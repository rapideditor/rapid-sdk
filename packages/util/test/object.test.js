import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as util from '../src/index.ts';


describe('utilObjectOmit', () => {
  it('omits keys', () => {
    const t = { a: 1, b: 2 };
    assert.deepEqual(util.utilObjectOmit(t, []), { a: 1, b: 2 });
    assert.deepEqual(util.utilObjectOmit(t, ['a']), { b: 2 });
    assert.deepEqual(util.utilObjectOmit(t, ['a', 'b']), {});
  });
});
