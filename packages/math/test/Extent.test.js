import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Extent } from '../built/math.mjs';


describe('math/extent', () => {
  describe('constructor', () => {
    it('defaults to infinitely empty extent', () => {
      const e = new Extent();
      assert.ok(e instanceof Extent);
      assert.deepEqual(e.min, [Infinity, Infinity]);
      assert.deepEqual(e.max, [-Infinity, -Infinity]);
    });

    it('constructs via a point', () => {
      const p = [0, 0];
      const e = new Extent(p);
      assert.ok(e instanceof Extent);
      assert.deepEqual(e.min, p);
      assert.deepEqual(e.max, p);
    });

    it('constructs via two points', () => {
      const min = [0, 0];
      const max = [5, 10];
      const e = new Extent(min, max);
      assert.ok(e instanceof Extent);
      assert.deepEqual(e.min, min);
      assert.deepEqual(e.max, max);
    });

    it('constructs via an Extent', () => {
      const min = [0, 0];
      const max = [5, 10];
      const a = new Extent(min, max);
      const b = new Extent(a);
      assert.ok(a instanceof Extent);
      assert.ok(b instanceof Extent);
      assert.notEqual(a, b);
      assert.deepEqual(b.min, min);
      assert.deepEqual(b.max, max);
    });
  });

  describe('#equals', () => {
    it('tests extent equality', () => {
      const a = new Extent([0, 0], [10, 10]);
      const b = new Extent([0, 0], [10, 10]);
      const c = new Extent([0, 0], [12, 12]);
      assert.equal(a.equals(b), true);
      assert.equal(a.equals(c), false);
    });
  });

  describe('#area', () => {
    it('returns the area', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.area();
      assert.equal(result, 50);
    });
  });

  describe('#center', () => {
    it('returns the center point', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.center();
      assert.ok(result instanceof Array);
      assert.deepEqual(result, [2.5, 5]);
    });
  });

  describe('#rectangle', () => {
    it('returns the Extent as a rectangle Array', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.rectangle();
      assert.ok(result instanceof Array);
      assert.deepEqual(result, [0, 0, 5, 10]);
    });
  });

  describe('#bbox', () => {
    it('returns the extent as a bbox Object', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.bbox();
      assert.ok(result instanceof Object);
      assert.deepEqual(result, { minX: 0, minY: 0, maxX: 5, maxY: 10 });
    });
  });

  describe('#toParam', () => {
    it('returns the extent as a paramater string', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.toParam();
      assert.equal(result, '0,0,5,10');
    });
  });

  describe('#polygon', () => {
    it('returns the extent as a polygon', () => {
      const e = new Extent([0, 0], [5, 10]);
      const result = e.polygon();
      assert.ok(result instanceof Array);
      assert.deepEqual(result, [ [0, 0], [0, 10], [5, 10], [5, 0], [0, 0] ]);
    });
  });

  describe('#padByMeters', () => {
    it('does not modify self', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(100);
      assert.ok(a instanceof Extent);
      assert.ok(b instanceof Extent);
      assert.notEqual(a, b);
    });

    it('does not change centerpoint of an extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(100);
      assert.deepEqual(b.center(), [2.5, 5]);
    });

    it('does not affect the extent with a pad of zero', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = a.padByMeters(0);
      assert.deepEqual(b.min, [0, 0]);
      assert.deepEqual(b.max, [5, 10]);
    });
  });

  describe('#extend', () => {
    it('does not modify self or other', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([1, 1]);
      const c = a.extend(b);
      assert.notEqual(a, b);
      assert.notEqual(a, c);
      assert.notEqual(b, c);
      assert.deepEqual(a.max, [0, 0]);  // 'a' unchanged
      assert.deepEqual(b.min, [1, 1]);  // 'b' unchanged
    });

    it('returns the minimal extent containing self and the given Vec2', () => {
      const a = new Extent();
      assert.deepEqual(a.min, [Infinity, Infinity]);
      assert.deepEqual(a.max, [-Infinity, -Infinity]);

      const b = a.extend([0, 0]);
      assert.deepEqual(b.min, [0, 0]);
      assert.deepEqual(b.max, [0, 0]);

      const c = b.extend([5, 10]);
      assert.deepEqual(c.min, [0, 0]);
      assert.deepEqual(c.max, [5, 10]);
    });

    it('returns the minimal extent containing self and the given Extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = new Extent([4, -1], [5, 10]);
      const c = a.extend(b);
      assert.deepEqual(c.min, [0, -1]);
      assert.deepEqual(c.max, [5, 10]);
    });
  });


  describe('#extendSelf', () => {
    it('modifies self, but not other', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([1, 1]);
      const c = a.extendSelf(b);
      assert.notEqual(a, b);
      assert.equal(a, c);      // a === c
      assert.notEqual(b, c);
      assert.deepEqual(a.max, [1, 1]);  // 'a' changed
      assert.deepEqual(b.min, [1, 1]);  // 'b' unchanged
    });

    it('returns the minimal extent containing self and the given Vec2', () => {
      const a = new Extent();
      assert.deepEqual(a.min, [Infinity, Infinity]);
      assert.deepEqual(a.max, [-Infinity, -Infinity]);

      a.extendSelf([0, 0]);
      assert.deepEqual(a.min, [0, 0]);
      assert.deepEqual(a.max, [0, 0]);

      a.extendSelf([5, 10]);
      assert.deepEqual(a.min, [0, 0]);
      assert.deepEqual(a.max, [5, 10]);
    });

    it('returns the minimal extent containing self and the given Extent', () => {
      const a = new Extent([0, 0], [5, 10]);
      const b = new Extent([4, -1], [5, 10]);
      a.extendSelf(b);
      assert.deepEqual(a.min, [0, -1]);
      assert.deepEqual(a.max, [5, 10]);
    });
  });

  describe('#contains', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      assert.equal(a.contains(b), true);
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      assert.equal(a.contains(b), true);
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      assert.equal(a.contains(b), false);
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      assert.equal(a.contains(b), true);
      assert.equal(b.contains(a), false);
    });

    it('returns false for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      assert.equal(a.contains(b), false);
      assert.equal(b.contains(a), false);
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      assert.equal(a.contains(b), false);
      assert.equal(b.contains(a), false);
    });
  });

  describe('#intersects', () => {
    it('returns true for a point inside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([2, 2]);
      assert.equal(a.intersects(b), true);
    });

    it('returns true for a point on the boundary of self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([0, 0]);
      assert.equal(a.intersects(b), true);
    });

    it('returns false for a point outside self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6]);
      assert.equal(a.intersects(b), false);
    });

    it('returns true for an extent contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      assert.equal(a.intersects(b), true);
      assert.equal(b.intersects(a), true);
    });

    it('returns true for an extent partially contained by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [6, 6]);
      assert.equal(a.intersects(b), true);
      assert.equal(b.intersects(a), true);
    });

    it('returns false for an extent not intersected by self', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 7], [7, 7]);
      assert.equal(a.intersects(b), false);
      assert.equal(b.intersects(a), false);
    });
  });

  describe('#intersection', () => {
    it('returns an empty extent if self does not intersect with other', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([6, 6], [7, 7]);
      const c = new Extent();
      assert.deepEqual(a.intersection(b), c);
    });

    it('returns the intersection of self with other (1)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 4], [7, 7]);
      const c = new Extent([3, 4], [5, 5]);
      assert.deepEqual(a.intersection(b), c);
      assert.deepEqual(b.intersection(a), c);
    });

    it('returns the intersection of self with other (2)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -4], [7, 2]);
      const c = new Extent([3, 0], [5, 2]);
      assert.deepEqual(a.intersection(b), c);
      assert.deepEqual(b.intersection(a), c);
    });

    it('returns the intersection of self with other (3)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, 3], [4, 7]);
      const c = new Extent([3, 3], [4, 5]);
      assert.deepEqual(a.intersection(b), c);
      assert.deepEqual(b.intersection(a), c);
    });

    it('returns the intersection of self with other (4)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([3, -2], [4, 2]);
      const c = new Extent([3, 0], [4, 2]);
      assert.deepEqual(a.intersection(b), c);
      assert.deepEqual(b.intersection(a), c);
    });

    it('returns the intersection of self with other (5)', () => {
      const a = new Extent([0, 0], [5, 5]);
      const b = new Extent([1, 1], [2, 2]);
      const c = new Extent([1, 1], [2, 2]);
      assert.deepEqual(a.intersection(b), c);
      assert.deepEqual(b.intersection(a), c);
    });
  });

  describe('#percentContainedIn', () => {
    it('returns 0 if either extent is infinite', () => {
      const a = new Extent();
      const b = new Extent([0, 3], [4, 1]);
      assert.equal(a.percentContainedIn(b), 0);
      assert.equal(b.percentContainedIn(a), 0);
    });

    it('returns 0 if extent w/o area does not intersect other extent w/o area', () => {
      const a = new Extent([5, 5], [5, 5]);
      const b = new Extent([2, 2], [2, 2]);
      assert.equal(a.percentContainedIn(b), 0);
      assert.equal(b.percentContainedIn(a), 0);
    });

    it('returns 1 if extent w/o area touching other extent w/ area', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([0, 0], [1, 1]);
      assert.equal(a.percentContainedIn(b), 1);
    });

    it('returns 1 if extent w/o area touching (i.e. same as) other extent w/o area', () => {
      const a = new Extent([0, 0], [0, 0]);
      const b = new Extent([0, 0], [0, 0]);
      assert.equal(a.percentContainedIn(b), 1);
      assert.equal(b.percentContainedIn(a), 1);
    });

    it('returns 0 if extent w/ area touching other extent w/ area (zero-area intersection, corners touch only)', () => {
      const a = new Extent([0, 0], [1, 1]);
      const b = new Extent([1, 1], [2, 2]);
      assert.equal(a.percentContainedIn(b), 0);
      assert.equal(b.percentContainedIn(a), 0);
    });

    it('returns 0 if extent w/ area does not intersect other extent w/ area', () => {
      const a = new Extent([0, 0], [1, 1]);
      const b = new Extent([0, 3], [4, 1]);
      assert.equal(a.percentContainedIn(b), 0);
      assert.equal(b.percentContainedIn(a), 0);
    });

    it('returns the percent contained of self with other (1)', () => {
      const a = new Extent([0, 0], [2, 1]);
      const b = new Extent([1, 0], [3, 1]);
      assert.equal(a.percentContainedIn(b), 0.5);
      assert.equal(b.percentContainedIn(a), 0.5);
    });

    it('returns the percent contained of self with other (2)', () => {
      const a = new Extent([0, 0], [4, 1]);
      const b = new Extent([3, 0], [4, 2]);
      assert.equal(a.percentContainedIn(b), 0.25);
      assert.equal(b.percentContainedIn(a), 0.5);
    });
  });
});
