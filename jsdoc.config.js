module.exports = {
  opts: {
    destination: './docs/',
    recurse: true
  },
  source: {
    excludePattern: '(node_modules|docs|tests)'
  },
  tags: {
    allowUnknownTags: false,
    dictionaries: ['jsdoc']
  }
};
