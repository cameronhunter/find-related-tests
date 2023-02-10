import Jest from '../src/jest';
import * as path from 'node:path';

test('getTestPaths', async () => {
  const jest = new Jest('jest.config.cjs', { cwd: './test/__fixtures__' });

  const testPaths = await jest.getTestPaths();

  const expected = [
    expect.stringContaining('application/__functional__/button.test.js'),
    expect.stringContaining('application/__functional__/browse.test.js'),
    expect.stringContaining('application/__functional__/keyboard.test.js'),
    expect.stringContaining('application/__functional__/menu.test.js'),
    expect.stringContaining('application/__functional__/details.test.js'),
    expect.stringContaining('application/__functional__/search.test.js'),
    expect.stringContaining('application/__functional__/smoke.test.js'),
    expect.stringContaining('application/__stories__/button.story.js')
  ];

  expect(testPaths).toHaveLength(expected.length);
  expect(testPaths).toEqual(expect.arrayContaining(expected));
});

describe('getDependencyResolver', () => {
  test('resolve', async () => {
    const cwd = './test/__fixtures__';
    const jest = new Jest('jest.config.cjs', { cwd });

    const resolver = await jest.getDependencyResolver();

    const dependencies = await resolver.resolve(path.resolve(cwd, 'application/__functional__/smoke.test.js'));

    expect(dependencies).toEqual([expect.stringContaining('page-object-model/index.js')]);
  });

  test('resolveInverse', async () => {
    const cwd = './test/__fixtures__';
    const jest = new Jest('jest.config.cjs', { cwd });

    const resolver = await jest.getDependencyResolver();

    const dependents = await resolver.resolveInverse(
      new Set([path.resolve(cwd, 'application/components/synopsis.js')]),
      () => true
    );

    const expected = [
      expect.stringContaining('application/routes/details.js'),
      expect.stringContaining('application/routes/browse.js'),
      expect.stringContaining('application/index.js'),
      expect.stringContaining('application/components/synopsis.js')
    ];

    expect(dependents).toHaveLength(expected.length);
    expect(dependents).toEqual(expect.arrayContaining(expected));
  });
});
