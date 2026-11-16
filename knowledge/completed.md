# Completed work

## May 2026

Released in 1.0.0-pre.5; see [CHANGELOG.md](../CHANGELOG.md) for the user-facing list.

- **Package layout cleanup.** Barrel files are now `index.ts`, and each package keeps its shared types in `src/types.ts`. The `Edge` type was folded into `Closest` (same `{index, distance, point}` shape), which `vecProject` now returns; the ⚠️ entry is in the changelog.
- **Tests moved to TypeScript.** Bun runs `.ts` tests natively. Adding explicit `Vec2` tuple types and null guards surfaced strict-mode errors the old tsconfig had been hiding; all are fixed. Per-package `bunfig.toml` files now carry their own `[test]` coverage config.
- **tsconfig split into check and build.** See [decisions.md](decisions.md#tsconfig-split-check-only-root-per-package-build).
- **Better typings.** `geomRotate` preserves tuple types, so fixed-length arrays like `Quad` survive rotation without casts. `TagDiff.oldVal`/`newVal` are now `string | undefined`, matching what `utilTagDiff` produces at runtime. `utilQsString`'s `noencode` argument is optional.
- **Surrounding rectangles reworked.** `SSR` became `SurroundingRectangle` and gained `centroid`, `dimensions`, `longAxis` and `shortAxis`. `geomGetDominantSurroundingRectangle` was added; see [decisions.md](decisions.md#surrounding-rectangle-use-the-dominant-axis-not-the-longest-side).
