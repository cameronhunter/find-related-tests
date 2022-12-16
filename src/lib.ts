import * as path from 'node:path';
import { parseTagMap } from './parseTags';
import Jest from './jest';
import type { JestDependencyResolver } from './jest';

interface Options {
  cwd?: string;
}

export class Project {
  #jest: Jest;
  #options: Required<Options>;

  #tagsToTests?: Map<string, string[]>;
  #resolver?: JestDependencyResolver;

  constructor(configPath: string, options?: Options) {
    this.#options = { cwd: process.cwd(), ...options };
    this.#jest = new Jest(path.resolve(this.#options.cwd, configPath));
  }

  /**
   * Find all tags that should be tested by changing the specified files.
   */
  async findRelatedTags(changeSet: string[]): Promise<Set<string>> {
    const files = [
      ...(await this.resolveInverse(changeSet)),
      // Include tags from the changed files too, not just dependent files.
      ...this.resolvePaths(changeSet)
    ];

    const tagsToFiles = await parseTagMap(files, this.#options);

    return new Set(tagsToFiles.keys());
  }

  /**
   * Find all tests which would be affected by changing the specified files.
   */
  async findRelatedTests(changeSet: string[]): Promise<Set<string>> {
    const tags = await this.findRelatedTags(changeSet);
    const tagsToTests = await this.getTagsToTests();

    const relatedTests = [];

    for (const tag of tags) {
      const tests = tagsToTests.get(tag) || [];
      relatedTests.push(...tests);
    }

    return new Set(relatedTests);
  }

  /**
   * Given a list of files, find all files that depend on them.
   */
  private async resolveInverse(filepaths: string[]): Promise<Set<string>> {
    const resolver = await this.getResolver();

    return new Set(
      this.resolvePaths(filepaths)
        .flatMap((file) => {
          /**
           * We intentionally don't pass all files into the `Set` because Jest
           * will include the file itself in its results. To avoid this, we pass
           * each file individually and ignore itself in the resolution. This
           * still allows for _other_ files to have dependents that are in the
           * `filepaths` list.
           */
          return resolver.resolveInverse(new Set([file]), (f) => f !== file);
        })
        .map((file) => path.relative(this.#options.cwd, file))
    );
  }

  private async getTagsToTests() {
    if (this.#tagsToTests) {
      return this.#tagsToTests;
    }

    const testPaths = await this.#jest.getTestPaths();
    this.#tagsToTests = await parseTagMap(testPaths, this.#options);

    return this.#tagsToTests;
  }

  private async getResolver() {
    if (this.#resolver) {
      return this.#resolver;
    }

    this.#resolver = await this.#jest.getDependencyResolver();

    return this.#resolver;
  }

  /**
   * Resolve filepaths to absolute filepaths taking the current working directory into account.
   */
  private resolvePaths(files: string[]): string[] {
    return files.map((file) => path.resolve(this.#options.cwd, file));
  }
}
