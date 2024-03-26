import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Transform, geoZoomToScale } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/Transform', () => {
  describe('constructor', () => {
    it('creates a default Transform', () => {
      const t = new Transform();
      assert.ok(t instanceof Transform);
      assert.equal(t.x, 0);
      assert.equal(t.y, 0);
      assert.equal(t.k, 256 / Math.PI); // z1
      assert.equal(t.r, 0);
      assert.equal(t.v, 1);
    });

    it('creates a Transform from another Transform-like', () => {
      const t = new Transform({ x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 });
      assert.ok(t instanceof Transform);
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.k, 512 / Math.PI); // z2
      assert.equal(t.r, Math.PI / 2);
      assert.equal(t.v, 2);
    });

    it('constrains scale to values in z0..z24', () => {
      const t1 = new Transform({ k: geoZoomToScale(-1) });
      assert.ok(t1 instanceof Transform);
      assert.equal(t1.k, geoZoomToScale(0));
      const t2 = new Transform({ k: geoZoomToScale(25) });
      assert.ok(t2 instanceof Transform);
      assert.equal(t2.k, geoZoomToScale(24));
    });

    it('wraps rotation to values in 0..2π', () => {
      const t1 = new Transform({ r: 3 * Math.PI });
      assert.ok(t1 instanceof Transform);
      assert.equal(t1.r, Math.PI);
      const t2 = new Transform({ r: -Math.PI });
      assert.ok(t2 instanceof Transform);
      assert.equal(t2.r, Math.PI);
    });
  });

  describe('#translation', () => {
    it('sets/gets translation', () => {
      const t = new Transform();
      t.translation = [20, 30];
      assert.deepEqual(t.translation, [20, 30]);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.translation = [20, 30];
      assert.equal(t.v, v0 + 1);  // increment once
      t.translation = [20, 30];
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.translation = Infinity;
      assert.deepEqual(t.translation, [0, 0]);
      t.translation = NaN;
      assert.deepEqual(t.translation, [0, 0]);
      t.translation = 'fake';
      assert.deepEqual(t.translation, [0, 0]);
      assert.equal(t.v, v0);  // no increment
    });
  });

  describe('#scale', () => {
    it('sets/gets scale', () => {
      const t = new Transform();
      t.scale = 512 / Math.PI;
      assert.equal(t.scale, 512 / Math.PI);
    });

    it('constrains scale to values in z0..z24', () => {
      const t = new Transform();
      t.scale = geoZoomToScale(-1);
      assert.equal(t.scale, geoZoomToScale(0));
      t.scale = geoZoomToScale(25);
      assert.equal(t.scale, geoZoomToScale(24));
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.scale = 512 / Math.PI;
      assert.equal(t.v, v0 + 1);  // increment once
      t.scale = 512 / Math.PI;
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.scale = Infinity;
      assert.deepEqual(t.scale, 256 / Math.PI);
      t.scale = NaN;
      assert.deepEqual(t.scale, 256 / Math.PI);
      t.scale = 'fake';
      assert.deepEqual(t.scale, 256 / Math.PI);
      assert.equal(t.v, v0);  // no increment
    });
  });

  describe('#zoom', () => {
    it('sets/gets zoom', () => {
      const t = new Transform();
      t.zoom = 2;
      assert.equal(t.zoom, 2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t = new Transform();
      t.zoom = -1;
      assert.equal(t.zoom, 0);
      t.zoom = 25;
      assert.equal(t.zoom, 24);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.zoom = 2;
      assert.equal(t.v, v0 + 1);  // increment once
      t.zoom = 2;
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.zoom = Infinity;
      assert.deepEqual(t.zoom, 1);
      t.zoom = NaN;
      assert.deepEqual(t.zoom, 1);
      t.zoom = 'fake';
      assert.deepEqual(t.zoom, 1);
      assert.equal(t.v, v0);  // no increment
    });
  });

  describe('#rotation', () => {
    it('sets/gets rotation', () => {
      const t = new Transform();
      t.rotation = Math.PI;
      assert.equal(t.rotation, Math.PI);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t = new Transform();
      t.rotation = 3 * Math.PI;
      assert.equal(t.rotation, Math.PI);
      t.rotation = -Math.PI;
      assert.equal(t.rotation, Math.PI);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = Math.PI;
      assert.equal(t.v, v0 + 1);  // increment once
      t.rotation = Math.PI;
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = Infinity;
      assert.deepEqual(t.rotation, 0);
      t.rotation = NaN;
      assert.deepEqual(t.rotation, 0);
      t.rotation = 'fake';
      assert.deepEqual(t.rotation, 0);
      assert.equal(t.v, v0);  // no increment
    });
  });

  describe('#props', () => {
    it('sets/gets props', () => {
      const t = new Transform();
      assert.deepEqual(t.props, { x: 0, y: 0, k: 256 / Math.PI, r: 0 });
      assert.equal(t.v, 1);

      t.props = { x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 };
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.k, 512 / Math.PI); // z2
      assert.equal(t.r, Math.PI / 2);
      assert.equal(t.v, 2);
    });

    it('constrains scale to values in z0..z24', () => {
      const t = new Transform();
      t.props = { k: geoZoomToScale(-1) };
      assert.equal(t.scale, geoZoomToScale(0));
      t.props = { k: geoZoomToScale(25) };
      assert.equal(t.scale, geoZoomToScale(24));
    });

    it('wraps rotation to values in 0..2π', () => {
      const t = new Transform();
      t.props = { r: 3 * Math.PI };
      assert.equal(t.rotation, Math.PI);
      t.props = { r: -Math.PI };
      assert.equal(t.rotation, Math.PI);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.props = { x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 };
      assert.equal(t.v, v0 + 1);  // increment once
      t.props = { x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 };
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      t.props = { x: Infinity, y: NaN, k: null, r: '', fake: 10 };
      assert.deepEqual(t.props, { x: 0, y: 0, k: 256 / Math.PI, r: 0 });
    });
  });

});
