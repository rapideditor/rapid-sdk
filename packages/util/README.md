[![npm version](https://badge.fury.io/js/%40rapid-sdk%2Futil.svg)](https://badge.fury.io/js/%40rapid-sdk%2Futil)

# @rapid-sdk/util

🧳 The rapid-sdk utility library


## Installing

For example, in Node.js:
`npm install @rapid-sdk/util`

This library is distributed as an ES module. CommonJS code can still `require()` it in Node 20.19+ or 22.12+.


```js
import * as util from '@rapid-sdk/util';           // ESM import all
import { utilHashcode } from '@rapid-sdk/util';    // ESM import named
// or
const util = require('@rapid-sdk/util');                       // CommonJS import all
const utilHashcode = require('@rapid-sdk/util').utilHashcode;  // CommonJS import named
```

## Contents

- 🔑 `aes.ts`:  Functions for performing AES encryption/decryption
- 🗂️ `array.ts`: Array helper functions
- 🗄️ `object.ts`: Object helper functions
- 🗺️ `osm.ts`: OSM helper functions
- 🔒 `session_mutex.ts`:  A per-domain session mutex backed by a cookie and dead man's switch
- 📝 `string.ts`: String helper functions
- 💭 `types.ts`: TypeScript Types


## Contributing

See the [CONTRIBUTING.md](https://github.com/rapideditor/rapid-sdk/blob/main/CONTRIBUTING.md) file for more info.
