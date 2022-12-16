import type { Config } from '@jest/types';
import { readConfig } from 'jest-config';
import { DependencyResolver as JestDependencyResolver } from 'jest-resolve-dependencies';
import Runtime from 'jest-runtime';
import { extract, parse } from 'jest-docblock';
import type { SnapshotResolver } from 'jest-snapshot';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

interface Options {
  cwd?: string;
}

export class DependencyResolver {
  static async create(config: string, options?: Options): Promise<DependencyResolver> {
    const opts: Required<Options> = { cwd: process.cwd(), ...options };

    const { projectConfig } = await readConfig({} as Config.Argv, path.resolve(opts.cwd, config));

    await fs.mkdir(projectConfig.cacheDirectory, { recursive: true });

    const hasteMap = await Runtime.createHasteMap(projectConfig, {
      console: { log() {}, error() {}, warn() {} } as any as Console,
      maxWorkers: os.cpus().length - 1,
      resetCache: false,
      watchman: false
    });

    const { hasteFS, moduleMap } = await hasteMap.build();
    const resolver = Runtime.createResolver(projectConfig, moduleMap);

    return new DependencyResolver(
      new JestDependencyResolver(resolver, hasteFS, undefined as any as SnapshotResolver),
      opts
    );
  }

  #resolver: JestDependencyResolver;
  #options: Required<Options>;

  private constructor(resolver: JestDependencyResolver, options: Required<Options>) {
    this.#resolver = resolver;
    this.#options = options;
  }

  /**
   * Given a list of files, find all files that they depend on.
   */
  resolve(paths: string | string[]): Set<string> {
    return new Set(
      this.resolvePaths(paths)
        .flatMap((file) => this.#resolver.resolve(file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  /**
   * Given a list of files, find all files that depend on them.
   */
  resolveInverse(paths: string | string[]): Set<string> {
    return new Set(
      this.resolvePaths(paths)
        .flatMap((file) => this.#resolver.resolveInverse(new Set([file]), (f) => f !== file))
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  async tags(paths: string | string[]): Promise<Set<string>> {
    const files = [...this.resolveInverse(paths), ...this.resolvePaths(paths)];

    const tags = await Promise.all(files.map((file) => this.getPragmaFromFile(file, 'tag')));

    return new Set(tags.flat());
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
  private resolvePaths(files: string | string[]): string[] {
    return (Array.isArray(files) ? files : [files]).map((file) => path.resolve(this.#options.cwd, file));
  }
}
