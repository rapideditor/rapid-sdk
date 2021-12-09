/**
 * 📐 Vector (coordinate) math functions
 * @module
 */

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

/** Test whether two given vectors are equal
 * @param a
 * @param b
 * @param epsilon if provideed, equality is done within epsilon
 * @returns true if equal, false otherwise
 * @example ```
 * vecEqual([1, 2], [1, 2]);                         // returns true
 * vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5);   // returns true
 * ```
 */
export function vecEqual(a: Vec2, b: Vec2, epsilon?: number): boolean {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}

/** Adds two vectors
 * @param a
 * @param b
 * @returns sum of two vectors
 * @example ```
 * vecAdd([1, 2], [3, 4]);   // returns [4, 6]
 * ```
 */
export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

/** Subtract two vectors
 * @param a
 * @param b
 * @returns difference of `a - b`
 * @example ```
 * vecSubtract([1, 2], [3, 4]);   // returns [-2, -2]
 * ```
 */
export function vecSubtract(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

/** Scale a vector uniformly by factor
 * @param a vector
 * @param n scale factor
 * @returns scaled vector
 * @example ```
 * vecScale([1, 2], 2);   // returns [2, 4]
 * ```
 */
export function vecScale(a: Vec2, n: number): Vec2 {
  return [a[0] * n, a[1] * n];
}

/** Floor (round down) the coordinates of a vector
 * @param a target vector
 * @returns floored vector
 * @example ```
 * vecFloor([0, 1.01]);   // returns [0, 1]
 * ```
 */
export function vecFloor(a: Vec2): Vec2 {
  return [Math.floor(a[0]), Math.floor(a[1])];
}

/** Linear interpolate a point along a vector
 * @param a first point
 * @param b second point
 * @param t interpolation factor
 * @returns interpolated point
 * @example ```
 * vecInterp([0, 0], [10, 10], 0.5);   // returns [5, 5]
 * ```
 */
export function vecInterp(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Returns the length of a vector
 * @description http://jsperf.com/id-dist-optimization
 * @param a
 * @param b If not passed, defaults to [0,0].
 * @returns vector length
 * @example ```
 * vecLength([0, 0], [4, 3]);   // returns 5
 * vecLength([4, 3]);           // returns 5
 * ```
 */
export function vecLength(a: Vec2, b?: Vec2): number {
  b = b || [0, 0];
  const x: number = a[0] - b[0];
  const y: number = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

/** Length of vector raised to the power two
 * @param a
 * @param b
 * @returns
 */
export function vecLengthSquare(a: Vec2, b: Vec2 = [0, 0]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

/** Normalize a vector (i.e. return a unit vector)
 * @param a target vector
 * @returns unit vector
 * @example ```
 * vecNormalize([5, 0]);   // returns [1, 0]
 * ```
 */
export function vecNormalize(a: Vec2): Vec2 {
  const length: number = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (length !== 0) {
    return vecScale(a, 1 / length);
  }
  return [0, 0];
}

/** Return the counterclockwise angle in the range (-pi, pi)
 * between the positive X axis and the line intersecting a and b.
 * @param a
 * @param b
 * @returns resulting angle
 * @example ```
 * vecAngle([0, 0], [-1, 0]);   // returns π
 * ```
 */
export function vecAngle(a: Vec2, b: Vec2): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

/** Returns the dot product of two vectors
 * @param a
 * @param b
 * @param origin If not passed, defaults to [0,0]
 * @returns dot product result
 * @example ```
 * vecDot([2, 0], [2, 0]);   // returns 4
 * ```
 */
export function vecDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}

/** Normalized Dot Product - normalizes input vectors before returning dot product
 * @param a
 * @param b
 * @param origin If not passed, defaults to [0,0]
 * @returns normalized dot product result
 * @example ```
 * vecNormalizedDot([2, 0], [2, 0]);   // returns 1
 * ```
 */
export function vecNormalizedDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecNormalize(vecSubtract(a, origin));
  const q: Vec2 = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}

/** Returns the 2D cross product of OA and OB vectors
 * @param a A
 * @param b B
 * @param origin If not passed, defaults to [0,0]
 * @returns magnitude of Z vector - A positive value, if OAB makes a counter-clockwise turn,
 * negative for clockwise turn, and zero if the points are collinear.
 * @example ```
 * vecCross([2, 0], [0, 2]);   // returns 4
 * ```
 */
export function vecCross(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}

/** An Object containing `index`, `distance`, and `target` properties */
export interface Edge {
  index: number; // index of segment along path
  distance: number; // distance from point to path
  target: Vec2; // point along path
}

/** Find closest orthogonal projection of point onto points array
 * @param a source point
 * @param points target points
 * @returns Edge object containing info about the projected point,
 * or `null` if `points` is a degenerate path (0- or 1- point).
 * @example ```
 *      c
 *      |
 *  a --*--- b
 *
 *  * = [2, 0]
 *
 * const a = [0, 0];
 * const b = [5, 0];
 * const c = [2, 1];
 * vecProject(c, [a, b]);   // returns Edge { index: 1, distance: 1, target: [2, 0] }
 * ```
 */
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
