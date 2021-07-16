export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

// Test whether two given vectors are equal (optionally, to within epsilon)
export function vecEqual(a: Vec2, b: Vec2, epsilon?: number): boolean {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}

// Add two vectors
export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

// Subtract two vectors
export function vecSubtract(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

// Scale a vector uniformly by factor
export function vecScale(a: Vec2, n: number): Vec2 {
  return [a[0] * n, a[1] * n];
}

// Floor the coordinates of a vector
export function vecFloor(a: Vec2): Vec2 {
  return [Math.floor(a[0]), Math.floor(a[1])];
}

// Linear interpolate a point along a vector
export function vecInterp(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Length of a vector
// http://jsperf.com/id-dist-optimization
export function vecLength(a: Vec2, b?: Vec2): number {
  b = b || [0, 0];
  const x: number = a[0] - b[0];
  const y: number = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

// Normalize a vector (return a unit vector)
export function vecNormalize(a: Vec2): Vec2 {
  const length: number = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
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

// Dot Product
export function vecDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}

// Normalized Dot Product - normalizes input vectors before returning dot product
export function vecNormalizedDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecNormalize(vecSubtract(a, origin));
  const q: Vec2 = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}

// 2D cross product of OA and OB vectors, returns magnitude of Z vector
// Returns a positive value, if OAB makes a counter-clockwise turn,
// negative for clockwise turn, and zero if the points are collinear.
export function vecCross(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}

export interface Edge {
  index: number; // index of segment along path
  distance: number; // distance from point to path
  target: Vec2; // point along path
}

// Find closest orthogonal projection of point onto points array
export function vecProject(a: Vec2, points: Vec2[]): Edge | null {
  let min: number = Infinity;
  let idx: number | undefined;
  let target: Vec2 | undefined;

  for (let i: number = 0; i < points.length - 1; i++) {
    const o: Vec2 = points[i];
    const s: Vec2 = vecSubtract(points[i + 1], o);
    const v: Vec2 = vecSubtract(a, o);
    const proj: number = vecDot(v, s) / vecDot(s, s);
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

  if (idx !== undefined && target !== undefined) {
    return { index: idx, distance: min, target: target };
  } else {
    return null;
  }
}
