import type { Config } from '@jest/types';
import { readConfig } from 'jest-config';
import { DependencyResolver as JestDependencyResolver } from 'jest-resolve-dependencies';
import Runtime from 'jest-runtime';
import type { SnapshotResolver } from 'jest-snapshot';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { SearchSource } from '@jest/core';
import { parseTagMap } from './parseTags';

interface Options {
  cwd?: string;
}

export class DependencyResolver {
  static async create(config: string, options?: Options): Promise<DependencyResolver> {
    const opts: Required<Options> = { cwd: process.cwd(), ...options };

    const { projectConfig, globalConfig } = await readConfig({} as Config.Argv, path.resolve(opts.cwd, config));

    await fs.mkdir(projectConfig.cacheDirectory, { recursive: true });

    const context = await Runtime.createContext(projectConfig, {
      console: { log() {}, error() {}, warn() {} } as any as Console,
      maxWorkers: os.cpus().length - 1,
      watchman: false
    });

    const source = new SearchSource(context);
    const results = await source.getTestPaths(globalConfig);
    const testPaths = results.tests.map((test) => test.path);
    const tagsToTests = await parseTagMap(testPaths, options);

    const hasteMap = await Runtime.createHasteMap(projectConfig, {
      console: { log() {}, error() {}, warn() {} } as any as Console,
      maxWorkers: os.cpus().length - 1,
      resetCache: false,
      watchman: false
    });

    const { hasteFS, moduleMap } = await hasteMap.build();
    const resolver = Runtime.createResolver(projectConfig, moduleMap);

    const jestResolver = new JestDependencyResolver(resolver, hasteFS, undefined as any as SnapshotResolver);

    return new DependencyResolver(tagsToTests, jestResolver, opts);
  }

  #tagsToTests: Map<string, string[]>;
  #resolver: JestDependencyResolver;
  #options: Required<Options>;

  private constructor(
    tagsToTests: Map<string, string[]>,
    resolver: JestDependencyResolver,
    options: Required<Options>
  ) {
    this.#tagsToTests = tagsToTests;
    this.#resolver = resolver;
    this.#options = options;
  }

  /**
   * Given a list of files, find all files that they depend on.
   */
  resolve(filepaths: string[]): Set<string> {
    return new Set(
      this.resolvePaths(filepaths)
        .flatMap((file) => this.#resolver.resolve(file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  /**
   * Given a list of files, find all files that depend on them.
   */
  resolveInverse(filepaths: string[]): Set<string> {
    return new Set(
      this.resolvePaths(filepaths)
        .flatMap((file) => this.#resolver.resolveInverse(new Set([file]), (f) => f !== file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  async resolveInverseTags(filepaths: string[]): Promise<Set<string>> {
    // We want to include tags from the files themselves, not just dependent files.
    const files = [...this.resolveInverse(filepaths), ...this.resolvePaths(filepaths)];

    const tagsToFiles = await parseTagMap(files, this.#options);

    return new Set(tagsToFiles.keys());
  }

  async findRelatedTests(filepaths: string[]): Promise<Set<string>> {
    const tags = await this.resolveInverseTags(filepaths);

    const relatedTests = [];

    for (const tag of tags) {
      const tests = this.#tagsToTests.get(tag) || [];
      relatedTests.push(...tests);
    }

    return new Set(relatedTests);
  }

  /**
   * Resolve filepaths to absolute filepaths taking the current working directory into account.
   */
  private resolvePaths(files: string[]): string[] {
    return files.map((file) => path.resolve(this.#options.cwd, file));
  }
}
