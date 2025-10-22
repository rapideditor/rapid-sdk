## Release Checklist

```bash

# Get the code, update dependencies, build everything, and make sure tests pass.
git checkout main
git pull origin
bun install
bun run all

# Pick a version you want to push to all packages, see https://semver.org/
export VERSION=A.B.C-pre.D

# This is also a good time to update `CHANGELOG.md`

# Bumps the package versions everywhere, but without doing any of the git stuff.
bun --workspaces pm version $VERSION --no-git-tag-version

# Commit all changes, add the tag yourself, then push code and tag to GitHub.
git add . && git commit -m "$VERSION"
git tag $VERSION
git push origin main $VERSION

# Publishes the subpackages
bun --workspaces publish

```
