import { Project } from '../src/lib';

test('Find related tests', async () => {
  const project = new Project('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await project.findRelatedTests(['darwin/components/keyboard.js'])).toEqual(
    new Set([
      'darwin/__functional__/keyboard.test.js',
      'darwin/__functional__/search.test.js',
      'darwin/__functional__/smoke.test.js'
    ])
  );

  expect(await project.findRelatedTests(['darwin/components/bob.js'])).toEqual(
    new Set([
      'darwin/__functional__/browse.test.js',
      'darwin/__functional__/mdp.test.js',
      'darwin/__functional__/smoke.test.js'
    ])
  );
});

test('Find related tags', async () => {
  const project = new Project('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await project.findRelatedTags(['darwin/components/boxshot.js'])).toEqual(
    new Set(['boxshot', 'browse', 'search'])
  );

  expect(await project.findRelatedTags(['darwin/components/bob.js'])).toEqual(new Set(['browse', 'mdp', 'bob']));

  expect(await project.findRelatedTags(['darwin/components/text.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'keyboard', 'mdp', 'menu', 'profileGate', 'search'])
  );

  expect(await project.findRelatedTags(['darwin/components/text.js', 'darwin/components/image.js'])).toEqual(
    new Set(['bob', 'browse', 'button', 'keyboard', 'mdp', 'menu', 'profileGate', 'search', 'boxshot'])
  );
});
