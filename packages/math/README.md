[![npm version](https://badge.fury.io/js/%40id-sdk%2Fmath.svg)](https://badge.fury.io/js/%40id-sdk%2Fmath)


# @id-sdk/math

🔢 Collection of iD-sdk math libraries


## Installing

`npm install @id-sdk/math`

This package contains a re-export of the iD-sdk math subpackages.

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const Extent = require('@id-sdk/math').Extent;   // CommonJS
// or
import { Extent } from '@id-sdk/math';   // ES6
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## Modules

### math

Module                | Description
--------------------- | -------------
[@id-sdk/extent]      | 📦 Extent class for creating bounding boxes
[@id-sdk/geo]         | 🌐 Geographic (spherical) math functions
[@id-sdk/geom]        | 📈 Geometric (planar) math functions
[@id-sdk/projection]  | 📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
[@id-sdk/tiler]       | 🀄️ Tiler class for splitting the world into rectangular tiles
[@id-sdk/vector]      | 📐 Vector (coordinate) math functions
<hr></hr>             | <hr></hr>
[@id-sdk/math]        | 🔢 All of the above in one convenient package

[@id-sdk/extent]: /packages/math/extent
[@id-sdk/geo]: /packages/math/geo
[@id-sdk/geom]: /packages/math/geom
[@id-sdk/projection]: /packages/math/projection
[@id-sdk/tiler]: /packages/math/tiler
[@id-sdk/vector]: /packages/math/vector
[@id-sdk/math]: /packages/math
