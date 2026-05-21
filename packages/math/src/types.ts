/**
 * 💭 Common type signatures for the math package
 * @module
 */

import type { Extent } from './Extent.ts';

/** A 2-tuple, for example: `[longitude, latitude]` */
export type Vec2 = [number, number];
/** A 3-tuple, for example: `[x, y, z]` */
export type Vec3 = [number, number, number];
/** A 4-tuple, for example: `[minX, minY, maxX, maxY]` */
export type Vec4 = [number, number, number, number];
/**
 * A 5-element polygon, representing a quadrilateral with 4 corners (viewport, tile, etc)
 * By convention, the first point must be the same as the last point, for GeoJSON compatibility. */
export type Quad = [Vec2, Vec2, Vec2, Vec2, Vec2];

/** Bounding box containing minX, minY, maxX, maxY numbers */
export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/** An Object containing details about the closest point to a given path */
export interface Closest {
  /** index of segment along path */
  index: number;
  /** distance from point to path */
  distance: number;
  /** point along path */
  point: Vec2;
};

/** An Object containing details about a surrounding rectangle for a given set of points */
export interface SurroundingRectangle {
  /** The surrounding rectangle polygon */
  polygon: Quad;
  /** Angle offset from x axis */
  angle: number;
  /** Centroid of the rectangle (long and short axes intersect here) */
  centroid: Vec2;
  /** Short axis of the rectangle (perpendicular to angle, the rect's height direction) */
  shortAxis: [Vec2, Vec2];
  /** Long axis of the rectangle (along angle, the rect's width direction) */
  longAxis: [Vec2, Vec2];
};

/** An Object containing details about a Tile */
export interface Tile {
  /** tile identifier string ex. '0,0,0' */
  id: string;
  /** tile coordinate array ex. [0,0,0] */
  xyz: Vec3;
  /** Extent in WGS84 coordinates [lon,lat] */
  wgs84Extent: Extent;
  /** Extent in world coordinates [x,y] (at WORLD_ZOOM scale, range 0..WORLD_SIZE) */
  worldExtent: Extent;
  /** true if the tile is visible, false if not */
  isVisible: boolean;
};

/** An Object used to return information about the tiles covering a given viewport */
export interface TileResult {
  tiles: Tile[];
};

/** An Object containing details about a Transform */
export interface TransformProps {
  /** translation in x direction from origin */
  x: number;
  /** translation in y direction from origin */
  y: number;
  /** zoom factor */
  z: number;
  /** rotation, in radians */
  r: number;
};

