#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { Project } from './lib';
import * as assert from 'node:assert';

const {
  values: { file: files, jestConfig, cwd, tags }
} = parseArgs({
  options: {
    file: {
      type: 'string',
      short: 'f',
      multiple: true
    },
    jestConfig: {
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
  assert.ok(files, 'Expected a `file` parameter to be defined');
  assert.ok(jestConfig, 'Expected a `jestConfig` parameter to be defined');

  const project = new Project(jestConfig, { cwd: cwd || process.cwd() });

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
