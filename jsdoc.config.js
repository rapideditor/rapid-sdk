module.exports = {
  opts: {
    destination: './docs/',
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

  docdash: {
    sort: true,
    openGraph: {
      title: 'ideditor',
      type: 'Map editing made easy',
      url: 'https://github.com/ideditor/ideditor'
    },
    meta: {
      title: 'iD Editor Documentation'
    },
    search: true,
    private: false,
    menu: {
      GitHub: {
        href: 'https://github.com/ideditor/ideditor',
        target: '_blank',
        class: 'menu-item',
        id: 'GitHub'
      }
    }
  }
};
