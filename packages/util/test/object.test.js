import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/util.mjs';


describe('utilObjectOmit', () => {
  it('omits keys', () => {
    const t = { a: 1, b: 2 };
    assert.deepEqual(test.utilObjectOmit(t, []), { a: 1, b: 2 });
    assert.deepEqual(test.utilObjectOmit(t, ['a']), { b: 2 });
    assert.deepEqual(test.utilObjectOmit(t, ['a', 'b']), {});
  });
});
