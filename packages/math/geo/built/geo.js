'use strict';
exports.__esModule = true;
// constants
var TAU = 2 * Math.PI;
var EQUATORIAL_RADIUS = 6356752.314245179;
var POLAR_RADIUS = 6378137.0;
function geoLatToMeters(dLat) {
  return dLat * ((TAU * POLAR_RADIUS) / 360);
}
exports.geoLatToMeters = geoLatToMeters;
function geoLonToMeters(dLon, atLat) {
  return Math.abs(atLat) >= 90
    ? 0
    : dLon * ((TAU * EQUATORIAL_RADIUS) / 360) * Math.abs(Math.cos(atLat * (Math.PI / 180)));
}
exports.geoLonToMeters = geoLonToMeters;
function geoMetersToLat(m) {
  return m / ((TAU * POLAR_RADIUS) / 360);
}
exports.geoMetersToLat = geoMetersToLat;
function geoMetersToLon(m, atLat) {
  return Math.abs(atLat) >= 90
    ? 0
    : m / ((TAU * EQUATORIAL_RADIUS) / 360) / Math.abs(Math.cos(atLat * (Math.PI / 180)));
}
exports.geoMetersToLon = geoMetersToLon;
function geoMetersToOffset(meters, tileSize) {
  tileSize = tileSize || 256;
  return [
    (meters[0] * tileSize) / (TAU * EQUATORIAL_RADIUS),
    (-meters[1] * tileSize) / (TAU * POLAR_RADIUS)
  ];
}
exports.geoMetersToOffset = geoMetersToOffset;
function geoOffsetToMeters(offset, tileSize) {
  tileSize = tileSize || 256;
  return [
    (offset[0] * TAU * EQUATORIAL_RADIUS) / tileSize,
    (-offset[1] * TAU * POLAR_RADIUS) / tileSize
  ];
}
exports.geoOffsetToMeters = geoOffsetToMeters;
// Equirectangular approximation of spherical distances on Earth
function geoSphericalDistance(a, b) {
  var x = geoLonToMeters(a[0] - b[0], (a[1] + b[1]) / 2);
  var y = geoLatToMeters(a[1] - b[1]);
  return Math.sqrt(x * x + y * y);
}
exports.geoSphericalDistance = geoSphericalDistance;
// scale to zoom
function geoScaleToZoom(k, tileSize) {
  tileSize = tileSize || 256;
  var log2ts = Math.log(tileSize) * Math.LOG2E;
  return Math.log(k * TAU) / Math.LN2 - log2ts;
}
exports.geoScaleToZoom = geoScaleToZoom;
// zoom to scale
function geoZoomToScale(z, tileSize) {
  tileSize = tileSize || 256;
  return (tileSize * Math.pow(2, z)) / TAU;
}
exports.geoZoomToScale = geoZoomToScale;
// returns info about the point from `points` closest to the given `a`
function geoSphericalClosestNode(points, a) {
  var minDistance = Infinity;
  var idx;
  for (var i = 0; i < points.length; i++) {
    var distance = geoSphericalDistance(points[i], a);
    if (distance < minDistance) {
      minDistance = distance;
      idx = i;
    }
  }
  if (idx !== undefined) {
    return { index: idx, distance: minDistance, point: points[idx] };
  } else {
    return null;
  }
}
exports.geoSphericalClosestNode = geoSphericalClosestNode;
