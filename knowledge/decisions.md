# Decisions

## Surrounding rectangle: use the dominant axis, not the longest side

`geomGetDominantSurroundingRectangle` orients the rectangle by outline edge-length support for orthogonal axes: each edge votes for its angle, weighted by length.

Rejected: scoring by the longest side. On convex hulls it tends to follow a hypotenuse or diagonal rather than the shape's real orientation.

To test changes here, use a stepped footprint, where the smallest-area rectangle picks a smaller diagonal envelope but the dominant axis should stay orthogonal.

## Math code is hot: don't make it do extra work

`packages/math` runs in Rapid's render and edit loops, so its functions are called constantly. Write them to do no more work than needed: no extra allocations, copies, guards or passes in loops, and no convenience abstractions in hot paths. Readability still matters, but measure (see the benchmarks item in `backlog.md`) rather than assume when changing a hot loop.

For the same reason, `noUncheckedIndexedAccess` is on for `packages/util` only (in its `tsconfig.json`). In math, most indexing is a bounds-safe loop like `points[i]`, so the flag would mean ~200 `!` marks or runtime guards (34 in source, the rest in tests) for little real safety. Fixed-length tuples like `Vec2` and `Quad` are already typed exactly. If loops get rewritten to avoid indexing (`for…of`, a `prev` variable for neighbor pairs, tuple parameter types), the flag could be reconsidered for math.

## tsconfig split: check-only root, per-package build

The root `tsconfig.json` is for type checking only (`noEmit: true`) and includes test files. Each package has a `tsconfig.build.json` that extends it and emits declarations only; the `build:ts` script runs `tsc -p tsconfig.build.json`. This keeps tests type-checked without emitting them into `dist/`.
