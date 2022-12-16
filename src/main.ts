#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { DependencyResolver } from './lib';
import * as assert from 'node:assert';

const {
  values: { file, config, cwd }
} = parseArgs({
  options: {
    file: {
      type: 'string',
      short: 'f',
      multiple: true
    },
    config: {
      type: 'string'
    },
    cwd: {
      type: 'string',
      default: process.cwd()
    }
  }
});

async function main() {
  assert.ok(file, 'Expected a `file` parameter to be defined');
  assert.ok(config, 'Expected a `config` parameter to be defined');

  const resolver = await DependencyResolver.create(config, { cwd: cwd || process.cwd() });
  const tests = await resolver.findRelatedTests(file);

  for (const test of tests) {
    console.log(test);
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
