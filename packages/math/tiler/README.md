# @id-sdk/tiler

🀄️ Tiler class for splitting the world into rectangular tiles
See: https://developers.google.com/maps/documentation/javascript/coordinates


## Installing

`npm install @id-sdk/tiler`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const Tiler = require('@id-sdk/tiler').Tiler;   // CommonJS
// or
import { Tiler } from '@id-sdk/tiler';   // ES6
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## API Reference

##### Methods
* [new Tiler](#constructor)() _constructor_
* [getTiles](#getTiles)(projection: Projection): TileResult
* [getGeoJSON](#getGeoJSON)(tileResult: TileResult): Object
* [tileSize](#tileSize)(val?: number): number | Tiler
* [zoomRange](#zoomRange)(val?: Vec2): Vec2 | Tiler
* [margin](#margin)(val?: number): number | Tiler
* [skipNullIsland](#skipNullIsland)(val?: boolean): boolean | Tiler

##### Static Methods
* [Tiler.isNearNullIsland](#Tiler.isNearNullIsland)(x: number, y: number, z: number): boolean

##### Types
* [Vec2](#Vec2): [number, number]
* [TileCoord](#TileCoord): [number, number, number]
* [Tile](#Tile): { id: string, xyz: TileCoord, pxExtent: Extent, wgs84Extent: Extent, isVisible: boolean }
* [TileResult](#TileResult): { tiles: Tile[] }


## Methods

<a name="constructor" href="#constructor">#</a> <b>new Tiler</b>()
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L37 "Source")

Constructs a new Tiler.  By default, the tiler uses a 256px tilesize, a zoomRange of 0-24, fetches no margin tiles beyond the viewport, and includes data around "Null Island". (These defaults can be changed at any time by using accessor methods.)

```js
const t = new Tiler();
```


<a name="getTiles" href="#getTiles">#</a> <b>getTiles</b>(projection: Projection): TileResult
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L41 "Source")

Returns a TileResult object which contains details about all the tiles covering the given projection and viewport.

The tiler accepts a Projection object, which encapsulates the state of the current viewport (translation, scale, and dimensions).

##### At zoom 0:
```js
//
//  +-------+  +85.0511
//  |       |
//  | 0,0,0 |
//  |       |
//  +-------+  -85.0511
//-180    +180
//
const t0 = new Tiler();
const p0 = new Projection(128, 128, 128 / Math.PI)  // z0
    .dimensions([[0, 0], [256, 256]]);              // entire world visible

let result = t0.getTiles(p0);
```

##### At zoom 1:
```js
//
//  +-------+-------+  +85.0511
//  |       |       |
//  | 0,0,1 | 1,0,1 |
//  |       |       |
//  +-------+-------+   0
//  |       |       |
//  | 0,1,1 | 1,1,1 |
//  |       |       |
//  +-------+-------+  -85.0511
//-180      0     +180
//
const t1 = new Tiler();
const p1 = new Projection(256, 256, 256 / Math.PI)  // z1
    .dimensions([[0, 0], [512, 512]]);              // entire world visible

let result = t1.getTiles(p1);
```

##### At zoom 2:
```js
//
//  +-------+-------+-------+-------+  +85.0511
//  |       |       |       |       |
//  | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
//  |       |       |       |       |
//  +-------+-------+-------+-------+  +66.5133
//  |       |       |       |       |
//  | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
//  |       |       |       |       |
//  +-------+-------+-------+-------+   0
//  |       |       |       |       |
//  | 0,2,2 | 1,2,2 | 2,2,2 | 3,2,2 |
//  |       |       |       |       |
//  +-------+-------+-------+-------+  -66.5133
//  |       |       |       |       |
//  | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
//  |       |       |       |       |
//  +-------+-------+-------+-------+  -85.0511
//-180     -90      0      +90    +180
//
const t2 = new Tiler();
const p2 = new Projection(512, 512, 512 / Math.PI)  // z2
    .dimensions([[0, 0], [1024, 1024]]);            // entire world visible

let result = t2.getTiles(p2);
```


<a name="getGeoJSON" href="#getGeoJSON">#</a> <b>getGeoJSON</b>(tileResult: TileResult): Object
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L114 "Source")

Accepts a TileResult object and returns a GeoJSON FeatureCollection containing a Feature for each rectangular tile.  Useful for displaying a tile grid for debugging.

```js
const t = new Tiler();
const p = new Projection(256, 256, 256 / Math.PI)  // z1
    .dimensions([[0, 0], [512, 512]]);             // entire world visible

let result = t.getTiles(p);
let gj = t.getGeoJSON(result);    // returns a GeoJSON FeatureCollection
```


<a name="tileSize" href="#tileSize">#</a> <b>tileSize</b>(val?: number): number | Tiler
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L136 "Source")

When passed a numeric argument, sets the tile size and returns `this` for method chaining.

When passed no argument, returns the tile size.

```js
const t = new Tiler().tileSize(512);   // sets tile size
t.tileSize();   // gets tile size - returns 512
```


<a name="zoomRange" href="#zoomRange">#</a> <b>zoomRange</b>(val?: Vec2): Vec2 | Tiler
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L143 "Source")

When passed a Vec2 argument, sets the min/max zoom range and returns `this` for method chaining.

When passed no argument, returns the min/max zoom range.

```js
const t = new Tiler().zoomRange([10, 20]);   // sets min/max zoom range
t.zoomRange();   // gets min/max zoom range - returns [10, 20]
```


<a name="margin" href="#margin">#</a> <b>margin</b>(val?: number): number | Tiler
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L151 "Source")

Sometimes it can be useful to fetch additional tiles that extend beyond the viewport, for example to preload data that may soon be visible, or to complete connections and merge geometries with nearby tiles.

When passed a numeric argument, sets the tile margin and returns `this` for method chaining.

When passed no argument, returns the tile margin.

```js
const t = new Tiler().margin(1);   // sets tile margin
t.margin();   // gets tile margin - returns 1
```


<a name="skipNullIsland" href="#skipNullIsland">#</a> <b>skipNullIsland</b>(val?: boolean): boolean | Tiler
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L158 "Source")

When loading data from a tiled service, it is common for invalid data to be located around "Null Island", therefore it can be useful to skip loading these tiles.

When passed a boolean argument, sets the `skipNullIsland` value and returns `this` for method chaining.

When passed no argument, returns the `skipNullIsland` value.

```js
const t = new Tiler().skipNullIsland(true);   // sets skipNullIsland value
t.skipNullIsland();   // gets skipNullIsland value - returns true
```


## Static Methods

<a name="Tiler.isNearNullIsland" href="#Tiler.isNearNullIsland">#</a> <b>Tiler.isNearNullIsland</b>(x: number, y: number, z: number): boolean
[<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/tiler/src/tiler.ts#L178 "Source")

Tests whether the given `x`,`y`,`z` tile coordinate is near "Null Island" [0,0].

A tile is considered "near" if it >= z7 and around the center of the map
within these or descendent tiles (roughly within about 2.8° of [0,0]).

```
+---------+---------+
|         |         |
| 63,63,7 | 64,63,7 |
|         |         |
+-------[0,0]-------+
|         |         |
| 63,64,7 | 64,64,7 |
|         |         |
+---------+---------+
```

```js
Tiler.isNearNullIsland(31, 31, 6);    // returns false (zoom 6)
Tiler.isNearNullIsland(63, 65, 7);    // returns false (south of Null Island region)

Tiler.isNearNullIsland(63, 63, 7);    // returns true
Tiler.isNearNullIsland(127, 127, 8);  // returns true
```


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`


<a name="TileCoord" href="#TileCoord">#</a> <b>TileCoord</b>

An array of three numbers for representing a tile coordinate with `x`,`y`,`z`.

`[number, number, number]`


<a name="Tile" href="#Tile">#</a> <b>Tile</b>

An Object containing everything you need to know about a tile.

`{ id: string, xyz: TileCoord, pxExtent: Extent, wgs84Extent: Extent, isVisible: boolean }`


<a name="TileResult" href="#TileResult">#</a> <b>TileResult</b>

An Object used to return information about the tiles covering a given projection and viewport.

`{ tiles: Tile[] }`
