## Release Checklist

```bash
$  git checkout main
$  git pull origin
$  npm install                     # update monorepo root dependencies
$  npm bootstrap                   # update monorepo subpackage dependencies
$  npm run all                     # build everything
$  npm run test                    # make sure all tests pass
$  npx lerna version               # choose the next version, lerna will update everything and check in
$  npx lerna publish from-git      # lerna will publish all subpackages to npm
```
