/**
 * Geographic (spherical) math module
 * @module @ideditor/geo
 * @see module:@ideditor/geo
 */

type Vec2 = [number, number];

// constants
const TAU = 2 * Math.PI;
const EQUATORIAL_RADIUS = 6356752.314245179;
const POLAR_RADIUS = 6378137.0;

export function geoLatToMeters(dLat: number): number {
  return dLat * ((TAU * POLAR_RADIUS) / 360);
}

export function geoLonToMeters(dLon: number, atLat: number): number {
  return Math.abs(atLat) >= 90
    ? 0
    : dLon * ((TAU * EQUATORIAL_RADIUS) / 360) * Math.abs(Math.cos(atLat * (Math.PI / 180)));
}

export function geoMetersToLat(m: number): number {
  return m / ((TAU * POLAR_RADIUS) / 360);
}

export function geoMetersToLon(m: number, atLat: number): number {
  return Math.abs(atLat) >= 90
    ? 0
    : m / ((TAU * EQUATORIAL_RADIUS) / 360) / Math.abs(Math.cos(atLat * (Math.PI / 180)));
}

export function geoMetersToOffset(meters: Vec2, tileSize?: number): Vec2 {
  tileSize = tileSize || 256;
  return [
    (meters[0] * tileSize) / (TAU * EQUATORIAL_RADIUS),
    (-meters[1] * tileSize) / (TAU * POLAR_RADIUS)
  ];
}

export function geoOffsetToMeters(offset: Vec2, tileSize?: number): Vec2 {
  tileSize = tileSize || 256;
  return [
    (offset[0] * TAU * EQUATORIAL_RADIUS) / tileSize,
    (-offset[1] * TAU * POLAR_RADIUS) / tileSize
  ];
}

// Equirectangular approximation of spherical distances on Earth
export function geoSphericalDistance(a: Vec2, b: Vec2): number {
  const x: number = geoLonToMeters(a[0] - b[0], (a[1] + b[1]) / 2);
  const y: number = geoLatToMeters(a[1] - b[1]);
  return Math.sqrt(x * x + y * y);
}

// scale to zoom
export function geoScaleToZoom(k: number, tileSize?: number): number {
  tileSize = tileSize || 256;
  const log2ts: number = Math.log(tileSize) * Math.LOG2E;
  return Math.log(k * TAU) / Math.LN2 - log2ts;
}

// zoom to scale
export function geoZoomToScale(z: number, tileSize?: number): number {
  tileSize = tileSize || 256;
  return (tileSize * Math.pow(2, z)) / TAU;
}

interface Closest {
  index: number;
  distance: number;
  point: Vec2;
}
// returns info about the point from `points` closest to the given `a`
export function geoSphericalClosestNode(points: Vec2[], a: Vec2): Closest | null {
  let minDistance: number = Infinity;
  let idx: number;

  for (let i: number = 0; i < points.length; i++) {
    let distance: number = geoSphericalDistance(points[i], a);
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
