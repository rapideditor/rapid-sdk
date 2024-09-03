/**
 * 🔢 Numeric math functions
 * @module
 */


/** Clamp a number within a min..max range
 * @param num
 * @param min
 * @param max
 * @returns  result
 * @example
 * numClamp(-1, 0, 10);  // returns 0, (below min)
 * numClamp(5, 0, 10);   // returns 5, (in range)
 * numClamp(11, 0, 10);  // returns 10, (above max)
 */
export function numClamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(num, max));
}


/** Wrap a number around a min..max range
 *  Similar to modulo, but works for negative numbers too.
 * @param num
 * @param min
 * @param max
 * @returns  result
 * @example
 * numWrap(-1, 0, 10);  // returns 9, (below min)
 * numWrap(5, 0, 10);   // returns 5, (in range)
 * numWrap(11, 0, 10);  // returns 1, (above max)
 */
export function numWrap(num: number, min: number, max: number): number {
  const d = max - min;
  return ((num - min) % d + d) % d + min;
}
