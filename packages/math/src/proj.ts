
/**
 * 📽️ Pure projection and transform helpers
 * @module
 */

import { ANGLE_EPSILON, DEG2RAD, MAX_PHI, MIN_PHI, RAD2DEG, TAU, WORLD_HALF, WORLD_SIZE, WORLD_ZOOM } from './constants.ts';
import { numClamp } from './number.ts';
import { vecRotate } from './vector.ts';

import type { TransformProps, Vec2 } from './types.ts';


/** Converts Lon/Lat [λ,φ] in WGS84 into pre-scaled world coordinates [x,y].
 * @param loc WGS84 coordinate [lon, lat]
 * @returns world coordinate [x, y]
 */
export function projWgs84ToWorld(loc: Vec2): Vec2 {
  const x = (loc[0] + 180) / 360 * WORLD_SIZE;
  const phi = numClamp(loc[1] * DEG2RAD, MIN_PHI, MAX_PHI);
  const y = ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * WORLD_SIZE;
  return [x, y];
}


/** Converts pre-scaled world coordinates [x,y] into WGS84 Lon/Lat [λ,φ].
 * @param world world coordinate [x, y]
 * @returns WGS84 coordinate [lon, lat]
 */
export function projWorldToWgs84(world: Vec2): Vec2 {
  const lon = (world[0] / WORLD_SIZE) * 360 - 180;
  const n = Math.PI - TAU * (world[1] / WORLD_SIZE);
  const phi = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const lat = numClamp(phi, MIN_PHI, MAX_PHI) * RAD2DEG;
  return [lon, lat];
}


/** Converts world coordinate to screen coordinate by applying a transform.
 * @param world world coordinate [x, y]
 * @param transform transform properties `{x,y,z,r}`
 * @param center screen center [x, y], used when applying rotation
 * @param includeRotation if true, apply transform rotation
 * @returns screen coordinate [x, y]
 */
export function projWorldToScreen(
  world: Vec2,
  transform: Required<TransformProps>,
  center: Vec2,
  includeRotation?: boolean
): Vec2 {
  const { x, y, z, r } = transform;
  const scale = 2 ** (z - WORLD_ZOOM);  // world coords are pre-scaled to WORLD_ZOOM

  const point: Vec2 = [
    ((world[0] - WORLD_HALF) * scale) + x,
    ((world[1] - WORLD_HALF) * scale) + y
  ];

  if (includeRotation && Math.abs(r) > ANGLE_EPSILON) {
    return vecRotate(point, r, center);
  } else {
    return point;
  }
}


/** Converts screen coordinate to world coordinate by applying an inverse transform.
 * @param screen screen coordinate [x, y]
 * @param transform transform properties `{x,y,z,r}`
 * @param center screen center [x, y], used when removing rotation
 * @param includeRotation if true, remove transform rotation
 * @returns world coordinate [x, y]
 */
export function projScreenToWorld(
  screen: Vec2,
  transform: Required<TransformProps>,
  center: Vec2,
  includeRotation?: boolean
): Vec2 {
  const { x, y, z, r } = transform;
  const rotated = (includeRotation && Math.abs(r) > ANGLE_EPSILON)
    ? vecRotate(screen, -r, center)
    : screen;

  const scale = 2 ** (z - WORLD_ZOOM);  // world coords are pre-scaled to WORLD_ZOOM
  return [
    ((rotated[0] - x) / scale) + WORLD_HALF,
    ((rotated[1] - y) / scale) + WORLD_HALF
  ];
}
