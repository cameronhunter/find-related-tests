import { DependencyResolver } from '../src/lib';

describe('simple', () => {
  test('resolveInverse', async () => {
    const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__/simple' });
    const files = resolver.resolveInverse('d.js');

    expect(files).toEqual(new Set(['a.js', 'c.js']));
  });

  test('tags', async () => {
    const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__/simple' });
    const tags = await resolver.tags('d.js');

    expect(tags).toEqual(new Set(['a', 'c', 'd']));
  });
});

describe('realistic', () => {
  test('tags', async () => {
    const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__/realistic' });

    expect(await resolver.tags(['components/boxshot.js'])).toEqual(new Set(['boxshot', 'browse', 'search']));

    expect(await resolver.tags(['components/bob.js'])).toEqual(new Set(['browse', 'edp', 'mdp', 'bob']));

    expect(await resolver.tags(['components/text.js'])).toEqual(
      new Set(['bob', 'browse', 'button', 'edp', 'keyboard', 'mdp', 'menu', 'search', 'text'])
    );

    expect(await resolver.tags(['components/text.js', 'components/image.js'])).toEqual(
      new Set(['bob', 'browse', 'button', 'edp', 'keyboard', 'mdp', 'menu', 'search', 'text', 'boxshot', 'image'])
    );
  });
});
