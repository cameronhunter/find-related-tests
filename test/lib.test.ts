import { DependencyResolver } from '../src/lib';

test('Find related tests', async () => {
  const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__' });

  const changedFiles = ['darwin/components/keyboard.js'];
  const relatedTests = await resolver.resolveTests(changedFiles);

  expect(relatedTests).toEqual(
    new Set([
      'darwin/__functional__/keyboard.test.js',
      'darwin/__functional__/search.test.js',
      'darwin/__functional__/smoke.test.js'
    ])
  );
});

test('Resolve inverse tags', async () => {
  const resolver = await DependencyResolver.create('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await resolver.resolveInverseTags(['darwin/components/boxshot.js'])).toEqual(
    new Set(['boxshot', 'browse', 'search'])
  );

  expect(await resolver.resolveInverseTags(['darwin/components/bob.js'])).toEqual(new Set(['browse', 'mdp', 'bob']));

  expect(await resolver.resolveInverseTags(['darwin/components/text.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'keyboard', 'mdp', 'menu', 'profileGate', 'search'])
  );

  expect(await resolver.resolveInverseTags(['darwin/components/text.js', 'darwin/components/image.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'keyboard', 'mdp', 'menu', 'profileGate', 'search', 'boxshot'])
  );
});
