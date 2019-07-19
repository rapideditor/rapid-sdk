declare type Vec2 = [number, number];
export declare function geomEdgeEqual(a: Vec2, b: Vec2): boolean;
export declare function geomRotatePoints(points: Vec2[], angle: number, around: Vec2): Vec2[];
export declare function geomLineIntersection(a: Vec2[], b: Vec2[]): Vec2 | null;
export declare function geomPathIntersections(path1: Vec2[], path2: Vec2[]): Vec2[];
export declare function geomPathHasIntersections(path1: Vec2[], path2: Vec2[]): boolean;
export declare function geomPointInPolygon(point: Vec2, polygon: Vec2[]): boolean;
export declare function geomPolygonContainsPolygon(outer: Vec2[], inner: Vec2[]): boolean;
export declare function geomPolygonIntersectsPolygon(
  outer: Vec2[],
  inner: Vec2[],
  checkSegments: boolean
): boolean;
interface SSR {
  poly: Vec2[];
  angle: number;
}
export declare function geomGetSmallestSurroundingRectangle(points: Vec2[]): SSR;
export declare function geomPathLength(path: Vec2[]): number;
export declare function geomViewportNudge(point: Vec2, dimensions: Vec2): Vec2 | null;
export {};
//# sourceMappingURL=geom.d.ts.map
