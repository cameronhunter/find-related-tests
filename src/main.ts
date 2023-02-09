#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { Project } from './lib';
import * as assert from 'node:assert';
import { resolve } from 'node:path';

const { positionals: files, values } = parseArgs({
  allowPositionals: true,
  options: {
    jestConfig: {
      type: 'string'
    },
    config: {
      type: 'string'
    },
    tags: {
      type: 'boolean'
    },
    cwd: {
      type: 'string',
      default: process.cwd()
    }
  }
});

async function main() {
  assert.ok(files, 'Expected at least one file path as a positional argument');
  assert.ok(values.jestConfig || values.config, 'Expected a `jestConfig` or `config` parameter to be defined');

  const cwd = values.cwd || process.cwd();
  const config = values.config ? require(resolve(cwd, values.config)) : undefined;
  const jestConfig = values.jestConfig || config?.jestConfig;
  const parsers = config?.parsers;
  const minimatchOptions = config?.minimatchOptions;
  const tags = values.tags || config?.tags;

  const project = new Project(jestConfig, { cwd, parsers, minimatchOptions });

  const results = await (tags ? project.findRelatedTags(files) : project.findRelatedTests(files));

  for (const result of results) {
    console.log(result);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
