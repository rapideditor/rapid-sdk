import { describe, expect, it } from 'bun:test';
import { utilIterable } from '../src/iterable.ts';


describe('utilIterable', () => {
  it('accepts Arrays', () => {
    const v = [1, 2, 3];
    const result = utilIterable(v);
    expect(result).toStrictEqual(v);
  });

  it('accepts Sets', () => {
    const v = new Set([1, 2, 3]);
    const result = utilIterable(v);
    expect(result).toStrictEqual(v);
  });

  it('accepts string value', () => {
    const v = 'hello';
    const result = utilIterable(v);
    expect(result).toEqual(['hello']);
  });

  it('accepts numeric value', () => {
    const v = 1;
    const result = utilIterable(v);
    expect(result).toEqual([1]);
  });

  it('handles null', () => {
    const v = null;
    const result = utilIterable(v);
    expect(result).toEqual([]);
  });

  it('handles undefined', () => {
    const result = utilIterable(undefined);
    expect(result).toEqual([]);
  });

});

