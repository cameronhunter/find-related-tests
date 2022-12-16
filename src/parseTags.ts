import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { extract, parse } from 'jest-docblock';

/**
 * Parse the docblock from a file and extract named pragma values.
 *
 * In theory, this could use any methodology for extracting tags from a file, it
 * doesn't necessarily need to use docblock pragmas.
 */
export async function parseTags(filepath: string | string[], options?: { cwd?: string }): Promise<string[]> {
  if (Array.isArray(filepath)) {
    const tags = await parseTagMap(filepath, options);
    return Array.from(tags.keys());
  }

  const cwd = options?.cwd || process.cwd();
  const contents = await fs.readFile(path.resolve(cwd, filepath), 'utf-8');
  const docblock = extract(contents);
  const pragmas = parse(docblock);

  const tags = pragmas['tag'];

  if (!tags) {
    return [];
  }

  if (typeof tags === 'string') {
    return [tags];
  }

  return tags;
}

/**
 * Given an array of files, create a map of all tags -> files that contain them.
 */
export async function parseTagMap(filepaths: string[], options?: { cwd?: string }): Promise<Map<string, string[]>> {
  const cwd = options?.cwd || process.cwd();
  const allTags = await Promise.all(filepaths.map((file) => parseTags(file, { cwd, ...options })));

  return filepaths.reduce((state, filepath, index) => {
    for (const tag of allTags[index] || []) {
      const value = state.get(tag) || [];
      const newValue = new Set([...value, path.relative(cwd, filepath)]);
      state.set(tag, Array.from(newValue));
    }

    return state;
  }, new Map<string, string[]>());
}
