/**
 * 📈 Geometric (planar) math functions
 * @module
 */

import { polygonHull as d3_polygonHull, polygonCentroid as d3_polygonCentroid } from 'd3-polygon';
import { ANGLE_EPSILON, HALF_PI } from './constants.ts';
import { Extent } from './Extent.ts';
import { numWrap } from './number.ts';
import { vecLength } from './vector.ts';

import type { SurroundingRectangle, Vec2 } from './types.ts';


/** Test whether two given coordinates describe the same edge
 * @param a
 * @param b
 * @returns `true` if equal, `false` if unequal.
 * @example
 * geomEdgeEqual([1, 2], [1, 2]);   // returns true
 * geomEdgeEqual([1, 2], [2, 1]);   // returns true
 */
export function geomEdgeEqual(a: Vec2, b: Vec2): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}


/** Reflect all points across a line axis, without modifying the input points array
 * @remarks Axis is the infinite line through `axis[0]` and `axis[1]`.
 * @param points Array of points to reflect
 * @param axis reflection axis as `[start, end]`
 * @returns reflected points
 * @example
 * const points = [[0, 0], [2, 2], [3, 1]];
 * geomReflect(points, [[0, 1], [2, 1]]);   // returns [[0, 2], [2, 0], [3, 1]]
 */
export function geomReflect<T extends Vec2[]>(points: T, axis: [Vec2, Vec2]): T {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const [axisA, axisB] = axis;
  const [axisAX, axisAY] = axisA;
  const dx = axisB[0] - axisAX;
  const dy = axisB[1] - axisAY;
  const denom = dx * dx + dy * dy;

  // Degenerate axis - keep geometry unchanged.
  if (!denom) {
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      result[i] = [point[0], point[1]];
    }
    return result as T;
  }

  // reflect p across ab
  // http://math.stackexchange.com/questions/65503/point-reflection-over-a-line
  const a = (dx * dx - dy * dy) / denom;
  const b = (2 * dx * dy) / denom;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const radialX = point[0] - axisAX;
    const radialY = point[1] - axisAY;
    result[i] = [
      a * radialX + b * radialY + axisAX,
      b * radialX - a * radialY + axisAY
    ];
  }
  return result as T;
}


/** Rotate all points counterclockwise around a pivot point by given angle (in radians), without modifying the input points array
 * @param points Array of points to rotate
 * @param angle angle in radians
 * @param origin pivot point
 * @returns rotated points
 * @example
 * const points = [[1, 0], [1, 1]];
 * const origin = [0, 0];
 * geomRotate(points, Math.PI, origin);   // returns [[-1, 0], [-1, -1]]
 */
export function geomRotate<T extends Vec2[]>(points: T, angle: number, origin: Vec2): T {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const [originX, originY] = origin;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const radialX = point[0] - originX;
    const radialY = point[1] - originY;
    result[i] = [
      radialX * cos - radialY * sin + originX,
      radialX * sin + radialY * cos + originY
    ];
  }
  return result as T;
}


/** Scale all points relative to an origin point, without modifying the input points array
 * @param points Array of points to scale
 * @param scaleFactor scale factor (`1` keeps size unchanged)
 * @param origin origin point
 * @returns scaled points
 * @example
 * const points = [[1, 0], [2, 0]];
 * const origin = [0, 0];
 * geomScale(points, 2, origin);   // returns [[2, 0], [4, 0]]
 */
export function geomScale<T extends Vec2[]>(points: T, scaleFactor: number, origin: Vec2): T {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const [originX, originY] = origin;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    result[i] = [
      originX + scaleFactor * (point[0] - originX),
      originY + scaleFactor * (point[1] - originY)
    ];
  }
  return result as T;
}


/** Convert points from global coordinates into a local coordinate frame.
 * @remarks Subtracting a local origin is useful before precision-sensitive geometry
 * operations (for example cross products used in centroid/area calculations).
 * @param points target points
 * @param origin local frame origin
 * @returns points in local frame
 * @example
 * const world = [[1000, 2000], [1005, 2003]];
 * geomToLocal(world, [1000, 2000]);   // returns [[0, 0], [5, 3]]
 */
