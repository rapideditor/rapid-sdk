import * as test from '..';

describe('math/extent', () => {
  describe('constructor', () => {
    it('defaults to infinitely empty extent', () => {
      expect(test.Extent().equals([[Infinity, Infinity], [-Infinity, -Infinity]])).toBeTruthy();
    });

    it('constructs via a point', () => {
      const p = [0, 0];
      expect(test.Extent(p).equals([p, p])).toBeTruthy();
    });

    it('constructs via two points', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(test.Extent(min, max).equals([min, max])).toBeTruthy();
    });

    it('constructs via an extent', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(test.Extent([min, max]).equals([min, max])).toBeTruthy();
    });

    it('constructs via an test.Extent', () => {
      const min = [0, 0];
      const max = [5, 10];
      const extent = test.Extent(min, max);
      expect(test.Extent(extent).equals(extent)).toBeTruthy();
    });

    it('has length 2', () => {
      expect(test.Extent().length).to.equal(2);
    });

    it('has min element', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(test.Extent(min, max)[0]).to.equal(min);
    });

    it('has max element', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(test.Extent(min, max)[1]).to.equal(max);
    });
  });

  describe('#equals', () => {
    it('tests extent equality', () => {
      const e1 = test.Extent([0, 0], [10, 10]);
      const e2 = test.Extent([0, 0], [10, 10]);
      const e3 = test.Extent([0, 0], [12, 12]);
      expect(e1.equals(e2)).toBeTruthy();
      expect(e1.equals(e3)).toBeFalsy();
    });
  });

  describe('#center', () => {
    it('returns the center point', () => {
      expect(test.Extent([0, 0], [5, 10]).center()).toBe([2.5, 5]);
    });
  });

  describe('#rectangle', () => {
    it('returns the extent as a rectangle', () => {
      expect(test.Extent([0, 0], [5, 10]).rectangle()).toBe([0, 0, 5, 10]);
    });
  });

  describe('#polygon', () => {
    it('returns the extent as a polygon', () => {
      expect(test.Extent([0, 0], [5, 10]).polygon()).toBe([
        [0, 0],
        [0, 10],
        [5, 10],
        [5, 0],
        [0, 0]
      ]);
    });
  });

  describe('#area', () => {
    it('returns the area', () => {
      expect(test.Extent([0, 0], [5, 10]).area()).toBe(50);
    });
  });

  describe('#padByMeters', () => {
    it('does not change centerpoint of an extent', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(
        test
          .Extent(min, max)
          .padByMeters(100)
          .center()
      ).toBe([2.5, 5]);
    });

    it('does not affect the extent with a pad of zero', () => {
      const min = [0, 0];
      const max = [5, 10];
      expect(test.Extent(min, max).padByMeters(0)[0]).toBe([0, 0]);
    });
  });

  describe('#extend', () => {
    it('does not modify self', () => {
      const extent = test.Extent([0, 0], [0, 0]);
      extent.extend([1, 1]);
      expect(extent.equals([[0, 0], [0, 0]])).toBeTruthy();
    });

    it('returns the minimal extent containing self and the given point', () => {
      expect(
        test
          .Extent()
          .extend([0, 0])
          .equals([[0, 0], [0, 0]])
      ).toBeTruthy();
      expect(
        test
          .Extent([0, 0], [0, 0])
          .extend([5, 10])
          .equals([[0, 0], [5, 10]])
      ).toBeTruthy();
    });

    it('returns the minimal extent containing self and the given extent', () => {
      expect(
        test
          .Extent()
          .extend([[0, 0], [5, 10]])
          .equals([[0, 0], [5, 10]])
      ).toBeTruthy();
      expect(
        test
          .Extent([0, 0], [0, 0])
          .extend([[4, -1], [5, 10]])
          .equals([[0, -1], [5, 10]])
      ).toBeTruthy();
    });
  });

  describe('#_extend', () => {
    it('extends self to the minimal extent containing self and the given extent', () => {
      const e = test.Extent();
      e._extend([[0, 0], [5, 10]]);
      expect(e.equals([[0, 0], [5, 10]])).toBeTruthy();

      e = test.Extent([0, 0], [0, 0]);
      e._extend([[4, -1], [5, 10]]);
      expect(e.equals([[0, -1], [5, 10]])).toBeTruthy();
    });
  });

  describe('#contains', () => {
    it('returns true for a point inside self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([2, 2])).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([0, 0])).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([6, 6])).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([[1, 1], [2, 2]])).toBeTrue();
      expect(test.Extent([1, 1], [2, 2]).contains([[0, 0], [5, 5]])).toBeFalse();
    });

    it('returns false for an extent partially contained by self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([[1, 1], [6, 6]])).toBeFalse();
      expect(test.Extent([1, 1], [6, 6]).contains([[0, 0], [5, 5]])).toBeFalse();
    });

    it('returns false for an extent not intersected by self', () => {
      expect(test.Extent([0, 0], [5, 5]).contains([[6, 6], [7, 7]])).toBeFalse();
      expect(test.Extent([[6, 6], [7, 7]]).contains([[0, 0], [5, 5]])).toBeFalse();
    });
  });

  describe('#intersects', () => {
    it('returns true for a point inside self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([2, 2])).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([0, 0])).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([6, 6])).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([[1, 1], [2, 2]])).toBeTrue();
      expect(test.Extent([1, 1], [2, 2]).intersects([[0, 0], [5, 5]])).toBeTrue();
    });

    it('returns true for an extent partially contained by self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([[1, 1], [6, 6]])).toBeTrue();
      expect(test.Extent([1, 1], [6, 6]).intersects([[0, 0], [5, 5]])).toBeTrue();
    });

    it('returns false for an extent not intersected by self', () => {
      expect(test.Extent([0, 0], [5, 5]).intersects([[6, 6], [7, 7]])).toBeFalse();
      expect(test.Extent([[6, 6], [7, 7]]).intersects([[0, 0], [5, 5]])).toBeFalse();
    });
  });

  describe('#intersection', () => {
    it('returns an empty extent if self does not intersect with other', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([6, 6], [7, 7]);
      expect(a.intersection(b)).toBe(test.Extent());
    });

    it('returns the intersection of self with other (1)', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([3, 4], [7, 7]);
      expect(a.intersection(b)).toBe(test.Extent([3, 4], [5, 5]));
      expect(b.intersection(a)).toBe(test.Extent([3, 4], [5, 5]));
    });

    it('returns the intersection of self with other (2)', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([3, -4], [7, 2]);
      expect(a.intersection(b)).toBe(test.Extent([3, 0], [5, 2]));
      expect(b.intersection(a)).toBe(test.Extent([3, 0], [5, 2]));
    });

    it('returns the intersection of self with other (3)', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([3, 3], [4, 7]);
      expect(a.intersection(b)).toBe(test.Extent([3, 3], [4, 5]));
      expect(b.intersection(a)).toBe(test.Extent([3, 3], [4, 5]));
    });

    it('returns the intersection of self with other (4)', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([3, -2], [4, 2]);
      expect(a.intersection(b)).toBe(test.Extent([3, 0], [4, 2]));
      expect(b.intersection(a)).toBe(test.Extent([3, 0], [4, 2]));
    });

    it('returns the intersection of self with other (5)', () => {
      const a = test.Extent([0, 0], [5, 5]);
      const b = test.Extent([1, 1], [2, 2]);
      expect(a.intersection(b)).toBe(test.Extent([1, 1], [2, 2]));
      expect(b.intersection(a)).toBe(test.Extent([1, 1], [2, 2]));
    });
  });

  describe('#percentContainedIn', () => {
    it('returns a 0 if self does not intersect other', () => {
      const a = test.Extent([0, 0], [1, 1]);
      const b = test.Extent([0, 3], [4, 1]);
      expect(a.percentContainedIn(b)).toBe(0);
      expect(b.percentContainedIn(a)).toBe(0);
    });

    it('returns the percent contained of self with other (1)', () => {
      const a = test.Extent([0, 0], [2, 1]);
      const b = test.Extent([1, 0], [3, 1]);
      expect(a.percentContainedIn(b)).toBe(0.5);
      expect(b.percentContainedIn(a)).toBe(0.5);
    });

    it('returns the percent contained of self with other (2)', () => {
      const a = test.Extent([0, 0], [4, 1]);
      const b = test.Extent([3, 0], [4, 2]);
      expect(a.percentContainedIn(b)).toBe(0.25);
      expect(b.percentContainedIn(a)).toBe(0.5);
    });
  });
});
