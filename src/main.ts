#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { buildDependencyGraph } from './lib';
import * as assert from 'node:assert';

const {
  values: { files, config, pretty, root }
} = parseArgs({
  options: {
    files: {
      type: 'string',
      short: 'f'
    },
    config: {
      type: 'string',
      short: 'c'
    },
    root: {
      type: 'string',
      short: 'r',
      default: process.cwd()
    },
    pretty: {
      type: 'boolean',
      short: 'p'
    }
  }
});

async function main() {
  assert.ok(files, 'Expected a `files` parameter to be defined');
  assert.ok(config, 'Expected a `config` parameter to be defined');

  const graph = await buildDependencyGraph(files, config, { root });

  console.log(JSON.stringify(graph, null, pretty ? 2 : undefined));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
