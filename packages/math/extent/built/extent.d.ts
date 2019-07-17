declare type Vec2 = [number, number];
interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export declare class Extent {
    min: Vec2;
    max: Vec2;
    constructor(otherOrMin?: Extent | Vec2, max?: Vec2);
    equals(other: any): boolean;
    extend(other: any): Extent;
    area(): number;
    center(): Vec2;
    rectangle(): number[];
    bbox(): BBox;
    polygon(): Vec2[];
    contains(other: any): boolean;
    intersects(other: any): boolean;
    intersection(other: any): Extent;
    percentContainedIn(other: any): number;
    padByMeters(meters: number): Extent;
    toParam(): string;
}
export {};
//# sourceMappingURL=extent.d.ts.map