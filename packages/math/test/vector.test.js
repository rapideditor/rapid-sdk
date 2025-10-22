import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as math from '../src/math.ts';


assert.closeTo = function(a, b, epsilon = 1e-9) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/vector', () => {
  describe('vecEqual', () => {
    it('tests vectors for exact equality', () => {
      assert.equal(math.vecEqual([1, 2], [1, 2]), true);
      assert.equal(math.vecEqual([1, 2], [1, 0]), false);
      assert.equal(math.vecEqual([1, 2], [2, 1]), false);
    });
    it('tests vectors for equality within epsilon', () => {
      assert.equal(math.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5), true);
      assert.equal(math.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-8), false);
    });
  });

  describe('vecAdd', () => {
    it('adds vectors', () => {
      assert.deepEqual(math.vecAdd([1, 2], [3, 4]), [4, 6]);
      assert.deepEqual(math.vecAdd([1, 2], [0, 0]), [1, 2]);
      assert.deepEqual(math.vecAdd([1, 2], [-3, -4]), [-2, -2]);
    });
  });

  describe('vecSubtract', () => {
    it('subtracts vectors', () => {
      assert.deepEqual(math.vecSubtract([1, 2], [3, 4]), [-2, -2]);
      assert.deepEqual(math.vecSubtract([1, 2], [0, 0]), [1, 2]);
      assert.deepEqual(math.vecSubtract([1, 2], [-3, -4]), [4, 6]);
    });
  });

  describe('vecScale', () => {
    it('multiplies vectors', () => {
      assert.deepEqual(math.vecScale([1, 2], 0), [0, 0]);
      assert.deepEqual(math.vecScale([1, 2], 1), [1, 2]);
      assert.deepEqual(math.vecScale([1, 2], 2), [2, 4]);
      assert.deepEqual(math.vecScale([1, 2], 0.5), [0.5, 1]);
    });
  });

  describe('vecRotate', () => {
    it('rotates vectors', () => {
      const result = math.vecRotate([1, 1], Math.PI / 2, [0, 0]);
      assert.closeTo(result[0], -1);
      assert.closeTo(result[1], 1);
    });
  });

  describe('vecRound', () => {
    it('rounds vectors', () => {
      assert.deepEqual(math.vecRound([0.1, 1.5]), [0, 2]);
      assert.deepEqual(math.vecRound([-0.1, -1.5]), [-0, -1]);
    });
  });

  describe('vecFloor', () => {
    it('rounds vectors down', () => {
      assert.deepEqual(math.vecFloor([0.1, 1.5]), [0, 1]);
      assert.deepEqual(math.vecFloor([-0.1, -1.5]), [-1, -2]);
    });
  });

  describe('vecCeil', () => {
    it('rounds vectors up', () => {
      assert.deepEqual(math.vecCeil([0.1, 1.5]), [1, 2]);
      assert.deepEqual(math.vecCeil([-0.1, -1.5]), [-0, -1]);
    });
  });

  describe('vecTrunc', () => {
    it('truncates vectors', () => {
      assert.deepEqual(math.vecTrunc([0.1, 1.5]), [0, 1]);
      assert.deepEqual(math.vecTrunc([-0.1, -1.5]), [-0, -1]);
    });
  });

  describe('vecInterp', () => {
    it('interpolates halfway', () => {
      const a = [0, 0];
      const b = [10, 10];
      assert.deepEqual(math.vecInterp(a, b, 0.5), [5, 5]);
    });
    it('interpolates to one side', () => {
      const a = [0, 0];
      const b = [10, 10];
      assert.deepEqual(math.vecInterp(a, b, 0), [0, 0]);
    });
  });

  describe('vecLength', () => {
    it('distance between two same points is zero', () => {
      const a = [0, 0];
      const b = [0, 0];
      assert.equal(math.vecLength(a, b), 0);
    });
    it('a straight 10 unit line is 10', () => {
      const a = [0, 0];
      const b = [10, 0];
      assert.equal(math.vecLength(a, b), 10);
    });
    it('a pythagorean triangle is right', () => {
      const a = [0, 0];
      const b = [4, 3];
      assert.equal(math.vecLength(a, b), 5);
    });
    it('defaults second argument to [0, 0]', () => {
      assert.equal(math.vecLength([4, 3]), 5);
    });
  });

  describe('vecLengthSquare', () => {
    it('distance between two same points is zero', () => {
      const a = [0, 0];
      const b = [0, 0];
      assert.equal(math.vecLengthSquare(a, b), 0);
    });
    it('a straight 10 unit line is 10', () => {
      const a = [0, 0];
      const b = [10, 0];
      assert.equal(math.vecLengthSquare(a, b), 100);
    });
    it('a pythagorean triangle is right', () => {
      const a = [0, 0];
      const b = [4, 3];
      assert.equal(math.vecLengthSquare(a, b), 25);
    });
    it('defaults second argument to [0,0]', () => {
      assert.equal(math.vecLengthSquare([4, 3]), 25);
    });
  });

  describe('vecNormalize', () => {
    it('gets unit vectors', () => {
      assert.deepEqual(math.vecNormalize([0, 0]), [0, 0]);
      assert.deepEqual(math.vecNormalize([1, 0]), [1, 0]);
      assert.deepEqual(math.vecNormalize([5, 0]), [1, 0]);
      assert.deepEqual(math.vecNormalize([-5, 0]), [-1, 0]);
      assert.closeTo(math.vecNormalize([1, 1])[0], Math.sqrt(2) / 2);
      assert.closeTo(math.vecNormalize([1, 1])[1], Math.sqrt(2) / 2);
    });
  });

  describe('vecAngle', () => {
    it('returns angle between a and b', () => {
      assert.closeTo(math.vecAngle([0, 0], [1, 0]), 0);
      assert.closeTo(math.vecAngle([0, 0], [0, 1]), Math.PI / 2);
      assert.closeTo(math.vecAngle([0, 0], [-1, 0]), Math.PI);
      assert.closeTo(math.vecAngle([0, 0], [0, -1]), -Math.PI / 2);
    });
  });

  describe('vecDot', () => {
    it('dot product of right angle is zero', () => {
      const a = [1, 0];
      const b = [0, 1];
      assert.equal(math.vecDot(a, b), 0);
    });
    it('dot product of same vector multiplies', () => {
      const a = [2, 0];
      const b = [2, 0];
      assert.equal(math.vecDot(a, b), 4);
    });
  });

  describe('vecNormalizedDot', () => {
    it('normalized dot product of right angle is zero', () => {
      const a = [2, 0];
      const b = [0, 2];
      assert.equal(math.vecNormalizedDot(a, b), 0);
    });
    it('normalized dot product of same vector multiplies unit vectors', () => {
      const a = [2, 0];
      const b = [2, 0];
      assert.equal(math.vecNormalizedDot(a, b), 1);
    });
    it('normalized dot product of 45 degrees', () => {
      const a = [0, 2];
      const b = [2, 2];
      assert.closeTo(math.vecNormalizedDot(a, b), Math.sqrt(2) / 2);
    });
  });

  describe('vecCross', () => {
    it('2D cross product of right hand turn is positive', () => {
      const a = [2, 0];
      const b = [0, 2];
      assert.equal(math.vecCross(a, b), 4);
    });
    it('2D cross product of left hand turn is negative', () => {
      const a = [2, 0];
      const b = [0, -2];
      assert.equal(math.vecCross(a, b), -4);
    });
    it('2D cross product of colinear points is zero', () => {
      const a = [-2, 0];
      const b = [2, 0];
      assert.equal(math.vecCross(a, b), -0);
    });
  });

  describe('vecProject', () => {
    it('returns null for a degenerate path (no nodes)', () => {
      assert.equal(math.vecProject([0, 1], []), null);
    });

    it('returns null for a degenerate path (single node)', () => {
      assert.equal(math.vecProject([0, 1], [0, 0]), null);
    });

    it('calculates the orthogonal projection of a point onto a path', () => {
      //     c
      //     |
      // a --*--- b
      //
      // * = [2, 0]
      const a = [0, 0];
      const b = [5, 0];
      const c = [2, 1];
      const edge = math.vecProject(c, [a, b]);
      assert.ok(edge instanceof Object);
      assert.equal(edge.index, 1);
      assert.equal(edge.distance, 1);
      assert.deepEqual(edge.target, [2, 0]);
    });

    it('returns the starting vertex when the orthogonal projection is < 0', () => {
      const a = [0, 0];
      const b = [5, 0];
      const c = [-3, 4];
      const edge = math.vecProject(c, [a, b]);
      assert.ok(edge instanceof Object);
      assert.equal(edge.index, 1);
      assert.equal(edge.distance, 5);
      assert.deepEqual(edge.target, [0, 0]);
    });

    it('returns the ending vertex when the orthogonal projection is > 1', () => {
      const a = [0, 0];
      const b = [5, 0];
      const c = [8, 4];
      const edge = math.vecProject(c, [a, b]);
      assert.ok(edge instanceof Object);
      assert.equal(edge.index, 1);
      assert.equal(edge.distance, 5);
      assert.deepEqual(edge.target, [5, 0]);
    });
  });
});
