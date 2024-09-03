# Contributing to rapid-sdk

## Contributing Code

Before performing any code changes go through the following setup:

```bash
git checkout main
git pull origin
npm install            # update monorepo root and subpackage dependencies
npm run all            # build everything
```


### Writting code documentation
Code follows [TSDoc](https://tsdoc.org/) standard of source documentation and uses [typedoc](https://typedoc.org/) generator to generate HTML documentation.
