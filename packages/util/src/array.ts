type ArrayOrSet = Array<unknown> | Set<unknown>;


/** Checks if provided arguments have same elements at the same indices
 * @param a
 * @param b
 * @returns Returns true if a and b have the same elements at the same indices, false otherwise
 */
export function utilArrayIdentical(a: Array<unknown>, b: Array<unknown>): boolean {
  // an array is always identical to itself
  if (a === b) return true;

  let i = a.length;
  if (i !== b.length) return false;
  while (i--) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


/** (a \ b) Create a set that contains those elements of set a that are not in set b.
 * @remarks This operation is also sometimes called minus (-)
 * @param a
 * @param b
 * @returns result of a \ b
 * @example
 * let a = [1,2,3];
 * let b = [4,3,2];
 * utilArrayDifference(a, b)  // returns: [1]
 * utilArrayDifference(b, a)  // returns: [4]
 */
export function utilArrayDifference(a: ArrayOrSet, b: ArrayOrSet): Array<unknown> {
  const other = new Set(b);
  return Array.from(new Set(a)).filter(val => !other.has(val));
}


/** (a ∩ b) Create a set that contains those elements of set a that are also in set b.
 * @remarks This operation is known as intersection
 * @param a
 * @param b
 * @returns result of a ∩ b
 * @example
 * let a = [1,2,3];
 * let b = [4,3,2];
 * utilArrayIntersection(a, b)  // returns: [2,3]
 */
export function utilArrayIntersection(a: ArrayOrSet, b: ArrayOrSet): Array<unknown> {
  const other = new Set(b);
  return Array.from(new Set(a)).filter(val => other.has(val));
}


/** (a ∪ b) Create a set that contains the elements of both set a and set b
 * @remarks This operation is known as union
 * @param a
 * @param b
 * @returns result of a ∩ b
 * @example
 * let a = [1,2,3];
 * let b = [4,3,2];
 * utilArrayUnion(a, b)  // returns: [1,2,3,4]
 */
export function utilArrayUnion(a: ArrayOrSet, b: ArrayOrSet): Array<unknown> {
  const result = new Set(a);
  b.forEach(val => result.add(val));
  return Array.from(result);
}


/** Returns an array with all the duplicates removed
 * @param a
 * @returns array with unique elements
 * @example
 * let a = [1,1,2,3,3];
 * utilArrayUniq(a) // returns: [1,2,3]
 */
export function utilArrayUniq(a: ArrayOrSet): Array<unknown> {
  return Array.from(new Set(a));
}


/** Splits array into chunks of given chunk size
 * @param a target array
 * @param chunkSize size of chunk
 * @returns
 * @example
 * let a = [1,2,3,4,5,6,7];
 * utilArrayChunk(a, 3);  // returns: [[1,2,3],[4,5,6],[7]];
 */
export function utilArrayChunk(a: Array<unknown>, chunkSize: number): Array<Array<unknown>> {
  if (!chunkSize || chunkSize < 0) return [a.slice()];

  const result = new Array(Math.ceil(a.length / chunkSize));
  return Array.from(result, (item, i) => {
    return a.slice(i * chunkSize, i * chunkSize + chunkSize);
  });
}


/** Flattens two level array into a single level
 * @param a target two level array
 * @returns resulting single level array
 * @example
 * let a = [[1,2,3],[4,5,6],[7]];
 * utilArrayFlatten(a); // returns: [1,2,3,4,5,6,7];
 */
export function utilArrayFlatten(a: Array<Array<unknown>>): Array<unknown> {
  return a.reduce((acc, val) => acc.concat(val), []);
}


/** Groups the items of the Array according to the given key
 * @param a target items
 * @param key property or a key function
 * @returns grouped items
 * @example
 * let pets = [
 *   { type: 'Dog', name: 'Spot' },
 *   { type: 'Cat', name: 'Tiger' },
 *   { type: 'Dog', name: 'Rover' },
 *   { type: 'Cat', name: 'Leo' }
 * ];
 * utilArrayGroupBy(pets, 'type')
 * returns:
 * {
 *   'Dog': [{type: 'Dog', name: 'Spot'}, {type: 'Dog', name: 'Rover'}],
 *   'Cat': [{type: 'Cat', name: 'Tiger'}, {type: 'Cat', name: 'Leo'}]
 * }
 *
 * utilArrayGroupBy(pets, function(item) { return item.name.length; })
 * returns:
 * {
 *   3: [{type: 'Cat', name: 'Leo'}],
 *   4: [{type: 'Dog', name: 'Spot'}],
 *   5: [{type: 'Cat', name: 'Tiger'}, {type: 'Dog', name: 'Rover'}]
 * }
 */
export function utilArrayGroupBy(a, key): object {
  return a.reduce((acc, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    (acc[group] = acc[group] || []).push(item);
    return acc;
  }, {});
}


/** Returns an Array with all the duplicates removed
 * where uniqueness determined by the given key
 * @param a
 * @param key property or a key function
 * @returns
 * @example
 * let pets = [
 *   { type: 'Dog', name: 'Spot' },
 *   { type: 'Cat', name: 'Tiger' },
 *   { type: 'Dog', name: 'Rover' },
 *   { type: 'Cat', name: 'Leo' }
 * ];
 *
 * utilArrayUniqBy(pets, 'type')
 * returns:
 * [
 *   { type: 'Dog', name: 'Spot' },
 *   { type: 'Cat', name: 'Tiger' }
 * ]
 *
 * utilArrayUniqBy(pets, function(item) { return item.name.length; })
 * returns:
 * [
 *   { type: 'Dog', name: 'Spot' },
 *   { type: 'Cat', name: 'Tiger' },
 *   { type: 'Cat', name: 'Leo' }
 * }
 */
export function utilArrayUniqBy(a, key): Array<unknown> {
  const seen = new Set();
  return a.reduce((acc, item) => {
    const val = typeof key === 'function' ? key(item) : item[key];
    if (val && !seen.has(val)) {
      seen.add(val);
      acc.push(item);
    }
    return acc;
  }, []);
}
