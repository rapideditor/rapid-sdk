/**
 * 🌐 Geographic (spherical) math functions
 * @module
 */

import { TAU, DEG2RAD, POLAR_RADIUS, EQUATORIAL_RADIUS } from './constants';
import { Vec2 } from './vector';


/** Convert degrees latitude to meters.
 * @param dLat degrees latitude
 * @returns meters
 * @example
 * geoLatToMeters(1);  // returns ≈110946
 */
export function geoLatToMeters(dLat: number): number {
  return dLat * ((TAU * POLAR_RADIUS) / 360);
}


/** Convert degrees longitude to meters at a given latitude
 * @param dLon longitude
 * @param atLat latitude
 * @returns meters
 * @example
 * geoLonToMeters(1, 0);  // returns ≈111319 at equator
 */
export function geoLonToMeters(dLon: number, atLat: number): number {
  return Math.abs(atLat) >= 90
    ? 0
    : dLon * ((TAU * EQUATORIAL_RADIUS) / 360) * Math.abs(Math.cos(atLat * DEG2RAD));
}


/** Convert meters to degrees latitude
 * @param m meters
 * @returns degrees latitude
 * @example
 * geoMetersToLat(110946);  // returns ≈1°
 */
export function geoMetersToLat(m: number): number {
  return m / ((TAU * POLAR_RADIUS) / 360);
}


/** Convert meters to degrees longitude at a given latitude
 * @param m meters
 * @param atLat latitude
 * @returns degrees longitude
 * @example
 * geoMetersToLon(110946, 0);  // returns ≈1° at equator
 */
export function geoMetersToLon(m: number, atLat: number): number {
  return Math.abs(atLat) >= 90
    ? 0
    : m / ((TAU * EQUATORIAL_RADIUS) / 360) / Math.abs(Math.cos(atLat * DEG2RAD));
}


/** Convert offset in meters (for example, imagery offset) to offset in tile pixels
 * @param m offset in meters
 * @param tileSize tile size (defaults to 256)
 * @returns offset in tile pixels
 * @example
 * geoMetersToOffset([100, 100]);  // returns ≈[0.00064, -0.00064] pixels
 */
export function geoMetersToOffset(m: Vec2, tileSize: number = 256): Vec2 {
  return [
    (m[0] * tileSize) / (TAU * EQUATORIAL_RADIUS),
    (-m[1] * tileSize) / (TAU * POLAR_RADIUS)
  ];
}


/** Convert imagery offset in tile pixels to offset in meters
 * @param offset offset in tile pixels
 * @param tileSize tile size (defaults to 256)
 * @returns offset in meters
 * @example
 * geoOffsetToMeters([0.00064, -0.00064]);  // returns ≈[100, 100] meters
 */
export function geoOffsetToMeters(offset: Vec2, tileSize: number = 256): Vec2 {
  return [
    (offset[0] * TAU * EQUATORIAL_RADIUS) / tileSize,
    (-offset[1] * TAU * POLAR_RADIUS) / tileSize
  ];
}


/** Equirectangular approximation of spherical distances on Earth
 * @remarks The scalar overload can avoid temporary tuple allocations in hot loops.
 * @param a
 * @param b
 * @returns distance in meters
 * @example
 * geoSphericalDistance([0, 0], [1, 0]);  // returns ≈110946 meters
 */
export function geoSphericalDistance(a: Vec2, b: Vec2): number;
export function geoSphericalDistance(lon1: number, lat1: number, lon2: number, lat2: number): number;
export function geoSphericalDistance(a: Vec2 | number, b: Vec2 | number, c?: number, d?: number): number {
  let lon1: number;
  let lat1: number;
  let lon2: number;
  let lat2: number;

  if (typeof a === 'number') {
    lon1 = a;
    lat1 = b as number;
    lon2 = c as number;
    lat2 = d as number;
  } else {
    lon1 = a[0];
    lat1 = a[1];
    lon2 = (b as Vec2)[0];
    lat2 = (b as Vec2)[1];
  }

  const x: number = geoLonToMeters(lon1 - lon2, (lat1 + lat2) / 2);
  const y: number = geoLatToMeters(lat1 - lat2);
  return Math.sqrt(x * x + y * y);
}


/** LEGACY - DO NOT USE IN NEW CODE
 * Projection scale factor to tile zoom level
 * @param k projection scale factor
 * @param tileSize tile size (defaults to 256)
 * @returns tile zoom level
 * @example
 * geoScaleToZoom(5340353.7154);  // returns ≈17
 */
export function geoScaleToZoom(k: number, tileSize: number = 256): number {
  const log2ts: number = Math.log(tileSize) * Math.LOG2E;
  return Math.log(k * TAU) / Math.LN2 - log2ts;
}

/** LEGACY - DO NOT USE IN NEW CODE
 * Tile zoom to projection scale factor
 * @param z tile zoom level
 * @param tileSize tile size (defaults to 256)
 * @returns projection scale factor
 * @example
 * geoZoomToScale(17);  // returns ≈5340353.7154
 */
export function geoZoomToScale(z: number, tileSize: number = 256): number {
  return (tileSize * (2 ** z)) / TAU;
}


/** An Object containing `index`, `distance`, and `point` properties*/
export interface Closest {
  /** index of segment along path */
  index: number;
  /** distance from point to path */
  distance: number;
  /** point along path */
  point: Vec2;
}

/** Returns info about the point from provided points closest to the given target point
 * @param points points
 * @param a target point
 * @returns closest info if exists, null otherwise
 */
export function geoSphericalClosestPoint(points: Vec2[], a: Vec2): Closest | null {
  let minDistance = Infinity;
  let idx: number | undefined;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const distance = geoSphericalDistance(p[0], p[1], a[0], a[1]);
    if (distance < minDistance) {
      minDistance = distance;
      idx = i;
    }
  }

  if (idx !== undefined) {
    return { index: idx, distance: minDistance, point: points[idx] };
  } else {
    return null;
  }
}
