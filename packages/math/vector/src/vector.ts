/**
 * @module @id-sdk/vector
 * @description  📐 Module containing Vector (coordinate) math functions
 */

/** @typedef {number[2]} Vec2 */
type Vec2 = [number, number];

/** Test whether two given vectors are equal
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @param {number} [epsilon] - Threshold for equality
 * @returns {boolean} True if equal, false if unequal
 * @example
 * vecEqual([1, 2], [1, 2]);   // returns true
 * vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5);   // returns true
 */
export function vecEqual(a: Vec2, b: Vec2, epsilon?: number): boolean {
  if (epsilon) {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}

/** Add two vectors
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @returns {Vec2} Sum of a + b
 * @example
 * vecAdd([1, 2], [3, 4]);   // returns [4, 6]
 */
export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

/** Subtract two vectors
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @returns {Vec2} Difference of a - b
 * @example
 * vecSubtract([1, 2], [3, 4]);   // returns [-2, -2]
 */
export function vecSubtract(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

/** Scale a vector uniformly by factor
 * @param {Vec2} a - Input vector
 * @param {number} n - Scale factor
 * @returns {Vec2} Scaled vector
 * @example
 * vecScale([1, 2], 2);   // returns [2, 4]
 */
export function vecScale(a: Vec2, n: number): Vec2 {
  return [a[0] * n, a[1] * n];
}

/** Floor the coordinates of a vector
 * @param {Vec2} a - Input vector
 * @returns {Vec2} Floored vector
 * @example
 * vecFloor([0, 1.01]);   // returns [0, 1]
 */
export function vecFloor(a: Vec2): Vec2 {
  return [Math.floor(a[0]), Math.floor(a[1])];
}

/** Linear interpolate a point along a vector
 * @param {Vec2} a - Start coordinate
 * @param {Vec2} b - End coordinate
 * @param {number} t - Scaled distance between ab
 * @returns {Vec2} Point along ab
 * @example
 * vecInterp([0, 0], [10, 10], 0.5);   // returns [5, 5]
 */
export function vecInterp(a: Vec2, b: Vec2, t: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Length of a vector
 * @param {Vec2} a - Start coordinate
 * @param {Vec2} [b=[0,0]] - End coordinate
 * @returns {Vec2} Length of ab
 * @example
 * vecLength([0, 0], [4, 3]);   // returns 5
 */
// http://jsperf.com/id-dist-optimization
export function vecLength(a: Vec2, b?: Vec2): number {
  b = b || [0, 0];
  const x: number = a[0] - b[0];
  const y: number = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

/** Normalize a vector (return a unit vector)
 * @param {Vec2} a - Input vector
 * @returns {Vec2} Unit vector
 * @example
 * vecNormalize([5, 0]);   // returns [1, 0]
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
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @returns {number} Angle between a and b
 * @example
 * vecAngle([0, 0], [-1, 0]);   // returns π
 */
export function vecAngle(a: Vec2, b: Vec2): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

/** Dot Product
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @param {Vec2} [origin=[0,0]] - Origin
 * @returns {number} a · b
 * @example
 * vecDot([2, 0], [2, 0]);   // returns 4
 */
export function vecDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[0] + p[1] * q[1];
}

/** Normalized Dot Product - normalizes input vectors before returning dot product
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @param {Vec2} [origin=[0,0]] - Origin
 * @returns {number} a · b
 * @example
 * vecNormalizedDot([2, 0], [2, 0]);   // returns 1
 */
export function vecNormalizedDot(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecNormalize(vecSubtract(a, origin));
  const q: Vec2 = vecNormalize(vecSubtract(b, origin));
  return vecDot(p, q);
}

/** 2D cross product of OA and OB vectors, returns magnitude of Z vector
 * Returns a positive value, if OAB makes a counter-clockwise turn,
 * negative for clockwise turn, and zero if the points are collinear.
 * @param {Vec2} a - First vector
 * @param {Vec2} b - Second vector
 * @param {Vec2} [origin=[0,0]] - Origin
 * @returns {number} a ⅹ b
 * @example
 * vecCross([2, 0], [0, 2]);   // returns 4
 */
export function vecCross(a: Vec2, b: Vec2, origin?: Vec2): number {
  origin = origin || [0, 0];
  const p: Vec2 = vecSubtract(a, origin);
  const q: Vec2 = vecSubtract(b, origin);
  return p[0] * q[1] - p[1] * q[0];
}

/**
 * @typedef Edge
 * @type {object}
 * @property {number} index - index of segment along path
 * @property {number} distance - distance from point to path
 * @property {Vec2} target - point along path
 */
interface Edge {
  index: number;
  distance: number;
  target: Vec2;
}

/** Find closest orthogonal projection of point onto points array
 * @param {Vec2} a - Point to project
 * @param {Vec2[]} points - Path to project point onto
 * @returns {Edge} Edge and target point along edge
 * @example
 * //
 * //     c
 * //     |
 * // a --*--- b
 * //
 * // * = [2, 0]
 * //
 * const a = [0, 0];
 * const b = [5, 0];
 * const c = [2, 1];
 * test.vecProject(c, [a, b]);   // returns {index: 1, distance: 1, target: [2, 0] }
 */
export function vecProject(a: Vec2, points: Vec2[]): Edge | null {
  let min: number = Infinity;
  let idx: number;
  let target: Vec2;

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

  if (idx !== undefined) {
    return { index: idx, distance: min, target: target };
  } else {
    return null;
  }
}
