import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/util.mjs';


assert.arrayContains = function(choices, val) {
  if (!Array.isArray(choices)) {
    assert.fail(`${choices} is not an Array`);
    return;
  }

  for (const choice of choices) {
    if (Object.is(val, choice)) return;  // found one
  }
  assert.fail(`${val} is not one of ${choices}`);
}


describe('utilCleanTags', () => {
  it('handles empty tags object', () => {
    const t = {};
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {});
  });

  it('discards empty keys', () => {
    const t = { '': 'bar' };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {});
  });

  it('discards undefined values', () => {
    const t = { foo: undefined };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {});
  });

  it('trims whitespace', () => {
    const t = {
      leading: '   value',
      trailing: 'value  ',
      both: '   value  '
    };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {
      leading: 'value',
      trailing: 'value',
      both: 'value'
    });
  });

  it('cleans some unprintable characters from websites and emails', () => {
    const t = {
      website: 'http://example\u200B.com',
      email: 'person@example\u200C.com'
    };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {
      website: 'http://example.com',
      email: 'person@example.com'
    });
  });

  it('trims semicolon delimited whitespace', () => {
    const t = {
      leading: '   value1;  value2',
      trailing: 'value1  ;value2  ',
      both: '   value1  ;  value2  '
    };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {
      leading: 'value1;value2',
      trailing: 'value1;value2',
      both: 'value1;value2'
    });
  });

  it('does not clean description, note, fixme', () => {
    const t = {
      description: '   value',
      note: 'value  ',
      fixme: '   value  '
    };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, t);
  });

  it('uses semicolon-space delimiting for opening_hours, conditional: tags', () => {
    const t = {
      opening_hours:
        ' Mo-Su 08:00-18:00    ;Apr 10-15 off;Jun 08:00-14:00  ;  Aug off; Dec 25 off ',
      collection_times:
        '  Mo 10:00-12:00,12:30-15:00    ;Tu-Fr 08:00-12:00,12:30-15:00;Sa 08:00-12:00    ',
      'maxspeed:conditional': '    120 @ (06:00-20:00)   ;80 @ wet  ',
      'restriction:conditional': '  no_u_turn @ (Mo-Fr 09:00-10:00,15:00-16:00;SH off)  '
    };
    const result = test.utilCleanTags(t);
    assert.deepEqual(result, {
      opening_hours: 'Mo-Su 08:00-18:00; Apr 10-15 off; Jun 08:00-14:00; Aug off; Dec 25 off',
      collection_times: 'Mo 10:00-12:00,12:30-15:00; Tu-Fr 08:00-12:00,12:30-15:00; Sa 08:00-12:00',
      'maxspeed:conditional': '120 @ (06:00-20:00); 80 @ wet',
      'restriction:conditional': 'no_u_turn @ (Mo-Fr 09:00-10:00,15:00-16:00; SH off)'
    });
  });
});

describe('utilEntitySelector', () => {
  it('works for nothing', () => {
    assert.equal(test.utilEntitySelector([]), 'nothing');
  });
  it('works for 1 id', () => {
    assert.equal(test.utilEntitySelector(['class1']), '.class1');
  });
  it('works for 2 ids', () => {
    assert.equal(test.utilEntitySelector(['class1', 'class2']), '.class1,.class2');
  });
});

