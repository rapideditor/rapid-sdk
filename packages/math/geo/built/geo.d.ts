declare type Vec2 = [number, number];
export declare function geoLatToMeters(dLat: number): number;
export declare function geoLonToMeters(dLon: number, atLat: number): number;
export declare function geoMetersToLat(m: number): number;
export declare function geoMetersToLon(m: number, atLat: number): number;
export declare function geoMetersToOffset(meters: Vec2, tileSize?: number): Vec2;
export declare function geoOffsetToMeters(offset: Vec2, tileSize?: number): Vec2;
export declare function geoSphericalDistance(a: Vec2, b: Vec2): number;
export declare function geoScaleToZoom(k: number, tileSize?: number): number;
export declare function geoZoomToScale(z: number, tileSize?: number): number;
interface Closest {
    index: number;
    distance: number;
    point: Vec2;
}
export declare function geoSphericalClosestNode(points: Vec2[], a: Vec2): Closest | null;
export {};
//# sourceMappingURL=geo.d.ts.map