## Release Checklist

```bash
$  git checkout main
$  git pull origin
$  yarn                            # update monorepo root and subpackage dependencies
$  yarn run all                    # build everything
$  yarn run test                   # make sure all tests pass
$  npx lerna version               # choose the next version, lerna will update everything and check in
$  npx lerna publish from-git      # lerna will publish all subpackages to npm
```
