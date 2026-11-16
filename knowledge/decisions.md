# Decisions

## Surrounding rectangle: use the dominant axis, not the longest side

`geomGetDominantSurroundingRectangle` orients the rectangle by outline edge-length support for orthogonal axes: each edge votes for its angle, weighted by length.

Rejected: scoring by the longest side. On convex hulls it tends to follow a hypotenuse or diagonal rather than the shape's real orientation.

To test changes here, use a stepped footprint, where the smallest-area rectangle picks a smaller diagonal envelope but the dominant axis should stay orthogonal.

## tsconfig split: check-only root, per-package build

The root `tsconfig.json` is for type checking only (`noEmit: true`) and includes test files. Each package has a `tsconfig.build.json` that extends it and emits declarations only; the `build:ts` script runs `tsc -p tsconfig.build.json`. This keeps tests type-checked without emitting them into `dist/`.
