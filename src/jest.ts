/**
 * Jest provides many internal packages which we can use to build a dependency
 * graph of our project. We also use Jest to find all tests defined by the
 * configuration.
 *
 * Credit: Rogelio Guzman – https://github.com/rogeliog/build-dependency-graph
 */

import type { Config } from '@jest/types';
import { readConfig } from 'jest-config';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import Runtime from 'jest-runtime';
import { SearchSource } from '@jest/core';
import { DependencyResolver } from 'jest-resolve-dependencies';
import type { SnapshotResolver } from 'jest-snapshot';

const fakeConsole = { log() {}, error() {}, warn() {} } as any as Console;

export type { DependencyResolver as JestDependencyResolver };

export interface Options {
  cwd?: string;
}

export default class Jest {
  #configPath: string;

  #config?: { globalConfig: Config.GlobalConfig; projectConfig: Config.ProjectConfig };
  #testPaths?: string[];
  #dependencyResolver?: DependencyResolver;

  constructor(configPath: string, options?: Options) {
    this.#configPath = path.resolve(options?.cwd || process.cwd(), configPath);
  }

  async getDependencyResolver(options?: {
    maxWorkers?: number;
    watchman?: boolean;
    resetCache?: boolean;
  }): Promise<DependencyResolver> {
    if (this.#dependencyResolver) {
      return this.#dependencyResolver;
    }

    const { projectConfig } = await this.getConfig();

    const hasteMap = await Runtime.createHasteMap(projectConfig, {
      console: fakeConsole,
      maxWorkers: options?.maxWorkers || os.cpus().length - 1,
      resetCache: options?.resetCache || false,
      watchman: options?.watchman || false
    });

    const { hasteFS, moduleMap } = await hasteMap.build();
    const resolver = Runtime.createResolver(projectConfig, moduleMap);

    this.#dependencyResolver = new DependencyResolver(resolver, hasteFS, undefined as any as SnapshotResolver);

    return this.#dependencyResolver;
  }

  async getTestPaths(options?: { maxWorkers?: number; watchman?: boolean }): Promise<string[]> {
    if (this.#testPaths) {
      return this.#testPaths;
    }

    const { globalConfig, projectConfig } = await this.getConfig();

    const context = await Runtime.createContext(projectConfig, {
      console: fakeConsole,
      maxWorkers: options?.maxWorkers || os.cpus().length - 1,
      watchman: options?.watchman || false
    });

    const source = new SearchSource(context);
    const results = await source.getTestPaths(globalConfig);

    this.#testPaths = results.tests.map((test) => test.path);

    return this.#testPaths;
  }

  private async getConfig() {
    if (this.#config) {
      return this.#config;
    }

    this.#config = await readConfig({} as Config.Argv, this.#configPath);

    await fs.mkdir(this.#config.projectConfig.cacheDirectory, { recursive: true });

    return this.#config;
  }
}
