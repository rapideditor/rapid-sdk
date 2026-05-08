import { describe, expect, expectTypeOf, it } from 'bun:test';
import * as math from '../src/index.ts';
import type { Quad, Vec2 } from '../src/index.ts';


function rectangleSideLengths(rectangle) {
  const poly = rectangle.polygon;
  const sideA = Math.hypot(poly[1][0] - poly[0][0], poly[1][1] - poly[0][1]);
  const sideB = Math.hypot(poly[2][0] - poly[1][0], poly[2][1] - poly[1][1]);
  return sideA > sideB ? [sideA, sideB] : [sideB, sideA];
}

function rectangleArea(rectangle) {
  const [longSide, shortSide] = rectangleSideLengths(rectangle);
  return longSide * shortSide;
}

function assertRectangleContainsPoints(rectangle, points) {
  const origin = rectangle.polygon[0];
  const edgeA = [rectangle.polygon[1][0] - origin[0], rectangle.polygon[1][1] - origin[1]];
  const edgeB = [rectangle.polygon[3][0] - origin[0], rectangle.polygon[3][1] - origin[1]];
  const edgeALengthSquare = edgeA[0] * edgeA[0] + edgeA[1] * edgeA[1];
  const edgeBLengthSquare = edgeB[0] * edgeB[0] + edgeB[1] * edgeB[1];

  for (const point of points) {
    const pointVector = [point[0] - origin[0], point[1] - origin[1]];
    const alongA = (pointVector[0] * edgeA[0] + pointVector[1] * edgeA[1]) / edgeALengthSquare;
    const alongB = (pointVector[0] * edgeB[0] + pointVector[1] * edgeB[1]) / edgeBLengthSquare;
    expect(alongA >= -1e-9 && alongA <= 1 + 1e-9).toBeTruthy();
    expect(alongB >= -1e-9 && alongB <= 1 + 1e-9).toBeTruthy();
  }
}

function offAxisLShapedBuildingPoints() {
  const footprint: Vec2[] = [[0, 0], [8, 0], [8, 2], [3, 2], [3, 6], [0, 6], [0, 0]];
  return math.geomRotatePoints(footprint, Math.PI / 6, [0, 0]);
}

