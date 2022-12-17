import { Browse, Details, Profiles, Search } from '../../page-object-model';

const page = {};

test('Smoke test', async () => {
  const profiles = await Profiles.from(page);

  await profiles.selectProfile(0);

  const browse = await Browse.from(page);

  await browse.selectInAppMenu('Search');

  const search = await Search.from(page);

  await search.searchFor('Stranger Things');
  await search.selectResult(0);

  const details = await Details.from(page);

  await details.addToMyList();
});
