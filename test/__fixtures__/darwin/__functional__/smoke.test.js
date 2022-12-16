import { Browse, MDP, ProfileGate, Search } from '../../page-object-model';

const page = {};

test('Smoke test', async () => {
  const profileGate = await ProfileGate.from(page);

  await profileGate.selectProfile(0);

  const browse = await Browse.from(page);

  await browse.selectInAppMenu('Search');

  const search = await Search.from(page);

  await search.searchFor('Stranger Things');
  await search.selectResult(0);

  const mdp = await MDP.from(page);

  await mdp.addToMyList();
});
