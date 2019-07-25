/**
 * @module @id-sdk/geom
 * @description 📈 Module containing Geometric (planar) math functions
 */

import { polygonHull as d3_polygonHull, polygonCentroid as d3_polygonCentroid } from 'd3-polygon';

import { Extent } from '@id-sdk/extent';
import { vecCross, vecDot, vecEqual, vecInterp, vecLength, vecSubtract } from '@id-sdk/vector';

type Vec2 = [number, number];

/** Test whether two given coordinates describe the same edge
 * @param {Vec2} a - Start coordinate
 * @param {Vec2} b - End coordinate
 * @returns {boolean} True if equal, false if unequal
 * @example
 * geomEdgeEqual([1, 2], [1, 2]);   // returns true
 * geomEdgeEqual([1, 2], [2, 1]);   // returns true
 */
export function geomEdgeEqual(a: Vec2, b: Vec2): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

/** Rotate all points counterclockwise around a pivot point by given angle
 * @param {Vec2[]} points - points
 * @param {number} angle - Rotation angle
 * @param {Vec2} around - Point to rotate around
 * @returns {Vec2[]} Rotated points
 * @example
 * const points = [[1, 0], [1, 1]];
 * const around = [0, 0];
 * geomRotatePoints(points, Math.Pi, around);   // returns [[-1, 0], [-1, -1]]
 */
export function geomRotatePoints(points: Vec2[], angle: number, around: Vec2): Vec2[] {
  return points.map((point: Vec2) => {
    const radial: Vec2 = vecSubtract(point, around);
    return [
      radial[0] * Math.cos(angle) - radial[1] * Math.sin(angle) + around[0],
      radial[0] * Math.sin(angle) + radial[1] * Math.cos(angle) + around[1]
    ];
  });
}

/** Return the intersection point of 2 line segments.
 * From https://github.com/pgkelley4/line-segments-intersect
 * This uses the vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 * @param {Vec2[]} a - First line
 * @param {Vec2[]} b - Second line
 * @returns {Vec2|null} Intersection point found, or null if no intersection
 * @example
 * //         b0
 * //         |
 * //   a0 ---*--- a1
 * //         |
 * //         b1
 * //
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5]];
 * geomLineIntersection(a, b);   // returns [5, 0]
 */
export function geomLineIntersection(a: Vec2[], b: Vec2[]): Vec2 | null {
  const p: Vec2 = [a[0][0], a[0][1]];
  const p2: Vec2 = [a[1][0], a[1][1]];
  const q: Vec2 = [b[0][0], b[0][1]];
  const q2: Vec2 = [b[1][0], b[1][1]];
  const r: Vec2 = vecSubtract(p2, p);
  const s: Vec2 = vecSubtract(q2, q);
  const uNumerator: number = vecCross(vecSubtract(q, p), r);
  const denominator: number = vecCross(r, s);

  if (uNumerator && denominator) {
    const u = uNumerator / denominator;
    const t = vecCross(vecSubtract(q, p), s) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return vecInterp(p, p2, t);
    }
  }

  return null;
}

/** Return all intersection points of 2 paths
 * @param {Vec2[]} path1 - First path
 * @param {Vec2[]} path2 - Second path
 * @returns {Vec2[]|null} Array of intersection points found, or null if no intersections
 * @example
 * //         b0
 * //         | \
 * //   a0 ---*--*--- a1
 * //         |   \
 * //        b1 -- b2
 * //
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
 * geomPathIntersections(a, b);   // returns [[5, 0], [7.5, 0]]
 */
export function geomPathIntersections(path1: Vec2[], path2: Vec2[]): Vec2[] {
  let intersections: Vec2[] = [];
  for (let i: number = 0; i < path1.length - 1; i++) {
    for (let j: number = 0; j < path2.length - 1; j++) {
      const a: Vec2[] = [path1[i], path1[i + 1]];
      const b: Vec2[] = [path2[j], path2[j + 1]];
      const hit: Vec2 = geomLineIntersection(a, b);
      if (hit) {
        intersections.push(hit);
      }
    }
  }
  return intersections;
}

/** Return true if paths intersect, false if not
 * @param {Vec2[]} path1 - First path
 * @param {Vec2[]} path2 - Second path
 * @returns {boolean} True if paths intersect, false if not
 * @example
 * //         b0
 * //         | \
 * //   a0 ---*--*--- a1
 * //         |   \
 * //        b1 -- b2
 * //
 * const a = [[0, 0], [10, 0]];
 * const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
 * geomPathHasIntersections(a, b);   // returns true
 */
export function geomPathHasIntersections(path1: Vec2[], path2: Vec2[]): boolean {
  for (let i: number = 0; i < path1.length - 1; i++) {
    for (let j: number = 0; j < path2.length - 1; j++) {
      const a: Vec2[] = [path1[i], path1[i + 1]];
      const b: Vec2[] = [path2[j], path2[j + 1]];
      const hit: Vec2 | null = geomLineIntersection(a, b);
      if (hit) {
        return true;
      }
    }
  }
  return false;
}

/** Return true if point is contained in polygon
 * From https://github.com/substack/point-in-polygon.
 * ray-casting algorithm based on
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param {Vec2} point - The point to test
 * @param {Vec2[]} polygon - Polygon represented as closed array of points
 * @returns {boolean} True if point is within polygon, false if not
 * @example
 * //   p1 --- p2
 * //   |   *   |
 * //   p0 --- p3
 * //
 * const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
 * const point = [0.5, 0.5];
 * geomPointInPolygon(point, poly);   // returns true
 */
