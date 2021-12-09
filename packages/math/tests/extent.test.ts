import { Extent } from '../src/extent';
import { Vec2 } from '../src/vector';

describe('math/extent', () => {
  describe('constructor', () => {
    it('defaults to infinitely empty extent', () => {
      const e = new Extent();
      expect(e.min).toStrictEqual([Infinity, Infinity]);
      expect(e.max).toStrictEqual([-Infinity, -Infinity]);
    });

    it('constructs via a point', () => {
      const p: Vec2 = [0, 0];
      const e = new Extent(p);
      expect(e.min).toStrictEqual(p);
      expect(e.max).toStrictEqual(p);
    });

    it('constructs via two points', () => {
      const min: Vec2 = [0, 0];
      const max: Vec2 = [5, 10];
      const e = new Extent(min, max);
      expect(e.min).toStrictEqual(min);
      expect(e.max).toStrictEqual(max);
    });

    it('constructs via an extent', () => {
      const min: Vec2 = [0, 0];
      const max: Vec2 = [5, 10];
      const a = new Extent(min, max);
      const b = new Extent(a);
      expect(b.min).toStrictEqual(min);
      expect(b.max).toStrictEqual(max);
    });
  });

  describe('#equals', () => {
    it('tests extent equality', () => {
      const a = new Extent([0, 0], [10, 10]);
      const b = new Extent([0, 0], [10, 10]);
      const c = new Extent([0, 0], [12, 12]);
      expect(a.equals(b)).toBeTruthy();
      expect(a.equals(c)).toBeFalsy();
    });
  });

  describe('#area', () => {
    it('returns the area', () => {
      const a = new Extent([0, 0], [5, 10]);
      expect(a.area()).toBe(50);
    });
  });

  describe('#center', () => {
    it('returns the center point', () => {
      const a = new Extent([0, 0], [5, 10]);
      expect(a.center()).toStrictEqual([2.5, 5]);
    });
  });

  describe('#rectangle', () => {
    it('returns the extent as a rectangle Array', () => {
      const a = new Extent([0, 0], [5, 10]);
      expect(a.rectangle()).toStrictEqual([0, 0, 5, 10]);
    });
  });

  describe('#bbox', () => {
    it('returns the extent as a bbox Object', () => {
      const bbox = new Extent([0, 0], [5, 10]).bbox();
      expect(bbox).toHaveProperty('minX', 0);
      expect(bbox).toHaveProperty('minY', 0);
      expect(bbox).toHaveProperty('maxX', 5);
      expect(bbox).toHaveProperty('maxY', 10);
    });
  });

  describe('#toParam', () => {
    it('returns the extent as a paramater string', () => {
      expect(new Extent([0, 0], [5, 10]).toParam()).toStrictEqual('0,0,5,10');
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

  describe('#padByMeters', () => {
    it('does not change centerpoint of an extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(100);
      expect(b.center()).toStrictEqual([2.5, 5]);
    });

    it('does not affect the extent with a pad of zero', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(0);
      expect(b.min).toStrictEqual([0, 0]);
      expect(b.max).toStrictEqual([5, 10]);
    });
  });

  describe('#extend', () => {
    it('does not modify self', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([1, 1]);
      a.extend(b);
      expect(a.max).toStrictEqual([0, 0]);
    });

    it('returns the minimal extent containing self and the given point', () => {
      const a = new Extent();
      const b = a.extend(new Extent([0, 0]));
      expect(b.min).toStrictEqual([0, 0]);
      expect(b.max).toStrictEqual([0, 0]);

      const c = b.extend(new Extent([5, 10]));
      expect(c.min).toStrictEqual([0, 0]);
      expect(c.max).toStrictEqual([5, 10]);
    });

    it('returns the minimal extent containing self and the given extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = new Extent([4, -1], [5, 10]);
      const c = a.extend(b);
      expect(c.min).toStrictEqual([0, -1]);
      expect(c.max).toStrictEqual([5, 10]);
    });
  });

  describe('#contains', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      expect(a.contains(b)).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      expect(a.contains(b)).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      expect(a.contains(b)).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      expect(a.contains(b)).toBeTrue();
      expect(b.contains(a)).toBeFalse();
    });

    it('returns false for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      expect(a.contains(b)).toBeFalse();
      expect(b.contains(a)).toBeFalse();
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      expect(a.contains(b)).toBeFalse();
      expect(b.contains(a)).toBeFalse();
    });
  });

  describe('#intersects', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      expect(a.intersects(b)).toBeTrue();
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      expect(a.intersects(b)).toBeTrue();
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      expect(a.intersects(b)).toBeFalse();
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      expect(a.intersects(b)).toBeTrue();
      expect(b.intersects(a)).toBeTrue();
    });

    it('returns true for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      expect(a.intersects(b)).toBeTrue();
      expect(b.intersects(a)).toBeTrue();
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      expect(a.intersects(b)).toBeFalse();
      expect(b.intersects(a)).toBeFalse();
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
    it('returns 0 if either extent is infinite', () => {
      const a = new Extent();
      const b = new Extent([0, 3], [4, 1]);
      expect(a.percentContainedIn(b)).toBe(0);
      expect(b.percentContainedIn(a)).toBe(0);
    });

    it('returns 0 if extent w/o area does not intersect other extent w/o area', () => {
      const a = new Extent([5, 5], [5, 5]);
      const b = new Extent([2, 2], [2, 2]);
      expect(a.percentContainedIn(b)).toBe(0);
      expect(b.percentContainedIn(a)).toBe(0);
    });

    it('returns 1 if extent w/o area touching other extent w/ area', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([0, 0], [1, 1]);
      expect(a.percentContainedIn(b)).toBe(1);
    });

    it('returns 1 if extent w/o area touching (i.e. same as) other extent w/o area', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([0, 0], [0, 0]);
      expect(a.percentContainedIn(b)).toBe(1);
      expect(b.percentContainedIn(a)).toBe(1);
    });

    it('returns 0 if extent w/ area touching other extent w/ area (zero-area intersection, corners touch only)', () => {
      const a = new Extent([0, 0], [1, 1]);
      const b = new Extent([1, 1], [2, 2]);
      expect(a.percentContainedIn(b)).toBe(0);
      expect(b.percentContainedIn(a)).toBe(0);
    });

    it('returns 0 if extent w/ area does not intersect other extent w/ area', () => {
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
