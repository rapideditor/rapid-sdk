import { describe, expect, it } from 'bun:test';
import * as util from '../src/index.ts';


describe('utilObjectOmit', () => {
  it('omits keys', () => {
    const t = { a: 1, b: 2 };
    expect(util.utilObjectOmit(t, [])).toEqual({ a: 1, b: 2 });
    expect(util.utilObjectOmit(t, ['a'])).toEqual({ b: 2 });
    expect(util.utilObjectOmit(t, ['a', 'b'])).toEqual({});
  });
});
