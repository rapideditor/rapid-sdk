import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as math from '../src/math.ts';


assert.closeTo = function(a, b, epsilon = 1e-9) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/number', () => {
  describe('numClamp', () => {
    it('clamps integers within a min..max range', () => {
      assert.equal(math.numClamp(-1, 0, 10), 0);
      assert.equal(math.numClamp(5, 0, 10), 5);
      assert.equal(math.numClamp(11, 0, 10), 10);
    });
    it('clamps floats within a min..max range', () => {
      assert.equal(math.numClamp(-Math.PI, 0, 2 * Math.PI), 0);
      assert.equal(math.numClamp(Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.equal(math.numClamp(3 * Math.PI, 0, 2 * Math.PI), 2 * Math.PI);
    });
  });

  describe('numWrap', () => {
    it('wraps integers around a min..max range', () => {
      assert.equal(math.numWrap(-1, 0, 10), 9);
      assert.equal(math.numWrap(5, 0, 10), 5);
      assert.equal(math.numWrap(11, 0, 10), 1);
    });
    it('wraps floats around a min..max range', () => {
      assert.closeTo(math.numWrap(-Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.closeTo(math.numWrap(Math.PI, 0, 2 * Math.PI), Math.PI);
      assert.closeTo(math.numWrap(3 * Math.PI, 0, 2 * Math.PI), Math.PI);
    });
  });
});