describe('utilEntityOrMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [
      { id: w1.id, type: w1.type },
      { id: w2.id, type: w2.type }
    ]
  };
  const r2 = { id: 'r-2', type: 'relation', members: [{ id: r1.id, type: r1.type }] };
  const r3 = { id: 'r-3', type: 'relation' };
  const graph = {
    hasEntity: (id) =>
      ({
        'w-1': w1,
        'w-2': w2,
        'r-1': r1,
        'r-2': r2,
        'r-3': r3
      }[id])
  };

  it('trivially returns ways', () => {
    assert.equal(test.utilEntityOrMemberSelector(['w-1'], graph), '.w-1');
    assert.equal(test.utilEntityOrMemberSelector(['w-2'], graph), '.w-2');
  });

  it('does not descend into sub relations', () => {
    const result = test.utilEntityOrMemberSelector(['r-2'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.r-2');
    assert.equal(result.length, 2);
  });

  it('does not descend into sub relations', () => {
    const result = test.utilEntityOrMemberSelector(['r-2'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.r-2');
    assert.equal(result.length, 2);
  });

  it('works with degenerate relation (no members)', () => {
    const result = test.utilEntityOrMemberSelector(['r-3'], graph).split(',');
    assert.arrayContains(result, '.r-3');
    assert.equal(result.length, 1);
  });

  it('correctly gathers up ways under a relation', () => {
    const result = test.utilEntityOrMemberSelector(['r-1'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 3);
  });

  it('works on an array of inputs', () => {
    let result = test.utilEntityOrMemberSelector(['w-1', 'w-2'], graph).split(',');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 2);

    result = test.utilEntityOrMemberSelector(['r-1', 'r-2'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.arrayContains(result, '.r-2');
    assert.equal(result.length, 4);
  });
});

describe('utilEntityOrDeepMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [
      { id: w1.id, type: w1.type },
      { id: w2.id, type: w2.type }
    ]
  };
  const r2 = { id: 'r-2', type: 'relation', members: [{ id: r1.id, type: r1.type }] };
  const r3 = { id: 'r-3', type: 'relation', members: [{ id: r2.id, type: r2.type }] };
  const r4 = { id: 'r-4', type: 'relation' };
  const graph = {
    hasEntity: (id) =>
      ({
        'w-1': w1,
        'w-2': w2,
        'r-1': r1,
        'r-2': r2,
        'r-3': r3,
        'r-4': r4
      }[id])
  };

  it('trivially returns ways', () => {
    assert.equal(test.utilEntityOrDeepMemberSelector(['w-1'], graph), '.w-1');
    assert.equal(test.utilEntityOrDeepMemberSelector(['w-2'], graph), '.w-2');
  });

  it('does descend into sub relations', () => {
    const result = test.utilEntityOrDeepMemberSelector(['r-3'], graph).split(',');
    assert.arrayContains(result, '.r-3');
    assert.arrayContains(result, '.r-2');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 5);
  });

  it('works with degenerate relation (no members)', () => {
    const result = test.utilEntityOrDeepMemberSelector(['r-4'], graph).split(',');
    assert.arrayContains(result, '.r-4');
    assert.equal(result.length, 1);
  });

  it('correctly gathers up ways under a relation', () => {
    const result = test.utilEntityOrDeepMemberSelector(['r-1'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 3);
  });

  it('works on an array of inputs', () => {
    let result = test.utilEntityOrDeepMemberSelector(['w-1', 'w-2'], graph).split(',');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 2);

    result = test.utilEntityOrDeepMemberSelector(['r-1', 'r-2'], graph).split(',');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.arrayContains(result, '.r-2');
    assert.equal(result.length, 4);
  });
});

describe('utilDeepMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [
      { id: w1.id, type: w1.type },
      { id: w2.id, type: w2.type }
    ],
    isMultipolygon: () => false
  };
  const r2 = {
    id: 'r-2',
    type: 'relation',
    members: [{ id: r1.id, type: r1.type }],
    isMultipolygon: () => true
  };
  const r3 = {
    id: 'r-3',
    type: 'relation',
    members: [{ id: r2.id, type: r2.type }],
    isMultipolygon: () => false
  };
  const r4 = { id: 'r-4', type: 'relation', isMultipolygon: () => true };
  const graph = {
    hasEntity: (id) =>
      ({
        'w-1': w1,
        'w-2': w2,
        'r-1': r1,
        'r-2': r2,
        'r-3': r3,
        'r-4': r4
      }[id])
  };

  it('does descend into sub relations', () => {
    const result = test.utilDeepMemberSelector(['r-3'], graph, false).split(',');
    assert.arrayContains(result, '.r-2');
    assert.arrayContains(result, '.r-1');
    assert.arrayContains(result, '.w-2');
    assert.arrayContains(result, '.w-1');
  });

  it('works with degenerate relation (no members)', () => {
    assert.equal(test.utilDeepMemberSelector(['r-4'], graph, false), 'nothing');
  });

  it('skips multipolygons when requested', () => {
    const result = test.utilDeepMemberSelector(['r-3'], graph, true).split(',');
    assert.arrayContains(result, '.r-2');
    assert.equal(result.length, 1);
  });

  it('correctly gathers up everything under a relation', () => {
    const result = test.utilDeepMemberSelector(['r-1'], graph, false).split(',');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 2);
  });

  it('works on an array of inputs', () => {
    const result = test.utilDeepMemberSelector(['r-1', 'r-2'], graph, false).split(',');
    assert.arrayContains(result, '.w-1');
    assert.arrayContains(result, '.w-2');
    assert.equal(result.length, 2);
  });
});

