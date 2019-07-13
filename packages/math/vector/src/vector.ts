type Vec2 = [number, number];

// vector equals
export function vecEqual(a: Vec2, b: Vec2, epsilon?: number): boolean {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}

// vector addition
export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

// vector subtraction
export function vecSubtract(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

// vector scaling
export function vecScale(a: Vec2, mag: number): Vec2 {
  return [a[0] * mag, a[1] * mag];
}

// vector rounding
export function vecFloor(a: Vec2): Vec2 {
  return [Math.floor(a[0]), Math.floor(a[1])];
}

// linear interpolation
export function vecInterp(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// http://jsperf.com/id-dist-optimization
export function vecLength(a: Vec2, b?: Vec2): number {
  b = b || [0, 0];
  let x: number = a[0] - b[0];
  let y: number = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

// get a unit vector
export function vecNormalize(a: Vec2): Vec2 {
  let length: number = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (length !== 0) {
    return vecScale(a, 1 / length);
  }
  return [0, 0];
}

// Return the counterclockwise angle in the range (-pi, pi)
// between the positive X axis and the line intersecting a and b.
export function vecAngle(a: Vec2, b: Vec2): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

// dot product
export function vecDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  let p: Vec2 = vecSubtract(a, origin);
  let q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}

// normalized dot product
export function vecNormalizedDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  let p: Vec2 = vecNormalize(vecSubtract(a, origin));
  let q: Vec2 = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}

// 2D cross product of OA and OB vectors, returns magnitude of Z vector
// Returns a positive value, if OAB makes a counter-clockwise turn,
// negative for clockwise turn, and zero if the points are collinear.
export function vecCross(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  let p: Vec2 = vecSubtract(a, origin);
  let q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}


interface Edge {
    index: number;
    distance: number;
    target: Vec2;
};
// find closest orthogonal projection of point onto points array
export function vecProject(a: Vec2, points: Vec2[]): Edge | null {
  let min: number = Infinity;
  let idx: number;
  let target: Vec2;

  for (let i: number = 0; i < points.length - 1; i++) {
    let o: Vec2 = points[i];
    let s: Vec2 = vecSubtract(points[i + 1], o);
    let v: Vec2 = vecSubtract(a, o);
    let proj: number = vecDot(v, s) / vecDot(s, s);
    let p: Vec2;

    if (proj < 0) {
      p = o;
    } else if (proj > 1) {
      p = points[i + 1];
    } else {
      p = [o[0] + proj * s[0], o[1] + proj * s[1]];
    }

    let dist: number = vecLength(p, a);
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
