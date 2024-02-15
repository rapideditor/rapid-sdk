## Release Checklist

```bash

# Get the code, update dependencies, build everything, and make sure tests pass.
git checkout main
git pull origin
npm install
npm run all

# Pick a version you want to push to all packages, see https://semver.org/
export VERSION=A.B.C-pre.D

# This is also a good time to update `CHANGELOG.md`

# Bumps the package versions everywhere, but without doing any of the git stuff.
# (By default, `npm` commands want to operate on the root but not the workspaces.)
npm version $VERSION --workspaces --include-workspace-root=true --git-tag-version=false

# Commit all changes, add the tag yourself, then push code and tag to GitHub.
git add . && git commit -m "$VERSION"
git tag $VERSION
git push origin main $VERSION

# Publishes the subpackages only, we don't publish the root at this time.
# (`include-workspace-root` defaults to false, but we include it here anyway.)
npm publish --workspaces --include-workspace-root=false

```
