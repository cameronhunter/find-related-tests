import { parseTagMap, parseTags } from '../src/parseTags';
import { vol as fs } from 'memfs';
import dedent from 'dedent';

jest.mock('node:fs/promises', () => require('memfs').fs.promises);

beforeAll(() => {
  fs.fromJSON({
    'file-with-no-docblock.js': '',
    'file-with-no-tags.js': dedent`
      /**
       * This file has no tags.
       */
    `,
    'file-with-one-tag.js': dedent`
      /**
       * @tag foo
       */
    `,
    'file-with-multiple-tags.js': dedent`
      /**
       * @tag foo
       * @tag bar
       */
    `
  });
});

afterAll(() => {
  fs.reset();
});

describe('parseTags', () => {
  test('No docblock', async () => {
    expect(await parseTags('file-with-no-docblock.js')).toEqual([]);
  });

  test('No tags', async () => {
    expect(await parseTags('file-with-no-tags.js')).toEqual([]);
  });

  test('One tag', async () => {
    expect(await parseTags('file-with-one-tag.js')).toEqual(['foo']);
  });

  test('Multiple tags', async () => {
    expect(await parseTags('file-with-multiple-tags.js')).toEqual(['foo', 'bar']);
  });
});

describe('parseTagMap', () => {
  test('gets a map of tag -> files that contains them', async () => {
    const files = [
      'file-with-no-docblock.js',
      'file-with-no-tags.js',
      'file-with-one-tag.js',
      'file-with-multiple-tags.js'
    ];

    expect(await parseTagMap(files)).toEqual(
      new Map([
        ['foo', ['file-with-one-tag.js', 'file-with-multiple-tags.js']],
        ['bar', ['file-with-multiple-tags.js']]
      ])
    );
  });
});
