import { buildDependencyGraph } from '../src/lib';

test('Integration test', async () => {
  const graph = await buildDependencyGraph('./test/__resources__/*.js', './test/__resources__/jest.config.cjs', {
    root: './test/__resources__'
  });

  expect(graph.dependenciesOf('a.js')).toEqual(['b.js', 'd.js', 'c.js']);
  expect(graph.dependenciesOf('b.js')).toEqual([]);
  expect(graph.dependenciesOf('c.js')).toEqual(['d.js']);
  expect(graph.dependenciesOf('d.js')).toEqual([]);

  expect(graph.dependantsOf('a.js')).toEqual([]);
  expect(graph.dependantsOf('b.js')).toEqual(['a.js']);
  expect(graph.dependantsOf('c.js')).toEqual(['a.js']);
  expect(graph.dependantsOf('d.js')).toEqual(['a.js', 'c.js']);
});
