import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/util.mjs';


assert.sameMembers = function(a, b) {
  if (!Array.isArray(a)) {
    assert.fail(`${a} is not an Array`);
    return;
  }
  if (!Array.isArray(b)) {
    assert.fail(`${b} is not an Array`);
    return;
  }

  for (const item of a) {
    if (!b.includes(item)) {
      assert.fail(`${a} and ${b} don't have same members`);
      return;
    }
  }
  for (const item of b) {
    if (!a.includes(item)) {
      assert.fail(`${a} and ${b} don't have same members`);
      return;
    }
  }
};


describe('utilArrayIdentical', () => {
  it('same Arrays are identical', () => {
    const a = [1, 2, 3];
    assert.equal(test.utilArrayIdentical(a, a), true);
  });

  it('different length Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    assert.equal(test.utilArrayIdentical(a, b), false);
  });

  it('same contents Arrays are identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    assert.equal(test.utilArrayIdentical(a, b), true);
  });

  it('different contents Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];
    assert.equal(test.utilArrayIdentical(a, b), false);
  });

  it('compares elements strictly', () => {
    const a = [0, 1];
    const b = ['', 1];
    assert.equal(test.utilArrayIdentical(a, b), false);

    const c = [{ foo: 'bar' }];
    const d = [{ foo: 'bar' }];
    assert.equal(test.utilArrayIdentical(c, d), false);
  });
});

describe('utilArrayDifference', () => {
  it('returns difference of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(test.utilArrayDifference([], []), []);
    assert.deepEqual(test.utilArrayDifference([], a), []);
    assert.deepEqual(test.utilArrayDifference(a, []), [1, 2, 3]);
    assert.deepEqual(test.utilArrayDifference(a, b), [1]);
    assert.deepEqual(test.utilArrayDifference(b, a), [4]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns intersection of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(test.utilArrayIntersection([], []), []);
    assert.deepEqual(test.utilArrayIntersection([], a), []);
    assert.deepEqual(test.utilArrayIntersection(a, []), []);
    assert.sameMembers(test.utilArrayIntersection(a, b), [2, 3]);
    assert.sameMembers(test.utilArrayIntersection(b, a), [2, 3]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns union of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(test.utilArrayUnion([], []), []);
    assert.sameMembers(test.utilArrayUnion([], a), [1, 2, 3]);
    assert.sameMembers(test.utilArrayUnion(a, []), [1, 2, 3]);
    assert.sameMembers(test.utilArrayUnion(a, b), [1, 2, 3, 4]);
    assert.sameMembers(test.utilArrayUnion(b, a), [1, 2, 3, 4]);
  });
});

describe('utilArrayUniq', () => {
  it('utilArrayUniq returns unique values in an Array', () => {
    const a = [1, 1, 2, 3, 3];
    assert.deepEqual(test.utilArrayUniq([]), []);
    assert.deepEqual(test.utilArrayUniq(a), [1, 2, 3]);
  });
});

describe('utilArrayChunk', () => {
  it('returns array split into given sized chunks', () => {
    const a = [1, 2, 3, 4, 5, 6, 7];
    // bad chunkSizes, just copy whole array into a single chunk
    assert.deepEqual(test.utilArrayChunk(a), [[1, 2, 3, 4, 5, 6, 7]]);
    assert.deepEqual(test.utilArrayChunk(a, -1), [[1, 2, 3, 4, 5, 6, 7]]);
    assert.deepEqual(test.utilArrayChunk(a, 0), [[1, 2, 3, 4, 5, 6, 7]]);
    // good chunkSizes
    assert.deepEqual(test.utilArrayChunk(a, 2), [[1, 2], [3, 4], [5, 6], [7]]);
    assert.deepEqual(test.utilArrayChunk(a, 3), [[1, 2, 3], [4, 5, 6], [7]]);
    assert.deepEqual(test.utilArrayChunk(a, 4), [[1, 2, 3, 4], [5, 6, 7]]);
  });
});

describe('utilArrayFlatten', () => {
  it('utilArrayFlatten returns two level array as single level', () => {
    const a = [[1, 2, 3], [4, 5, 6], [7]];
    assert.deepEqual(test.utilArrayFlatten(a), [1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('utilArrayGroupBy', () => {
  const pets = [
    { type: 'Dog', name: 'Spot' },
    { type: 'Cat', name: 'Tiger' },
    { type: 'Dog', name: 'Rover' },
    { type: 'Cat', name: 'Leo' }
  ];

  it('groups by key property', () => {
    const expected = {
      Dog: [
        { type: 'Dog', name: 'Spot' },
        { type: 'Dog', name: 'Rover' }
      ],
      Cat: [
        { type: 'Cat', name: 'Tiger' },
        { type: 'Cat', name: 'Leo' }
      ]
    };
    assert.deepEqual(test.utilArrayGroupBy(pets, 'type'), expected);
  });

  it('groups by key function', () => {
    const expected = {
      3: [{ type: 'Cat', name: 'Leo' }],
      4: [{ type: 'Dog', name: 'Spot' }],
      5: [
        { type: 'Cat', name: 'Tiger' },
        { type: 'Dog', name: 'Rover' }
      ]
    };
    const keyFn = (item) => item.name.length;
    assert.deepEqual(test.utilArrayGroupBy(pets, keyFn), expected);
  });

  it('undefined key function', () => {
    const expected = {
      undefined: pets
    };
    assert.deepEqual(test.utilArrayGroupBy(pets), expected);
  });
});

describe('utilArrayUniqBy', () => {
  const pets = [
    { type: 'Dog', name: 'Spot' },
    { type: 'Cat', name: 'Tiger' },
    { type: 'Dog', name: 'Rover' },
    { type: 'Cat', name: 'Leo' }
  ];

  it('groups by key property', () => {
    const expected = [
      { type: 'Dog', name: 'Spot' },
      { type: 'Cat', name: 'Tiger' }
      //{ type: 'Dog', name: 'Rover' },   // not unique by type
      //{ type: 'Cat', name: 'Leo' }      // not unique by type
    ];
    assert.deepEqual(test.utilArrayUniqBy(pets, 'type'), expected);
  });

  it('groups by key function', () => {
    const expected = [
      { type: 'Dog', name: 'Spot' },
      { type: 'Cat', name: 'Tiger' },
      //{ type: 'Dog', name: 'Rover' },   // not unique by name length
      { type: 'Cat', name: 'Leo' }
    ];
    const keyFn = (item) => item.name.length;
    assert.deepEqual(test.utilArrayUniqBy(pets, keyFn), expected);
  });

  it('undefined key function', () => {
    assert.deepEqual(test.utilArrayUniqBy(pets), []);
  });
});
