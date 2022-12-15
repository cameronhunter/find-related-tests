import type { Config } from '@jest/types';
import glob from 'glob';
import { readConfig } from 'jest-config';
import { DependencyResolver } from 'jest-resolve-dependencies';
import Runtime from 'jest-runtime';
import type { SnapshotResolver } from 'jest-snapshot';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { DepGraph } from 'dependency-graph';
import * as path from 'node:path';

async function getDependencyResolver(configPath: string): Promise<DependencyResolver> {
  const { projectConfig: config } = await readConfig({} as Config.Argv, configPath);
  const cacheDirExists = fs.existsSync(config.cacheDirectory);

  if (!cacheDirExists) {
    await fs.promises.mkdir(config.cacheDirectory, { recursive: true });
  }

  const hasteMap = await Runtime.createHasteMap(config, {
    console: { log() {}, error() {}, warn() {} } as any as Console,
    maxWorkers: os.cpus().length - 1,
    resetCache: false,
    watchman: false
  });

  const { hasteFS, moduleMap } = await hasteMap.build();
  const resolver = Runtime.createResolver(config, moduleMap);

  return new DependencyResolver(resolver, hasteFS, undefined as any as SnapshotResolver);
}

interface Options {
  cwd?: string | undefined;
  ignore?: glob.IOptions['ignore'];
}

export async function buildDependencyGraph(
  files: string | string[],
  configPath: string,
  options?: Options
): Promise<DepGraph<string>> {
  const cwd = options?.cwd || process.cwd();

  const targetFiles = findFiles(files, { cwd, ...options });
  const reverseDependencyResolver = await getDependencyResolver(path.resolve(cwd, configPath));

  return targetFiles.reduce((graph, file) => {
    const dependencies = reverseDependencyResolver.resolve(file);

    const relativeFile = path.relative(cwd, file);
    graph.addNode(relativeFile);

    dependencies.forEach((dependency) => {
      const relativeDependency = path.relative(cwd, dependency);
      graph.addNode(relativeDependency);
      graph.addDependency(relativeFile, relativeDependency);
    });

    return graph;
  }, new DepGraph<string>({ circular: true }));
}

/**
 * Support finding files using either an array of paths/globs or a single
 * path/glob.
 */
function findFiles(input: string | string[], options?: glob.IOptions): string[] {
  const files = Array.isArray(input) ? input : [input];

  const set = files.reduce((state, file) => {
    for (const result of glob.sync(file, { ...options, absolute: true })) {
      state.add(result);
    }

    return state;
  }, new Set<string>());

  return Array.from(set);
}
