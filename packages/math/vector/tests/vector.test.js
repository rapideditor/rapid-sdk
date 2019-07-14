const test = require('..');
const CLOSE = 6; // digits

describe('vector', () => {
  describe('vecEqual', () => {
    it('tests vectors for exact equality', () => {
      expect(test.vecEqual([1, 2], [1, 2])).toBeTruthy();
      expect(test.vecEqual([1, 2], [1, 0])).toBeFalsy();
      expect(test.vecEqual([1, 2], [2, 1])).toBeFalsy();
    });
    it('tests vectors for equality within epsilon', () => {
      expect(test.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5)).toBeTruthy();
      expect(test.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-8)).toBeFalsy();
    });
  });

  describe('vecAdd', () => {
    it('adds vectors', () => {
      expect(test.vecAdd([1, 2], [3, 4])).toEqual([4, 6]);
      expect(test.vecAdd([1, 2], [0, 0])).toEqual([1, 2]);
      expect(test.vecAdd([1, 2], [-3, -4])).toEqual([-2, -2]);
    });
  });

  describe('vecSubtract', () => {
    it('subtracts vectors', () => {
      expect(test.vecSubtract([1, 2], [3, 4])).toEqual([-2, -2]);
      expect(test.vecSubtract([1, 2], [0, 0])).toEqual([1, 2]);
      expect(test.vecSubtract([1, 2], [-3, -4])).toEqual([4, 6]);
    });
  });

  describe('vecScale', () => {
    it('multiplies vectors', () => {
      expect(test.vecScale([1, 2], 0)).toEqual([0, 0]);
      expect(test.vecScale([1, 2], 1)).toEqual([1, 2]);
      expect(test.vecScale([1, 2], 2)).toEqual([2, 4]);
      expect(test.vecScale([1, 2], 0.5)).toEqual([0.5, 1]);
    });
  });

  describe('vecFloor', () => {
    it('rounds vectors', () => {
      expect(test.vecFloor([0.1, 1])).toEqual([0, 1]);
      expect(test.vecFloor([0, 1])).toEqual([0, 1]);
      expect(test.vecFloor([0, 1.1])).toEqual([0, 1]);
    });
  });

  describe('vecInterp', () => {
    it('interpolates halfway', () => {
      const a = [0, 0];
      const b = [10, 10];
      expect(test.vecInterp(a, b, 0.5)).toEqual([5, 5]);
    });
    it('interpolates to one side', () => {
      const a = [0, 0];
      const b = [10, 10];
      expect(test.vecInterp(a, b, 0)).toEqual([0, 0]);
    });
  });

  describe('vecLength', () => {
    it('distance between two same points is zero', () => {
      const a = [0, 0];
      const b = [0, 0];
      expect(test.vecLength(a, b)).toEqual(0);
    });
    it('a straight 10 unit line is 10', () => {
      const a = [0, 0];
      const b = [10, 0];
      expect(test.vecLength(a, b)).toEqual(10);
    });
    it('a pythagorean triangle is right', () => {
      const a = [0, 0];
      const b = [4, 3];
      expect(test.vecLength(a, b)).toEqual(5);
    });
  });

  describe('vecNormalize', () => {
    it('gets unit vectors', () => {
      expect(test.vecNormalize([0, 0])).toEqual([0, 0]);
      expect(test.vecNormalize([1, 0])).toEqual([1, 0]);
      expect(test.vecNormalize([5, 0])).toEqual([1, 0]);
      expect(test.vecNormalize([-5, 0])).toEqual([-1, 0]);
      expect(test.vecNormalize([1, 1])[0]).toBeCloseTo(Math.sqrt(2) / 2, CLOSE);
      expect(test.vecNormalize([1, 1])[1]).toBeCloseTo(Math.sqrt(2) / 2, CLOSE);
    });
  });

  describe('vecAngle', () => {
    it('returns angle between a and b', () => {
      expect(test.vecAngle([0, 0], [1, 0])).toBeCloseTo(0, CLOSE);
      expect(test.vecAngle([0, 0], [0, 1])).toBeCloseTo(Math.PI / 2, CLOSE);
      expect(test.vecAngle([0, 0], [-1, 0])).toBeCloseTo(Math.PI, CLOSE);
      expect(test.vecAngle([0, 0], [0, -1])).toBeCloseTo(-Math.PI / 2, CLOSE);
    });
  });

  describe('vecDot', () => {
    it('dot product of right angle is zero', () => {
      const a = [1, 0];
      const b = [0, 1];
      expect(test.vecDot(a, b)).toEqual(0);
    });
    it('dot product of same vector multiplies', () => {
      const a = [2, 0];
      const b = [2, 0];
      expect(test.vecDot(a, b)).toEqual(4);
    });
  });

  describe('vecNormalizedDot', () => {
    it('normalized dot product of right angle is zero', () => {
      const a = [2, 0];
      const b = [0, 2];
      expect(test.vecNormalizedDot(a, b)).toEqual(0);
    });
    it('normalized dot product of same vector multiplies unit vectors', () => {
      const a = [2, 0];
      const b = [2, 0];
      expect(test.vecNormalizedDot(a, b)).toEqual(1);
    });
    it('normalized dot product of 45 degrees', () => {
      const a = [0, 2];
      const b = [2, 2];
      expect(test.vecNormalizedDot(a, b)).toBeCloseTo(Math.sqrt(2) / 2, CLOSE);
    });
  });

  describe('vecCross', () => {
    it('2D cross product of right hand turn is positive', () => {
      const a = [2, 0];
      const b = [0, 2];
      expect(test.vecCross(a, b)).toEqual(4);
    });
    it('2D cross product of left hand turn is negative', () => {
      const a = [2, 0];
      const b = [0, -2];
      expect(test.vecCross(a, b)).toEqual(-4);
    });
    it('2D cross product of colinear points is zero', () => {
      const a = [-2, 0];
      const b = [2, 0];
      expect(test.vecCross(a, b)).toBe(-0);
    });
  });

  describe('vecProject', () => {
    it('returns null for a degenerate path (no nodes)', () => {
      expect(test.vecProject([0, 1], [])).toBeNull();
    });

    it('returns null for a degenerate path (single node)', () => {
      expect(test.vecProject([0, 1], [0, 0])).toBeNull();
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
      const edge = test.vecProject(c, [a, b]);
      expect(edge.index).toEqual(1);
      expect(edge.distance).toEqual(1);
      expect(edge.target).toEqual([2, 0]);
    });

    it('returns the starting vertex when the orthogonal projection is < 0', () => {
      const a = [0, 0];
      const b = [5, 0];
      const c = [-3, 4];
      const edge = test.vecProject(c, [a, b]);
      expect(edge.index).toEqual(1);
      expect(edge.distance).toEqual(5);
      expect(edge.target).toEqual([0, 0]);
    });

    it('returns the ending vertex when the orthogonal projection is > 1', () => {
      const a = [0, 0];
      const b = [5, 0];
      const c = [8, 4];
      const edge = test.vecProject(c, [a, b]);
      expect(edge.index).toEqual(1);
      expect(edge.distance).toEqual(5);
      expect(edge.target).toEqual([5, 0]);
    });
  });
});
