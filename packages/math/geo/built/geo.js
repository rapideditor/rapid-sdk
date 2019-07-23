'use strict';
/**
 * @module @ideditor/geo
 * @description 🌐 Module containing Geographic (spherical) math functions
 */
exports.__esModule = true;
// constants
var TAU = 2 * Math.PI;
var EQUATORIAL_RADIUS = 6356752.314245179;
var POLAR_RADIUS = 6378137.0;
/** Convert degrees latitude to meters
 * @param {number} dLat - degrees latitude
 * @returns {number} meters
 * @example
 * geoLatToMeters(1);  // returns ≈111319
 */
function geoLatToMeters(dLat) {
  return dLat * ((TAU * POLAR_RADIUS) / 360);
}
exports.geoLatToMeters = geoLatToMeters;
/** Convert degrees longitude to meters at a given latitude
 * @param {number} dLon - degrees longitude
 * @param {number} atLat - at latitude
 * @returns {number} meters
 * @example
 * geoLonToMeters(1, 0);  // returns ≈110946 at equator
 */
function geoLonToMeters(dLon, atLat) {
  return Math.abs(atLat) >= 90
    ? 0
    : dLon * ((TAU * EQUATORIAL_RADIUS) / 360) * Math.abs(Math.cos(atLat * (Math.PI / 180)));
}
exports.geoLonToMeters = geoLonToMeters;
/** Convert meters to degrees latitude
 * @param {number} m - meters
 * @returns {number} degrees latitude
 * @example
 * geoMetersToLat(111319);  // returns ≈1°
 */
function geoMetersToLat(m) {
  return m / ((TAU * POLAR_RADIUS) / 360);
}
exports.geoMetersToLat = geoMetersToLat;
/** Convert meters to degrees longitude at a given latitude
 * @param {number} m - meters
 * @param {number} atLat - at latitude
 * @returns {number} degrees longitude
 * @example
 * geoMetersToLon(110946, 0);  // returns ≈1° at equator
 */
function geoMetersToLon(m, atLat) {
  return Math.abs(atLat) >= 90
    ? 0
    : m / ((TAU * EQUATORIAL_RADIUS) / 360) / Math.abs(Math.cos(atLat * (Math.PI / 180)));
}
exports.geoMetersToLon = geoMetersToLon;
/** Convert imagery offset in meters to offset in tile pixels
 * @param {Vec2} m - Offset in meters
 * @param {number} [tileSize=256] - Tile size in pixels
 * @returns {Vec2} Offset in pixels
 * @example
 * geoMetersToOffset([100, 100]);  // returns ≈[0.00064, -0.00064] pixels
 */
function geoMetersToOffset(m, tileSize) {
  tileSize = tileSize || 256;
  return [(m[0] * tileSize) / (TAU * EQUATORIAL_RADIUS), (-m[1] * tileSize) / (TAU * POLAR_RADIUS)];
}
exports.geoMetersToOffset = geoMetersToOffset;
/** Convert imagery offset in tile pixels to offset in meters
 * @param {Vec2} offset - Offset in pixels
 * @param {number} [tileSize=256] - Tile size in pixels
 * @returns {Vec2} Offset in meters
 * @example
 * geoOffsetToMeters([0.00064, -0.00064]);  // returns ≈[100, 100] meters
 */
function geoOffsetToMeters(offset, tileSize) {
  tileSize = tileSize || 256;
  return [
    (offset[0] * TAU * EQUATORIAL_RADIUS) / tileSize,
    (-offset[1] * TAU * POLAR_RADIUS) / tileSize
  ];
}
exports.geoOffsetToMeters = geoOffsetToMeters;
/** Equirectangular approximation of spherical distances on Earth
 * @param {Vec2} a - Start coordinate
 * @param {Vec2} b - End coordinate
 * @returns {number} Approximate distance in meters
 * @example
 * geoSphericalDistance([0, 0], [1, 0]);  // returns ≈110946 meters
 */
function geoSphericalDistance(a, b) {
  var x = geoLonToMeters(a[0] - b[0], (a[1] + b[1]) / 2);
  var y = geoLatToMeters(a[1] - b[1]);
  return Math.sqrt(x * x + y * y);
}
exports.geoSphericalDistance = geoSphericalDistance;
/** Projection scale factor to tile zoom level
 * @param {number} k - Scale factor
 * @param {number} [tileSize=256] - Tile size in pixels
 * @returns {number} Tile zoom level
 * @example
 * geoScaleToZoom(5340353.7154);  // returns ≈17
 */
function geoScaleToZoom(k, tileSize) {
  tileSize = tileSize || 256;
  var log2ts = Math.log(tileSize) * Math.LOG2E;
  return Math.log(k * TAU) / Math.LN2 - log2ts;
}
exports.geoScaleToZoom = geoScaleToZoom;
/** Tile zoom to projection scale factor
 * @param {number} z - Tile zoom level
 * @param {number} [tileSize=256] - Tile size in pixels
 * @returns {number} Scale factor
 * @example
 * geoZoomToScale(17);  // returns ≈5340353.7154
 */
function geoZoomToScale(z, tileSize) {
  tileSize = tileSize || 256;
  return (tileSize * Math.pow(2, z)) / TAU;
}
exports.geoZoomToScale = geoZoomToScale;
/** Returns info about the point from `points` closest to the given `a`
 * @param {Vec2} a - Point to test
 * @param {Vec2[]} points - Path to test against
 * @returns {Closest} Info about closest point along path
 */
function geoSphericalClosestPoint(points, a) {
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
exports.geoSphericalClosestPoint = geoSphericalClosestPoint;
