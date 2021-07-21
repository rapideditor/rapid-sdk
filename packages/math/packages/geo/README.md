[![npm version](https://badge.fury.io/js/%40id-sdk%2Fgeo.svg)](https://badge.fury.io/js/%40id-sdk%2Fgeo)

# @id-sdk/geo

🌐 Geographic (spherical) math functions


## Installing

`npm install @id-sdk/geo`

This library is distributed in ESM format only.  It cannot be `require()`'d from CommonJS.
For more, please read Sindre Sorhus’s [FAQ](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

```js
import * as geo from '@id-sdk/geo';
import { geoLatToMeters } from '@id-sdk/geo';
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.



## API Reference

##### Functions
* [geoLatToMeters](#geoLatToMeters)(dLat: number): number
* [geoLonToMeters](#geoLonToMeters)(dLon: number, atLat: number): number
* [geoMetersToLat](#geoMetersToLat)(m: number): number
* [geoMetersToLon](#geoMetersToLon)(m: number, atLat: number): number
* [geoMetersToOffset](#geoMetersToOffset)(m: Vec2, tileSize?: number): Vec2
* [geoOffsetToMeters](#geoOffsetToMeters)(offset: Vec2, tileSize?: number): Vec2
* [geoSphericalDistance](#geoSphericalDistance)(a: Vec2, b: Vec2): number
* [geoScaleToZoom](#geoScaleToZoom)(k: number, tileSize?: number): number
* [geoZoomToScale](#geoZoomToScale)(z: number, tileSize?: number): number
* [geoSphericalClosestPoint](#geoSphericalClosestPoint)(points: Vec2[], a: Vec2): Closest | null

##### Types
* [Vec2](#Vec2): [number, number]
* [Closest](#Closest): { index: number, distance: number, point: Vec2 }


## Functions

<a name="geoLatToMeters" href="#geoLatToMeters">#</a> <b>geoLatToMeters</b>(dLat: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L10 "Source")

Convert degrees latitude to meters.

```js
geoLatToMeters(1);  // returns ≈111319
```


<a name="geoLonToMeters" href="#geoLonToMeters">#</a> <b>geoLonToMeters</b>(dLon: number, atLat: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L15 "Source")

Convert degrees longitude to meters at a given latitude.

```js
geoLonToMeters(1, 0);  // returns ≈110946 at equator
```


<a name="geoMetersToLat" href="#geoMetersToLat">#</a> <b>geoMetersToLat</b>(m: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L22 "Source")

Convert meters to degrees latitude.

```js
geoMetersToLat(111319);  // returns ≈1°
```


<a name="geoMetersToLon" href="#geoMetersToLon">#</a> <b>geoMetersToLon</b>(m: number, atLat: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L27 "Source")

Convert meters to degrees longitude at a given latitude.

```js
geoMetersToLon(110946, 0);  // returns ≈1° at equator
```


<a name="geoMetersToOffset" href="#geoMetersToOffset">#</a> <b>geoMetersToOffset</b>(m: Vec2, tileSize?: number): Vec2
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L34 "Source")

Convert offset in meters (for example, imagery offset) to offset in tile pixels.  `tileSize` defaults to 256px.

```js
geoMetersToOffset([100, 100]);  // returns ≈[0.00064, -0.00064] pixels
```


<a name="geoOffsetToMeters" href="#geoOffsetToMeters">#</a> <b>geoOffsetToMeters</b>(offset: Vec2, tileSize?: number): Vec2
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L40 "Source")

Convert imagery offset in tile pixels to offset in meters.  `tileSize` defaults to 256px.

```js
geoOffsetToMeters([0.00064, -0.00064]);  // returns ≈[100, 100] meters
```


<a name="geoSphericalDistance" href="#geoSphericalDistance">#</a> <b>geoSphericalDistance</b>(a: Vec2, b: Vec2): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L49 "Source")

Equirectangular approximation of spherical distances on Earth.

```js
geoSphericalDistance([0, 0], [1, 0]);  // returns ≈110946 meters
```


<a name="geoScaleToZoom" href="#geoScaleToZoom">#</a> <b>geoScaleToZoom</b>(k: number, tileSize?: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L56 "Source")

Projection scale factor to tile zoom level.  `tileSize` defaults to 256px.

```js
geoScaleToZoom(5340353.7154);  // returns ≈17
```


<a name="geoZoomToScale" href="#geoZoomToScale">#</a> <b>geoZoomToScale</b>(z: number, tileSize?: number): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L63 "Source")

Tile zoom to projection scale factor.  `tileSize` defaults to 256px.

```js
geoZoomToScale(17);  // returns ≈5340353.7154
```


<a name="geoSphericalClosestPoint" href="#geoSphericalClosestPoint">#</a> <b>geoSphericalClosestPoint</b>(points: Vec2[], a: Vec2): Closest | null
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/geo/src/geo.ts#L75 "Source")

Returns info about the point from `points` closest to the given test point `a`.



## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`


<a name="Closest" href="#Closest">#</a> <b>Closest</b>

An Object containing `index`, `distance`, and `point` properties.  Used as the return value for [geoSphericalClosestPoint()](#geoSphericalClosestPoint).

`{ index: number, distance: number, point: Vec2 }`

