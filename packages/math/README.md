[![npm version](https://badge.fury.io/js/%40id-sdk%2Fmath.svg)](https://badge.fury.io/js/%40id-sdk%2Fmath)


# @id-sdk/math

🔢 Collection of iD-sdk math libraries


## Installing

`npm install @id-sdk/math`

This package contains a re-export of the iD-sdk math subpackages.

This library is distributed in ESM format only.  It cannot be `require()`'d from CommonJS.
For more, please read Sindre Sorhus’s [FAQ](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).


```js
import { Extent } from '@id-sdk/math';
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## Packages

### math

Module                | Description
--------------------- | -------------
[@id-sdk/extent]      | 📦 Extent class for creating bounding boxes
[@id-sdk/geo]         | 🌐 Geographic (spherical) math functions
[@id-sdk/geom]        | 📈 Geometric (planar) math functions
[@id-sdk/projection]  | 📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
[@id-sdk/tiler]       | 🀄️ Tiler class for splitting the world into rectangular tiles
[@id-sdk/vector]      | 📐 Vector (coordinate) math functions
---                   | ---
[@id-sdk/math]        | 🔢 All of the above in one convenient package

[@id-sdk/extent]: /packages/math/packages/extent
[@id-sdk/geo]: /packages/math/packages/geo
[@id-sdk/geom]: /packages/math/packages/geom
[@id-sdk/projection]: /packages/math/packages/projection
[@id-sdk/tiler]: /packages/math/packages/tiler
[@id-sdk/vector]: /packages/math/packages/vector
[@id-sdk/math]: /packages/math
