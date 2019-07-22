'use strict';
/**
 * Vector math module
 * @module @ideditor/vector
 * @see module:@ideditor/vector
 */
exports.__esModule = true;
/** Test whether two given vectors are equal
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @param {number} [epsilon] - Threshold for equality
 *  @returns {boolean} True if equal, false if unequal
 */
function vecEqual(a, b, epsilon) {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}
exports.vecEqual = vecEqual;
/** Add two vectors
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @returns {Vec2} Sum of a + b
 */
function vecAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
exports.vecAdd = vecAdd;
/** Subtract two vectors
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @returns {Vec2} Difference of a - b
 */
function vecSubtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
exports.vecSubtract = vecSubtract;
/** Scale a vector uniformly by factor
 *  @param {Vec2} a - Input vector
 *  @param {number} n - Scale factor
 *  @returns {Vec2} Scaled vector
 */
function vecScale(a, n) {
  return [a[0] * n, a[1] * n];
}
exports.vecScale = vecScale;
/** Floor the coordinates of a vector
 *  @param {Vec2} a - Input vector
 *  @returns {Vec2} Floored vector
 */
function vecFloor(a) {
  return [Math.floor(a[0]), Math.floor(a[1])];
}
exports.vecFloor = vecFloor;
/** Linear interpolate a point along a vector
 *  @param {Vec2} a - Start coordinate
 *  @param {Vec2} b - End coordinate
 *  @param {number} t - Scaled distance between ab
 *  @returns {Vec2} Point along ab
 */
function vecInterp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
exports.vecInterp = vecInterp;
/** Length of a vector
 *  @param {Vec2} a - Start coordinate
 *  @param {Vec2} [b=[0,0]] - End coordinate
 *  @returns {Vec2} Length of ab
 */
// http://jsperf.com/id-dist-optimization
function vecLength(a, b) {
  b = b || [0, 0];
  var x = a[0] - b[0];
  var y = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}
exports.vecLength = vecLength;
/** Normalize a vector (return a unit vector)
 *  @param {Vec2} a - Input vector
 *  @returns {Vec2} Unit vector
 */
function vecNormalize(a) {
  var length = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (length !== 0) {
    return vecScale(a, 1 / length);
  }
  return [0, 0];
}
exports.vecNormalize = vecNormalize;
/** Return the counterclockwise angle in the range (-pi, pi)
 *  between the positive X axis and the line intersecting a and b.
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @returns {number} Angle between a and b
 */
function vecAngle(a, b) {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
exports.vecAngle = vecAngle;
/** Dot Product
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @param {Vec2} [origin=[0,0]] - Origin
 *  @returns {number} a · b
 */
function vecDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecSubtract(a, origin);
  var q = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}
exports.vecDot = vecDot;
/** Normalized Dot Product
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @param {Vec2} [origin=[0,0]] - Origin
 *  @returns {number} a · b
 */
function vecNormalizedDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecNormalize(vecSubtract(a, origin));
  var q = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}
exports.vecNormalizedDot = vecNormalizedDot;
/** 2D cross product of OA and OB vectors, returns magnitude of Z vector
 *  Returns a positive value, if OAB makes a counter-clockwise turn,
 *  negative for clockwise turn, and zero if the points are collinear.
 *  @param {Vec2} a - First vector
 *  @param {Vec2} b - Second vector
 *  @param {Vec2} [origin=[0,0]] - Origin
 *  @returns {number} a ⅹ b
 */
function vecCross(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecSubtract(a, origin);
  var q = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}
exports.vecCross = vecCross;
/** Find closest orthogonal projection of point onto points array
 *  @param {Vec2} a - Point to project
 *  @param {Vec2[]} points - Path to project point onto
 *  @returns {Edge} Edge and target point along edge
 */
function vecProject(a, points) {
  var min = Infinity;
  var idx;
  var target;
  for (var i = 0; i < points.length - 1; i++) {
    var o = points[i];
    var s = vecSubtract(points[i + 1], o);
    var v = vecSubtract(a, o);
    var proj = vecDot(v, s) / vecDot(s, s);
    var p = void 0;
    if (proj < 0) {
      p = o;
    } else if (proj > 1) {
      p = points[i + 1];
    } else {
      p = [o[0] + proj * s[0], o[1] + proj * s[1]];
    }
    var dist = vecLength(p, a);
    if (dist < min) {
      min = dist;
      idx = i + 1;
      target = p;
    }
  }
  if (idx !== undefined) {
    return { index: idx, distance: min, target: target };
  } else {
    return null;
  }
}
exports.vecProject = vecProject;
