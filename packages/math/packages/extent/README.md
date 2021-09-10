[![npm version](https://badge.fury.io/js/%40id-sdk%2Fextent.svg)](https://badge.fury.io/js/%40id-sdk%2Fextent)

# @id-sdk/extent

📦 Extent class for creating bounding boxes


## Installing

`npm install @id-sdk/extent`

This library is distributed in ESM format only.  It cannot be `require()`'d from CommonJS.
For more, please read Sindre Sorhus’s [FAQ](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

```js
import { Extent } from '@id-sdk/extent';
```


## Contributing

This project is just getting started! 🌱

We're not able to support external contributors at this time, but check back in a bit when things have matured.


## API Reference

##### Methods
* [new Extent](#constructor)(otherOrMin?: Extent | Vec2, max?: Vec2) _constructor_
* [equals](#equals)(other: Extent): boolean
* [area](#area)(): number
* [center](#center)(): Vec2
* [rectangle](#rectangle)(): number[4]
* [toParam](#toParam)(): string
* [bbox](#bbox)(): BBox
* [polygon](#polygon)(): Vec2[5]
* [contains](#contains)(other: Extent): boolean
* [intersects](#intersects)(other: Extent): boolean
* [intersection](#intersection)(other: Extent): Extent
* [percentContainedIn](#percentContainedIn)(other: Extent): number
* [extend](#extend)(other: any): Extent
* [padByMeters](#padByMeters)(meters: number): Extent

##### Properties
* [min](#min): Vec2 - minimum corner of the Extent
* [max](#max): Vec2 - maximum corner of the Extent

##### Types
* [Vec2](#Vec2): [number, number]
* [BBox](#BBox): { minX: number, minY: number, maxX: number, maxY: number }


## Methods

<a name="constructor" href="#constructor">#</a> <b>new Extent</b>(otherOrMin?: Extent | Vec2, max?: Vec2)
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L17 "Source")

Constructs a new Extent.

```js
const e1 = new Extent();                // construct an initially empty extent
const e2 = new Extent([0, 0]);          // construct as a point (min and max both [0, 0])
const e3 = new Extent([0, 0], [5, 5]);  // construct as a point with given min and max
const e4 = new Extent(e3);              // copy an Extent to a new Extent
```


<a name="equals" href="#equals">#</a> <b>equals</b>(other: Extent): boolean
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L38 "Source")

Test whether extent equals another extent.  Returns `true` if they are equal, `false` if not.

```js
const a = new Extent([0, 0], [10, 10]);
const b = new Extent([0, 0], [10, 10]);
const c = new Extent([0, 0], [12, 12]);
a.equals(b);   // returns true
a.equals(c);   // returns false
```


<a name="area" href="#area">#</a> <b>area</b>(): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L49 "Source")

Returns the area of an extent.

```js
new Extent([0, 0], [5, 10]).area();  // returns 50
```


<a name="center" href="#center">#</a> <b>center</b>(): Vec2
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L54 "Source")

Returns the center point of an extent.

```js
new Extent([0, 0], [5, 10]).center();  // returns [2.5, 5]
```


<a name="rectangle" href="#rectangle">#</a> <b>rectangle</b>(): number[4]
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L59 "Source")

Returns an array rectangle as `[minX, minY, maxX, maxY]`.

```js
new Extent([0, 0], [5, 10]).rectangle();  // returns [0, 0, 5, 10]
```


<a name="toParam" href="#toParam">#</a> <b>toParam</b>(): string
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L64 "Source")

Returns a string representation of this extent's rectangle formatted as `"minX,minY,maxX,maxY"`.  This is often used to request a bounding box from a REST API.

```js
new Extent([0, 0], [5, 10]).toParam();  // returns '0,0,5,10'
```


<a name="bbox" href="#bbox">#</a> <b>bbox</b>(): BBox
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L69 "Source")

Returns a BBox Object with `minX`, `minY`, `maxX`, `maxY` properties.

```js
new Extent([0, 0], [5, 10]).bbox();  // returns { minX: 0, minY: 0, maxX: 5, maxY: 10 };
```


<a name="polygon" href="#polygon">#</a> <b>polygon</b>(): Vec2[5]
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L74 "Source")

Returns an array of coordinates as a polygon representing the extent wound clockwise.

```js
new Extent([0, 0], [5, 10]).polygon();  // returns [[0, 0], [0, 10], [5, 10], [5, 0], [0, 0]]
```


<a name="contains" href="#contains">#</a> <b>contains</b>(other: Extent): boolean
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L85 "Source")

Test whether this extent fully contains another extent.  Returns `true` if it does, `false` if not.

```js
const a = new Extent([0, 0], [5, 5]);
const b = new Extent([1, 1], [2, 2]);
a.contains(b);   // returns true
b.contains(a);   // returns false
```


<a name="intersects" href="#intersects">#</a> <b>intersects</b>(other: Extent): boolean
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L96 "Source")

Test whether this extent intersects another extent.  Returns `true` if it does, `false` if not.

```js
const a = new Extent([0, 0], [5, 5]);
const b = new Extent([1, 1], [6, 6]);
a.intersects(b);   // returns true
b.intersects(a);   // returns true
```


<a name="intersection" href="#intersection">#</a> <b>intersection</b>(other: Extent): Extent
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L107 "Source")

Returns a new Extent representing the intersection of this and other extent.

```js
const a = new Extent([0, 0], [5, 5]);
const b = new Extent([1, 1], [6, 6]);
a.intersection(b);   // returns new Extent { min: [ 1, 1 ], max: [ 5, 5 ] }
b.intersection(a);   // returns new Extent { min: [ 1, 1 ], max: [ 5, 5 ] }
```


<a name="percentContainedIn" href="#percentContainedIn">#</a> <b>percentContainedIn</b>(other: Extent): number
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L116 "Source")

Returns the percent of other extent contained within this extent, by area.

```js
const a = new Extent([0, 0], [4, 1]);
const b = new Extent([3, 0], [4, 2]);
a.percentContainedIn(b);   // returns 0.25
b.percentContainedIn(a);   // returns 0.5
```


<a name="extend" href="#extend">#</a> <b>extend</b>(other: Extent): Extent
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L129 "Source")

Extend the bounds of an extent, returning a new Extent.  This method does not modify the original or other extents.

```js
const a = new Extent([0, 0], [5, 10]);
const b = new Extent([4, -1], [5, 10]);
const c = a.extend(b);   // returns new Extent { min: [ 0, -1 ], max: [ 5, 10 ] }
```


<a name="padByMeters" href="#padByMeters">#</a> <b>padByMeters</b>(meters: number): Extent
[<>](https://github.com/ideditor/id-sdk/blob/main/packages/math/extent/src/extent.ts#L138 "Source")

Returns a new Extent representing the current extent (assumed to be defined in WGS84 geographic coordinates) padded by given meters.  This method does not modify the original extent.


## Properties

<a name="min" href="#min">#</a> <b>min</b>: Vec2<br/>
<a name="max" href="#max">#</a> <b>max</b>: Vec2

All of the Extent methods are designed to be used in an immutable programming style, and return new Extents instead of modifying the original object.

```js
const a = new Extent();
const b = new Extent([0, 0], [5, 5]);
const c = a.extend(b);   // `extend` returns a new Extent, does not modify a or b
```

However we make the `min` and `max` properties publicly mutable, in case you need to modify an extent bounds directly for performance reasons.

```js
const a = new Extent();    // construct an initially empty extent
a.min = [0, 0];            // adjust its min/max later
a.max = [5, 5];
```


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`

<a name="BBox" href="#BBox">#</a> <b>BBox</b>

An Object containing `minX`, `minY`, `maxX`, `maxY` numbers.

`{ minX: number, minY: number, maxX: number, maxY: number }`

