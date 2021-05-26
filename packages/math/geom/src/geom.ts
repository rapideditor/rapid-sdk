import { polygonHull as d3_polygonHull, polygonCentroid as d3_polygonCentroid } from 'd3-polygon';
import { Extent } from '@id-sdk/extent';
import {
  Vec2,
  vecCross,
  vecDot,
  vecEqual,
  vecInterp,
  vecLength,
  vecSubtract
} from '@id-sdk/vector';

// Test whether two given coordinates describe the same edge
export function geomEdgeEqual(a: Vec2, b: Vec2): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

// Rotate all points counterclockwise around a pivot point by given angle
export function geomRotatePoints(points: Vec2[], angle: number, around: Vec2): Vec2[] {
  return points.map((point: Vec2) => {
    const radial: Vec2 = vecSubtract(point, around);
    return [
      radial[0] * Math.cos(angle) - radial[1] * Math.sin(angle) + around[0],
      radial[0] * Math.sin(angle) + radial[1] * Math.cos(angle) + around[1]
    ];
  });
}

// Return the intersection point of 2 line segments.
// From https://github.com/pgkelley4/line-segments-intersect
// This uses the vector cross product approach described below:
// http://stackoverflow.com/a/565282/786339
export function geomLineIntersection(a: Vec2[], b: Vec2[]): Vec2 | null {
  if (a.length !== 2 || b.length !== 2) return null;

  const p: Vec2 = [a[0][0], a[0][1]];
  const p2: Vec2 = [a[1][0], a[1][1]];
  const q: Vec2 = [b[0][0], b[0][1]];
  const q2: Vec2 = [b[1][0], b[1][1]];
  const r: Vec2 = vecSubtract(p2, p);
  const s: Vec2 = vecSubtract(q2, q);
  const uNumerator: number = vecCross(vecSubtract(q, p), r);
  const denominator: number = vecCross(r, s);

  if (uNumerator && denominator) {
    const u = uNumerator / denominator;
    const t = vecCross(vecSubtract(q, p), s) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return vecInterp(p, p2, t);
    }
  }

  return null;
}

// Return all intersection points of 2 paths
export function geomPathIntersections(path1: Vec2[], path2: Vec2[]): Vec2[] {
  let intersections: Vec2[] = [];
  for (let i: number = 0; i < path1.length - 1; i++) {
    for (let j: number = 0; j < path2.length - 1; j++) {
      const a: Vec2[] = [path1[i], path1[i + 1]];
      const b: Vec2[] = [path2[j], path2[j + 1]];
      const hit: Vec2 | null = geomLineIntersection(a, b);
      if (hit) {
        intersections.push(hit);
      }
    }
  }
  return intersections;
}

// Return true if paths intersect, false if not
export function geomPathHasIntersections(path1: Vec2[], path2: Vec2[]): boolean {
  for (let i: number = 0; i < path1.length - 1; i++) {
    for (let j: number = 0; j < path2.length - 1; j++) {
      const a: Vec2[] = [path1[i], path1[i + 1]];
      const b: Vec2[] = [path2[j], path2[j + 1]];
      const hit: Vec2 | null = geomLineIntersection(a, b);
      if (hit) {
        return true;
      }
    }
  }
  return false;
}

// Return true if point is contained in polygon
// From https://github.com/substack/point-in-polygon.
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
export function geomPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
  const x: number = point[0];
  const y: number = point[1];
  let inside: boolean = false;

  for (let i: number = 0, j: number = polygon.length - 1; i < polygon.length; j = i++) {
    const xi: number = polygon[i][0];
    const yi: number = polygon[i][1];
    const xj: number = polygon[j][0];
    const yj: number = polygon[j][1];

    const intersect: boolean = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

// Return true if every point of inner polygon is contained within outer polygon
// From https://github.com/substack/point-in-polygon.
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
export function geomPolygonContainsPolygon(outer: Vec2[], inner: Vec2[]): boolean {
  return inner.every((point: Vec2) => {
    return geomPointInPolygon(point, outer);
  });
}

// Return true if any part of inner polygon intersects outer polygon
export function geomPolygonIntersectsPolygon(
  outer: Vec2[],
  inner: Vec2[],
  checkSegments?: boolean
): boolean {
  function testPoints(outer: Vec2[], inner: Vec2[]): boolean {
    return inner.some((point: Vec2) => {
      return geomPointInPolygon(point, outer);
    });
  }

  return testPoints(outer, inner) || (!!checkSegments && geomPathHasIntersections(outer, inner));
}

export interface SSR {
  poly: Vec2[]; // the smallest surrounding rectangle polygon
  angle: number; // angle offset from x axis
}

// Return the Smallest Surrounding Rectangle for a given set of points
// http://gis.stackexchange.com/questions/22895/finding-minimum-area-rectangle-for-given-points
// http://gis.stackexchange.com/questions/3739/generalisation-strategies-for-building-outlines/3756#3756
export function geomGetSmallestSurroundingRectangle(points: Vec2[]): SSR | null {
  const hull: Vec2[] | null = d3_polygonHull(points);
  if (!hull) return null;

  const centroid: Vec2 = d3_polygonCentroid(hull);
  let minArea: number = Infinity;
  let ssrExtent: Extent = new Extent();
  let ssrAngle: number = 0;
  let c1: Vec2 = hull[0];

  for (let i: number = 0; i <= hull.length - 1; i++) {
    const c2: Vec2 = i === hull.length - 1 ? hull[0] : hull[i + 1];
    const angle: number = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]);
    const poly: Vec2[] = geomRotatePoints(hull, -angle, centroid);
    const extent: Extent = poly.reduce((acc: Extent, point: Vec2) => {
      // update Extent min/max in-place for speed
      acc.min[0] = Math.min(acc.min[0], point[0]);
      acc.min[1] = Math.min(acc.min[1], point[1]);
      acc.max[0] = Math.max(acc.max[0], point[0]);
      acc.max[1] = Math.max(acc.max[1], point[1]);
      return acc;
    }, new Extent());

    const area: number = extent.area();
    if (area < minArea) {
      minArea = area;
      ssrExtent = extent;
      ssrAngle = angle;
    }
    c1 = c2;
  }

  return {
    poly: geomRotatePoints(ssrExtent.polygon(), ssrAngle, centroid),
    angle: ssrAngle
  };
}

// Return the length of the given path
export function geomPathLength(path: Vec2[]): number {
  let length: number = 0;
  for (let i: number = 0; i < path.length - 1; i++) {
    length += vecLength(path[i], path[i + 1]);
  }
  return length;
}

// If the given point is at the edge of the padded viewport,
// return a vector that will nudge the viewport in that direction
export function geomViewportNudge(point: Vec2, dimensions: Vec2): Vec2 | null {
  const pad: number[] = [80, 20, 50, 20]; // top, right, bottom, left
  let x: number = 0;
  let y: number = 0;

  if (point[0] > dimensions[0] - pad[1]) x = -10;
  if (point[0] < pad[3]) x = 10;
  if (point[1] > dimensions[1] - pad[2]) y = -10;
  if (point[1] < pad[0]) y = 10;

  if (x || y) {
    return [x, y];
  } else {
    return null;
  }
}
