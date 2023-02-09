module.exports = {
  jestConfig: require.resolve('./jest.config.cjs'),
  parsers: {
    '*.story.js': () => {
      return ['story', 'tags'];
    }
  }
};
