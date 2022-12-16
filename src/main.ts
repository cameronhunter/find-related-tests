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
  const tags = await resolver.tags(file);

  for (const tag of tags) {
    console.log(tag);
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
