#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { buildDependencyGraph } from './lib';
import * as assert from 'node:assert';

const {
  values: { file, config, pretty, cwd }
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
    },
    pretty: {
      type: 'boolean'
    }
  }
});

async function main() {
  assert.ok(file, 'Expected a `file` parameter to be defined');
  assert.ok(config, 'Expected a `config` parameter to be defined');

  const graph = await buildDependencyGraph(file, config, { cwd });

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
