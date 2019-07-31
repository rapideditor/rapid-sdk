import * as test from '..';

describe('math/geom', () => {
  const CLOSE = 6; // digits

  describe('geomEdgeEqual', () => {
    it('returns false for inequal edges', () => {
      expect(test.geomEdgeEqual(['a', 'b'], ['a', 'c'])).toBeFalse();
    });

    it('returns true for equal edges along same direction', () => {
      expect(test.geomEdgeEqual(['a', 'b'], ['a', 'b'])).toBeTrue();
    });

    it('returns true for equal edges along opposite direction', () => {
      expect(test.geomEdgeEqual(['a', 'b'], ['b', 'a'])).toBeTrue();
    });
  });

  describe('geomRotatePoints', () => {
    it('rotates points around [0, 0]', () => {
      const points = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around = [0, 0];
      const result = test.geomRotatePoints(points, angle, around);
      expect(result[0][0]).toBeCloseTo(-5, CLOSE);
      expect(result[0][1]).toBeCloseTo(0, CLOSE);
      expect(result[1][0]).toBeCloseTo(-5, CLOSE);
      expect(result[1][1]).toBeCloseTo(-1, CLOSE);
    });

    it('rotates points around [3, 0]', () => {
      const points = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around = [3, 0];
      const result = test.geomRotatePoints(points, angle, around);
      expect(result[0][0]).toBeCloseTo(1, CLOSE);
      expect(result[0][1]).toBeCloseTo(0, CLOSE);
      expect(result[1][0]).toBeCloseTo(1, CLOSE);
      expect(result[1][1]).toBeCloseTo(-1, CLOSE);
    });
  });

  describe('geomLineIntersection', () => {
    it('returns null if either line is not a proper line segment', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 0], [5, 0]];
      expect(test.geomLineIntersection([], b)).toBeNull();
      expect(test.geomLineIntersection([[0, 0]], b)).toBeNull();
      expect(test.geomLineIntersection(a, [])).toBeNull();
      expect(test.geomLineIntersection(a, [[0, 0]])).toBeNull();
    });

    it('returns null if lines are colinear with overlap', () => {
      //
      //   b0 --- a0 === b1 --- a1
      //
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 0], [5, 0]];
      expect(test.geomLineIntersection(a, b)).toBeNull();
    });

    it('returns null if lines are colinear but disjoint', () => {
      //
      //   b0 --- b1     a0 --- a1
      //
      const a = [[5, 0], [10, 0]];
      const b = [[-10, 0], [-5, 0]];
      expect(test.geomLineIntersection(a, b)).toBeNull();
    });

    it('returns null if lines are parallel', () => {
      //   b0 ------- b1
      //
      //   a0 ------- a1
      const a = [[0, 0], [10, 0]];
      const b = [[0, 5], [10, 5]];
      expect(test.geomLineIntersection(a, b)).toBeNull();
    });

    it('returns the intersection point between 2 lines', () => {
      //         b0
      //         |
      //   a0 ---*--- a1
      //         |
      //         b1
      const a = [[0, 0], [10, 0]];
      const b = [[5, 10], [5, -10]];
      expect(test.geomLineIntersection(a, b)).toStrictEqual([5, 0]);
    });
    it('returns null if lines are not parallel but not intersecting', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 10], [-5, -10]];
      expect(test.geomLineIntersection(a, b)).toBeNull();
    });
  });

  describe('geomPathIntersections', () => {
    it('returns empty array if either path is not at least a proper line segment', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(test.geomPathIntersections([], b)).toHaveLength(0);
      expect(test.geomPathIntersections([[0, 0]], b)).toHaveLength(0);
      expect(test.geomPathIntersections(a, [])).toHaveLength(0);
      expect(test.geomPathIntersections(a, [[0, 0]])).toHaveLength(0);
    });

    it('returns the intersection points between 2 paths', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(test.geomPathIntersections(a, b)).toStrictEqual([[5, 0], [7.5, 0]]);
    });
  });

  describe('geomPathHasIntersections', () => {
    it('returns false if either path is not at least a proper line segment', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(test.geomPathHasIntersections([], b)).toBeFalse();
      expect(test.geomPathHasIntersections([[0, 0]], b)).toBeFalse();
      expect(test.geomPathHasIntersections(a, [])).toBeFalse();
      expect(test.geomPathHasIntersections(a, [[0, 0]])).toBeFalse();
    });

    it('returns true if the paths intersect', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      expect(test.geomPathHasIntersections(a, b)).toBeTrue();
    });
  });

  describe('geomPointInPolygon', () => {
    it('says a point in a polygon is on a polygon', () => {
      //   p1 --- p2
      //   |   *   |
      //   p0 --- p3
      const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point = [0.5, 0.5];
      expect(test.geomPointInPolygon(point, poly)).toBeTrue();
    });
    it('says a point outside of a polygon is outside', () => {
      //       *
      //   p1 --- p2
      //   |       |
      //   p0 --- p3
      const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point = [0.5, 1.5];
      expect(test.geomPointInPolygon(point, poly)).toBeFalse();
    });
  });

  describe('geomPolygonContainsPolygon', () => {
    it('says a polygon in a polygon is in', () => {
      //   o1 -------- o2
      //   |  i1 -- i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(test.geomPolygonContainsPolygon(outer, inner)).toBeTrue();
    });
    it('says a polygon outside of a polygon is out', () => {
      //      i1
      //      |  \
      //   o1 -----\-- o2
      //   |  |     i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, 1], [1, 9], [2, 2], [2, 1], [1, 1]];
      expect(test.geomPolygonContainsPolygon(outer, inner)).toBeFalse();
    });
  });

  describe('geomPolygonIntersectsPolygon', () => {
    it('returns true when outer polygon fully contains inner', () => {
      //   o1 -------- o2
      //   |  i1 -- i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner)).toBeTrue();
    });

    it('returns false when inner polygon fully contains outer', () => {
      //   i1 -------- i2
      //   |  o1 -- o2  |
      //   |  |      |  |
      //   |  o0 -- o3  |
      //   i0 -------- i3
      const inner = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const outer = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner)).toBeFalse();
    });

    it('returns true when outer polygon partially contains inner (some vertices contained)', () => {
      //      i1
      //      |  \
      //   o1 -----\-- o2
      //   |  |     i2  |
      //   |  |      |  |
      //   |  i0 -- i3  |
      //   o0 -------- o3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, 1], [1, 9], [2, 2], [2, 1], [1, 1]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner)).toBeTrue();
    });

    it('returns false when outer polygon partially contains inner (no vertices contained - lax test)', () => {
      //       i1 -- i2
      //   o1 -+------+-- o2
      //   |   |      |   |
      //   |   |      |   |
      //   o0 -+------+-- o3
      //       i0 -- i3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner)).toBeFalse();
    });

    it('returns true when outer polygon partially contains inner (no vertices contained - strict test)', () => {
      //       i1 -- i2
      //   o1 -+------+-- o2
      //   |   |      |   |
      //   |   |      |   |
      //   o0 -+------+-- o3
      //       i0 -- i3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[1, -1], [1, 4], [2, 4], [2, -1], [1, -1]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner, true)).toBeTrue();
    });

    it('returns false when outer and inner are fully disjoint', () => {
      //   o1 ---- o2    i1 ---- i2
      //   |        |    |        |
      //   |        |    |        |
      //   o0 ---- o3    i0 ---- i3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[5, 0], [5, 3], [8, 3], [8, 0], [5, 0]];
      expect(test.geomPolygonIntersectsPolygon(outer, inner)).toBeFalse();
    });
  });

  describe('geomGetSmallestSurroundingRectangle', () => {
    it('calculates a smallest surrounding rectangle', () => {
      //  +-- p1 ------ p3
      //  |              |
      //  p0 ------ p2 --+
      const points = [[0, -1], [5, 1], [10, -1], [15, 1]];
      const ssr = test.geomGetSmallestSurroundingRectangle(points);
      expect(ssr.poly).toStrictEqual([[0, -1], [0, 1], [15, 1], [15, -1], [0, -1]]);
      expect(ssr.angle).toBe(0);
    });
  });

  describe('geomPathLength', () => {
    it('calculates a simple path length', () => {
      const path = [[0, 0], [0, 1], [3, 5]];
      expect(test.geomPathLength(path)).toBe(6);
    });

    it('does not fail on single-point path', () => {
      const path = [[0, 0]];
      expect(test.geomPathLength(path)).toBe(0);
    });

    it('estimates zero-length edges', () => {
      const path = [[0, 0], [0, 0]];
      expect(test.geomPathLength(path)).toBe(0);
    });
  });

  describe('geomViewportNudge', () => {
    const dimensions = [1000, 1000];
    it('returns null if the point is not at the edge', () => {
      expect(test.geomViewportNudge([500, 500], dimensions)).toBeNull();
    });
    it('nudges top edge', () => {
      expect(test.geomViewportNudge([500, 5], dimensions)).toStrictEqual([0, 10]);
    });
    it('nudges top-right corner', () => {
      expect(test.geomViewportNudge([995, 5], dimensions)).toStrictEqual([-10, 10]);
    });
    it('nudges right edge', () => {
      expect(test.geomViewportNudge([995, 500], dimensions)).toStrictEqual([-10, 0]);
    });
    it('nudges bottom-right corner', () => {
      expect(test.geomViewportNudge([995, 995], dimensions)).toStrictEqual([-10, -10]);
    });
    it('nudges bottom edge', () => {
      expect(test.geomViewportNudge([500, 995], dimensions)).toStrictEqual([0, -10]);
    });
    it('nudges bottom-left corner', () => {
      expect(test.geomViewportNudge([5, 995], dimensions)).toStrictEqual([10, -10]);
    });
    it('nudges left edge', () => {
      expect(test.geomViewportNudge([5, 500], dimensions)).toStrictEqual([10, 0]);
    });
    it('nudges top-left corner', () => {
      expect(test.geomViewportNudge([5, 5], dimensions)).toStrictEqual([10, 10]);
    });
  });
});
