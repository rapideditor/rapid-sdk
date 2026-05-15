import { describe, expect, it } from 'bun:test';
import { HALF_PI, WORLD_HALF, projScreenToWorld, projWgs84ToWorld, projWorldToScreen, projWorldToWgs84 } from '../src/index.ts';

import type { TransformProps, Vec2 } from '../src/index.ts';


describe('math/proj', () => {
  describe('projWgs84ToWorld / projWorldToWgs84', () => {
    it('converts [0, 0] in both directions', () => {
      const world = projWgs84ToWorld([0, 0]);
      expect(world[0]).toBeCloseTo(WORLD_HALF, 9);
      expect(world[1]).toBeCloseTo(WORLD_HALF, 9);

      const wgs84 = projWorldToWgs84(world);
      expect(wgs84[0]).toBeCloseTo(0, 9);
      expect(wgs84[1]).toBeCloseTo(0, 9);
    });

    it('clamps latitude beyond mercator limits', () => {
      const north = projWgs84ToWorld([-180, 95]);
      const south = projWgs84ToWorld([180, -95]);
      expect(north[1]).toBeCloseTo(0, 3);
      expect(south[1]).toBeGreaterThan(north[1]);
    });
  });

  describe('projWorldToScreen / projScreenToWorld', () => {
    const center: Vec2 = [128, 128];
    const transform: Required<TransformProps> = { x: 128, y: 128, z: 1, r: 0 };

    it('applies transform without rotation', () => {
      const world: Vec2 = [WORLD_HALF, WORLD_HALF];
      const screen = projWorldToScreen(world, transform, center, false);
      expect(screen).toEqual([128, 128]);

      const roundtrip = projScreenToWorld(screen, transform, center, false);
      expect(roundtrip[0]).toBeCloseTo(world[0], 9);
      expect(roundtrip[1]).toBeCloseTo(world[1], 9);
    });

    it('applies and removes rotation when requested', () => {
      const rotated: Required<TransformProps> = { ...transform, r: HALF_PI };
      const world: Vec2 = [WORLD_HALF + 2097152, WORLD_HALF];

      const screen = projWorldToScreen(world, rotated, center, true);
      expect(screen[0]).toBeCloseTo(128, 9);
      expect(screen[1]).toBeCloseTo(192, 9);

      const roundtrip = projScreenToWorld(screen, rotated, center, true);
      expect(roundtrip[0]).toBeCloseTo(world[0], 9);
      expect(roundtrip[1]).toBeCloseTo(world[1], 9);
    });
  });
});
