// vector equals
export function vecEqual(a, b, epsilon) {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}
// vector addition
export function vecAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
// vector subtraction
export function vecSubtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
// vector scaling
export function vecScale(a, mag) {
  return [a[0] * mag, a[1] * mag];
}
// vector rounding
export function vecFloor(a) {
  return [Math.floor(a[0]), Math.floor(a[1])];
}
// linear interpolation
export function vecInterp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
// http://jsperf.com/id-dist-optimization
export function vecLength(a, b) {
  b = b || [0, 0];
  var x = a[0] - b[0];
  var y = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}
// get a unit vector
export function vecNormalize(a) {
  var length = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (length !== 0) {
    return vecScale(a, 1 / length);
  }
  return [0, 0];
}
// Return the counterclockwise angle in the range (-pi, pi)
// between the positive X axis and the line intersecting a and b.
export function vecAngle(a, b) {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
// dot product
export function vecDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecSubtract(a, origin);
  var q = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}
// normalized dot product
export function vecNormalizedDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecNormalize(vecSubtract(a, origin));
  var q = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}
// 2D cross product of OA and OB vectors, returns magnitude of Z vector
// Returns a positive value, if OAB makes a counter-clockwise turn,
// negative for clockwise turn, and zero if the points are collinear.
export function vecCross(a, b, origin) {
  origin = origin || [0, 0];
  var p = vecSubtract(a, origin);
  var q = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}
// find closest orthogonal projection of point onto points array
export function vecProject(a, points) {
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
