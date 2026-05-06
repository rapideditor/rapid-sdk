import { describe, expect, it } from 'bun:test';
import { Extent, type Vec2 } from '../src/index.ts';


describe('math/extent', () => {
  describe('constructor', () => {
    it('defaults to infinitely empty extent', () => {
      const e = new Extent();
      expect(e).toBeInstanceOf(Extent);
      expect(e.min).toEqual([Infinity, Infinity]);
      expect(e.max).toEqual([-Infinity, -Infinity]);
    });

    it('constructs via a point', () => {
      const p: Vec2 = [0, 0];
      const e = new Extent(p);
      expect(e).toBeInstanceOf(Extent);
      expect(e.min).toEqual(p);
      expect(e.max).toEqual(p);
    });

    it('constructs via two points', () => {
      const min: Vec2 = [0, 0];
      const max: Vec2 = [5, 10];
      const e = new Extent(min, max);
      expect(e).toBeInstanceOf(Extent);
      expect(e.min).toEqual(min);
      expect(e.max).toEqual(max);
    });

    it('constructs via an Extent', () => {
      const min: Vec2 = [0, 0];
      const max: Vec2 = [5, 10];
      const a = new Extent(min, max);
      const b = new Extent(a);
      expect(a).toBeInstanceOf(Extent);
      expect(b).toBeInstanceOf(Extent);
      expect(a).not.toBe(b);
      expect(b.min).toEqual(min);
      expect(b.max).toEqual(max);
    });
  });

  describe('#equals', () => {
    it('tests extent equality', () => {
      const a = new Extent([0, 0], [10, 10]);
      const b = new Extent([0, 0], [10, 10]);
      const c = new Extent([0, 0], [12, 12]);
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe('#area', () => {
    it('returns the area', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.area();
      expect(result).toBe(50);
    });
  });

  describe('#center', () => {
    it('returns the center point', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.center();
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([2.5, 5]);
    });
  });

  describe('#rectangle', () => {
    it('returns the Extent as a rectangle Array', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.rectangle();
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([0, 0, 5, 10]);
    });
  });

  describe('#bbox', () => {
    it('returns the extent as a bbox Object', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.bbox();
      expect(result).toBeInstanceOf(Object);
      expect(result).toEqual({ minX: 0, minY: 0, maxX: 5, maxY: 10 });
    });
  });

  describe('#toParam', () => {
    it('returns the extent as a paramater string', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.toParam();
      expect(result).toBe('0,0,5,10');
    });
  });

  describe('#polygon', () => {
    it('returns the extent as a polygon wound counterclockwise', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.polygon();
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([[0, 0], [5, 0], [5, 10], [0, 10], [0, 0]]);
    });
  });

  describe('#padByMeters', () => {
    it('does not modify self', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(100);
      expect(a).toBeInstanceOf(Extent);
      expect(b).toBeInstanceOf(Extent);
      expect(a).not.toBe(b);
    });

    it('does not change centerpoint of an extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(100);
      expect(b.center()).toEqual([2.5, 5]);
    });

    it('does not affect the extent with a pad of zero', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(0);
      expect(b.min).toEqual([0, 0]);
      expect(b.max).toEqual([5, 10]);
    });
  });

  describe('#extend', () => {
    it('does not modify self or other', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([1, 1]);
      const c = a.extend(b);
      expect(a).not.toBe(b);
      expect(a).not.toBe(c);
      expect(b).not.toBe(c);
      expect(a.max).toEqual([0, 0]);  // 'a' unchanged
      expect(b.min).toEqual([1, 1]);  // 'b' unchanged
    });

    it('returns the minimal extent containing self and the given Vec2', () => {
      const a = new Extent();
      expect(a.min).toEqual([Infinity, Infinity]);
      expect(a.max).toEqual([-Infinity, -Infinity]);

      const b = a.extend([0, 0]);
      expect(b.min).toEqual([0, 0]);
      expect(b.max).toEqual([0, 0]);

      const c = b.extend([5, 10]);
      expect(c.min).toEqual([0, 0]);
      expect(c.max).toEqual([5, 10]);
    });

    it('returns the minimal extent containing self and the given Extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = new Extent([4, -1], [5, 10]);
      const c = a.extend(b);
      expect(c.min).toEqual([0, -1]);
      expect(c.max).toEqual([5, 10]);
    });
  });


  describe('#extendSelf', () => {
    it('modifies self, but not other', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([1, 1]);
      const c = a.extendSelf(b);
      expect(a).not.toBe(b);
      expect(a).toBe(c);      // a === c
      expect(b).not.toBe(c);
      expect(a.max).toEqual([1, 1]);  // 'a' changed
      expect(b.min).toEqual([1, 1]);  // 'b' unchanged
    });

    it('returns the minimal extent containing self and the given Vec2', () => {
      const a = new Extent();
      expect(a.min).toEqual([Infinity, Infinity]);
      expect(a.max).toEqual([-Infinity, -Infinity]);

      a.extendSelf([0, 0]);
      expect(a.min).toEqual([0, 0]);
      expect(a.max).toEqual([0, 0]);

      a.extendSelf([5, 10]);
      expect(a.min).toEqual([0, 0]);
      expect(a.max).toEqual([5, 10]);
    });

    it('returns the minimal extent containing self and the given Extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = new Extent([4, -1], [5, 10]);
      a.extendSelf(b);
      expect(a.min).toEqual([0, -1]);
      expect(a.max).toEqual([5, 10]);
    });
  });

  describe('#contains', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      expect(a.contains(b)).toBe(true);
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      expect(a.contains(b)).toBe(true);
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      expect(a.contains(b)).toBe(false);
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      expect(a.contains(b)).toBe(true);
      expect(b.contains(a)).toBe(false);
    });

    it('returns false for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      expect(a.contains(b)).toBe(false);
      expect(b.contains(a)).toBe(false);
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      expect(a.contains(b)).toBe(false);
      expect(b.contains(a)).toBe(false);
    });
  });

  describe('#intersects', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      expect(a.intersects(b)).toBe(true);
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      expect(a.intersects(b)).toBe(true);
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      expect(a.intersects(b)).toBe(false);
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      expect(a.intersects(b)).toBe(true);
      expect(b.intersects(a)).toBe(true);
    });

    it('returns true for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      expect(a.intersects(b)).toBe(true);
      expect(b.intersects(a)).toBe(true);
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      expect(a.intersects(b)).toBe(false);
      expect(b.intersects(a)).toBe(false);
    });
  });

  describe('#intersection', () => {
    it('returns an empty extent if self does not intersect with other', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6], [7, 7]);
      const c = new Extent();
      expect(a.intersection(b)).toEqual(c);
    });

    it('returns the intersection of self with other (1)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 4], [7, 7]);
      const c = new Extent([3, 4], [5, 5]);
      expect(a.intersection(b)).toEqual(c);
      expect(b.intersection(a)).toEqual(c);
    });

    it('returns the intersection of self with other (2)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -4], [7, 2]);
      const c = new Extent([3, 0], [5, 2]);
      expect(a.intersection(b)).toEqual(c);
      expect(b.intersection(a)).toEqual(c);
    });

    it('returns the intersection of self with other (3)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 3], [4, 7]);
      const c = new Extent([3, 3], [4, 5]);
      expect(a.intersection(b)).toEqual(c);
      expect(b.intersection(a)).toEqual(c);
    });

    it('returns the intersection of self with other (4)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -2], [4, 2]);
      const c = new Extent([3, 0], [4, 2]);
      expect(a.intersection(b)).toEqual(c);
      expect(b.intersection(a)).toEqual(c);
    });

    it('returns the intersection of self with other (5)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      const c = new Extent([1, 1], [2, 2]);
      expect(a.intersection(b)).toEqual(c);
      expect(b.intersection(a)).toEqual(c);
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
