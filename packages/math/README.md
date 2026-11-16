[![npm version](https://badge.fury.io/js/%40rapid-sdk%2Fmath.svg)](https://badge.fury.io/js/%40rapid-sdk%2Fmath)

# @rapid-sdk/math

🧳 The rapid-sdk math library


## Installing

For example, in Node.js:
`npm install @rapid-sdk/math`

This library is distributed as an ES module. CommonJS code can still `require()` it in Node 20.19+ or 22.12+.


```js
import * as math from '@rapid-sdk/math';     // ESM import all
import { Extent } from '@rapid-sdk/math';    // ESM import named
// or
const math = require('@rapid-sdk/math');           // CommonJS import all
const Extent = require('@rapid-sdk/math').Extent;  // CommonJS import named
```

## Contents

- ⭐️ `constants.ts`: Math Constants
- 📦 `Extent.ts`: Extent class for working with bounding boxes
- 🌐 `geo.ts`: Geographic (spherical) math functions
- 📈 `geom.ts`: Geometric (planar) math functions
- 🔢 `number.ts`: Number math functions
- 📽️ `proj.ts`: Projection math functions
- 🀄️ `Tiler.ts`: Tiler class for splitting the world into rectangular tiles
- 🕹️ `Transform.ts`: Transform class for managing translation, zoom, rotation
- 💭 `types.ts`: TypeScript Types
- 📐 `vector.ts`: Vector math functions
- 📺 `Viewport.ts`: Viewport class for managing view state and converting between Lon/Lat [λ,φ] and Cartesian [x,y] coordinates


## Contributing

See the [CONTRIBUTING.md](https://github.com/rapideditor/rapid-sdk/blob/main/CONTRIBUTING.md) file for more info.
