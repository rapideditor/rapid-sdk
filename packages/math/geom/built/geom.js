'use strict';
/**
 * @module @id-sdk/geom
 * @description 📈 Module containing Geometric (planar) math functions
 */
exports.__esModule = true;
var d3_polygon_1 = require('d3-polygon');
var extent_1 = require('@id-sdk/extent');
var vector_1 = require('@id-sdk/vector');
/** Test whether two given coordinates describe the same edge
 * @param {Vec2} a - Start coordinate
 * @param {Vec2} b - End coordinate
 * @returns {boolean} True if equal, false if unequal
 * @example
 * geomEdgeEqual([1, 2], [1, 2]);   // returns true
 * geomEdgeEqual([1, 2], [2, 1]);   // returns true
 */
function geomEdgeEqual(a, b) {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}
exports.geomEdgeEqual = geomEdgeEqual;
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
function geomRotatePoints(points, angle, around) {
  return points.map(function(point) {
    var radial = vector_1.vecSubtract(point, around);
    return [
      radial[0] * Math.cos(angle) - radial[1] * Math.sin(angle) + around[0],
      radial[0] * Math.sin(angle) + radial[1] * Math.cos(angle) + around[1]
    ];
  });
}
exports.geomRotatePoints = geomRotatePoints;
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
function geomLineIntersection(a, b) {
  var p = [a[0][0], a[0][1]];
  var p2 = [a[1][0], a[1][1]];
  var q = [b[0][0], b[0][1]];
  var q2 = [b[1][0], b[1][1]];
  var r = vector_1.vecSubtract(p2, p);
  var s = vector_1.vecSubtract(q2, q);
  var uNumerator = vector_1.vecCross(vector_1.vecSubtract(q, p), r);
  var denominator = vector_1.vecCross(r, s);
  if (uNumerator && denominator) {
    var u = uNumerator / denominator;
    var t = vector_1.vecCross(vector_1.vecSubtract(q, p), s) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return vector_1.vecInterp(p, p2, t);
    }
  }
  return null;
}
exports.geomLineIntersection = geomLineIntersection;
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
function geomPathIntersections(path1, path2) {
  var intersections = [];
  for (var i = 0; i < path1.length - 1; i++) {
    for (var j = 0; j < path2.length - 1; j++) {
      var a = [path1[i], path1[i + 1]];
      var b = [path2[j], path2[j + 1]];
      var hit = geomLineIntersection(a, b);
      if (hit) {
        intersections.push(hit);
      }
    }
  }
  return intersections;
}
exports.geomPathIntersections = geomPathIntersections;
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
function geomPathHasIntersections(path1, path2) {
  for (var i = 0; i < path1.length - 1; i++) {
    for (var j = 0; j < path2.length - 1; j++) {
      var a = [path1[i], path1[i + 1]];
      var b = [path2[j], path2[j + 1]];
      var hit = geomLineIntersection(a, b);
      if (hit) {
        return true;
      }
    }
  }
  return false;
}
exports.geomPathHasIntersections = geomPathHasIntersections;
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
function geomPointInPolygon(point, polygon) {
  var x = point[0];
  var y = point[1];
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0];
    var yi = polygon[i][1];
    var xj = polygon[j][0];
    var yj = polygon[j][1];
    var intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
exports.geomPointInPolygon = geomPointInPolygon;
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
function geomPolygonContainsPolygon(outer, inner) {
  return inner.every(function(point) {
    return geomPointInPolygon(point, outer);
  });
}
exports.geomPolygonContainsPolygon = geomPolygonContainsPolygon;
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
function geomPolygonIntersectsPolygon(outer, inner, checkSegments) {
  function testPoints(outer, inner) {
    return inner.some(function(point) {
      return geomPointInPolygon(point, outer);
    });
  }
  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}
exports.geomPolygonIntersectsPolygon = geomPolygonIntersectsPolygon;
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
function geomGetSmallestSurroundingRectangle(points) {
  var hull = d3_polygon_1.polygonHull(points);
  var centroid = d3_polygon_1.polygonCentroid(hull);
  var minArea = Infinity;
  var ssrExtent = new extent_1.Extent();
  var ssrAngle = 0;
  var c1 = hull[0];
  for (var i = 0; i <= hull.length - 1; i++) {
    var c2 = i === hull.length - 1 ? hull[0] : hull[i + 1];
    var angle = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]);
    var poly = geomRotatePoints(hull, -angle, centroid);
    var extent = poly.reduce(function(acc, point) {
      // update Extent min/max in-place for speed
      acc.min[0] = Math.min(acc.min[0], point[0]);
      acc.min[1] = Math.min(acc.min[1], point[1]);
      acc.max[0] = Math.max(acc.max[0], point[0]);
      acc.max[1] = Math.max(acc.max[1], point[1]);
      return acc;
    }, new extent_1.Extent());
    var area = extent.area();
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
exports.geomGetSmallestSurroundingRectangle = geomGetSmallestSurroundingRectangle;
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
function geomPathLength(path) {
  var length = 0;
  for (var i = 0; i < path.length - 1; i++) {
    length += vector_1.vecLength(path[i], path[i + 1]);
  }
  return length;
}
exports.geomPathLength = geomPathLength;
// If the given point is at the edge of the padded viewport,
// return a vector that will nudge the viewport in that direction
function geomViewportNudge(point, dimensions) {
  var pad = [80, 20, 50, 20]; // top, right, bottom, left
  var x = 0;
  var y = 0;
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
exports.geomViewportNudge = geomViewportNudge;
