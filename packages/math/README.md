[![npm version](https://badge.fury.io/js/%40rapid-sdk%2Fmath.svg)](https://badge.fury.io/js/%40rapid-sdk%2Fmath)

# @rapid-sdk/math

🧳 The rapid-sdk math library


## Installing

For example, in Node.js:
`npm install @rapid-sdk/math --save-prod`

This library is distributed in CJS and ESM module formats for maxmimum compatibility. ([Read more about Javascript module formats](https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm))


```js
const math = require('@rapid-sdk/math');           // CommonJS import all
const Extent = require('@rapid-sdk/math').Extent;  // CommonJS import named
// or
import * as math from '@rapid-sdk/math';     // ESM import all
import { Extent } from '@rapid-sdk/math';    // ESM import named
```

## Packages

- ⭐️ Math Constants
- 🌐 Geographic (spherical) math functions
- 📈 Geometric (planar) math functions
- 🔢 Number math functions
- 📐 Vector math functions

- 📦 Extent class for working with bounding boxes
- 🀄️ Tiler class for splitting the world into rectangular tiles
- 🕹️ Transform class for managing translation, scale, rotation
- 📺 Viewport class for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates


## Contributing

See the [CONTRIBUTING.md](https://github.com/rapideditor/rapid-sdk/blob/main/CONTRIBUTING.md) file for more info.
