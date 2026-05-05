import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as math from '../src/math.ts';


assert.closeTo = function(a, b, epsilon = 1e-9) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

function rectangleSideLengths(rectangle) {
  const poly = rectangle.poly;
  const sideA = Math.hypot(poly[1][0] - poly[0][0], poly[1][1] - poly[0][1]);
  const sideB = Math.hypot(poly[2][0] - poly[1][0], poly[2][1] - poly[1][1]);
  return sideA > sideB ? [sideA, sideB] : [sideB, sideA];
}

function rectangleArea(rectangle) {
  const [longSide, shortSide] = rectangleSideLengths(rectangle);
  return longSide * shortSide;
}

function assertRectangleContainsPoints(rectangle, points) {
  const origin = rectangle.poly[0];
  const edgeA = [rectangle.poly[1][0] - origin[0], rectangle.poly[1][1] - origin[1]];
  const edgeB = [rectangle.poly[3][0] - origin[0], rectangle.poly[3][1] - origin[1]];
  const edgeALengthSquare = edgeA[0] * edgeA[0] + edgeA[1] * edgeA[1];
  const edgeBLengthSquare = edgeB[0] * edgeB[0] + edgeB[1] * edgeB[1];

  for (const point of points) {
    const pointVector = [point[0] - origin[0], point[1] - origin[1]];
    const alongA = (pointVector[0] * edgeA[0] + pointVector[1] * edgeA[1]) / edgeALengthSquare;
    const alongB = (pointVector[0] * edgeB[0] + pointVector[1] * edgeB[1]) / edgeBLengthSquare;
    assert.ok(alongA >= -1e-9 && alongA <= 1 + 1e-9);
    assert.ok(alongB >= -1e-9 && alongB <= 1 + 1e-9);
  }
}

function offAxisLShapedBuildingPoints() {
  const footprint = [[0, 0], [8, 0], [8, 2], [3, 2], [3, 6], [0, 6], [0, 0]];
  return math.geomRotatePoints(footprint, Math.PI / 6, [0, 0]);
}

