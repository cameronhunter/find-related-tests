import type { Config } from '@jest/types';
import { readConfig } from 'jest-config';
import { DependencyResolver as JestDependencyResolver } from 'jest-resolve-dependencies';
import Runtime from 'jest-runtime';
import { extract, parse } from 'jest-docblock';
import type { SnapshotResolver } from 'jest-snapshot';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { SearchSource } from '@jest/core';

type JestTestContext = Awaited<ReturnType<typeof Runtime['createContext']>>;

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

    const hasteMap = await Runtime.createHasteMap(projectConfig, {
      console: { log() {}, error() {}, warn() {} } as any as Console,
      maxWorkers: os.cpus().length - 1,
      resetCache: false,
      watchman: false
    });

    const { hasteFS, moduleMap } = await hasteMap.build();
    const resolver = Runtime.createResolver(projectConfig, moduleMap);

    return new DependencyResolver(
      context,
      new JestDependencyResolver(resolver, hasteFS, undefined as any as SnapshotResolver),
      globalConfig,
      opts
    );
  }

  #context: JestTestContext;
  #resolver: JestDependencyResolver;
  #globalConfig: Config.GlobalConfig;
  #options: Required<Options>;

  private constructor(
    context: JestTestContext,
    resolver: JestDependencyResolver,
    globalConfig: Config.GlobalConfig,
    options: Required<Options>
  ) {
    this.#context = context;
    this.#resolver = resolver;
    this.#globalConfig = globalConfig;
    this.#options = options;
  }

  /**
   * Given a list of files, find all files that they depend on.
   */
  resolve(filepath: string, ...rest: string[]): Set<string> {
    return new Set(
      this.resolvePaths([filepath, ...rest])
        .flatMap((file) => this.#resolver.resolve(file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  /**
   * Given a list of files, find all files that depend on them.
   */
  resolveInverse(filepath: string, ...rest: string[]): Set<string> {
    return new Set(
      this.resolvePaths([filepath, ...rest])
        .flatMap((file) => this.#resolver.resolveInverse(new Set([file]), (f) => f !== file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  async resolveInverseTags(filepath: string, ...rest: string[]): Promise<Set<string>> {
    const files = [...this.resolveInverse(filepath, ...rest), ...this.resolvePaths([filepath, ...rest])];

    const tags = await Promise.all(files.map((file) => this.getPragmaFromFile(file, 'tag')));

    return new Set(tags.flat());
  }

  async resolveTests(filepath: string, ...rest: string[]): Promise<Set<string>> {
    const tags = await this.resolveInverseTags(filepath, ...rest);
    const source = new SearchSource(this.#context);

    // TODO: This should be made more efficient. Can we use Jest's filter?
    const allTests = await source.getTestPaths(this.#globalConfig);

    const set = new Set<string>();
    for (const test of allTests.tests) {
      if (await this.fileContainsTags(test.path, tags)) {
        set.add(test.path);
      }
    }

    return new Set(Array.from(set).map((file) => path.relative(this.#options.cwd, file)));
  }

  private async fileContainsTags(file: string, tags: Set<string>): Promise<boolean> {
    const fileTags = await this.getPragmaFromFile(file, 'tag');
    return fileTags.some((tag) => tags.has(tag));
  }

  /**
   * Parse the docblock from a file and extract named pragma values.
   */
  private async getPragmaFromFile(filepath: string, pragma: string): Promise<string[]> {
    const contents = await fs.readFile(path.resolve(this.#options.cwd, filepath), 'utf-8');
    const docblock = extract(contents);
    const pragmas = parse(docblock);

    const values = pragmas[pragma];

    if (!values) {
      return [];
    }

    if (typeof values === 'string') {
      return [values];
    }

    return values;
  }

  /**
   * Resolve filepaths to absolute filepaths taking the current working
   * directory into account.
   */
  private resolvePaths(files: string[]): string[] {
    return files.map((file) => path.resolve(this.#options.cwd, file));
  }
}
