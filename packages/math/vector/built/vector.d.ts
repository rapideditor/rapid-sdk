declare type Vec2 = [number, number];
export declare function vecEqual(a: Vec2, b: Vec2, epsilon?: number): boolean;
export declare function vecAdd(a: Vec2, b: Vec2): Vec2;
export declare function vecSubtract(a: Vec2, b: Vec2): Vec2;
export declare function vecScale(a: Vec2, mag: number): Vec2;
export declare function vecFloor(a: Vec2): Vec2;
export declare function vecInterp(a: Vec2, b: Vec2, t: number): Vec2;
export declare function vecLength(a: Vec2, b?: Vec2): number;
export declare function vecNormalize(a: Vec2): Vec2;
export declare function vecAngle(a: Vec2, b: Vec2): number;
export declare function vecDot(a: Vec2, b: Vec2, origin?: Vec2): number;
export declare function vecNormalizedDot(a: Vec2, b: Vec2, origin?: Vec2): number;
export declare function vecCross(a: Vec2, b: Vec2, origin?: Vec2): number;
interface Edge {
  index: number;
  distance: number;
  target: Vec2;
}
export declare function vecProject(a: Vec2, points: Vec2[]): Edge | null;
export {};
//# sourceMappingURL=vector.d.ts.map