describe('math/geom', () => {
  describe('geomEdgeEqual', () => {
    it('returns false for inequal edges', () => {
      assert.equal(math.geomEdgeEqual(['a', 'b'], ['a', 'c']), false);
    });

    it('returns true for equal edges along same direction', () => {
      assert.equal(math.geomEdgeEqual(['a', 'b'], ['a', 'b']), true);
    });

    it('returns true for equal edges along opposite direction', () => {
      assert.equal(math.geomEdgeEqual(['a', 'b'], ['b', 'a']), true);
    });
  });

  describe('geomRotatePoints', () => {
    it('rotates points around [0, 0]', () => {
      const points = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around = [0, 0];
      const result = math.geomRotatePoints(points, angle, around);
      assert.closeTo(result[0][0], -5);
      assert.closeTo(result[0][1], 0);
      assert.closeTo(result[1][0], -5);
      assert.closeTo(result[1][1], -1);
    });

    it('rotates points around [3, 0]', () => {
      const points = [[5, 0], [5, 1]];
      const angle = Math.PI;
      const around = [3, 0];
      const result = math.geomRotatePoints(points, angle, around);
      assert.closeTo(result[0][0], 1);
      assert.closeTo(result[0][1], 0);
      assert.closeTo(result[1][0], 1);
      assert.closeTo(result[1][1], -1);
    });
  });

  describe('geomLineIntersection', () => {
    it('returns null if either line is not a proper line segment', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 0], [5, 0]];
      assert.equal(math.geomLineIntersection([], b), null);
      assert.equal(math.geomLineIntersection([[0, 0]], b), null);
      assert.equal(math.geomLineIntersection(a, []), null);
      assert.equal(math.geomLineIntersection(a, [[0, 0]]), null);
    });

    it('returns null if lines are colinear with overlap', () => {
      //
      //   b0 --- a0 === b1 --- a1
      //
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 0], [5, 0]];
      assert.equal(math.geomLineIntersection(a, b), null);
    });

    it('returns null if lines are colinear but disjoint', () => {
      //
      //   b0 --- b1     a0 --- a1
      //
      const a = [[5, 0], [10, 0]];
      const b = [[-10, 0], [-5, 0]];
      assert.equal(math.geomLineIntersection(a, b), null);
    });

    it('returns null if lines are parallel', () => {
      //   b0 ------- b1
      //
      //   a0 ------- a1
      const a = [[0, 0], [10, 0]];
      const b = [[0, 5], [10, 5]];
      assert.equal(math.geomLineIntersection(a, b), null);
    });

    it('returns the intersection point between 2 lines', () => {
      //         b0
      //         |
      //   a0 ---*--- a1
      //         |
      //         b1
      const a = [[0, 0], [10, 0]];
      const b = [[5, 10], [5, -10]];
      const result = math.geomLineIntersection(a, b);
      assert.ok(result instanceof Array);
      assert.deepEqual(result, [5, 0]);
    });

    it('returns null if lines are not parallel but not intersecting', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[-5, 10], [-5, -10]];
      assert.equal(math.geomLineIntersection(a, b), null);
    });
  });

  describe('geomPathIntersections', () => {
    it('returns empty array if either path is not at least a proper line segment', () => {
      const a = [[0, 0], [10, 0] ];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      assert.deepEqual(math.geomPathIntersections([], b), []);
      assert.deepEqual(math.geomPathIntersections([[0, 0]], b), []);
      assert.deepEqual(math.geomPathIntersections(a, []), []);
      assert.deepEqual(math.geomPathIntersections(a, [[0, 0]]), []);
    });

    it('returns the intersection points between 2 paths', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      const result = math.geomPathIntersections(a, b);
      assert.ok(result instanceof Array);
      assert.deepEqual(result, [[5, 0], [7.5, 0]]);
    });
  });

  describe('geomPathHasIntersections', () => {
    it('returns false if either path is not at least a proper line segment', () => {
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      assert.equal(math.geomPathHasIntersections([], b), false);
      assert.equal(math.geomPathHasIntersections([[0, 0]], b), false);
      assert.equal(math.geomPathHasIntersections(a, []), false);
      assert.equal(math.geomPathHasIntersections(a, [[0, 0]]), false);
    });

    it('returns true if the paths intersect', () => {
      //         b0
      //         | \
      //   a0 ---*--*--- a1
      //         |   \
      //        b1 -- b2
      const a = [[0, 0], [10, 0]];
      const b = [[5, 5], [5, -5], [10, -5], [5, 5]];
      assert.equal(math.geomPathHasIntersections(a, b), true);
    });
  });

  describe('geomPointInPolygon', () => {
    it('says a point in a polygon is on a polygon', () => {
      //   p1 --- p2
      //   |   *   |
      //   p0 --- p3
      const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point = [0.5, 0.5];
      assert.equal(math.geomPointInPolygon(point, poly), true);
    });

    it('says a point outside of a polygon is outside', () => {
      //       *
      //   p1 --- p2
      //   |       |
      //   p0 --- p3
      const poly = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
      const point = [0.5, 1.5];
      assert.equal(math.geomPointInPolygon(point, poly), false);
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
      assert.equal(math.geomPolygonContainsPolygon(outer, inner), true);
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
      assert.equal(math.geomPolygonContainsPolygon(outer, inner), false);
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
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner), true);
    });

    it('returns false when inner polygon fully contains outer', () => {
      //   i1 -------- i2
      //   |  o1 -- o2  |
      //   |  |      |  |
      //   |  o0 -- o3  |
      //   i0 -------- i3
      const inner = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const outer = [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]];
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner), false);
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
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner), true);
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
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner), false);
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
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner, true), true);
    });

    it('returns false when outer and inner are fully disjoint', () => {
      //   o1 ---- o2    i1 ---- i2
      //   |        |    |        |
      //   |        |    |        |
      //   o0 ---- o3    i0 ---- i3
      const outer = [[0, 0], [0, 3], [3, 3], [3, 0], [0, 0]];
      const inner = [[5, 0], [5, 3], [8, 3], [8, 0], [5, 0]];
      assert.equal(math.geomPolygonIntersectsPolygon(outer, inner), false);
    });
  });

  describe('geomGetSmallestSurroundingRectangle', () => {
    it('returns null for empty points array', () => {
      assert.equal(math.geomGetSmallestSurroundingRectangle([]), null);
    });

    it('normalizes nearly equivalent axis angles', () => {
      const points = [[0, 0], [10, -1e-13], [10, 2], [0, 2], [0, 0]];
      const ssr = math.geomGetSmallestSurroundingRectangle(points);
      assert.ok(ssr instanceof Object);
      assert.equal(ssr.angle, 0);
    });

    it('calculates a smallest surrounding rectangle for an off-axis L-shaped building', () => {
      //  p5 --- p4
      //  |      |
      //  |      p3 ------ p2
      //  |                |
      //  p0 ------------- p1
      const points = offAxisLShapedBuildingPoints();
      const ssr = math.geomGetSmallestSurroundingRectangle(points);
      assert.ok(ssr instanceof Object);
      assertRectangleContainsPoints(ssr, points);

      const [longSide, shortSide] = rectangleSideLengths(ssr);
      assert.closeTo(longSide, 8);
      assert.closeTo(shortSide, 6);
      assert.closeTo(ssr.angle, Math.PI / 6);
    });
  });

  describe('geomGetLongestSurroundingRectangle', () => {
    it('returns null for empty points array', () => {
      assert.equal(math.geomGetLongestSurroundingRectangle([]), null);
    });

    it('calculates a longest surrounding rectangle for an off-axis L-shaped building', () => {
      //  p5 --- p4
      //  |      |
      //  |      p3 ------ p2
      //  |                |
      //  p0 ------------- p1
      const points = offAxisLShapedBuildingPoints();
      const lsr = math.geomGetLongestSurroundingRectangle(points);
      assert.ok(lsr instanceof Object);
      assertRectangleContainsPoints(lsr, points);

      const [longSide, shortSide] = rectangleSideLengths(lsr);
      assert.closeTo(longSide, 9.995120760870789);
      assert.closeTo(shortSide, 6.559297999321455);
      assert.closeTo(lsr.angle, 1.4196541601696426);
    });

    it('can choose a longer envelope than the smallest surrounding rectangle', () => {
      const points = offAxisLShapedBuildingPoints();
      const smallest = math.geomGetSmallestSurroundingRectangle(points);
      const longest = math.geomGetLongestSurroundingRectangle(points);

      assert.ok(smallest instanceof Object);
      assert.ok(longest instanceof Object);
      assert.ok(Math.abs(smallest.angle - longest.angle) > 1e-9);
      assert.ok(rectangleSideLengths(longest)[0] > rectangleSideLengths(smallest)[0]);
      assert.ok(rectangleArea(longest) > rectangleArea(smallest));
    });
  });

  describe('geomPathLength', () => {
    it('calculates a simple path length', () => {
      const path = [[0, 0], [0, 1], [3, 5]];
      assert.equal(math.geomPathLength(path), 6);
    });

    it('does not fail on single-point path', () => {
      const path = [[0, 0]];
      assert.equal(math.geomPathLength(path), 0);
    });

    it('handles zero-length edges', () => {
      const path = [[0, 0], [0, 0]];
      assert.equal(math.geomPathLength(path), 0);
    });
  });

});
