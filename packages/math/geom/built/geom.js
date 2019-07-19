'use strict';
exports.__esModule = true;
var d3_polygon_1 = require('d3-polygon');
var extent_1 = require('@ideditor/extent');
var vector_1 = require('@ideditor/vector');
function geomEdgeEqual(a, b) {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}
exports.geomEdgeEqual = geomEdgeEqual;
// Rotate all points counterclockwise around a pivot point by given angle
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
// Return the intersection point of 2 line segments.
// From https://github.com/pgkelley4/line-segments-intersect
// This uses the vector cross product approach described below:
//  http://stackoverflow.com/a/565282/786339
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
// Return whether point is contained in polygon.
//
// `point` should be a 2-item array of coordinates.
// `polygon` should be an array of 2-item arrays of coordinates.
//
// From https://github.com/substack/point-in-polygon.
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//
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
function geomPolygonContainsPolygon(outer, inner) {
  return inner.every(function(point) {
    return geomPointInPolygon(point, outer);
  });
}
exports.geomPolygonContainsPolygon = geomPolygonContainsPolygon;
function geomPolygonIntersectsPolygon(outer, inner, checkSegments) {
  function testPoints(outer, inner) {
    return inner.some(function(point) {
      return geomPointInPolygon(point, outer);
    });
  }
  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}
exports.geomPolygonIntersectsPolygon = geomPolygonIntersectsPolygon;
// http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
// http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756
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
      // update min/max in-place for speed
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
