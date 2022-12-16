import Jest from '../src/jest';
import * as path from 'node:path';

test('getTestPaths', async () => {
  const jest = new Jest('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await jest.getTestPaths()).toEqual([
    expect.stringContaining('darwin/__functional__/browse.test.js'),
    expect.stringContaining('darwin/__functional__/button.test.js'),
    expect.stringContaining('darwin/__functional__/keyboard.test.js'),
    expect.stringContaining('darwin/__functional__/mdp.test.js'),
    expect.stringContaining('darwin/__functional__/menu.test.js'),
    expect.stringContaining('darwin/__functional__/search.test.js'),
    expect.stringContaining('darwin/__functional__/smoke.test.js')
  ]);
});

describe('getDependencyResolver', () => {
  test('resolve', async () => {
    const cwd = './test/__fixtures__';
    const jest = new Jest('jest.config.cjs', { cwd });

    const resolver = await jest.getDependencyResolver();

    const dependencies = await resolver.resolve(path.resolve(cwd, 'darwin/__functional__/smoke.test.js'));

    expect(dependencies).toEqual([expect.stringContaining('page-object-model/index.js')]);
  });

  test('resolveInverse', async () => {
    const cwd = './test/__fixtures__';
    const jest = new Jest('jest.config.cjs', { cwd });

    const resolver = await jest.getDependencyResolver();

    const dependents = await resolver.resolveInverse(
      new Set([path.resolve(cwd, 'darwin/components/bob.js')]),
      () => true
    );

    expect(dependents).toEqual([
      expect.stringContaining('darwin/routes/browse.js'),
      expect.stringContaining('darwin/routes/mdp.js'),
      expect.stringContaining('darwin/index.js'),
      expect.stringContaining('darwin/components/bob.js')
    ]);
  });
});
