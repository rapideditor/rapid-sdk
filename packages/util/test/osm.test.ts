import { describe, expect, it } from 'bun:test';
import * as util from '../src/index.ts';


describe('utilCleanTags', () => {
  it('handles empty tags object', () => {
    const t = {};
    const result = util.utilCleanTags(t);
    expect(result).toEqual({});
  });

  it('discards empty keys', () => {
    const t = { '': 'bar' };
    const result = util.utilCleanTags(t);
    expect(result).toEqual({});
  });

  it('discards undefined values', () => {
    const t = { foo: undefined };
    const result = util.utilCleanTags(t);
    expect(result).toEqual({});
  });

  it('trims whitespace', () => {
    const t = {
      leading: '   value',
      trailing: 'value  ',
      both: '   value  '
    };
    const result = util.utilCleanTags(t);
    expect(result).toEqual({
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
    expect(result).toEqual({
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
    expect(result).toEqual({
      leading: 'value1;value2',
      trailing: 'value1;value2',
      both: 'value1;value2'
    });
  });

  it('does not clean description, note, fixme, inscription', () => {
    const t = {
      description: '   value',
      note: 'value  ',
      fixme: '   value  ',
      inscription: ' value1 ; value2 '
    };
    const result = util.utilCleanTags(t);
    expect(result).toEqual(t);
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
    expect(result).toEqual({
      opening_hours: 'Mo-Su 08:00-18:00; Apr 10-15 off; Jun 08:00-14:00; Aug off; Dec 25 off',
      collection_times: 'Mo 10:00-12:00,12:30-15:00; Tu-Fr 08:00-12:00,12:30-15:00; Sa 08:00-12:00',
      'maxspeed:conditional': '120 @ (06:00-20:00); 80 @ wet',
      'restriction:conditional': 'no_u_turn @ (Mo-Fr 09:00-10:00,15:00-16:00; SH off)'
    });
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
    hasEntity: (id: string) =>
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

  it('gracefully handles missing entities', () => {
    expect(util.utilGetAllNodes(['w-3'], graph)).toEqual([n3]);
    expect(util.utilGetAllNodes(['r-4'], graph)).toEqual([n1, n2, n3]);
  });

  it('gets all descendant nodes of multiple ids', () => {
    const a = { id: 'a', type: 'node' };
    const b = { id: 'b', type: 'node' };
    const c = { id: 'c', type: 'node' };
    const d = { id: 'd', type: 'node' };
    const e = { id: 'e', type: 'node' };
    const w11 = { id: 'w11', nodes: ['a', 'b', 'a'], type: 'way' };
    const w12 = { id: 'w12', nodes: ['c', 'b', 'a', 'c'], type: 'way' };
    const r = { id: 'r', members: [{ id: 'w11' }, { id: 'd' }] };
    const graph2 = {
      hasEntity: (id: string) =>
        ({
          a: a,
          b: b,
          c: c,
          d: d,
          e: e,
          w11: w11,
          w12: w12,
          r: r
        }[id])
    };
    const result = util.utilGetAllNodes(['r', 'w12', 'e'], graph2);
    expect(result).toContain(a);
    expect(result).toContain(b);
    expect(result).toContain(c);
    expect(result).toContain(d);
    expect(result).toContain(e);
    expect(result.length).toBe(5);
  });

  it('handles recursive relations', () => {
    const n = { id: 'n', type: 'node' };
    const r11 = { id: 'r11', members: [{ id: 'r12' }], type: 'relation' };
    const r12 = { id: 'r12', members: [{ id: 'r11' }, { id: 'n' }], type: 'relation' };
    const graph2 = {
      hasEntity: (id) =>
        ({
          n: n,
          r11: r11,
          r12: r12
        }[id])
    };
    const result = util.utilGetAllNodes(['r11'], graph2);
    expect(result).toContain(n);
    expect(result.length).toBe(1);
  });

  it('handles degenerate ways', () => {
    expect(util.utilGetAllNodes(['w-4'], graph)).toEqual([]);
    expect(util.utilGetAllNodes(['r-5'], graph)).toEqual([]);
  });

  it('handles degenerate relations', () => {});
});


describe('utilTagDiff', () => {
  const oldTags = { a: 'one', b: 'two', c: 'three' };
  const newTags = { a: 'one', b: 'three', d: 'four' };
  const diff = util.utilTagDiff(oldTags, newTags);

  expect(diff).toBeInstanceOf(Array);
  expect(diff.length).toBe(4);

  expect(diff[0]).toEqual({
    type: '-',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '- b=two' // delete-modify
  });
  expect(diff[1]).toEqual({
    type: '+',
    key: 'b',
    oldVal: 'two',
    newVal: 'three',
    display: '+ b=three' // insert-modify
  });
  expect(diff[2]).toEqual({
    type: '-',
    key: 'c',
    oldVal: 'three',
    newVal: undefined,
    display: '- c=three' // delete
  });
  expect(diff[3]).toEqual({
    type: '+',
    key: 'd',
    oldVal: undefined,
    newVal: 'four',
    display: '+ d=four' // insert
  });
});

describe('utilTagText', () => {
  expect(util.utilTagText({})).toBe('');
  expect(util.utilTagText({ tags: { foo: 'bar' } })).toBe('foo=bar');
  expect(util.utilTagText({ tags: { foo: 'bar', two: 'three' } })).toBe('foo=bar, two=three');
});
