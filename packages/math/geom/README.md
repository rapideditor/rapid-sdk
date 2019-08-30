# @id-sdk/geom

📈 Geometric (planar) math functions


## Installing

`npm install @id-sdk/geom`

This library is available in both ES5/CommonJS and ES6 module formats.

```js
const geom = require('@id-sdk/geom');                          // CommonJS import all
const geomEdgeEqual = require('@id-sdk/geom').geomEdgeEqual;   // CommonJS import named
// or
import * as geom from '@id-sdk/geom';             // ES6 import all
import { geomEdgeEqual } from '@id-sdk/geom';     // ES6 import named
```


## API Reference

##### Functions
* [geomEdgeEqual](#geomEdgeEqual)(a: Vec2, b: Vec2): boolean
* [geomRotatePoints](#geomRotatePoints)(points: Vec2[], angle: number, around: Vec2): Vec2[]
* [geomLineIntersection](#geomLineIntersection)(a: Vec2[], b: Vec2[]): Vec2 | null
* [geomPathIntersections](#geomPathIntersections)(path1: Vec2[], path2: Vec2[]): Vec2[]
* [geomPathHasIntersections](#geomPathHasIntersections)(path1: Vec2[], path2: Vec2[]): boolean
* [geomPointInPolygon](#geomPointInPolygon)(point: Vec2, polygon: Vec2[]): boolean
* [geomPolygonContainsPolygon](#geomPolygonContainsPolygon)(outer: Vec2[], inner: Vec2[]): boolean
* [geomPolygonIntersectsPolygon](#geomPolygonIntersectsPolygon)(outer: Vec2[], inner: Vec2[], checkSegments?: boolean): boolean
* [geomGetSmallestSurroundingRectangle](#geomGetSmallestSurroundingRectangle)(points: Vec2[]): SSR
* [geomPathLength](#geomPathLength)(path: Vec2[]): number
* [geomViewportNudge](#geomViewportNudge)(point: Vec2, dimensions: Vec2): Vec2 | null

##### Types
* [Vec2](#Vec2): [number, number]
* [SSR](#SSR):  { poly: Vec2, angle: number }


## Functions

<a name="geomEdgeEqual" href="#geomEdgeEqual">#</a> <b>geomEdgeEqual</b>(a: Vec2, b: Vec2): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L21 "Source")

Test whether two given coordinates describe the same edge.  Returns `true` if equal, `false` if unequal.

```js
geomEdgeEqual([1, 2], [1, 2]);   // returns true
geomEdgeEqual([1, 2], [2, 1]);   // returns true
```


<a name="geomRotatePoints" href="#geomRotatePoints">#</a> <b>geomRotatePoints</b>(points: Vec2[], angle: number, around: Vec2): Vec2[] [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L35 "Source")

Rotate all points counterclockwise around a pivot point by given angle (in radians), without modifying the input points array. Returns an array containing the rotated points.

```js
const points = [[1, 0], [1, 1]];
const around = [0, 0];
geomRotatePoints(points, Math.Pi, around);   // returns [[-1, 0], [-1, -1]]
```


<a name="geomLineIntersection" href="#geomLineIntersection">#</a> <b>geomLineIntersection</b>(a: Vec2[], b: Vec2[]): Vec2 | null [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L63 "Source")

Return the intersection point of 2 line segments.  From https://github.com/pgkelley4/line-segments-intersect
This uses the vector cross product approach described here:  http://stackoverflow.com/a/565282/786339

```js
//         b0
//         |
//   a0 ---*--- a1
//         |
//         b1
//
const a = [[0, 0], [10, 0]];
const b = [[5, 5], [5, -5]];
geomLineIntersection(a, b);   // returns [5, 0]
```


<a name="geomPathIntersections" href="#geomPathIntersections">#</a> <b>geomPathIntersections</b>(path1: Vec2[], path2: Vec2[]): Vec2[] [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L102 "Source")

Return all intersection points of 2 paths.

```js
//         b0
//         | \
//   a0 ---*--*--- a1
//         |   \
//        b1 -- b2
//
const a = [[0, 0], [10, 0]];
const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
geomPathIntersections(a, b);   // returns [[5, 0], [7.5, 0]]
```


<a name="geomPathHasIntersections" href="#geomPathHasIntersections">#</a> <b>geomPathHasIntersections</b>(path1: Vec2[], path2: Vec2[]): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L132 "Source")

Returns `true` if paths intersect, `false` if not.

```js
//         b0
//         | \
//   a0 ---*--*--- a1
//         |   \
//        b1 -- b2
//
const a = [[0, 0], [10, 0]];
const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
geomPathHasIntersections(a, b);   // returns true
```


<a name="geomPointInPolygon" href="#geomPointInPolygon">#</a> <b>geomPointInPolygon</b>(point: Vec2, polygon: Vec2[]): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L162 "Source")

Returns `true` if point is contained in polygon, `false` if not.
From https://github.com/substack/point-in-polygon .
Ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

```js
//   p1 --- p2
//   |   *   |
//   p0 --- p3
//
const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
const point = [0.5, 0.5];
geomPointInPolygon(point, poly);   // returns true
```


<a name="geomPolygonContainsPolygon" href="#geomPolygonContainsPolygon">#</a> <b>geomPolygonContainsPolygon</b>(outer: Vec2[], inner: Vec2[]): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L198 "Source")

Returns `true` if every point of inner polygon is contained within outer polygon, `false` if not.

```js
//   o1 -------- o2
//   |  i1 -- i2  |
//   |  |      |  |
//   |  i0 -- i3  |
//   o0 -------- o3
//
const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
const inner = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
geomPolygonContainsPolygon(outer, inner);   // returns true
```


<a name="geomPolygonIntersectsPolygon" href="#geomPolygonIntersectsPolygon">#</a> <b>geomPolygonIntersectsPolygon</b>(outer: Vec2[], inner: Vec2[], checkSegments?: boolean): boolean [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L222 "Source")

Returns `true` if any part of inner polygon intersects outer polygon, `false` if not.
Optionally, pass true to `checkSegments` option to test each segment (stricter but slower).

```js
//       i1 -- i2
//   o1 -+------+-- o2
//   |   |      |   |
//   |   |      |   |
//   o0 -+------+-- o3
//       i0 -- i3
//
const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
const inner = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
geomPolygonIntersectsPolygon(outer, inner, false);   // returns false (lax test - points only)
geomPolygonIntersectsPolygon(outer, inner, true);    // returns true (strict test - points and segments)
```


<a name="geomGetSmallestSurroundingRectangle" href="#geomGetSmallestSurroundingRectangle">#</a> <b>geomGetSmallestSurroundingRectangle</b>(points: Vec2[]): SSR [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L256 "Source")

Return the Smallest Surrounding Rectangle for a given set of points.
See:
 * http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
 * http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756

```js
//  +-- p1 ------ p3
//  |              |
//  p0 ------ p2 --+
//
const points = [[0, -1], [5, 1], [10, -1], [15, 1]];
const ssr = geomGetSmallestSurroundingRectangle(points);
// ssr.poly == [[0, -1], [0, 1], [15, 1], [15, -1], [0, -1]]
// ssr.angle == 0
```


<a name="geomPathLength" href="#geomPathLength">#</a> <b>geomPathLength</b>(path: Vec2[]): number [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L303 "Source")

Return the length of the given path.

```js
//           p2
//          /
//  p0 -- p1
//
const path = [[0, 0], [1, 0], [5, 3]];
geomPathLength(path);  // returns 6
```


<a name="geomViewportNudge" href="#geomViewportNudge">#</a> <b>geomViewportNudge</b>(point: Vec2, dimensions: Vec2): Vec2 | null [<>](https://github.com/ideditor/id-sdk/blob/master/packages/math/geom/src/geom.ts#L313 "Source")

If the given point is at the edge of the padded viewport, return a vector that will nudge the viewport in that direction


## Types

<a name="Vec2" href="#Vec2">#</a> <b>Vec2</b>

An array of two numbers.

`[number, number]`

<a name="SSR" href="#SSR">#</a> <b>SSR</b>

Smallest Surrounding Rectangle.
An Object containing `poly` and `angle` properties.  Used as the return value for [geomGetSmallestSurroundingRectangle()](#geomGetSmallestSurroundingRectangle).

`{ poly: Vec2, angle: number }`

