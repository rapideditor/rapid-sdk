# What's New

Thanks to all our contributors, users, and the many people that make Rapid possible! ❤️

**rapid-sdk** is an open source project. You can submit bug reports, help out,
or learn more by visiting our project page on GitHub:  :octocat: https://github.com/rapideditor/rapid-sdk

If you love **rapid-sdk**, please star our project on GitHub to show your support! ⭐️

_Breaking developer changes, which may affect downstream projects or sites that embed rapid-sdk, are marked with a_ ⚠️

<!--
# A.B.C
##### YYYY-MMM-DD

links:
[#xxx]: https://github.com/rapideditor/rapid-sdk/issues/xxx
[Rapid#xxxx]: https://github.com/facebook/Rapid/issues/xxxx
[iD#xxxxx]: https://github.com/openstreetmap/iD/issues/xxxxx
[@user]: https://github.com/user
-->

# 1.0.0-pre.5
#### 2026-May-??
* Projection and "world coordinate" changes:
  * ⚠️ World coordinates are now pre-scaled to zoom 16 (range 0..16,777,216 instead of 0..256) ([#306])
  * This allows renderers to handle world coordinates directly with acceptable float precision, avoiding extra steps to convert to screen coordinates.
  * New `proj` module contains the pure functions for converting coordinates: `projWgs84ToWorld`, `projWorldToWgs84`, `projWorldToScreen`, `projScreenToWorld`
  * This means consumers can call the projection functions without needing a viewport.
  * All `Viewport.project()`/`.unproject()`, etc. remain backward compatible - no callers need to change
* ⚠️ `Tile.tileExtent` renamed to `Tile.worldExtent` and values are now in zoom-16 world space
* ⚠️ `SSR` type renamed to `SurroundingRectangle`, also includes new data fields: ([#308])
  * `centroid` — geometric center of the rectangle (where axes intersect)
  * `longAxis` — `[Vec2, Vec2]` segment along the rectangle's longer dimension
  * `shortAxis` — `[Vec2, Vec2]` segment along the rectangle's shorter dimension
* ⚠️ `Edge` type removed (use `Closest` instead, it is the same)
* New and updated geometry point helpers:
  * ⚠️ `geomRotatePoints` renamed to `geomRotate`
  * New geometry point helpers `geomReflect`, `geomScale`, `geomToLocal`, `geomToOrigin`
  * New function `geomGetDominantSurroundingRectangle` — returns the surrounding rectangle aligned to a feature's dominant edge axis, useful for label/icon placement ([#308])
* Add `Vec4` and `Quad` type aliases and math constants: `WORLD_ZOOM`, `WORLD_SIZE`, `WORLD_HALF`, `ANGLE_EPSILON` ([#307])
* New and updated Extent helpers:
  * `Extent.rectangle()` returns type `Vec4`
  * `Extent.polygon()` returns type `Quad` ([#307])
  * New: `Extent.dimensions()` returns dimensions as [width, height].
* perf: scalar overloads for `vecDot`, `vecCross`, `vecLengthSquare`, `geoSphericalDistance`, `geomLineIntersection`, and more ([#307])
* `utilAesEncrypt` / `utilAesDecrypt` key parameter is now optional ([#300])
* `utilQsString` `noencode` parameter is now optional
* Upgrade to TypeScript 6
* Dependency updates, CI improvements

[#300]: https://github.com/rapideditor/rapid-sdk/issues/300
[#306]: https://github.com/rapideditor/rapid-sdk/issues/306
[#307]: https://github.com/rapideditor/rapid-sdk/issues/307
[#308]: https://github.com/rapideditor/rapid-sdk/issues/308


# 1.0.0-pre.4
#### 2025-Oct-22
*  This project uses [`bun`](https://bun.com/) now, for simpler developer tooling ([#298])
*  ⚠️ Breaking changes to Viewport (projection), Transform, and Tiler code ([#297])
  * Introduces "world coordinates" for working with unscaled Mercator
  * Changes Transform code to replace `k` scale parameter with `z` zoom parameter
  * (possibly more breaking changes to follow)
* Extent polygon should return coordinates wound counterclockwise ([#296])

[#298]: https://github.com/rapideditor/rapid-sdk/issues/298
[#297]: https://github.com/rapideditor/rapid-sdk/issues/297
[#296]: https://github.com/rapideditor/rapid-sdk/issues/296


# 1.0.0-pre.3
#### 2024-Sep-03
* [#275] ⚠️  Remove no longer used `geomViewportNudge`
* [#276] Do not remove spaces in inscription after ';' sign
* [#281] Fix tile coverage calculation for rotated viewports

[#275]: https://github.com/rapideditor/rapid-sdk/issues/275
[#276]: https://github.com/rapideditor/rapid-sdk/issues/276
[#281]: https://github.com/rapideditor/rapid-sdk/issues/281


# 1.0.0-pre.2
#### 2024-Mar-27
* [#273] Add `eslint`, `typescript-eslint` to the project
  * ⚠️  Also, narrow several of the types (we were using `any` a lot)
* [#269] Add package of numerical math functions and constants
* [#268] Add `Extent.extendSelf(other)` as a mutable version of `Extent.extend(other)`
* [#266] Rename `Projection`->`Viewport`, Extract several things to `Transform` class
* [#265] Include `map=` param before others in query strings
* [#264] Support map rotation in `Transform`, `Viewport`, `Tiler`
* [#263] ⚠️ Remove some things not needed:
   * d3 projection streams
   * util functions for working with css classes
* [#255] Simplify project, remove `prettier`, `jest`, `yarn`, `lerna`
* [#254] Fix incorrect Earth radius constants, thanks [@k-yle]

[#254]: https://github.com/rapideditor/rapid-sdk/issues/254
[#255]: https://github.com/rapideditor/rapid-sdk/issues/255
[#263]: https://github.com/rapideditor/rapid-sdk/issues/263
[#264]: https://github.com/rapideditor/rapid-sdk/issues/264
[#265]: https://github.com/rapideditor/rapid-sdk/issues/265
[#266]: https://github.com/rapideditor/rapid-sdk/issues/266
[#268]: https://github.com/rapideditor/rapid-sdk/issues/268
[#269]: https://github.com/rapideditor/rapid-sdk/issues/269
[#273]: https://github.com/rapideditor/rapid-sdk/issues/273
[@k-yle]: https://github.com/k-yle


# 1.0.0-pre.1
#### 2023-Mar-13
* Initial release of `math` and `util` code
* Renamed from `id-sdk` to `rapid-sdk`
