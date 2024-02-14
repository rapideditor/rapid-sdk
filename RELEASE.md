## Release Checklist

Get the code, update dependencies, build everything, and make sure tests pass.
```bash
git checkout main
git pull origin
npm install
npm run all
npm run test
```

This command bumps the package versions everywhere, but without doing any of the git stuff.
By default `npm version` likes to touch the root but not the workspaces.

```bash
npm version A.B.C-pre.D --workspaces --include-workspace-root=true --git-tag-version=false
```

Commit all changes, add the tag yourself, then push code and tag to GitHub.
```bash
git add . && git commit -m 'vA.B.C-pre.D'
git tag vA.B.C-pre.D
git push origin main vA.B.C-pre.D
```

Publishing, to figure out
```bash
#npx lerna publish from-git      # lerna will publish all subpackages to npm
```
