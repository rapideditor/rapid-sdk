import { polygonHull as d3_polygonHull, polygonCentroid as d3_polygonCentroid } from 'd3-polygon';
import { Extent } from '@ideditor/extent';
import { vecCross, vecInterp, vecLength, vecSubtract } from '@ideditor/vector';
export function geomEdgeEqual(a, b) {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}
// Rotate all points counterclockwise around a pivot point by given angle
export function geomRotatePoints(points, angle, around) {
  return points.map(function(point) {
    var radial = vecSubtract(point, around);
    return [
      radial[0] * Math.cos(angle) - radial[1] * Math.sin(angle) + around[0],
      radial[0] * Math.sin(angle) + radial[1] * Math.cos(angle) + around[1]
    ];
  });
}
// Return the intersection point of 2 line segments.
// From https://github.com/pgkelley4/line-segments-intersect
// This uses the vector cross product approach described below:
//  http://stackoverflow.com/a/565282/786339
export function geomLineIntersection(a, b) {
  var p = [a[0][0], a[0][1]];
  var p2 = [a[1][0], a[1][1]];
  var q = [b[0][0], b[0][1]];
  var q2 = [b[1][0], b[1][1]];
  var r = vecSubtract(p2, p);
  var s = vecSubtract(q2, q);
  var uNumerator = vecCross(vecSubtract(q, p), r);
  var denominator = vecCross(r, s);
  if (uNumerator && denominator) {
    var u = uNumerator / denominator;
    var t = vecCross(vecSubtract(q, p), s) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return vecInterp(p, p2, t);
    }
  }
  return null;
}
export function geomPathIntersections(path1, path2) {
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
export function geomPathHasIntersections(path1, path2) {
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
// Return whether point is contained in polygon.
//
// `point` should be a 2-item array of coordinates.
// `polygon` should be an array of 2-item arrays of coordinates.
//
// From https://github.com/substack/point-in-polygon.
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//
export function geomPointInPolygon(point, polygon) {
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
export function geomPolygonContainsPolygon(outer, inner) {
  return inner.every(function(point) {
    return geomPointInPolygon(point, outer);
  });
}
export function geomPolygonIntersectsPolygon(outer, inner, checkSegments) {
  function testPoints(outer, inner) {
    return inner.some(function(point) {
      return geomPointInPolygon(point, outer);
    });
  }
  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}
// http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
// http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756
export function geomGetSmallestSurroundingRectangle(points) {
  var hull = d3_polygonHull(points);
  var centroid = d3_polygonCentroid(hull);
  var minArea = Infinity;
  var ssrExtent = new Extent();
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
    }, new Extent());
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
export function geomPathLength(path) {
  var length = 0;
  for (var i = 0; i < path.length - 1; i++) {
    length += vecLength(path[i], path[i + 1]);
  }
  return length;
}
// If the given point is at the edge of the padded viewport,
// return a vector that will nudge the viewport in that direction
export function geomViewportNudge(point, dimensions) {
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