export function geomToLocal<T extends Vec2[]>(points: T, origin: Vec2): T {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const [originX, originY] = origin;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    result[i] = [point[0] - originX, point[1] - originY];
  }
  return result as T;
}


/** Convert points from a local coordinate frame back into global coordinates.
 * @param points points in local frame
 * @param origin local frame origin
 * @returns points in global coordinates
 * @example
 * const local = [[0, 0], [5, 3]];
 * geomToOrigin(local, [1000, 2000]);   // returns [[1000, 2000], [1005, 2003]]
 */
export function geomToOrigin<T extends Vec2[]>(points: T, origin: Vec2): T {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const [originX, originY] = origin;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    result[i] = [point[0] + originX, point[1] + originY];
  }
  return result as T;
}


/** Return the intersection point of 2 line segments
 * @remarks From https://github.com/pgkelley4/line-segments-intersect
 * This uses the vector cross product approach http://stackoverflow.com/a/565282/786339
 * @param a
 * @param b
 * @returns intersection point if exists, null otherwise
 * @example
 *         b0
 *         |
 *   a0 ---*--- a1
 *         |
 *         b1
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5]];
 * geomLineIntersection(a, b);   // returns [5, 0]
 */
export function geomLineIntersection(a: Vec2[], b: Vec2[]): Vec2 | null;
export function geomLineIntersection(a0: Vec2, a1: Vec2, b0: Vec2, b1: Vec2): Vec2 | null;
export function geomLineIntersection(
  aOrA0: Vec2[] | Vec2,
  bOrA1: Vec2[] | Vec2,
  cOrB0?: Vec2,
  dOrB1?: Vec2
): Vec2 | null {
  let a0: Vec2;
  let a1: Vec2;
  let b0: Vec2;
  let b1: Vec2;

  if (cOrB0 !== undefined && dOrB1 !== undefined) {
    a0 = aOrA0 as Vec2;
    a1 = bOrA1 as Vec2;
    b0 = cOrB0;
    b1 = dOrB1;
  } else {
    const a = aOrA0 as Vec2[];
    const b = bOrA1 as Vec2[];
    if (a.length !== 2 || b.length !== 2) return null;
    a0 = a[0];
    a1 = a[1];
    b0 = b[0];
    b1 = b[1];
  }

  const rx = a1[0] - a0[0];
  const ry = a1[1] - a0[1];
  const sx = b1[0] - b0[0];
  const sy = b1[1] - b0[1];
  const qpx = b0[0] - a0[0];
  const qpy = b0[1] - a0[1];

  // 2D cross products: r×s determines parallelism; (q-p)×r and (q-p)×s solve segment parameters.
  const uNumerator = qpx * ry - qpy * rx;
  const denominator = rx * sy - ry * sx;

  if (uNumerator && denominator) {
    const u = uNumerator / denominator;
    const t = (qpx * sy - qpy * sx) / denominator;   // t,u are intersection factors along segments a and b

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return [a0[0] + t * rx, a0[1] + t * ry];
    }
  }

  return null;
}


/** Return all intersection points of 2 paths
 * @param path1
 * @param path2
 * @returns intersection points
 * @example
 *        b0
 *        | \
 *  a0 ---*--*--- a1
 *        |   \
 *       b1 -- b2
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
 * geomPathIntersections(a, b);   // returns [[5, 0], [7.5, 0]]
 */
export function geomPathIntersections(path1: Vec2[], path2: Vec2[]): Vec2[] {
  const intersections: Vec2[] = [];
  for (let i = 0; i < path1.length - 1; i++) {
    const a0 = path1[i];
    const a1 = path1[i + 1];
    for (let j = 0; j < path2.length - 1; j++) {
      const hit = geomLineIntersection(a0, a1, path2[j], path2[j + 1]);
      if (hit) {
        intersections.push(hit);
      }
    }
  }
  return intersections;
}


