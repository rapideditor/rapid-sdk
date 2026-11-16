# Release Checklist

## Before releasing, does the project build cleanly?

```bash
# Make sure your main branch is up to date and all tests pass
git checkout main
git pull origin
bun install
bun run all
```

## Prepare the release

Pick a version, see https://semver.org/ - for example: 'A.B.C' or 'A.B.C-pre.D'

Optionally, use the `/release` skill in your agent (Claude Code, Copilot Chat, etc.) — it will:
- Validate the version number
- Identify commits since the last release and look up PR numbers
- Update `CHANGELOG.md` with a new entry
- Bump the version in all `package.json` files (root + workspaces)

(or perform these steps manually)

Review the changes, then commit using the `/commit` skill.

## Tag and publish

```bash
export VERSION=vA.B.C-pre.D
# Update version number in all package.json files (skip if `/release` already did this)
bun --workspaces pm version $VERSION --no-git-tag-version
git add . && git commit -m "$VERSION"
git tag "$VERSION"
git push origin main "$VERSION"
npm login    # if needed, session tokens last 2 hours
bun --workspaces publish   # publishes to npm using your current npm auth
```

Set as latest release on GitHub:
- Open https://github.com/rapideditor/rapid-sdk/blob/main/CHANGELOG.md and copy the URL to the new release
- Open https://github.com/rapideditor/rapid-sdk/tags and pick the new tag you just pushed
- There should be a link like "create a release from the tag", click that, and paste in the link to the changelog.
