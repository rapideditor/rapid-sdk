import { Extent } from '..';

describe('math/extent', () => {
  describe('constructor', () => {
    it('defaults to infinitely empty extent', () => {
      const e = new Extent();
      expect(e.min).toStrictEqual([Infinity, Infinity]);
      expect(e.max).toStrictEqual([-Infinity, -Infinity]);
    });

    it('constructs via a point', () => {
      const p = [0, 0];
      const e = new Extent(p);
      expect(e.min).toStrictEqual(p);
      expect(e.max).toStrictEqual(p);
    });

    it('constructs via two points', () => {
      const min = [0, 0];
      const max = [5, 10];
      const e = new Extent(min, max);
      expect(e.min).toStrictEqual(min);
      expect(e.max).toStrictEqual(max);
    });

    it('constructs via an extent', () => {
      const min = [0, 0];
      const max = [5, 10];
      const e1 = new Extent(min, max);
      const e2 = new Extent(e1);
      expect(e2.min).toStrictEqual(min);
      expect(e2.max).toStrictEqual(max);
    });
  });

  describe('#equals', () => {
    it('tests extent equality', () => {
      const e1 = new Extent([0, 0], [10, 10]);
      const e2 = new Extent([0, 0], [10, 10]);
      const e3 = new Extent([0, 0], [12, 12]);
      expect(e1.equals(e2)).toBeTruthy();
      expect(e1.equals(e3)).toBeFalsy();
    });
  });

  describe('#center', () => {
    it('returns the center point', () => {
      expect(new Extent([0, 0], [5, 10]).center()).toStrictEqual([2.5, 5]);
    });
  });

  describe('#rectangle', () => {
    it('returns the extent as a rectangle', () => {
      expect(new Extent([0, 0], [5, 10]).rectangle()).toStrictEqual([0, 0, 5, 10]);
    });
  });

  describe('#polygon', () => {
    it('returns the extent as a polygon', () => {
      expect(new Extent([0, 0], [5, 10]).polygon()).toStrictEqual([
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
      expect(new Extent([0, 0], [5, 10]).area()).toBe(50);
    });
  });

  describe('#padByMeters', () => {
    it('does not change centerpoint of an extent', () => {
      const e1 = new Extent([0, 0], [5, 10]);
      const e2 = e1.padByMeters(100);
      expect(e2.center()).toStrictEqual([2.5, 5]);
    });

    it('does not affect the extent with a pad of zero', () => {
      const e1 = new Extent([0, 0], [5, 10]);
      const e2 = e1.padByMeters(0);
      expect(e2.min).toStrictEqual([0, 0]);
      expect(e2.max).toStrictEqual([5, 10]);
    });
  });

  describe('#extend', () => {
    it('does not modify self', () => {
      const e = new Extent([0, 0], [0, 0]);
      e.extend([1, 1]);
      expect(e.max).toStrictEqual([0, 0]);
    });

    it('returns the minimal extent containing self and the given point', () => {
      const e1 = new Extent();
      const e2 = e1.extend([0, 0]);
      expect(e2.min).toStrictEqual([0, 0]);
      expect(e2.max).toStrictEqual([0, 0]);

      const e3 = e2.extend([5, 10]);
      expect(e3.min).toStrictEqual([0, 0]);
      expect(e3.max).toStrictEqual([5, 10]);
    });

    it('returns the minimal extent containing self and the given extent', () => {
      const e1 = new Extent([0, 0], [5, 10]);
      const e2 = new Extent([4, -1], [5, 10]);
      const e3 = e1.extend(e2);
      expect(e3.min).toStrictEqual([0, -1]);
      expect(e3.max).toStrictEqual([5, 10]);
    });
  });

  describe('#contains', () => {
    it('returns true for a point inside self', () => {
      expect(new Extent([0, 0], [5, 5]).contains([2, 2])).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      expect(new Extent([0, 0], [5, 5]).contains([0, 0])).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      expect(new Extent([0, 0], [5, 5]).contains([6, 6])).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([1, 1], [2, 2]);
      expect(e1.contains(e2)).toBeTrue();
      expect(e2.contains(e1)).toBeFalse();
    });

    it('returns false for an extent partially contained by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([1, 1], [6, 6]);
      expect(e1.contains(e2)).toBeFalse();
      expect(e2.contains(e1)).toBeFalse();
    });

    it('returns false for an extent not intersected by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([6, 7], [7, 7]);
      expect(e1.contains(e2)).toBeFalse();
      expect(e2.contains(e1)).toBeFalse();
    });
  });

  describe('#intersects', () => {
    it('returns true for a point inside self', () => {
      expect(new Extent([0, 0], [5, 5]).intersects([2, 2])).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      expect(new Extent([0, 0], [5, 5]).intersects([0, 0])).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      expect(new Extent([0, 0], [5, 5]).intersects([6, 6])).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([1, 1], [2, 2]);
      expect(e1.intersects(e2)).toBeTrue();
      expect(e2.intersects(e1)).toBeTrue();
    });

    it('returns true for an extent partially contained by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([1, 1], [6, 6]);
      expect(e1.intersects(e2)).toBeTrue();
      expect(e2.intersects(e1)).toBeTrue();
    });

    it('returns false for an extent not intersected by self', () => {
      const e1 = new Extent([0, 0], [5, 5]);
      const e2 = new Extent([6, 7], [7, 7]);
      expect(e1.intersects(e2)).toBeFalse();
      expect(e2.intersects(e1)).toBeFalse();
    });
  });

  describe('#intersection', () => {
    it('returns an empty extent if self does not intersect with other', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6], [7, 7]);
      const c = new Extent();
      expect(a.intersection(b)).toStrictEqual(c);
    });

    it('returns the intersection of self with other (1)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 4], [7, 7]);
      const c = new Extent([3, 4], [5, 5]);
      expect(a.intersection(b)).toStrictEqual(c);
      expect(b.intersection(a)).toStrictEqual(c);
    });

    it('returns the intersection of self with other (2)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -4], [7, 2]);
      const c = new Extent([3, 0], [5, 2]);
      expect(a.intersection(b)).toStrictEqual(c);
      expect(b.intersection(a)).toStrictEqual(c);
    });

    it('returns the intersection of self with other (3)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 3], [4, 7]);
      const c = new Extent([3, 3], [4, 5]);
      expect(a.intersection(b)).toStrictEqual(c);
      expect(b.intersection(a)).toStrictEqual(c);
    });

    it('returns the intersection of self with other (4)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -2], [4, 2]);
      const c = new Extent([3, 0], [4, 2]);
      expect(a.intersection(b)).toStrictEqual(c);
      expect(b.intersection(a)).toStrictEqual(c);
    });

    it('returns the intersection of self with other (5)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      const c = new Extent([1, 1], [2, 2]);
      expect(a.intersection(b)).toStrictEqual(c);
      expect(b.intersection(a)).toStrictEqual(c);
    });
  });

  describe('#percentContainedIn', () => {
    it('returns a 0 if self does not intersect other', () => {
      const a = new Extent([0, 0], [1, 1]);
      const b = new Extent([0, 3], [4, 1]);
      expect(a.percentContainedIn(b)).toBe(0);
      expect(b.percentContainedIn(a)).toBe(0);
    });

    it('returns the percent contained of self with other (1)', () => {
      const a = new Extent([0, 0], [2, 1]);
      const b = new Extent([1, 0], [3, 1]);
      expect(a.percentContainedIn(b)).toBe(0.5);
      expect(b.percentContainedIn(a)).toBe(0.5);
    });

    it('returns the percent contained of self with other (2)', () => {
      const a = new Extent([0, 0], [4, 1]);
      const b = new Extent([3, 0], [4, 2]);
      expect(a.percentContainedIn(b)).toBe(0.25);
      expect(b.percentContainedIn(a)).toBe(0.5);
    });
  });
});