/** Return true if paths intersect, false if not
 * @param path1
 * @param path2
 * @returns
 * @example
 *        b0
 *        | \
 *  a0 ---*--*--- a1
 *        |   \
 *       b1 -- b2
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
 * geomPathHasIntersections(a, b);   // returns true
 */
export function geomPathHasIntersections(path1: Vec2[], path2: Vec2[]): boolean {
  for (let i = 0; i < path1.length - 1; i++) {
    const a0 = path1[i];
    const a1 = path1[i + 1];
    for (let j = 0; j < path2.length - 1; j++) {
      if (geomLineIntersection(a0, a1, path2[j], path2[j + 1])) {
        return true;
      }
    }
  }
  return false;
}


/** Return true if point is contained in polygon, false otherwise
 * @remarks From https://github.com/substack/point-in-polygon
 * ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param point
 * @param polygon
 * @returns
 * @example
 *  p1 --- p2
 *  |   *   |
 *  p0 --- p3
 * const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
 * const point = [0.5, 0.5];
 * geomPointInPolygon(point, poly);   // returns true
 */
export function geomPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}


/** Return true if every point of inner polygon is contained within outer polygon, false otherwise
 * @remarks From https://github.com/substack/point-in-polygon
 * ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param outer
 * @param inner
 * @returns
 * @example
 *  o1 -------- o2
 *  |  i1 -- i2  |
 *  |  |      |  |
 *  |  i0 -- i3  |
 *  o0 -------- o3
 * const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
 * const inner = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
 * geomPolygonContainsPolygon(outer, inner);   // returns true
 */
export function geomPolygonContainsPolygon(outer: Vec2[], inner: Vec2[]): boolean {
  return inner.every((point: Vec2) => {
    return geomPointInPolygon(point, outer);
  });
}


/** Return true if any part of inner polygon intersects outer polygon, false otherwise
 * @param outer
 * @param inner
 * @param checkSegments if true test each segment (stricter but slower).
 * @returns
 * @example
 *      i1 -- i2
 *  o1 -+------+-- o2
 *  |   |      |   |
 *  |   |      |   |
 *  o0 -+------+-- o3
 *      i0 -- i3
 * const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
 * const inner = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
 * geomPolygonIntersectsPolygon(outer, inner, false);   // returns false (lax test - points only)
 * geomPolygonIntersectsPolygon(outer, inner, true);    // returns true (strict test - points and segments)
 */
export function geomPolygonIntersectsPolygon(outer: Vec2[], inner: Vec2[], checkSegments?: boolean): boolean {
  function testPoints(outer2: Vec2[], inner2: Vec2[]): boolean {
    return inner2.some((point: Vec2) => {
      return geomPointInPolygon(point, outer2);
    });
  }

  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}


/**
 * A generalized function for computing a surrounding rectangle for a given Array of points.
 * The caller supplies `getScore` and `isBetter` functions that define the heuristic which
 * determines what kind of rectangle to gather ("smallest" or "longest").
 * @param points
 * @param getScore
 * @param isBetter
 * @param initialBestScore
 * @returns  A SurroundingRectangle (polygon and angle) or `null` if the given points did not produce a valid hull.
 */
