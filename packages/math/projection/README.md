# @id-sdk/projection

📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates

 The default projection wraps a [d3.geoMercatorRaw](https://github.com/d3/d3-geo#geoMercatorRaw) projection, but works in degrees instead of radians, and skips several features:
- Antimeridian clipping
- Spherical rotation
- Resampling

## Installing

`npm install @id-sdk/projection`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const Projection = require('@id-sdk/projection').Projection;   // CommonJS
// or
import { Projection } from '@id-sdk/projection';   // ES6
```


## API Reference

##### Methods
* [new Projection](#constructor)(x?: number, y?: number, k?: number) _constructor_
* [project](#project)(p: Vec2): Vec2
* [invert](#invert)(p: Vec2): Vec2
* [scale](#scale)(val?: number): number | Projection
* [translate](#translate)(val?: Vec2): Vec2 | Projection
* [dimensions](#dimensions)(val?: Vec2[]): Vec2[] | Projection
* [transform](#transform)(obj?: Transform): Transform | Projection
* [getStream](#getStream)(): any

##### Types
* [Vec2](#Vec2): [number, number]
* [Transform](#Transform): { x: number, y: number, k: number }


## Methods

<a name="constructor" href="#constructor">#</a> <b>new Projection</b>(x?: number, y?: number, k?: number) [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L41 "Source")

Constructs a new Projection.  The default values are:
`x = 0`, `y = 0`, `k = 256 / Math.PI`
Which corresponds to the world at zoom 1 and centered on "Null Island" [0, 0].

```js
const p1 = new Projection();
const p2 = new Projection(20, 30, 512 / Math.PI);
```


<a name="project" href="#project">#</a> <b>project</b>(p: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L51 "Source")

Projects from given Lon/Lat (λ,φ) to Cartesian (x,y) coordinates.

```js
const p = new Projection();
p.project([0, 0]);                  // returns [0, 0]
p.project([180, -85.0511287798]);   // returns [256, 256]
p.project([-180, 85.0511287798]);   // returns [-256, -256]
```


<a name="invert" href="#invert">#</a> <b>invert</b>(p: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L60 "Source")

Inverse projects from given Cartesian (x,y) to Lon/Lat (λ,φ) coordinates.

```js
const p = new Projection();
p.invert([0, 0]);         // returns [0, 0]
p.invert([256, 256]);     // returns [180, -85.0511287798]
p.invert([-256, -256]);   // returns [-180, 85.0511287798]
```


<a name="scale" href="#scale">#</a> <b>scale</b>(val?: number): number | Projection [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L69 "Source")

When passed a numeric argument, sets the scale factor and returns `this` for method chaining.

When passed no argument, returns the scale factor.

```js
const p = new Projection().scale(512 / Math.PI);   // sets scale
p.scale();   // gets scale - returns 512 / Math.PI;
```


<a name="translate" href="#translate">#</a> <b>translate</b>(val?: Vec2): Vec2 | Projection [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L79 "Source")

When passed a Vec2 argument, sets the `x`,`y` translation values and returns `this` for method chaining.

When passed no argument, returns the `x`,`y` translation values.

```js
const p = new Projection().translate([20, 30]);    // sets translation
p.translate();   // gets translation - returns [20, 30]
```


<a name="dimensions" href="#dimensions">#</a> <b>dimensions</b>(val?: Vec2[]): Vec2[] | Projection [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L90 "Source")

When passed a Vec2[2] argument, sets the viewport min/max dimensions and returns `this` for method chaining.

When passed no argument, returns the viewport min/max dimensions.

```js
const p = new Projection().dimensions([[0, 0], [800, 600]]);    // sets viewport dimensions
p.dimensions();   // gets viewport dimensions - returns [[0, 0], [800, 600]]
```


<a name="transform" href="#transform">#</a> <b>transform</b>(obj?: Transform): Transform | Projection [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L100 "Source")

When passed a Transform argument, sets `x`,`y`,`k` from the Transform and returns `this` for method chaining.

When passed no argument, returns a Transform object containing the current `x`,`y`,`k` values.

```js
const t = { x: 20, y: 30, k: 512 / Math.PI };
const p = new Projection().transform(t);    // sets `x`,`y`,`k` from given Transform object
p.transform();   // gets transform - returns { x: 20, y: 30, k: 512 / Math.PI }
```


<a name="getStream" href="#getStream">#</a> <b>getStream</b>(): any [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/projection/src/projection.ts#L108 "Source")

Returns a [d3.geoTransform](https://github.com/d3/d3-geo#transforms) stream that uses this Projection to project geometry points.

```js
const proj = new Projection();
let s = proj.getStream();
let p;

s.stream = {
  point: (x, y) => {
    p = [x, y];
  }
};
s.point(-180, 85.0511287798);  // returns [256, 256]
```



## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`

<a name="Transform" href="#Transform">#</a> <b>Transform</b>

An Object containing `x`, `y`, `k` numbers.

`{ x: number, y: number, k: number }`
