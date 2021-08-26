import 'jest-extended';
import * as util from '../src/index';

describe('utilCleanTags', () => {
  it('handles empty tags object', () => {
    const t = {};
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({});
  });

  it('discards empty keys', () => {
    const t = { '': 'bar' };
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({});
  });

  it('discards undefined values', () => {
    const t = { foo: undefined };
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({});
  });

  it('trims whitespace', () => {
    const t = {
      leading: '   value',
      trailing: 'value  ',
      both: '   value  '
    };
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({
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
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({
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
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({
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
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual(t);
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
    const result = util.utilCleanTags(t);
    expect(result).toStrictEqual({
      opening_hours: 'Mo-Su 08:00-18:00; Apr 10-15 off; Jun 08:00-14:00; Aug off; Dec 25 off',
      collection_times: 'Mo 10:00-12:00,12:30-15:00; Tu-Fr 08:00-12:00,12:30-15:00; Sa 08:00-12:00',
      'maxspeed:conditional': '120 @ (06:00-20:00); 80 @ wet',
      'restriction:conditional': 'no_u_turn @ (Mo-Fr 09:00-10:00,15:00-16:00; SH off)'
    });
  });
});

describe('utilEntitySelector', () => {
  it('works for nothing', () => {
    expect(util.utilEntitySelector([])).toEqual('nothing');
  });
  it('works for 1 id', () => {
    expect(util.utilEntitySelector(['class1'])).toEqual('.class1');
  });
  it('works for 2 ids', () => {
    expect(util.utilEntitySelector(['class1', 'class2'])).toEqual('.class1,.class2');
  });
});

describe('utilEntityOrMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = { id: 'r-1', type: 'relation', members: [{id: w1.id, type: w1.type}, {id: w2.id, type: w2.type}] };
  const r2 = { id: 'r-2', type: 'relation', members: [{id: r1.id, type: r1.type}] };
  const entities = {  };
  const graph = { hasEntity: (id: string) => ({
    'w-1': w1,
    'w-2': w2,
    'r-1': r1,
    'r-2': r2,
  }[id]) };

  it('trivially returns ways', () => {
    expect(util.utilEntityOrMemberSelector(['w-1'], graph)).toEqual('.w-1');
    expect(util.utilEntityOrMemberSelector(['w-2'], graph)).toEqual('.w-2');
  });

  it('does not descend into sub relations', () => {
    const results = util.utilEntityOrMemberSelector(['r-2'], graph).split(',');
    expect(results).toContain('.r-1');
    expect(results).toContain('.r-2');
    expect(results).toHaveLength(2);
  });

  it('correctly gathers up ways under a relation', () => {
    const results = util.utilEntityOrMemberSelector(['r-1'], graph).split(',');
    expect(results).toContain('.r-1');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toHaveLength(3);
  });

  it('works on an array of inputs', () => {
    let results = util.utilEntityOrMemberSelector(['w-1', 'w-2'], graph).split(',');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toHaveLength(2);

    results = util.utilEntityOrMemberSelector(['r-1', 'r-2'], graph).split(',');
    expect(results).toContain('.r-1');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toContain('.r-2');
    expect(results).toHaveLength(4);
  });
});

describe('utilEntityOrDeepMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = { id: 'r-1', type: 'relation', members: [{id: w1.id, type: w1.type}, {id: w2.id, type: w2.type}] };
  const r2 = { id: 'r-2', type: 'relation', members: [{id: r1.id, type: r1.type}] };
  const r3 = { id: 'r-3', type: 'relation', members: [{id: r2.id, type: r2.type}] };
  const graph = { hasEntity: (id: string) => ({
    'w-1': w1,
    'w-2': w2,
    'r-1': r1,
    'r-2': r2,
    'r-3': r3,
  }[id]) };

  it('trivially returns ways', () => {
    expect(util.utilEntityOrDeepMemberSelector(['w-1'], graph)).toEqual('.w-1');
    expect(util.utilEntityOrDeepMemberSelector(['w-2'], graph)).toEqual('.w-2');
  });

  it('does descend into sub relations', () => {
    const results = util.utilEntityOrDeepMemberSelector(['r-3'], graph).split(',');
    expect(results).toContain('.r-3');
    expect(results).toContain('.r-2');
    expect(results).toContain('.r-1');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toHaveLength(5);
  });

  it('correctly gathers up ways under a relation', () => {
    const results = util.utilEntityOrDeepMemberSelector(['r-1'], graph).split(',');
    expect(results).toContain('.r-1');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toHaveLength(3);
  });

  it('works on an array of inputs', () => {
    let results = util.utilEntityOrDeepMemberSelector(['w-1', 'w-2'], graph).split(',');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toHaveLength(2);

    results = util.utilEntityOrDeepMemberSelector(['r-1', 'r-2'], graph).split(',');
    expect(results).toContain('.r-1');
    expect(results).toContain('.w-1');
    expect(results).toContain('.w-2');
    expect(results).toContain('.r-2');
    expect(results).toHaveLength(4);
  });
});

describe('utilDeepMemberSelector', () => {
  const w1 = { id: 'w-1', type: 'way' };
  const w2 = { id: 'w-2', type: 'way' };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [{id: w1.id, type: w1.type}, {id: w2.id, type: w2.type}],
    isMultipolygon: () => false,
  };
  const r2 = {
    id: 'r-2',
    type: 'relation',
    members: [{id: r1.id, type: r1.type}],
    isMultipolygon: () => true,
  };
  const r3 = {
    id: 'r-3',
    type: 'relation',
    members: [{id: r2.id, type: r2.type}],
    isMultipolygon: () => false,
  };
  const graph = { hasEntity: (id: string) => ({
    'w-1': w1,
    'w-2': w2,
    'r-1': r1,
    'r-2': r2,
    'r-3': r3,
  }[id]) };

  it('does descend into sub relations', () => {
    const result = new Set(util.utilDeepMemberSelector(['r-3'], graph, false).split(','));
    expect(result).toContain('.r-2');
    expect(result).toContain('.r-1');
    expect(result).toContain('.w-2');
    expect(result).toContain('.w-1');
  });

  it('skips multipolygons when requested', () => {
    const result = util.utilDeepMemberSelector(['r-3'], graph, true).split(',');
    expect(result).toContain('.r-2');
    expect(result).toHaveLength(1);
  });

  it('correctly gathers up everything under a relation', () => {
    const result = util.utilDeepMemberSelector(['r-1'], graph, false).split(',');
    expect(result).toContain('.w-1');
    expect(result).toContain('.w-2');
    expect(result).toHaveLength(2);
  });

  it('works on an array of inputs', () => {
    const result = util.utilDeepMemberSelector(['r-1', 'r-2'], graph, false).split(',');
    expect(result).toContain('.w-1');
    expect(result).toContain('.w-2');
    expect(result).toHaveLength(2);
  });
});

describe('utilGetAllNodes', () => {
  const n1 = { id: 'n-1', type: 'node' };
  const n2 = { id: 'n-2', type: 'node' };
  const n3 = { id: 'n-3', type: 'node' };
  const w1 = { id: 'w-1', type: 'way', nodes: ['n-1', 'n-2', 'n-1'] };
  const w2 = { id: 'w-2', type: 'way', nodes: ['n-2', 'n-3'] };
  const r1 = {
    id: 'r-1',
    type: 'relation',
    members: [{id: w1.id, type: w1.type}, {id: n3.id, type: n3.type}],
  };
  const r2 = {
    id: 'r-2',
    type: 'relation',
    members: [{id: r1.id, type: r1.type}],
  };
  const r3 = {
    id: 'r-3',
    type: 'relation',
    members: [{id: r2.id, type: r2.type}],
  };
  const graph = { hasEntity: (id: string) => ({
    'n-1': n1,
    'n-2': n2,
    'n-3': n3,
    'w-1': w1,
    'w-2': w2,
    'r-1': r1,
    'r-2': r2,
    'r-3': r3,
  }[id]) };

  it('handles nodes handed in', () => {
    expect(util.utilGetAllNodes(['n-1'], graph)).toEqual([n1]);
    expect(util.utilGetAllNodes(['n-1', 'n-2'], graph)).toEqual([n1, n2]);
    expect(util.utilGetAllNodes(['n-1', 'n-2', 'n-3'], graph)).toEqual([n1, n2, n3]);
  });

  it('gets all descendant nodes of a way', () => {
    expect(util.utilGetAllNodes(['w-1'], graph)).toEqual([n1, n2]);
    expect(util.utilGetAllNodes(['w-1', 'w-2'], graph)).toEqual([n1, n2, n3]);
  });

  it('gets all descendant nodes of a relation', () => {
    expect(util.utilGetAllNodes(['r-1'], graph)).toEqual([n1, n2, n3]);
    expect(util.utilGetAllNodes(['r-2'], graph)).toEqual([n1, n2, n3]);
    expect(util.utilGetAllNodes(['r-3'], graph)).toEqual([n1, n2, n3]);
  });

  it('gets all descendant nodes of multiple ids', () => {
    const a = { id: 'a', type: 'node' };
    const b = { id: 'b', type: 'node' };
    const c = { id: 'c', type: 'node' };
    const d = { id: 'd', type: 'node' };
    const e = { id: 'e', type: 'node' };
    const w1 = { id: 'w1', nodes: ['a','b','a'], type: 'way' };
    const w2 = { id: 'w2', nodes: ['c','b','a','c'], type: 'way' };
    const r = { id: 'r', members: [{id: 'w1'}, {id: 'd'}] };
    const graph = { hasEntity: (id: string) => ({
      'a': a,
      'b': b,
      'c': c,
      'd': d,
      'e': e,
      'w1': w1,
      'w2': w2,
      'r': r,
    }[id]) };
    const result = util.utilGetAllNodes(['r', 'w2', 'e'], graph);
    expect(result).toContain(a);
    expect(result).toContain(b);
    expect(result).toContain(c);
    expect(result).toContain(d);
    expect(result).toContain(e);
    expect(result).toHaveLength(5);
  });

  it('handles recursive relations', () => {
    const n = { id: 'n', type: 'node' };
    const r1 = { id: 'r1', members: [{id: 'r2'}], type: 'relation' };
    const r2 = { id: 'r2', members: [{id: 'r1'}, {id: 'n'}], type: 'relation' };
    const graph = { hasEntity: (id: string) => ({
      'n': n,
      'r1': r1,
      'r2': r2,
    }[id]) };
    const result = util.utilGetAllNodes(['r1'], graph);

    expect(result).toContain(n);
    expect(result).toHaveLength(1);
  });
});

describe('utilTagDiff', () => {
  const oldTags = { a: 'one', b: 'two', c: 'three' };
  const newTags = { a: 'one', b: 'three', d: 'four' };
  const diff = util.utilTagDiff(oldTags, newTags);
  expect(diff).toHaveLength(4);
  expect(diff[0]).toStrictEqual({
    type: '-',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '- b=two' // delete-modify
  });
  expect(diff[1]).toStrictEqual({
    type: '+',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '+ b=three' // insert-modify
  });
  expect(diff[2]).toStrictEqual({
    type: '-',
    key: 'c',
    oldVal: 'three',
    newVal: undefined,
    display: '- c=three' // delete
  });
  expect(diff[3]).toStrictEqual({
    type: '+',
    key: 'd',
    oldVal: undefined,
    newVal: 'four',
    display: '+ d=four' // insert
  });
});

describe('utilTagText', () => {
  expect(util.utilTagText({})).toEqual('');
  expect(util.utilTagText({ tags: { foo: 'bar' } })).toEqual('foo=bar');
  expect(util.utilTagText({ tags: { foo: 'bar', two: 'three' } })).toEqual('foo=bar, two=three');
});