export function getSurroundingRectangle(
  points: Vec2[],
  getScore: (extent: Extent) => number,
  isBetter: (score: number, bestScore: number) => boolean,
  initialBestScore: number
): SurroundingRectangle | null {
  const hull: Vec2[] | null = d3_polygonHull(points);
  if (!hull) return null;

  const centroid: Vec2 = d3_polygonCentroid(hull);
  const centroidX = centroid[0];
  const centroidY = centroid[1];
  const checkedAngles = new Set<number>();
  let bestScore = initialBestScore;
  let bestExtent = new Extent();
  let bestAngle = 0;

  for (let i = 0; i < hull.length; i++) {
    const c1: Vec2 = hull[i];
    const c2: Vec2 = i === hull.length - 1 ? hull[0] : hull[i + 1];
    const wrapped = numWrap(Math.atan2(c2[1] - c1[1], c2[0] - c1[0]), 0, HALF_PI);  // normalize angle between 0..π/2
    const angle = (wrapped < ANGLE_EPSILON || (HALF_PI - wrapped) < ANGLE_EPSILON) ? 0 : wrapped;
    const angleKey = Math.round(angle / ANGLE_EPSILON);
    if (checkedAngles.has(angleKey)) continue;
    checkedAngles.add(angleKey);

    const sin = Math.sin(-angle);
    const cos = Math.cos(-angle);
    const extent = new Extent();
    for (const point of hull) {
      const radialX = point[0] - centroidX;
      const radialY = point[1] - centroidY;
      const x = radialX * cos - radialY * sin + centroidX;
      const y = radialX * sin + radialY * cos + centroidY;

      // update Extent min/max in-place for speed
      extent.min[0] = Math.min(extent.min[0], x);
      extent.min[1] = Math.min(extent.min[1], y);
      extent.max[0] = Math.max(extent.max[0], x);
      extent.max[1] = Math.max(extent.max[1], y);
    }

    const score = getScore(extent);
    if (isBetter(score, bestScore)) {
      bestScore = score;
      bestExtent = extent;
      bestAngle = angle;
    }
  }

  return {
    polygon: geomRotate(bestExtent.polygon(), bestAngle, centroid),
    angle: bestAngle
  };
}


/** Return the Smallest Surrounding Rectangle for a given Array of points
 * @remarks
 * http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
 * http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756
 * @param points
 * @returns The smallest `SurroundingRectangle` by area, or `null` if the given points did not produce a valid hull.
 * @example
 * p5 --- p4
 * |      |
 * |      p3 ------ p2
 * |                |
 * p0 ------------- p1
 * const footprint = [[0, 0], [8, 0], [8, 2], [3, 2], [3, 6], [0, 6], [0, 0]];
 * const points = geomRotatePoints(footprint, Math.PI / 6, [0, 0]);
 * const ssr = geomGetSmallestSurroundingRectangle(points);
 * // ssr.angle == Math.PI / 6
 */
export function geomGetSmallestSurroundingRectangle(points: Vec2[]): SurroundingRectangle | null {
  const getScore = (extent: Extent) => extent.area();
  const isBest = (score: number, best: number) => score < best;
  return getSurroundingRectangle(points, getScore, isBest, Infinity);
}


/** Return the Longest Surrounding Rectangle for a given Array of points
 * @remarks
 * Loops over the convex hull edges, rotates to each edge angle, and chooses the
 * rectangle with the maximum side length.
 * @param points
 * @returns The longest `SurroundingRectangle` by side length, or `null` if the given points did not produce a valid hull.
 * @example
 * p5 --- p4
 * |      |
 * |      p3 ------ p2
 * |                |
 * p0 ------------- p1
 * const footprint = [[0, 0], [8, 0], [8, 2], [3, 2], [3, 6], [0, 6], [0, 0]];
 * const points = geomRotatePoints(footprint, Math.PI / 6, [0, 0]);
 * const lsr = geomGetLongestSurroundingRectangle(points);
 * // lsr.angle ~= 1.4196541601696426
 */
export function geomGetLongestSurroundingRectangle(points: Vec2[]): SurroundingRectangle | null {
  const getScore = (extent: Extent) => Math.max(Math.abs(extent.max[0] - extent.min[0]), Math.abs(extent.max[1] - extent.min[1]));
  const isBest = (score: number, best: number) => score > best;
  return getSurroundingRectangle(points, getScore, isBest, -Infinity);
}


/** Return the length of the given path
 * @param path
 * @returns length
 * @example
 *          p2
 *         /
 * p0 -- p1
 * const path = [[0, 0], [1, 0], [5, 3]];
 * geomPathLength(path);  // returns 6
 */
export function geomPathLength(path: Vec2[]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    length += vecLength(path[i], path[i + 1]);
  }
  return length;
}
