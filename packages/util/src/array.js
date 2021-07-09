
// Returns true if a and b have the same elements at the same indices.
export function utilArrayIdentical(a, b) {
  // an array is always identical to itself
  if (a === b) return true;

  let i = a.length;
  if (i !== b.length) return false;
  while (i--) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// http://2ality.com/2015/01/es6-set-operations.html

// Difference (a \ b): create a set that contains those elements of set a that are not in set b.
// This operation is also sometimes called minus (-).
// let a = [1,2,3];
// let b = [4,3,2];
// utilArrayDifference(a, b)
//   [1]
// utilArrayDifference(b, a)
//   [4]
export function utilArrayDifference(a, b) {
  let other = new Set(b);
  return Array.from(new Set(a))
    .filter(val => !other.has(val));
}

// Intersection (a ∩ b): create a set that contains those elements of set a that are also in set b.
// let a = [1,2,3];
// let b = [4,3,2];
// utilArrayIntersection(a, b)
//   [2,3]
export function utilArrayIntersection(a, b) {
  let other = new Set(b);
  return Array.from(new Set(a))
    .filter(val => other.has(val));
}

// Union (a ∪ b): create a set that contains the elements of both set a and set b.
// let a = [1,2,3];
// let b = [4,3,2];
// utilArrayUnion(a, b)
//   [1,2,3,4]
export function utilArrayUnion(a, b) {
  let result = new Set(a);
  b.forEach(val => result.add(val));
  return Array.from(result);
}

// Returns an Array with all the duplicates removed
// let a = [1,1,2,3,3];
// utilArrayUniq(a)
//   [1,2,3]
export function utilArrayUniq(a) {
    return Array.from(new Set(a));
}


// Splits array into chunks of given chunk size
// let a = [1,2,3,4,5,6,7];
// utilArrayChunk(a, 3);
//   [[1,2,3],[4,5,6],[7]];
export function utilArrayChunk(a, chunkSize) {
  if (!chunkSize || chunkSize < 0) return [a.slice()];

  let result = new Array(Math.ceil(a.length / chunkSize));
  return Array.from(result, (item, i) => {
    return a.slice(i * chunkSize, i * chunkSize + chunkSize);
  });
}


// Flattens two level array into a single level
// let a = [[1,2,3],[4,5,6],[7]];
// utilArrayFlatten(a);
//   [1,2,3,4,5,6,7];
export function utilArrayFlatten(a) {
  return a.reduce((acc, val) => acc.concat(val), []);
}


// Groups the items of the Array according to the given key
// `key` can be passed as a property or as a key function
//
// let pets = [
//     { type: 'Dog', name: 'Spot' },
//     { type: 'Cat', name: 'Tiger' },
//     { type: 'Dog', name: 'Rover' },
//     { type: 'Cat', name: 'Leo' }
// ];
//
// utilArrayGroupBy(pets, 'type')
//   {
//     'Dog': [{type: 'Dog', name: 'Spot'}, {type: 'Dog', name: 'Rover'}],
//     'Cat': [{type: 'Cat', name: 'Tiger'}, {type: 'Cat', name: 'Leo'}]
//   }
//
// utilArrayGroupBy(pets, function(item) { return item.name.length; })
//   {
//     3: [{type: 'Cat', name: 'Leo'}],
//     4: [{type: 'Dog', name: 'Spot'}],
//     5: [{type: 'Cat', name: 'Tiger'}, {type: 'Dog', name: 'Rover'}]
//   }
export function utilArrayGroupBy(a, key) {
  return a.reduce((acc, item) => {
    let group = (typeof key === 'function') ? key(item) : item[key];
    (acc[group] = acc[group] || []).push(item);
    return acc;
  }, {});
}


// Returns an Array with all the duplicates removed
// where uniqueness determined by the given key
// `key` can be passed as a property or as a key function
//
// let pets = [
//     { type: 'Dog', name: 'Spot' },
//     { type: 'Cat', name: 'Tiger' },
//     { type: 'Dog', name: 'Rover' },
//     { type: 'Cat', name: 'Leo' }
// ];
//
// utilArrayUniqBy(pets, 'type')
//   [
//     { type: 'Dog', name: 'Spot' },
//     { type: 'Cat', name: 'Tiger' }
//   ]
//
// utilArrayUniqBy(pets, function(item) { return item.name.length; })
//   [
//     { type: 'Dog', name: 'Spot' },
//     { type: 'Cat', name: 'Tiger' },
//     { type: 'Cat', name: 'Leo' }
//   }
export function utilArrayUniqBy(a, key) {
  let seen = new Set();
  return a.reduce((acc, item) => {
    let val = (typeof key === 'function') ? key(item) : item[key];
    if (val && !seen.has(val)) {
      seen.add(val);
      acc.push(item);
    }
    return acc;
  }, []);
}