describe('utilGetAllNodes', () => {
  const n1 = { id: 'n-1', type: 'node' };
  const n2 = { id: 'n-2', type: 'node' };
  const n3 = { id: 'n-3', type: 'node' };
  const w1 = { id: 'w-1', type: 'way', nodes: ['n-1', 'n-2', 'n-1'] };
  const w2 = { id: 'w-2', type: 'way', nodes: ['n-2', 'n-3'] };
  const w3 = { id: 'w-3', type: 'way', nodes: ['n-4', 'n-3'] };
  const w4 = { id: 'w-4', type: 'way' };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [
      { id: w1.id, type: w1.type },
      { id: n3.id, type: n3.type }
    ]
  };
  const r2 = {
    id: 'r-2',
    type: 'relation',
    members: [{ id: r1.id, type: r1.type }]
  };
  const r3 = {
    id: 'r-3',
    type: 'relation',
    members: [{ id: r2.id, type: r2.type }]
  };
  const r4 = {
    id: 'r-4',
    type: 'relation',
    members: [
      { id: r2.id, type: r2.type },
      { id: 'r-undef', type: 'relation' }
    ]
  };
  const r5 = { id: 'r-5', type: 'relation' };
  const graph = {
    hasEntity: (id) =>
      ({
        'n-1': n1,
        'n-2': n2,
        'n-3': n3,
        'w-1': w1,
        'w-2': w2,
        'w-3': w3,
        'w-4': w4,
        'r-1': r1,
        'r-2': r2,
        'r-3': r3,
        'r-4': r4,
        'r-5': r5
      }[id])
  };

  it('handles nodes handed in', () => {
    assert.deepEqual(test.utilGetAllNodes(['n-1'], graph), [n1]);
    assert.deepEqual(test.utilGetAllNodes(['n-1', 'n-2'], graph), [n1, n2]);
    assert.deepEqual(test.utilGetAllNodes(['n-1', 'n-2', 'n-3'], graph), [n1, n2, n3]);
  });

  it('gets all descendant nodes of a way', () => {
    assert.deepEqual(test.utilGetAllNodes(['w-1'], graph), [n1, n2]);
    assert.deepEqual(test.utilGetAllNodes(['w-1', 'w-2'], graph), [n1, n2, n3]);
  });

  it('gets all descendant nodes of a relation', () => {
    assert.deepEqual(test.utilGetAllNodes(['r-1'], graph), [n1, n2, n3]);
    assert.deepEqual(test.utilGetAllNodes(['r-2'], graph), [n1, n2, n3]);
    assert.deepEqual(test.utilGetAllNodes(['r-3'], graph), [n1, n2, n3]);
  });

  it('gracefully handles missing entities', () => {
    assert.deepEqual(test.utilGetAllNodes(['w-3'], graph), [n3]);
    assert.deepEqual(test.utilGetAllNodes(['r-4'], graph), [n1, n2, n3]);
  });

  it('gets all descendant nodes of multiple ids', () => {
    const a = { id: 'a', type: 'node' };
    const b = { id: 'b', type: 'node' };
    const c = { id: 'c', type: 'node' };
    const d = { id: 'd', type: 'node' };
    const e = { id: 'e', type: 'node' };
    const w1 = { id: 'w1', nodes: ['a', 'b', 'a'], type: 'way' };
    const w2 = { id: 'w2', nodes: ['c', 'b', 'a', 'c'], type: 'way' };
    const r = { id: 'r', members: [{ id: 'w1' }, { id: 'd' }] };
    const graph = {
      hasEntity: (id) =>
        ({
          a: a,
          b: b,
          c: c,
          d: d,
          e: e,
          w1: w1,
          w2: w2,
          r: r
        }[id])
    };
    const result = test.utilGetAllNodes(['r', 'w2', 'e'], graph);
    assert.arrayContains(result, a);
    assert.arrayContains(result, b);
    assert.arrayContains(result, c);
    assert.arrayContains(result, d);
    assert.arrayContains(result, e);
    assert.equal(result.length, 5);
  });

  it('handles recursive relations', () => {
    const n = { id: 'n', type: 'node' };
    const r1 = { id: 'r1', members: [{ id: 'r2' }], type: 'relation' };
    const r2 = { id: 'r2', members: [{ id: 'r1' }, { id: 'n' }], type: 'relation' };
    const graph = {
      hasEntity: (id) =>
        ({
          n: n,
          r1: r1,
          r2: r2
        }[id])
    };
    const result = test.utilGetAllNodes(['r1'], graph);
    assert.arrayContains(result, n);
    assert.equal(result.length, 1);
  });

  it('handles degenerate ways', () => {
    assert.deepEqual(test.utilGetAllNodes(['w-4'], graph), []);
    assert.deepEqual(test.utilGetAllNodes(['r-5'], graph), []);
  });

  it('handles degenerate relations', () => {});
});

describe('utilTagDiff', () => {
  const oldTags = { a: 'one', b: 'two', c: 'three' };
  const newTags = { a: 'one', b: 'three', d: 'four' };
  const diff = test.utilTagDiff(oldTags, newTags);

  assert.ok(diff instanceof Array);
  assert.equal(diff.length, 4);

  assert.deepEqual(diff[0], {
    type: '-',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '- b=two' // delete-modify
  });
  assert.deepEqual(diff[1], {
    type: '+',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '+ b=three' // insert-modify
  });
  assert.deepEqual(diff[2], {
    type: '-',
    key: 'c',
    oldVal: 'three',
    newVal: undefined,
    display: '- c=three' // delete
  });
  assert.deepEqual(diff[3], {
    type: '+',
    key: 'd',
    oldVal: undefined,
    newVal: 'four',
    display: '+ d=four' // insert
  });
});

describe('utilTagText', () => {
  assert.equal(test.utilTagText({}), '');
  assert.equal(test.utilTagText({ tags: { foo: 'bar' } }), 'foo=bar');
  assert.equal(test.utilTagText({ tags: { foo: 'bar', two: 'three' } }), 'foo=bar, two=three');
});