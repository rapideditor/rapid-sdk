import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as util from '../src/util.ts';


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
    assert.equal(util.utilArrayIdentical(a, a), true);
  });

  it('different length Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    assert.equal(util.utilArrayIdentical(a, b), false);
  });

  it('same contents Arrays are identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    assert.equal(util.utilArrayIdentical(a, b), true);
  });

  it('different contents Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];
    assert.equal(util.utilArrayIdentical(a, b), false);
  });

  it('compares elements strictly', () => {
    const a = [0, 1];
    const b = ['', 1];
    assert.equal(util.utilArrayIdentical(a, b), false);

    const c = [{ foo: 'bar' }];
    const d = [{ foo: 'bar' }];
    assert.equal(util.utilArrayIdentical(c, d), false);
  });
});

describe('utilArrayDifference', () => {
  it('returns difference of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(util.utilArrayDifference([], []), []);
    assert.deepEqual(util.utilArrayDifference([], a), []);
    assert.deepEqual(util.utilArrayDifference(a, []), [1, 2, 3]);
    assert.deepEqual(util.utilArrayDifference(a, b), [1]);
    assert.deepEqual(util.utilArrayDifference(b, a), [4]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns intersection of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(util.utilArrayIntersection([], []), []);
    assert.deepEqual(util.utilArrayIntersection([], a), []);
    assert.deepEqual(util.utilArrayIntersection(a, []), []);
    assert.sameMembers(util.utilArrayIntersection(a, b), [2, 3]);
    assert.sameMembers(util.utilArrayIntersection(b, a), [2, 3]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns union of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    assert.deepEqual(util.utilArrayUnion([], []), []);
    assert.sameMembers(util.utilArrayUnion([], a), [1, 2, 3]);
    assert.sameMembers(util.utilArrayUnion(a, []), [1, 2, 3]);
    assert.sameMembers(util.utilArrayUnion(a, b), [1, 2, 3, 4]);
    assert.sameMembers(util.utilArrayUnion(b, a), [1, 2, 3, 4]);
  });
});

describe('utilArrayUniq', () => {
  it('utilArrayUniq returns unique values in an Array', () => {
    const a = [1, 1, 2, 3, 3];
    assert.deepEqual(util.utilArrayUniq([]), []);
    assert.deepEqual(util.utilArrayUniq(a), [1, 2, 3]);
  });
});

describe('utilArrayChunk', () => {
  it('returns array split into given sized chunks', () => {
    const a = [1, 2, 3, 4, 5, 6, 7];
    // bad chunkSizes, just copy whole array into a single chunk
    assert.deepEqual(util.utilArrayChunk(a), [[1, 2, 3, 4, 5, 6, 7]]);
    assert.deepEqual(util.utilArrayChunk(a, -1), [[1, 2, 3, 4, 5, 6, 7]]);
    assert.deepEqual(util.utilArrayChunk(a, 0), [[1, 2, 3, 4, 5, 6, 7]]);
    // good chunkSizes
    assert.deepEqual(util.utilArrayChunk(a, 2), [[1, 2], [3, 4], [5, 6], [7]]);
    assert.deepEqual(util.utilArrayChunk(a, 3), [[1, 2, 3], [4, 5, 6], [7]]);
    assert.deepEqual(util.utilArrayChunk(a, 4), [[1, 2, 3, 4], [5, 6, 7]]);
  });
});

describe('utilArrayFlatten', () => {
  it('utilArrayFlatten returns two level array as single level', () => {
    const a = [[1, 2, 3], [4, 5, 6], [7]];
    assert.deepEqual(util.utilArrayFlatten(a), [1, 2, 3, 4, 5, 6, 7]);
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
    assert.deepEqual(util.utilArrayGroupBy(pets, 'type'), expected);
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
    assert.deepEqual(util.utilArrayGroupBy(pets, keyFn), expected);
  });

  it('undefined key function', () => {
    const expected = {
      undefined: pets
    };
    assert.deepEqual(util.utilArrayGroupBy(pets), expected);
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
    assert.deepEqual(util.utilArrayUniqBy(pets, 'type'), expected);
  });

  it('groups by key function', () => {
    const expected = [
      { type: 'Dog', name: 'Spot' },
      { type: 'Cat', name: 'Tiger' },
      //{ type: 'Dog', name: 'Rover' },   // not unique by name length
      { type: 'Cat', name: 'Leo' }
    ];
    const keyFn = (item) => item.name.length;
    assert.deepEqual(util.utilArrayUniqBy(pets, keyFn), expected);
  });

  it('undefined key function', () => {
    assert.deepEqual(util.utilArrayUniqBy(pets), []);
  });
});
