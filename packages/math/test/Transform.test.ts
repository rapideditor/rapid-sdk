import { describe, expect, it } from 'bun:test';
import { ANGLE_EPSILON, HALF_PI, TAU, Transform } from '../src/index.ts';


describe('math/Transform', () => {
  describe('constructor', () => {
    it('creates a default Transform', () => {
      const t = new Transform();
      expect(t).toBeInstanceOf(Transform);
      expect(t.x).toBe(0);
      expect(t.y).toBe(0);
      expect(t.z).toBe(1);
      expect(t.r).toBe(0);
      expect(t.v).toBe(1);
    });

    it('creates a Transform from another Transform-like', () => {
      const t = new Transform({ x: '20', y: '30', z: '2', r: HALF_PI } as any);
      expect(t).toBeInstanceOf(Transform);
      expect(t.x).toBe(20);
      expect(t.y).toBe(30);
      expect(t.z).toBe(2);
      expect(t.r).toBe(HALF_PI);
      expect(t.v).toBe(2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t1 = new Transform({ z: -1 });
      expect(t1).toBeInstanceOf(Transform);
      expect(t1.z).toBe(0);
      const t2 = new Transform({ z: 25 });
      expect(t2).toBeInstanceOf(Transform);
      expect(t2.z).toBe(24);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t1 = new Transform({ r: 3 * Math.PI });
      expect(t1).toBeInstanceOf(Transform);
      expect(t1.r).toBe(Math.PI);
      const t2 = new Transform({ r: -Math.PI });
      expect(t2).toBeInstanceOf(Transform);
      expect(t2.r).toBe(Math.PI);
    });

    it('snaps near-zero wrapped rotations to 0', () => {
      const t1 = new Transform({ r: ANGLE_EPSILON / 2 });
      expect(t1).toBeInstanceOf(Transform);
      expect(t1.r).toBe(0);

      const t2 = new Transform({ r: TAU - (ANGLE_EPSILON / 2) });
      expect(t2).toBeInstanceOf(Transform);
      expect(t2.r).toBe(0);
    });
  });

  describe('#translation', () => {
    it('sets/gets translation', () => {
      const t = new Transform();
      t.translation = [20, 30];
      expect(t.translation).toEqual([20, 30]);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.translation = [20, 30];
      expect(t.v).toBe(v0 + 1);  // increment once
      t.translation = [20, 30];
      expect(t.v).toBe(v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.translation = Infinity as any;
      expect(t.translation).toEqual([0, 0]);
      t.translation = NaN as any;
      expect(t.translation).toEqual([0, 0]);
      t.translation = 'fake' as any;
      expect(t.translation).toEqual([0, 0]);
      expect(t.v).toBe(v0);  // no increment
    });
  });

  describe('#zoom', () => {
    it('sets/gets zoom', () => {
      const t = new Transform();
      t.zoom = 2;
      expect(t.zoom).toBe(2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t = new Transform();
      t.zoom = -1;
      expect(t.zoom).toBe(0);
      t.zoom = 25;
      expect(t.zoom).toBe(24);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.zoom = 2;
      expect(t.v).toBe(v0 + 1);  // increment once
      t.zoom = 2;
      expect(t.v).toBe(v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.zoom = Infinity;
      expect(t.zoom).toEqual(1);
      t.zoom = NaN;
      expect(t.zoom).toEqual(1);
      t.zoom = 'fake' as any;
      expect(t.zoom).toEqual(1);
      expect(t.v).toBe(v0);  // no increment
    });
  });

  describe('#rotation', () => {
    it('sets/gets rotation', () => {
      const t = new Transform();
      t.rotation = Math.PI;
      expect(t.rotation).toBe(Math.PI);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t = new Transform();
      t.rotation = 3 * Math.PI;
      expect(t.rotation).toBe(Math.PI);
      t.rotation = -Math.PI;
      expect(t.rotation).toBe(Math.PI);
    });

    it('snaps near-zero wrapped rotations to 0', () => {
      const t = new Transform();
      t.rotation = ANGLE_EPSILON / 2;
      expect(t.rotation).toBe(0);
      t.rotation = TAU - (ANGLE_EPSILON / 2);
      expect(t.rotation).toBe(0);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = Math.PI;
      expect(t.v).toBe(v0 + 1);  // increment once
      t.rotation = Math.PI;
      expect(t.v).toBe(v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = Infinity;
      expect(t.rotation).toEqual(0);
      t.rotation = NaN;
      expect(t.rotation).toEqual(0);
      t.rotation = 'fake' as any;
      expect(t.rotation).toEqual(0);
      expect(t.v).toBe(v0);  // no increment
    });

    it('does not increment version for tiny near-zero rotations from 0', () => {
      const t = new Transform();
      const v0 = t.v;
      t.rotation = ANGLE_EPSILON / 2;
      expect(t.rotation).toBe(0);
      expect(t.v).toBe(v0);
      t.rotation = TAU - (ANGLE_EPSILON / 2);
      expect(t.rotation).toBe(0);
      expect(t.v).toBe(v0);
    });
  });

  describe('#props', () => {
    it('sets/gets props', () => {
      const t = new Transform();
      expect(t.props).toEqual({ x: 0, y: 0, z: 1, r: 0 });
      expect(t.v).toBe(1);

      t.props = { x: '20', y: '30', z: '2', r: HALF_PI } as any;
      expect(t.x).toBe(20);
      expect(t.y).toBe(30);
      expect(t.z).toBe(2);
      expect(t.r).toBe(HALF_PI);
      expect(t.v).toBe(2);
    });

    it('constrains zoom to values in z0..z24', () => {
      const t = new Transform();
      t.props = { z: -1 };
      expect(t.zoom).toBe(0);
      t.props = { z: 25 };
      expect(t.zoom).toBe(24);
    });

    it('wraps rotation to values in 0..2π', () => {
      const t = new Transform();
      t.props = { r: 3 * Math.PI };
      expect(t.rotation).toBe(Math.PI);
      t.props = { r: -Math.PI };
      expect(t.rotation).toBe(Math.PI);
    });

    it('snaps near-zero wrapped rotations to 0', () => {
      const t = new Transform();
      t.props = { r: ANGLE_EPSILON / 2 };
      expect(t.rotation).toBe(0);
      t.props = { r: TAU - (ANGLE_EPSILON / 2) };
      expect(t.rotation).toBe(0);
    });

    it('increments version only on actual change', () => {
      const t = new Transform();
      const v0 = t.v;
      t.props = { x: '20', y: '30', z: '2', r: HALF_PI } as any;
      expect(t.v).toBe(v0 + 1);  // increment once
      t.props = { x: '20', y: '30', z: '2', r: HALF_PI } as any;
      expect(t.v).toBe(v0 + 1);  // no increment
    });

    it('ignores invalid values', () => {
      const t = new Transform();
      t.props = { x: Infinity, y: NaN, z: null, r: '', fake: 10 } as any;
      expect(t.props).toEqual({ x: 0, y: 0, z: 1, r: 0 });
    });
  });

});
