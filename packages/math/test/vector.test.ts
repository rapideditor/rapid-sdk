import { describe, expect, it } from 'bun:test';
import * as math from '../src/index.ts';
import type { Vec2 } from '../src/index.ts';


describe('math/vector', () => {
  describe('vecEqual', () => {
    it('tests vectors for exact equality', () => {
      expect(math.vecEqual([1, 2], [1, 2])).toBe(true);
      expect(math.vecEqual([1, 2], [1, 0])).toBe(false);
      expect(math.vecEqual([1, 2], [2, 1])).toBe(false);
    });
    it('tests vectors for equality within epsilon', () => {
      expect(math.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-5)).toBe(true);
      expect(math.vecEqual([1, 2], [1.0000001, 2.0000001], 1e-8)).toBe(false);
    });
  });

  describe('vecAdd', () => {
    it('adds vectors', () => {
      expect(math.vecAdd([1, 2], [3, 4])).toEqual([4, 6]);
      expect(math.vecAdd([1, 2], [0, 0])).toEqual([1, 2]);
      expect(math.vecAdd([1, 2], [-3, -4])).toEqual([-2, -2]);
    });
  });

  describe('vecSubtract', () => {
    it('subtracts vectors', () => {
      expect(math.vecSubtract([1, 2], [3, 4])).toEqual([-2, -2]);
      expect(math.vecSubtract([1, 2], [0, 0])).toEqual([1, 2]);
      expect(math.vecSubtract([1, 2], [-3, -4])).toEqual([4, 6]);
    });
  });

  describe('vecScale', () => {
    it('multiplies vectors', () => {
      expect(math.vecScale([1, 2], 0)).toEqual([0, 0]);
      expect(math.vecScale([1, 2], 1)).toEqual([1, 2]);
      expect(math.vecScale([1, 2], 2)).toEqual([2, 4]);
      expect(math.vecScale([1, 2], 0.5)).toEqual([0.5, 1]);
    });
  });

  describe('vecRotate', () => {
    it('rotates vectors', () => {
      const result = math.vecRotate([1, 1], Math.PI / 2, [0, 0]);
      expect(result[0]).toBeCloseTo(-1, 9);
      expect(result[1]).toBeCloseTo(1, 9);
    });
  });

  describe('vecRound', () => {
    it('rounds vectors', () => {
      expect(math.vecRound([0.1, 1.5])).toEqual([0, 2]);
      expect(math.vecRound([-0.1, -1.5])).toEqual([-0, -1]);
    });
  });

  describe('vecFloor', () => {
    it('rounds vectors down', () => {
      expect(math.vecFloor([0.1, 1.5])).toEqual([0, 1]);
      expect(math.vecFloor([-0.1, -1.5])).toEqual([-1, -2]);
    });
  });

  describe('vecCeil', () => {
    it('rounds vectors up', () => {
      expect(math.vecCeil([0.1, 1.5])).toEqual([1, 2]);
      expect(math.vecCeil([-0.1, -1.5])).toEqual([-0, -1]);
    });
  });

  describe('vecTrunc', () => {
    it('truncates vectors', () => {
      expect(math.vecTrunc([0.1, 1.5])).toEqual([0, 1]);
      expect(math.vecTrunc([-0.1, -1.5])).toEqual([-0, -1]);
    });
  });

  describe('vecInterp', () => {
    it('interpolates halfway', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [10, 10];
      expect(math.vecInterp(a, b, 0.5)).toEqual([5, 5]);
    });
    it('interpolates to one side', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [10, 10];
      expect(math.vecInterp(a, b, 0)).toEqual([0, 0]);
    });
  });

  describe('vecLength', () => {
    it('distance between two same points is zero', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [0, 0];
      expect(math.vecLength(a, b)).toBe(0);
    });
    it('a straight 10 unit line is 10', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [10, 0];
      expect(math.vecLength(a, b)).toBe(10);
    });
    it('a pythagorean triangle is right', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [4, 3];
      expect(math.vecLength(a, b)).toBe(5);
    });
    it('defaults second argument to [0, 0]', () => {
      expect(math.vecLength([4, 3])).toBe(5);
    });
  });

  describe('vecLengthSquare', () => {
    it('distance between two same points is zero', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [0, 0];
      expect(math.vecLengthSquare(a, b)).toBe(0);
    });
    it('a straight 10 unit line is 10', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [10, 0];
      expect(math.vecLengthSquare(a, b)).toBe(100);
    });
    it('a pythagorean triangle is right', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [4, 3];
      expect(math.vecLengthSquare(a, b)).toBe(25);
    });
    it('defaults second argument to [0,0]', () => {
      expect(math.vecLengthSquare([4, 3])).toBe(25);
    });
    it('supports scalar overload for hot paths', () => {
      expect(math.vecLengthSquare(0, 0, 4, 3)).toBe(25);
      expect(math.vecLengthSquare(4, 3)).toBe(25);
    });
  });

  describe('vecNormalize', () => {
    it('gets unit vectors', () => {
      expect(math.vecNormalize([0, 0])).toEqual([0, 0]);
      expect(math.vecNormalize([1, 0])).toEqual([1, 0]);
      expect(math.vecNormalize([5, 0])).toEqual([1, 0]);
      expect(math.vecNormalize([-5, 0])).toEqual([-1, 0]);
      expect(math.vecNormalize([1, 1])[0]).toBeCloseTo(Math.sqrt(2) / 2, 9);
      expect(math.vecNormalize([1, 1])[1]).toBeCloseTo(Math.sqrt(2) / 2, 9);
    });
  });

  describe('vecAngle', () => {
    it('returns angle between a and b', () => {
      expect(math.vecAngle([0, 0], [1, 0])).toBeCloseTo(0, 9);
      expect(math.vecAngle([0, 0], [0, 1])).toBeCloseTo(Math.PI / 2, 9);
      expect(math.vecAngle([0, 0], [-1, 0])).toBeCloseTo(Math.PI, 9);
      expect(math.vecAngle([0, 0], [0, -1])).toBeCloseTo(-Math.PI / 2, 9);
    });
  });

  describe('vecDot', () => {
    it('dot product of right angle is zero', () => {
      const a: Vec2 = [1, 0];
      const b: Vec2 = [0, 1];
      expect(math.vecDot(a, b)).toBe(0);
    });
    it('dot product of same vector multiplies', () => {
      const a: Vec2 = [2, 0];
      const b: Vec2 = [2, 0];
      expect(math.vecDot(a, b)).toBe(4);
    });
    it('supports scalar overload for hot paths', () => {
      expect(math.vecDot(2, 0, 2, 0)).toBe(4);
      expect(math.vecDot(1, 0, 0, 1)).toBe(0);
    });
  });

  describe('vecNormalizedDot', () => {
    it('normalized dot product of right angle is zero', () => {
      const a: Vec2 = [2, 0];
      const b: Vec2 = [0, 2];
      expect(math.vecNormalizedDot(a, b)).toBe(0);
    });
    it('normalized dot product of same vector multiplies unit vectors', () => {
      const a: Vec2 = [2, 0];
      const b: Vec2 = [2, 0];
      expect(math.vecNormalizedDot(a, b)).toBe(1);
    });
    it('normalized dot product of 45 degrees', () => {
      const a: Vec2 = [0, 2];
      const b: Vec2 = [2, 2];
      expect(math.vecNormalizedDot(a, b)).toBeCloseTo(Math.sqrt(2) / 2, 9);
    });
  });

  describe('vecCross', () => {
    it('2D cross product of right hand turn is positive', () => {
      const a: Vec2 = [2, 0];
      const b: Vec2 = [0, 2];
      expect(math.vecCross(a, b)).toBe(4);
    });
    it('2D cross product of left hand turn is negative', () => {
      const a: Vec2 = [2, 0];
      const b: Vec2 = [0, -2];
      expect(math.vecCross(a, b)).toBe(-4);
    });
    it('2D cross product of colinear points is zero', () => {
      const a: Vec2 = [-2, 0];
      const b: Vec2 = [2, 0];
      expect(math.vecCross(a, b)).toBe(-0);
    });
    it('supports scalar overload for hot paths', () => {
      expect(math.vecCross(2, 0, 0, 2)).toBe(4);
      expect(math.vecCross(2, 0, 0, -2)).toBe(-4);
    });
  });

  describe('vecProject', () => {
    it('returns null for a degenerate path (no nodes)', () => {
      expect(math.vecProject([0, 1], [])).toBe(null);
    });

    it('returns null for a degenerate path (single node)', () => {
      expect(math.vecProject([0, 1], [[0, 0]])).toBe(null);
    });

    it('calculates the orthogonal projection of a point onto a path', () => {
      //     c
      //     |
      // a --*--- b
      //
      // * = [2, 0]
      const a: Vec2 = [0, 0];
      const b: Vec2 = [5, 0];
      const c: Vec2 = [2, 1];
      const edge = math.vecProject(c, [a, b]);
      expect(edge).toBeInstanceOf(Object);
      if (!edge) throw new Error('expected projected edge');
      expect(edge.index).toBe(1);
      expect(edge.distance).toBe(1);
      expect(edge.point).toEqual([2, 0]);
    });

    it('returns the starting vertex when the orthogonal projection is < 0', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [5, 0];
      const c: Vec2 = [-3, 4];
      const edge = math.vecProject(c, [a, b]);
      expect(edge).toBeInstanceOf(Object);
      if (!edge) throw new Error('expected projected edge');
      expect(edge.index).toBe(1);
      expect(edge.distance).toBe(5);
      expect(edge.point).toEqual([0, 0]);
    });

    it('returns the ending vertex when the orthogonal projection is > 1', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [5, 0];
      const c: Vec2 = [8, 4];
      const edge = math.vecProject(c, [a, b]);
      expect(edge).toBeInstanceOf(Object);
      if (!edge) throw new Error('expected projected edge');
      expect(edge.index).toBe(1);
      expect(edge.distance).toBe(5);
      expect(edge.point).toEqual([5, 0]);
    });
  });
});
