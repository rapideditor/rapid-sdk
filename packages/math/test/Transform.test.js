import { describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import { ANGLE_EPSILON, HALF_PI, TAU, Transform } from '../src/index.ts';


describe('math/Transform', () => {
  describe('constructor', () => {
    it('creates a default Transform', () => {
      const t = new Transform();
      assert.ok(t instanceof Transform);
      assert.equal(t.x, 0);
      assert.equal(t.y, 0);
      assert.equal(t.z, 1);
      assert.equal(t.r, 0);
      assert.equal(t.v, 1);
    });

    it('creates a Transform from another Transform-like', () => {
      const t = new Transform({ x: '20', y: '30', z: '2', r: HALF_PI });
      assert.ok(t instanceof Transform);
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.z, 2);
      assert.equal(t.r, HALF_PI);
      assert.equal(t.v, 2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t1 = new Transform({ z: -1 });
      assert.ok(t1 instanceof Transform);
      assert.equal(t1.z, 0);
      const t2 = new Transform({ z: 25 });
      assert.ok(t2 instanceof Transform);
      assert.equal(t2.z, 24);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t1 = new Transform({ r: 3 * Math.PI });
      assert.ok(t1 instanceof Transform);
      assert.equal(t1.r, Math.PI);
      const t2 = new Transform({ r: -Math.PI });
      assert.ok(t2 instanceof Transform);
      assert.equal(t2.r, Math.PI);
    });

    it('snaps near-zero wrapped rotations to 0', () => {
      const t1 = new Transform({ r: ANGLE_EPSILON / 2 });
      assert.ok(t1 instanceof Transform);
      assert.equal(t1.r, 0);

      const t2 = new Transform({ r: TAU - (ANGLE_EPSILON / 2) });
      assert.ok(t2 instanceof Transform);
      assert.equal(t2.r, 0);
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

    it('snaps near-zero wrapped rotations to 0', () => {
      const t = new Transform();
      t.rotation = ANGLE_EPSILON / 2;
      assert.equal(t.rotation, 0);
      t.rotation = TAU - (ANGLE_EPSILON / 2);
      assert.equal(t.rotation, 0);
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

    it('does not increment version for tiny near-zero rotations from 0', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = ANGLE_EPSILON / 2;
      assert.equal(t.rotation, 0);
      assert.equal(t.v, v0);
      t.rotation = TAU - (ANGLE_EPSILON / 2);
      assert.equal(t.rotation, 0);
      assert.equal(t.v, v0);
    });
  });

  describe('#props', () => {
    it('sets/gets props', () => {
      const t = new Transform();
      assert.deepEqual(t.props, { x: 0, y: 0, z: 1, r: 0 });
      assert.equal(t.v, 1);

      t.props = { x: '20', y: '30', z: '2', r: HALF_PI };
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.z, 2);
      assert.equal(t.r, HALF_PI);
      assert.equal(t.v, 2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t = new Transform();
      t.props = { z: -1 };
      assert.equal(t.zoom, 0);
      t.props = { z: 25 };
      assert.equal(t.zoom, 24);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t = new Transform();
      t.props = { r: 3 * Math.PI };
      assert.equal(t.rotation, Math.PI);
      t.props = { r: -Math.PI };
      assert.equal(t.rotation, Math.PI);
    });

    it('snaps near-zero wrapped rotations to 0', () => {
      const t = new Transform();
      t.props = { r: ANGLE_EPSILON / 2 };
      assert.equal(t.rotation, 0);
      t.props = { r: TAU - (ANGLE_EPSILON / 2) };
      assert.equal(t.rotation, 0);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.props = { x: '20', y: '30', z: '2', r: HALF_PI };
      assert.equal(t.v, v0 + 1);  // increment once
      t.props = { x: '20', y: '30', z: '2', r: HALF_PI };
      assert.equal(t.v, v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      t.props = { x: Infinity, y: NaN, z: null, r: '', fake: 10 };
      assert.deepEqual(t.props, { x: 0, y: 0, z: 1, r: 0 });
    });
  });

});
