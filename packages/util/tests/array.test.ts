import * as util from '../src/index';

describe('utilArrayIdentical', () => {
  it('same Arrays are identical', () => {
    const a = [1, 2, 3];
    expect(util.utilArrayIdentical(a, a)).toBeTrue();
  });

  it('different length Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    expect(util.utilArrayIdentical(a, b)).toBeFalse();
  });

  it('same contents Arrays are identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(util.utilArrayIdentical(a, b)).toBeTrue();
  });

  it('different contents Arrays are not identical', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];
    expect(util.utilArrayIdentical(a, b)).toBeFalse();
  });

  it('compares elements strictly', () => {
    const a = [0, 1];
    const b = ['', 1];
    expect(util.utilArrayIdentical(a, b)).toBeFalse();

    const c = [{ foo: 'bar' }];
    const d = [{ foo: 'bar' }];
    expect(util.utilArrayIdentical(a, b)).toBeFalse();
  });
});

describe('utilArrayDifference', () => {
  it('returns difference of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    expect(util.utilArrayDifference([], [])).toEqual([]);
    expect(util.utilArrayDifference([], a)).toEqual([]);
    expect(util.utilArrayDifference(a, [])).toIncludeSameMembers([1, 2, 3]);
    expect(util.utilArrayDifference(a, b)).toIncludeSameMembers([1]);
    expect(util.utilArrayDifference(b, a)).toIncludeSameMembers([4]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns intersection of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    expect(util.utilArrayIntersection([], [])).toEqual([]);
    expect(util.utilArrayIntersection([], a)).toEqual([]);
    expect(util.utilArrayIntersection(a, [])).toEqual([]);
    expect(util.utilArrayIntersection(a, b)).toIncludeSameMembers([2, 3]);
    expect(util.utilArrayIntersection(b, a)).toIncludeSameMembers([2, 3]);
  });
});

describe('utilArrayIntersection', () => {
  it('returns union of two Arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 3, 2];
    expect(util.utilArrayUnion([], [])).toEqual([]);
    expect(util.utilArrayUnion([], a)).toIncludeSameMembers([1, 2, 3]);
    expect(util.utilArrayUnion(a, [])).toIncludeSameMembers([1, 2, 3]);
    expect(util.utilArrayUnion(a, b)).toIncludeSameMembers([1, 2, 3, 4]);
    expect(util.utilArrayUnion(b, a)).toIncludeSameMembers([1, 2, 3, 4]);
  });
});

describe('utilArrayUniq', () => {
  it('utilArrayUniq returns unique values in an Array', () => {
    const a = [1, 1, 2, 3, 3];
    expect(util.utilArrayUniq([])).toEqual([]);
    expect(util.utilArrayUniq(a)).toIncludeSameMembers([1, 2, 3]);
  });
});

describe('utilArrayChunk', () => {
  it('returns array split into given sized chunks', () => {
    const a = [1, 2, 3, 4, 5, 6, 7];
    // bad chunkSizes, just copy whole array into a single chunk
    expect(util.utilArrayChunk(a)).toEqual([[1, 2, 3, 4, 5, 6, 7]]);
    expect(util.utilArrayChunk(a, -1)).toEqual([[1, 2, 3, 4, 5, 6, 7]]);
    expect(util.utilArrayChunk(a, 0)).toEqual([[1, 2, 3, 4, 5, 6, 7]]);
    // good chunkSizes
    expect(util.utilArrayChunk(a, 2)).toEqual([[1, 2], [3, 4], [5, 6], [7]]);
    expect(util.utilArrayChunk(a, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(util.utilArrayChunk(a, 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7]
    ]);
  });
});

describe('utilArrayFlatten', () => {
  it('utilArrayFlatten returns two level array as single level', () => {
    const a = [[1, 2, 3], [4, 5, 6], [7]];
    expect(util.utilArrayFlatten(a)).toEqual([1, 2, 3, 4, 5, 6, 7]);
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
    expect(util.utilArrayGroupBy(pets, 'type')).toEqual(expected);
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
    const keyFn = function (item) {
      return item.name.length;
    };
    expect(util.utilArrayGroupBy(pets, keyFn)).toEqual(expected);
  });

  it('undefined key function', () => {
    const expected = {
      undefined: pets
    };
    expect(util.utilArrayGroupBy(pets)).toEqual(expected);
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
    expect(util.utilArrayUniqBy(pets, 'type')).toEqual(expected);
  });

  it('groups by key function', () => {
    const expected = [
      { type: 'Dog', name: 'Spot' },
      { type: 'Cat', name: 'Tiger' },
      //{ type: 'Dog', name: 'Rover' },   // not unique by name length
      { type: 'Cat', name: 'Leo' }
    ];
    const keyFn = function (item) {
      return item.name.length;
    };
    expect(util.utilArrayUniqBy(pets, keyFn)).toEqual(expected);
  });

  it('undefined key function', () => {
    expect(util.utilArrayUniqBy(pets)).toEqual([]);
  });
});