describe('math/geom', () => {
  describe('geomEdgeEqual', () => {
    it('returns false for inequal edges', () => {
      expect(math.geomEdgeEqual([0, 1], [0, 2])).toBe(false);
    });

    it('returns true for equal edges along same direction', () => {
      expect(math.geomEdgeEqual([0, 1], [0, 1])).toBe(true);
    });

    it('returns true for equal edges along opposite direction', () => {
      expect(math.geomEdgeEqual([0, 1], [1, 0])).toBe(true);
    });
  });

  describe('geomRotatePoints', () => {
    it('rotates points around [0, 0]', () => {
      const points: Vec2[] = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around: Vec2 = [0, 0];
      const result = math.geomRotatePoints(points, angle, around);
      expect(result[0][0]).toBeCloseTo(-5, 9);
      expect(result[0][1]).toBeCloseTo(0, 9);
      expect(result[1][0]).toBeCloseTo(-5, 9);
      expect(result[1][1]).toBeCloseTo(-1, 9);
    });

    it('rotates points around [3, 0]', () => {
      const points: Vec2[] = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around: Vec2 = [3, 0];
      const result = math.geomRotatePoints(points, angle, around);
      expect(result[0][0]).toBeCloseTo(1, 9);
      expect(result[0][1]).toBeCloseTo(0, 9);
      expect(result[1][0]).toBeCloseTo(1, 9);
      expect(result[1][1]).toBeCloseTo(-1, 9);
    });

    it('returns a new array and does not mutate input', () => {
      const points: Vec2[] = [[5, 0], [5, 1]];
      const original = points.map(point => [point[0], point[1]] as Vec2);
      const result = math.geomRotatePoints(points, Math.PI, [0, 0]);

      expect(result).not.toBe(points);
      expect(points).toEqual(original);
    });
  });

  describe('geomReflectPoints', () => {
    it('reflects points across a horizontal axis', () => {
      const points: Vec2[] = [[0, 0], [2, 2], [3, 1]];
      const result = math.geomReflectPoints(points, [[0, 1], [2, 1]]);
      expect(result[0][0]).toBeCloseTo(0, 9);
      expect(result[0][1]).toBeCloseTo(2, 9);
      expect(result[1][0]).toBeCloseTo(2, 9);
      expect(result[1][1]).toBeCloseTo(0, 9);
      expect(result[2][0]).toBeCloseTo(3, 9);
      expect(result[2][1]).toBeCloseTo(1, 9);
    });

    it('preserves tuple shape for Quad inputs', () => {
      const quad: Quad = [[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]];
      const reflected: Quad = math.geomReflectPoints(quad, [[0, 1], [4, 1]]);
      expect(reflected).toHaveLength(5);
      expect(reflected[0][0]).toBeCloseTo(0, 9);
      expect(reflected[0][1]).toBeCloseTo(2, 9);
    });

    it('returns unchanged copy for degenerate axis', () => {
      const points: Vec2[] = [[0, 0], [2, 2], [3, 1]];
      const result = math.geomReflectPoints(points, [[1, 1], [1, 1]]);
      expect(result).toEqual(points);
      expect(result).not.toBe(points);
    });

    it('returns a new array and does not mutate input', () => {
      const points: Vec2[] = [[0, 0], [2, 2], [3, 1]];
      const original = points.map(point => [point[0], point[1]] as Vec2);
      const result = math.geomReflectPoints(points, [[0, 1], [2, 1]]);

      expect(result).not.toBe(points);
      expect(points).toEqual(original);
    });
  });

  describe('geomScalePoints', () => {
    it('scales points around [0, 0]', () => {
      const points: Vec2[] = [[1, 0], [2, 1]];
      const result = math.geomScalePoints(points, 2, [0, 0]);
      expect(result[0][0]).toBeCloseTo(2, 9);
      expect(result[0][1]).toBeCloseTo(0, 9);
      expect(result[1][0]).toBeCloseTo(4, 9);
      expect(result[1][1]).toBeCloseTo(2, 9);
    });

    it('scales points around an arbitrary anchor', () => {
      const points: Vec2[] = [[3, 1], [1, 3]];
      const result = math.geomScalePoints(points, 0.5, [1, 1]);
      expect(result[0][0]).toBeCloseTo(2, 9);
      expect(result[0][1]).toBeCloseTo(1, 9);
      expect(result[1][0]).toBeCloseTo(1, 9);
      expect(result[1][1]).toBeCloseTo(2, 9);
    });

    it('preserves tuple shape for Quad inputs', () => {
      const quad: Quad = [[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]];
      const scaled: Quad = math.geomScalePoints(quad, 0.5, [2, 1]);
      expect(scaled).toHaveLength(5);
      expect(scaled[0][0]).toBeCloseTo(1, 9);
      expect(scaled[0][1]).toBeCloseTo(0.5, 9);
    });

    it('returns a new array and does not mutate input', () => {
      const points: Vec2[] = [[1, 0], [2, 1]];
      const original = points.map(point => [point[0], point[1]] as Vec2);
      const result = math.geomScalePoints(points, 2, [0, 0]);

      expect(result).not.toBe(points);
      expect(points).toEqual(original);
    });
  });

  describe('type tests', () => {
    it('preserves Quad tuple shape in point transforms', () => {
      const quad: Quad = [[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]];

      expectTypeOf(math.geomRotatePoints(quad, Math.PI / 3, [0, 0])).toEqualTypeOf<Quad>();
      expectTypeOf(math.geomReflectPoints(quad, [[0, 1], [4, 1]])).toEqualTypeOf<Quad>();
      expectTypeOf(math.geomScalePoints(quad, 0.5, [2, 1])).toEqualTypeOf<Quad>();
    });
  });

  describe('geomLineIntersection', () => {
    it('returns null if either line is not a proper line segment', () => {
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[-5, 0], [5, 0]];
      expect(math.geomLineIntersection([], b)).toBe(null);
      expect(math.geomLineIntersection([[0, 0]] as Vec2[], b)).toBe(null);
      expect(math.geomLineIntersection(a, [])).toBe(null);
      expect(math.geomLineIntersection(a, [[0, 0]] as Vec2[])).toBe(null);
    });

    it('returns null if lines are colinear with overlap', () => {
      //
      //   b0 --- a0 === b1 --- a1
      //
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[-5, 0], [5, 0]];
      expect(math.geomLineIntersection(a, b)).toBe(null);
    });

    it('returns null if lines are colinear but disjoint', () => {
      //
      //   b0 --- b1     a0 --- a1
      //
      const a: Vec2[] = [[5, 0], [10, 0]];
      const b: Vec2[] = [[-10, 0], [-5, 0]];
      expect(math.geomLineIntersection(a, b)).toBe(null);
    });

    it('returns null if lines are parallel', () => {
      //   b0 ------- b1
      //
      //   a0 ------- a1
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[0, 5], [10, 5]];
      expect(math.geomLineIntersection(a, b)).toBe(null);
    });

    it('returns the intersection point between 2 lines', () => {
      //         b0
      //         |
      //   a0 ---*--- a1
      //         |
      //         b1
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[5, 10], [5, -10]];
      const result = math.geomLineIntersection(a, b);
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([5, 0]);
    });

    it('returns null if lines are not parallel but not intersecting', () => {
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[-5, 10], [-5, -10]];
      expect(math.geomLineIntersection(a, b)).toBe(null);
    });
  });

  describe('geomPathIntersections', () => {
    it('returns empty array if either path is not at least a proper line segment', () => {
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(math.geomPathIntersections([], b)).toEqual([]);
      expect(math.geomPathIntersections([[0, 0]] as Vec2[], b)).toEqual([]);
      expect(math.geomPathIntersections(a, [])).toEqual([]);
      expect(math.geomPathIntersections(a, [[0, 0]] as Vec2[])).toEqual([]);
    });

    it('returns the intersection points between 2 paths', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[5, 5], [5, -5], [10, -5], [5, 5]];
      const result = math.geomPathIntersections(a, b);
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([[5, 0], [7.5, 0]]);
    });
  });

  describe('geomPathHasIntersections', () => {
    it('returns false if either path is not at least a proper line segment', () => {
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(math.geomPathHasIntersections([], b)).toBe(false);
      expect(math.geomPathHasIntersections([[0, 0]] as Vec2[], b)).toBe(false);
      expect(math.geomPathHasIntersections(a, [])).toBe(false);
      expect(math.geomPathHasIntersections(a, [[0, 0]] as Vec2[])).toBe(false);
    });

    it('returns true if the paths intersect', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a: Vec2[] = [[0, 0], [10, 0]];
      const b: Vec2[] = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(math.geomPathHasIntersections(a, b)).toBe(true);
    });
  });

  describe('geomPointInPolygon', () => {
    it('says a point in a polygon is on a polygon', () => {
      //   p1 --- p2
      //   |   *   |
      //   p0 --- p3
      const poly: Vec2[] = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point: Vec2 = [0.5, 0.5];
      expect(math.geomPointInPolygon(point, poly)).toBe(true);
    });

    it('says a point outside of a polygon is outside', () => {
      //       *
      //   p1 --- p2
      //   |       |
      //   p0 --- p3
      const poly: Vec2[] = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point: Vec2 = [0.5, 1.5];
      expect(math.geomPointInPolygon(point, poly)).toBe(false);
    });
  });

  describe('geomPolygonContainsPolygon', () => {
    it('says a polygon in a polygon is in', () => {
      //   o1 -------- o2
      //   |  i1 -- i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(math.geomPolygonContainsPolygon(outer, inner)).toBe(true);
    });

    it('says a polygon outside of a polygon is out', () => {
      //      i1
      //      |  \
      //   o1 -----\-- o2
      //   |  |     i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, 1], [1, 9], [2, 2], [2, 1], [1, 1]];
      expect(math.geomPolygonContainsPolygon(outer, inner)).toBe(false);
    });
  });

  describe('geomPolygonIntersectsPolygon', () => {
    it('returns true when outer polygon fully contains inner', () => {
      //   o1 -------- o2
      //   |  i1 -- i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner)).toBe(true);
    });

    it('returns false when inner polygon fully contains outer', () => {
      //   i1 -------- i2
      //   |  o1 -- o2  |
      //   |  |      |  |
      //   |  o0 -- o3  |
      //   i0 -------- i3
      const inner: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const outer: Vec2[] = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner)).toBe(false);
    });

    it('returns true when outer polygon partially contains inner (some vertices contained)', () => {
      //      i1
      //      |  \
      //   o1 -----\-- o2
      //   |  |     i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, 1], [1, 9], [2, 2], [2, 1], [1, 1]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner)).toBe(true);
    });

    it('returns false when outer polygon partially contains inner (no vertices contained - lax test)', () => {
      //       i1 -- i2
      //   o1 -+------+-- o2
      //   |   |      |   |
      //   |   |      |   |
      //   o0 -+------+-- o3
      //       i0 -- i3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner)).toBe(false);
    });

    it('returns true when outer polygon partially contains inner (no vertices contained - strict test)', () => {
      //       i1 -- i2
      //   o1 -+------+-- o2
      //   |   |      |   |
      //   |   |      |   |
      //   o0 -+------+-- o3
      //       i0 -- i3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner, true)).toBe(true);
    });

    it('returns false when outer and inner are fully disjoint', () => {
      //   o1 ---- o2    i1 ---- i2
      //   |        |    |        |
      //   |        |    |        |
      //   o0 ---- o3    i0 ---- i3
      const outer: Vec2[] = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner: Vec2[] = [[5, 0], [5, 3], [8, 3], [8, 0], [5, 0]];
      expect(math.geomPolygonIntersectsPolygon(outer, inner)).toBe(false);
    });
  });

  describe('geomGetSmallestSurroundingRectangle', () => {
    it('returns null for empty points array', () => {
      expect(math.geomGetSmallestSurroundingRectangle([])).toBe(null);
    });

    it('normalizes nearly equivalent axis angles', () => {
      const points: Vec2[] = [[0, 0], [10, -1e-13], [10, 2], [0, 2], [0, 0]];
      const ssr = math.geomGetSmallestSurroundingRectangle(points);
      expect(ssr).toBeInstanceOf(Object);
      if (!ssr) throw new Error('expected smallest surrounding rectangle');
      expect(ssr.angle).toBe(0);
    });

    it('calculates a smallest surrounding rectangle for an off-axis L-shaped building', () => {
      //  p5 --- p4
      //  |      |
      //  |      p3 ------ p2
      //  |                |
      //  p0 ------------- p1
      const points = offAxisLShapedBuildingPoints();
      const ssr = math.geomGetSmallestSurroundingRectangle(points);
      expect(ssr).toBeInstanceOf(Object);
      if (!ssr) throw new Error('expected smallest surrounding rectangle');
      assertRectangleContainsPoints(ssr, points);

      const [longSide, shortSide] = rectangleSideLengths(ssr);
      expect(longSide).toBeCloseTo(8, 9);
      expect(shortSide).toBeCloseTo(6, 9);
      expect(ssr.angle).toBeCloseTo(Math.PI / 6, 9);
    });
  });

  describe('geomGetLongestSurroundingRectangle', () => {
    it('returns null for empty points array', () => {
      expect(math.geomGetLongestSurroundingRectangle([])).toBe(null);
    });

    it('calculates a longest surrounding rectangle for an off-axis L-shaped building', () => {
      //  p5 --- p4
      //  |      |
      //  |      p3 ------ p2
      //  |                |
      //  p0 ------------- p1
      const points = offAxisLShapedBuildingPoints();
      const lsr = math.geomGetLongestSurroundingRectangle(points);
      expect(lsr).toBeInstanceOf(Object);
      if (!lsr) throw new Error('expected longest surrounding rectangle');
      assertRectangleContainsPoints(lsr, points);

      const [longSide, shortSide] = rectangleSideLengths(lsr);
      expect(longSide).toBeCloseTo(9.995120760870789, 9);
      expect(shortSide).toBeCloseTo(6.559297999321455, 9);
      expect(lsr.angle).toBeCloseTo(1.4196541601696426, 9);
    });

    it('can choose a longer envelope than the smallest surrounding rectangle', () => {
      const points = offAxisLShapedBuildingPoints();
      const smallest = math.geomGetSmallestSurroundingRectangle(points);
      const longest = math.geomGetLongestSurroundingRectangle(points);

      expect(smallest).toBeInstanceOf(Object);
      expect(longest).toBeInstanceOf(Object);
      if (!smallest || !longest) throw new Error('expected surrounding rectangles');
      expect(Math.abs(smallest.angle - longest.angle)).toBeGreaterThan(1e-9);
      expect(rectangleSideLengths(longest)[0]).toBeGreaterThan(rectangleSideLengths(smallest)[0]);
      expect(rectangleArea(longest)).toBeGreaterThan(rectangleArea(smallest));
    });
  });

  describe('geomPathLength', () => {
    it('calculates a simple path length', () => {
      const path: Vec2[] = [[0, 0], [0, 1], [3, 5]];
      expect(math.geomPathLength(path)).toBe(6);
    });

    it('does not fail on single-point path', () => {
      const path: Vec2[] = [[0, 0]];
      expect(math.geomPathLength(path)).toBe(0);
    });

    it('handles zero-length edges', () => {
      const path: Vec2[] = [[0, 0], [0, 0]];
      expect(math.geomPathLength(path)).toBe(0);
    });
  });

});
