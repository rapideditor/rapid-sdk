[![npm version](https://badge.fury.io/js/%40id-sdk%2Futil.svg)](https://badge.fury.io/js/%40id-sdk%2Futil)


# @id-sdk/util

🧰 Collection of iD-sdk utility libraries


## Installing

`npm install @id-sdk/util`

This library is distributed in ESM format only.  It cannot be `require()`'d from CommonJS.
For more, please read Sindre Sorhus’s [FAQ](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

```js
import * as util from '@id-sdk/util';
import { utilHashcode } from '@id-sdk/util';
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## API Reference

TODO

### Functions

#### AES
* `utilAesEncrypt`
* `utilAesDecrypt`

#### Array
* `utilArrayChunk`
* `utilArrayDifference`
* `utilArrayFlatten`
* `utilArrayGroupBy`
* `utilArrayIdentical`
* `utilArrayIntersection`
* `utilArrayUnion`
* `utilArrayUniq`
* `utilArrayUniqBy`

#### Object
* `utilObjectOmit`

#### OSM
* `utilCleanTags`
* `utilCombinedTags`
* `utilDeepMemberSelector`
* `utilEntityRoot`
* `utilEntitySelector`
* `utilEntityOrMemberSelector`
* `utilEntityOrDeepMemberSelector`
* `utilGetAllNodes`
* `utilTagDiff`
* `utilTagText`

#### Session
* `utilSessionMutex`

#### String
* `utilEditDistance`
* `utilHashcode`
* `utilQsString`
* `utilStringQs`
* `utilUnicodeCharsCount`
* `utilUnicodeCharsTruncated`
* `utilSafeString`
* `utilUniqueString`

