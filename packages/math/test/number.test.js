import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
}

describe('math/number', () => {
  describe('numClamp', () => {
    it('clamps integers within a min..max range', () => {
      assert.equal(test.numClamp(-1, 0, 10), 0);
      assert.equal(test.numClamp(5, 0, 10), 5);
      assert.equal(test.numClamp(11, 0, 10), 10);
    });
    it('clamps floats within a min..max range', () => {
      assert.equal(test.numClamp(-Math.PI, 0, 2 * Math.PI), 0);
      assert.equal(test.numClamp(Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.equal(test.numClamp(3 * Math.PI, 0, 2 * Math.PI), 2 * Math.PI);
    });
  });

  describe('numWrap', () => {
    it('wraps integers around a min..max range', () => {
      assert.equal(test.numWrap(-1, 0, 10), 9);
      assert.equal(test.numWrap(5, 0, 10), 5);
      assert.equal(test.numWrap(11, 0, 10), 1);
    });
    it('wraps floats around a min..max range', () => {
      assert.closeTo(test.numWrap(-Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.closeTo(test.numWrap(Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.closeTo(test.numWrap(3 * Math.PI, 0, 2 * Math.PI), Math.PI);
    });
  });
});
