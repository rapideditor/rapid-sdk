/**
 * Constants
 * @module
 */

export const TAU = 2 * Math.PI;
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const HALF_PI = Math.PI / 2;
export const QUARTER_PI = Math.PI / 4;
export const ANGLE_EPSILON = 1e-12;

export const MIN_Z = 0;
export const MAX_Z = 24;

export const WORLD_ZOOM = 16;
export const WORLD_SCALE = 2 ** WORLD_ZOOM;
export const WORLD_SIZE = 256 * WORLD_SCALE;   // 16_777_216
export const WORLD_HALF = WORLD_SIZE / 2; // 8_388_608 — the Mercator origin (Null Island)

export const MAX_PHI = 2 * Math.atan(Math.exp(Math.PI)) - HALF_PI;  // 85.0511287798 in radians
export const MIN_PHI = -MAX_PHI;

export const EQUATORIAL_RADIUS = 6378137.0;
export const POLAR_RADIUS = 6356752.314245179;
