// vector equals
export function VecEqual(a, b, epsilon) {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}

// vector addition
export function VecAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

// vector subtraction
export function VecSubtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

// vector scaling
export function VecScale(a, mag) {
  return [a[0] * mag, a[1] * mag];
}

// vector rounding
export function VecFloor(a) {
  return [Math.floor(a[0]), Math.floor(a[1])];
}

// linear interpolation
export function VecInterp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// http://jsperf.com/id-dist-optimization
export function VecLength(a, b) {
  b = b || [0, 0];
  var x = a[0] - b[0];
  var y = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

// get a unit vector
export function VecNormalize(a) {
  var length = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (length !== 0) {
    return VecScale(a, 1 / length);
  }
  return [0, 0];
}

// Return the counterclockwise angle in the range (-pi, pi)
// between the positive X axis and the line intersecting a and b.
export function VecAngle(a, b) {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

// dot product
export function VecDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = VecSubtract(a, origin);
  var q = VecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}

// normalized dot product
export function VecNormalizedDot(a, b, origin) {
  origin = origin || [0, 0];
  var p = VecNormalize(VecSubtract(a, origin));
  var q = VecNormalize(VecSubtract(b, origin));
  return VecDot(p, q);
}

// 2D cross product of OA and OB vectors, returns magnitude of Z vector
// Returns a positive value, if OAB makes a counter-clockwise turn,
// negative for clockwise turn, and zero if the points are collinear.
export function VecCross(a, b, origin) {
  origin = origin || [0, 0];
  var p = VecSubtract(a, origin);
  var q = VecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}

// find closest orthogonal projection of point onto points array
export function VecProject(a, points) {
  var min = Infinity;
  var idx;
  var target;

  for (var i = 0; i < points.length - 1; i++) {
    var o = points[i];
    var s = VecSubtract(points[i + 1], o);
    var v = VecSubtract(a, o);
    var proj = VecDot(v, s) / VecDot(s, s);
    var p;

    if (proj < 0) {
      p = o;
    } else if (proj > 1) {
      p = points[i + 1];
    } else {
      p = [o[0] + proj * s[0], o[1] + proj * s[1]];
    }

    var dist = VecLength(p, a);
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
