import { describe, expect, it } from 'bun:test';
import {
  HALF_PI, WORLD_HALF, WORLD_SCALE, WORLD_SIZE,
  projScreenToWorld, projWgs84ToWorld, projWorldToScreen, projWorldToWgs84
} from '../src/index.ts';

import type { TransformProps, Vec2 } from '../src/index.ts';


describe('math/proj', () => {

  describe('#projWgs84ToWorld', () => {
    it(`Projects [0°, 0°] -> [${WORLD_HALF}, ${WORLD_HALF}]`, () => {
      const point = projWgs84ToWorld([0, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_HALF, 5);
      expect(point[1]).toBeCloseTo(WORLD_HALF, 5);
    });

    it(`Projects [-180°, 85.0511287798°] -> [0, 0]`, () => {
      const point = projWgs84ToWorld([-180, 85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 5);
      expect(point[1]).toBeCloseTo(0, 5);
    });

    it(`Projects [-180°, -85.0511287798°] -> [0, ${WORLD_SIZE}]`, () => {
      const point = projWgs84ToWorld([-180, -85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 5);
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);
    });

    it(`Projects [180°, 85.0511287798°] -> [${WORLD_SIZE}, 0]`, () => {
      const point = projWgs84ToWorld([180, 85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_SIZE, 5);
      expect(point[1]).toBeCloseTo(0, 5);
    });

    it(`Projects [180°, -85.0511287798°] -> [${WORLD_SIZE}, ${WORLD_SIZE}]`, () => {
      const point = projWgs84ToWorld([180, -85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_SIZE, 5);
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);
    });

    it(`Projects out of bounds [-270°, 95°] -> [${-WORLD_SIZE / 4}, 0]`, () => {
      const point = projWgs84ToWorld([-270, 95]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-WORLD_SIZE / 4, 5);  // wrap x
      expect(point[1]).toBeCloseTo(0, 5);                // clamp y
    });

    it(`Projects out of bounds [270°, -95°] -> [${5 * WORLD_SIZE / 4}, ${WORLD_SIZE}]`, () => {
      const point = projWgs84ToWorld([270, -95]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(5 * WORLD_SIZE / 4, 5);  // wrap x
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);          // clamp y
    });
  });


  describe('#projWorldToWgs84', () => {
    it(`Unprojects [${WORLD_HALF}, ${WORLD_HALF}] -> [0°, 0°]`, () => {
      const point = projWorldToWgs84([WORLD_HALF, WORLD_HALF]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 9);
      expect(point[1]).toBeCloseTo(0, 9);
    });

    it(`Unprojects [0, 0] -> [-180°, 85.0511287798°]`, () => {
      const point = projWorldToWgs84([0, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-180, 9);
      expect(point[1]).toBeCloseTo(85.0511287798, 9);
    });

    it(`Unprojects [0, ${WORLD_SIZE}] -> [-180°, -85.0511287798°]`, () => {
      const point = projWorldToWgs84([0, WORLD_SIZE]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-180, 9);
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);
    });

    it(`Unprojects [${WORLD_SIZE}, 0] -> [180°, 85.0511287798°]`, () => {
      const point = projWorldToWgs84([WORLD_SIZE, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(180, 9);
      expect(point[1]).toBeCloseTo(85.0511287798, 9);
    });

    it(`Unprojects [${WORLD_SIZE}, ${WORLD_SIZE}] -> [180°, -85.0511287798°]`, () => {
      const point = projWorldToWgs84([WORLD_SIZE, WORLD_SIZE]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(180, 9);
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);
    });

    it(`Unprojects out of bounds [${-WORLD_SIZE / 4}, ${-WORLD_SIZE / 4}] -> [-270°, 85.0511287798°]`, () => {
      const point = projWorldToWgs84([-WORLD_SIZE / 4, -WORLD_SIZE / 4]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-270, 9);           // wrap x
      expect(point[1]).toBeCloseTo(85.0511287798, 9);  // clamp y
    });

    it(`Unprojects out of bounds [${5 * WORLD_SIZE / 4}, ${5 * WORLD_SIZE / 4}] -> [270°, -85.0511287798°] -> `, () => {
      const point = projWorldToWgs84([5 * WORLD_SIZE / 4, 5 * WORLD_SIZE / 4]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(270, 9);             // wrap x
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);  // clamp y
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
      // 32 * WORLD_SCALE world units = 64 screen px at z=1, regardless of WORLD_ZOOM
      const world: Vec2 = [WORLD_HALF + (32 * WORLD_SCALE), WORLD_HALF];

      const screen = projWorldToScreen(world, rotated, center, true);
      expect(screen[0]).toBeCloseTo(128, 9);
      expect(screen[1]).toBeCloseTo(192, 9);

      const roundtrip = projScreenToWorld(screen, rotated, center, true);
      expect(roundtrip[0]).toBeCloseTo(world[0], 9);
      expect(roundtrip[1]).toBeCloseTo(world[1], 9);
    });
  });
});
