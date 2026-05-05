/**
 * 📈 Geometric (planar) math functions
 * @module
 */

import { polygonHull as d3_polygonHull, polygonCentroid as d3_polygonCentroid } from 'd3-polygon';
import { ANGLE_EPSILON, HALF_PI } from './constants';
import { Extent } from './Extent';
import { numWrap } from './number';
import { Vec2, vecLength } from './vector';


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


/** Rotate all points counterclockwise around a pivot point by given angle (in radians), without modifying the input points array
 * @param points target points
 * @param angle angle in radians
 * @param around pivot point
 * @returns rotated points
 * @example
 * const points = [[1, 0], [1, 1]];
 * const around = [0, 0];
 * geomRotatePoints(points, Math.PI, around);   // returns [[-1, 0], [-1, -1]]
 */
export function geomRotatePoints(points: Vec2[], angle: number, around: Vec2): Vec2[] {
  const result: Vec2[] = new Array(points.length);  // prealloc
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const aroundX = around[0];
  const aroundY = around[1];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const radialX = point[0] - aroundX;
    const radialY = point[1] - aroundY;
    result[i] = [
      radialX * cos - radialY * sin + aroundX,
      radialX * sin + radialY * cos + aroundY
    ];
  }
  return result;
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


/** Surrounding Rectangle. An Object containing `poly` and `angle` properties. */
export interface SurroundingRectangle {
  /** the surrounding rectangle polygon */
  poly: Vec2[];
  /** angle offset from x axis */
  angle: number;
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
    poly: geomRotatePoints(bestExtent.polygon(), bestAngle, centroid),
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
