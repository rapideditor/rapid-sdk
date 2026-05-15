import type { Nullable, OneOrMore } from './types.ts';

/**
 * Converts a single or multiple values into something iterable
 * that can be iterated over with `for..of`
 *
 * @param vals - A single value or something iterable like Array or Set
 * @returns An iterable (Array or Set)
 *
 * @example
 * utilIterable([1, 2, 3])     // returns [1, 2, 3]
 * utilIterable(new Set([1]))  // returns Set([1])
 * utilIterable(5)             // returns [5]
 */
export function utilIterable<T>(vals: Nullable<OneOrMore<T>>): Iterable<T> {
  if (Array.isArray(vals)) return vals;
  if (vals instanceof Set) return vals;
  if (vals === null || vals === undefined) return [];
  return [vals];
}
