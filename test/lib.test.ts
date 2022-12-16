import { DependencyResolver } from '../src/lib';

test('tags', async () => {
  const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await resolver.resolveInverseTags(['components/boxshot.js'])).toEqual(
    new Set(['boxshot', 'browse', 'search'])
  );

  expect(await resolver.resolveInverseTags(['components/bob.js'])).toEqual(new Set(['browse', 'edp', 'mdp', 'bob']));

  expect(await resolver.resolveInverseTags(['components/text.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'edp', 'keyboard', 'mdp', 'menu', 'search', 'text'])
  );

  expect(await resolver.resolveInverseTags(['components/text.js', 'components/image.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'edp', 'keyboard', 'mdp', 'menu', 'search', 'text', 'boxshot', 'image'])
  );
});

test('tests', async () => {
  const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await resolver.resolveTests(['components/keyboard.js'])).toEqual(
    new Set(['__functional__/keyboard.test.js', '__functional__/search.test.js', '__functional__/smoke.test.js'])
  );
});
