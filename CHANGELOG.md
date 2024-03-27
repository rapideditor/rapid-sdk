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
