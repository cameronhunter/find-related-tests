const babel = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');

/**
 * Use babel to parse the tags from the AST.
 */
function parseTagsFromStories(fileContents) {
  const ast = babel.parse(fileContents, { allowImportExportEverywhere: true, errorRecovery: true });

  let tags = [];

  traverse(ast, {
    ObjectProperty(path) {
      if (path.node.key.name === 'tags') {
        tags = path
          .get('value')
          .get('elements')
          .map((path) => path.get('value').node);
      }
    }
  });

  return tags;
}

module.exports = {
  jestConfig: require.resolve('./jest.config.cjs'),
  parsers: {
    '**/*.story.js': parseTagsFromStories
  }
};
