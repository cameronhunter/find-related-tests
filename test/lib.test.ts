import { Project } from '../src/lib';

test('Find related tests', async () => {
  const project = new Project('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await project.findRelatedTests(['application/components/keyboard.js'])).toEqual(
    new Set([
      'application/__functional__/keyboard.test.js',
      'application/__functional__/search.test.js',
      'application/__functional__/smoke.test.js'
    ])
  );

  expect(await project.findRelatedTests(['application/components/synopsis.js'])).toEqual(
    new Set([
      'application/__functional__/browse.test.js',
      'application/__functional__/details.test.js',
      'application/__functional__/smoke.test.js'
    ])
  );

  expect(await project.findRelatedTests(['application/components/menu.js'])).toEqual(
    new Set([
      'application/__functional__/details.test.js',
      'application/__functional__/menu.test.js',
      'application/__functional__/search.test.js',
      'application/__functional__/smoke.test.js'
    ])
  );
});

test('Find related tags', async () => {
  const project = new Project('jest.config.cjs', { cwd: './test/__fixtures__' });

  expect(await project.findRelatedTags(['application/components/boxshot.js'])).toEqual(
    new Set(['boxshot', 'browse', 'search'])
  );

  expect(await project.findRelatedTags(['application/components/synopsis.js'])).toEqual(
    new Set(['browse', 'details', 'synopsis'])
  );

  expect(await project.findRelatedTags(['application/components/text.js'])).toEqual(
    new Set(['synopsis', 'browse', 'button', 'keyboard', 'details', 'menu', 'profiles', 'search'])
  );

  expect(await project.findRelatedTags(['application/components/text.js', 'application/components/image.js'])).toEqual(
    new Set(['synopsis', 'browse', 'button', 'keyboard', 'details', 'menu', 'profiles', 'search', 'boxshot'])
  );
});