export function geomPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  const x: number = point[0];
  const y: number = point[1];
  let inside: boolean = false;

  for (let i: number = 0, j: number = polygon.length - 1; i < polygon.length; j = i++) {
    const xi: number = polygon[i][0];
    const yi: number = polygon[i][1];
    const xj: number = polygon[j][0];
    const yj: number = polygon[j][1];

    const intersect: boolean = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/** Return true if every point of inner polygon is contained within outer polygon
 * From https://github.com/substack/point-in-polygon.
 * ray-casting algorithm based on
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param {Vec2[]} outer - Outer polygon represented as closed array of points
 * @param {Vec2[]} inner - Inner polygon represented as closed array of points
 * @returns {boolean} True if all inner points lie within outer polygon, false if not
 * @example
 * //   o1 -------- o2
 * //   |  i1 -- i2  |
 * //   |  |      |  |
 * //   |  i0 -- i3  |
 * //   o0 -------- o3
 * //
 * const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
 * const inner = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
 * geomPolygonContainsPolygon(outer, inner);   // returns true
 */
export function geomPolygonContainsPolygon(outer: Vec2[], inner: Vec2[]): boolean {
  return inner.every((point: Vec2) => {
    return geomPointInPolygon(point, outer);
  });
}

/** Return true if any part of inner polygon intersects outer polygon
 * @param {Vec2[]} outer - Outer polygon represented as closed array of points
 * @param {Vec2[]} inner - Inner polygon represented as closed array of points
 * @param {boolean} [checkSegments] - Pass true to test each segment (stricter but slower)
 * @returns {boolean} True if any part of inner polygon intersects outer polygon
 * @example
 * //       i1 -- i2
 * //   o1 -+------+-- o2
 * //   |   |      |   |
 * //   |   |      |   |
 * //   o0 -+------+-- o3
 * //       i0 -- i3
 * //
 * const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
 * const inner = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
 * geomPolygonIntersectsPolygon(outer, inner, false);   // returns false (lax test - points only)
 * geomPolygonIntersectsPolygon(outer, inner, true);    // returns true (strict test - points and segments)
 */
export function geomPolygonIntersectsPolygon(
  outer: Vec2[],
  inner: Vec2[],
  checkSegments?: boolean
): boolean {
  function testPoints(outer: Vec2[], inner: Vec2[]): boolean {
    return inner.some((point: Vec2) => {
      return geomPointInPolygon(point, outer);
    });
  }

  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}

interface SSR {
  poly: Vec2[];
  angle: number;
}

/** Return the Smallest Surrounding Rectangle for a given set of points
 * http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
 * http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756
 * @param {Vec2[]} points - The points to find the smallest surrounding rectangle
 * @returns {SSR} Object containg the SSR polygon and angle
 * @example
 * //  +-- p1 ------ p3
 * //  |              |
 * //  p0 ------ p2 --+
 * //
 * const points = [[0, -1], [5, 1], [10, -1], [15, 1]];
 * const ssr = geomGetSmallestSurroundingRectangle(points);
 * // ssr.poly == [[0, -1], [0, 1], [15, 1], [15, -1], [0, -1]]
 * // ssr.angle == 0
 */
export function geomGetSmallestSurroundingRectangle(points: Vec2[]): SSR {
  const hull: Vec2[] = d3_polygonHull(points);
  const centroid: Vec2 = d3_polygonCentroid(hull);
  let minArea: number = Infinity;
  let ssrExtent: Extent = new Extent();
  let ssrAngle: number = 0;
  let c1: Vec2 = hull[0];

  for (let i: number = 0; i <= hull.length - 1; i++) {
    const c2: Vec2 = i === hull.length - 1 ? hull[0] : hull[i + 1];
    const angle: number = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]);
    const poly: Vec2[] = geomRotatePoints(hull, -angle, centroid);
    const extent: Extent = poly.reduce((acc: Extent, point: Vec2) => {
      // update Extent min/max in-place for speed
      acc.min[0] = Math.min(acc.min[0], point[0]);
      acc.min[1] = Math.min(acc.min[1], point[1]);
      acc.max[0] = Math.max(acc.max[0], point[0]);
      acc.max[1] = Math.max(acc.max[1], point[1]);
      return acc;
    }, new Extent());

    const area: number = extent.area();
    if (area < minArea) {
      minArea = area;
      ssrExtent = extent;
      ssrAngle = angle;
    }
    c1 = c2;
  }

  return {
    poly: geomRotatePoints(ssrExtent.polygon(), ssrAngle, centroid),
    angle: ssrAngle
  };
}

/** Return the length of the given path
 * @param {Vec2[]} path - The path to find the length of
 * @returns {number} length of the path
 * @example
 * //           p2
 * //          /
 * //  p0 -- p1
 * //
 * const path = [[0, 0], [1, 0], [5, 3]];
 * geomPathLength(path);  // returns 6
 */
export function geomPathLength(path: Vec2[]): number {
  let length: number = 0;
  for (let i: number = 0; i < path.length - 1; i++) {
    length += vecLength(path[i], path[i + 1]);
  }
  return length;
}

// If the given point is at the edge of the padded viewport,
// return a vector that will nudge the viewport in that direction
export function geomViewportNudge(point: Vec2, dimensions: Vec2): Vec2 | null {
  const pad: number[] = [80, 20, 50, 20]; // top, right, bottom, left
  let x: number = 0;
  let y: number = 0;

  if (point[0] > dimensions[0] - pad[1]) x = -10;
  if (point[0] < pad[3]) x = 10;
  if (point[1] > dimensions[1] - pad[2]) y = -10;
  if (point[1] < pad[0]) y = 10;

  if (x || y) {
    return [x, y];
  } else {
    return null;
  }
}
