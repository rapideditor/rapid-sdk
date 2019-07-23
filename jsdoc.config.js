const pkg = require('./package.json');

module.exports = {
  opts: {
    destination: './docs/',
    readme: './README.md',
    recurse: true,
    template: 'node_modules/docdash'
  },
  source: {
    excludePattern: '(node_modules|docs|tests)'
  },
  tags: {
    allowUnknownTags: false,
    dictionaries: ['jsdoc']
  },
  templates: {
    default: {
      includeDate: false
    }
  },
  docdash: {
    sort: true,
    openGraph: {
      title: pkg.name,
      type: pkg.description,
      url: 'https://github.com/' + pkg.repostiory
    },
    meta: {
      title: 'iD Editor Documentation',
      description: pkg.description,
      keyword: pkg.keywords.join(',')
    },
    search: true,
    collapse: true,
    typedefs: true,
    private: false,
    menu: {
      GitHub: {
        href: 'https://github.com/' + pkg.repository,
        target: '_blank',
        class: 'menu-item',
        id: 'GitHub'
      }
    }
  }
};
