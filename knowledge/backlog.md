# Backlog

## Performance benchmarks for `packages/math`

**Why:** we added scalar overloads to cut temporary allocations and call overhead in hot paths, but haven't measured the real gain. A repeatable suite would validate future math changes, catch regressions, and keep performance discussions objective.

**Design:**
- A lightweight Bun benchmark harness, e.g. `packages/math/bench/`, comparing tuple-based calls with scalar-overload calls for hot functions.
- Start with the recently optimized or overloaded functions: `vecDot`, `vecCross`, `vecLengthSquare`, `geoSphericalDistance`, plus key callers like `vecProject` and `geoSphericalClosestPoint`.
- Each benchmark gets warmup, fixed iteration counts and multiple runs, so results report median and variance, not a single timing.
- Report both absolute time and relative speedup, so results make sense across machines.

**Notes:**
- Keep benchmark code separate from unit tests, so correctness and performance checks stay independent.
- Benchmark the code paths users actually hit, not only synthetic helpers.
- Record baseline numbers in a markdown summary (e.g. `packages/math/bench/README.md`) for future runs to compare against.

## Compile-time overload tests

Add type-level assertions for the scalar and tuple forms of `vecDot`, `vecCross`, `geoSphericalDistance`, etc., so tests check the return type and not just the value.
