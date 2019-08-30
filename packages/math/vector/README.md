# @id-sdk/vector

📐 Vector (coordinate) math functions


## Installing

`npm install @id-sdk/vector`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const vec = require('@id-sdk/vector');                 // CommonJS import all
const vecEqual = require('@id-sdk/vector').vecEqual;   // CommonJS import named
// or
import * as vec from '@id-sdk/vector';         // ES6 import all
import { vecEqual } from '@id-sdk/vector';     // ES6 import named
```


## API Reference

##### Functions
* [vecEqual](#vecEqual)(a: Vec2, b: Vec2, epsilon?: number): boolean
* [vecAdd](#vecAdd)(a: Vec2, b: Vec2): Vec2
* [vecSubtract](#vecSubtract)(a: Vec2, b: Vec2): Vec2
* [vecScale](#vecScale)(a: Vec2, n: number): Vec2
* [vecFloor](#vecFloor)(a: Vec2): Vec2
* [vecInterp](#vecInterp)(a: Vec2, b: Vec2, t: number): Vec2
* [vecLength](#vecLength)(a: Vec2, b?: Vec2): number
* [vecNormalize](#vecNormalize)(a: Vec2): Vec2
* [vecAngle](#vecAngle)(a: Vec2, b: Vec2): number
* [vecDot](#vecDot)(a: Vec2, b: Vec2, origin?: Vec2): number
* [vecNormalizedDot](#vecNormalizedDot)(a: Vec2, b: Vec2, origin?: Vec2): number
* [vecCross](#vecCross)(a: Vec2, b: Vec2, origin?: Vec2): number
* [vecProject](#vecProject)(a: Vec2, points: Vec2[]): Edge | null

##### Types
* [Vec2](#Vec2): [number, number]
* [Edge](#Edge): { index: number, distance: number, target: Vec2 }


## Functions

<a name="vecEqual" href="#vecEqual">#</a> <b>vecEqual</b>(a: Vec2, b: Vec2, epsilon?: number): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L18 "Source")

Test whether two given vectors are equal (optionally, to within epsilon).

```js
vecEqual([1, 2], [1, 2]);                         // returns true
vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5);   // returns true
```


<a name="vecAdd" href="#vecAdd">#</a> <b>vecAdd</b>(a: Vec2, b: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L33 "Source")

Adds two vectors, returns the vector sum of `a + b`.

```js
vecAdd([1, 2], [3, 4]);   // returns [4, 6]
```


<a name="vecSubtract" href="#vecSubtract">#</a> <b>vecSubtract</b>(a: Vec2, b: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L44 "Source")

Subtracts two vectors, returns the vector difference of `a - b`.

```js
vecSubtract([1, 2], [3, 4]);   // returns [-2, -2]
```


<a name="vecScale" href="#vecScale">#</a> <b>vecScale</b>(a: Vec2, n: number): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L55 "Source")

Scale a vector uniformly by factor, returns the scaled vector.

```js
vecScale([1, 2], 2);   // returns [2, 4]
```


<a name="vecFloor" href="#vecFloor">#</a> <b>vecFloor</b>(a: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L65 "Source")

Round down the coordinates of a vector.

```js
vecFloor([0, 1.01]);   // returns [0, 1]
```


<a name="vecInterp" href="#vecInterp">#</a> <b>vecInterp</b>(a: Vec2, b: Vec2, t: number): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L77 "Source")

Linear interpolate a point along a vector.

```js
vecInterp([0, 0], [10, 10], 0.5);   // returns [5, 5]
```


<a name="vecLength" href="#vecLength">#</a> <b>vecLength</b>(a: Vec2, b?: Vec2): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L89 "Source")

Returns the length of a vector.  If `b` is not passed in, it defaults to [0,0].

```js
vecLength([0, 0], [4, 3]);   // returns 5
vecLength([4, 3]);           // returns 5
```


<a name="vecNormalize" href="#vecNormalize">#</a> <b>vecNormalize</b>(a: Vec2): Vec2 [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L102 "Source")

Normalize a vector (i.e. returns a unit vector).

```js
vecNormalize([5, 0]);   // returns [1, 0]
```


<a name="vecAngle" href="#vecAngle">#</a> <b>vecAngle</b>(a: Vec2, b: Vec2): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L118 "Source")

Returns the counterclockwise angle in the range (-pi, pi) between the positive X axis and the line intersecting a and b.

```js
vecAngle([0, 0], [-1, 0]);   // returns π
```


<a name="vecDot" href="#vecDot">#</a> <b>vecDot</b>(a: Vec2, b: Vec2, origin?: Vec2): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L130 "Source")

Returns the dot product of two vectors.  If `origin` is not passed in, it defaults to [0,0].

```js
vecDot([2, 0], [2, 0]);   // returns 4
```


<a name="vecNormalizedDot" href="#vecNormalizedDot">#</a> <b>vecNormalizedDot</b>(a: Vec2, b: Vec2, origin?: Vec2): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L145 "Source")

Normalized Dot Product - normalizes input vectors before returning dot product.  If `origin` is not passed in, it defaults to [0,0].

```js
vecNormalizedDot([2, 0], [2, 0]);   // returns 1
```


<a name="vecCross" href="#vecCross">#</a> <b>vecCross</b>(a: Vec2, b: Vec2, origin?: Vec2): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L162 "Source")

Returns the 2D cross product of OA and OB vectors, returns magnitude of Z vector. If `origin` is not passed in, it defaults to [0,0].

This returns a positive value, if OAB makes a counter-clockwise turn, negative for clockwise turn, and zero if the points are collinear.

```js
vecCross([2, 0], [0, 2]);   // returns 4
```


<a name="vecProject" href="#vecProject">#</a> <b>vecProject</b>(a: Vec2, points: Vec2[]): Edge | null [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/vector/src/vector.ts#L199 "Source")

Find closest orthogonal projection of point onto points array.  Returns an Edge object containing info about the projected point, or `null` if `points` is a degenerate path (0- or 1- point).

```js
//     c
//     |
// a --*--- b
//
// * = [2, 0]
//
const a = [0, 0];
const b = [5, 0];
const c = [2, 1];
vecProject(c, [a, b]);   // returns Edge { index: 1, distance: 1, target: [2, 0] }
```


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`


<a name="Edge" href="#Edge">#</a> <b>Edge</b>

An Object containing `index`, `distance`, and `target` properties.  Used as the return value for [vecProject()](#vecProject).

`{ index: number, distance: number, target: Vec2 }`

