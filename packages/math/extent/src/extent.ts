import { geoMetersToLat, geoMetersToLon } from '@id-sdk/geo';
import { Vec2 } from '@id-sdk/vector';

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class Extent {
  public min: Vec2 = [Infinity, Infinity];
  public max: Vec2 = [-Infinity, -Infinity];

  // Constructs a new Extent
  constructor(otherOrMin?: Extent | Vec2, max?: Vec2) {
    let min;
    if (otherOrMin instanceof Extent) {
      min = otherOrMin.min;
      max = otherOrMin.max;
    } else {
      min = otherOrMin;
    }

    if (min && min.length === 2) {
      this.min[0] = min[0];
      this.min[1] = min[1];
      if (!max) max = min;
    }
    if (max && max.length === 2) {
      this.max[0] = max[0];
      this.max[1] = max[1];
    }
  }

  // Test whether extent equals another extent
  equals(other: any): boolean {
    if (!(other instanceof Extent)) other = Reflect.construct(Extent, arguments);
    return (
      this.min[0] === other.min[0] &&
      this.min[1] === other.min[1] &&
      this.max[0] === other.max[0] &&
      this.max[1] === other.max[1]
    );
  }

  // Returns the area of an extent
  area(): number {
    return Math.abs((this.max[0] - this.min[0]) * (this.max[1] - this.min[1]));
  }

  // Returns the center point of an extent
  center(): Vec2 {
    return [(this.min[0] + this.max[0]) / 2, (this.min[1] + this.max[1]) / 2];
  }

  // Returns an array rectangle as `[minX, minY, maxX, maxY]`
  rectangle(): number[] {
    return [this.min[0], this.min[1], this.max[0], this.max[1]];
  }

  // Returns a string representation of this extent's rectangle formatted as `"minX,minY,maxX,maxY"`
  toParam(): string {
    return this.rectangle().join(',');
  }

  // Returns an Object with `minX`, `minY`, `maxX`, `maxY` properties.
  bbox(): BBox {
    return { minX: this.min[0], minY: this.min[1], maxX: this.max[0], maxY: this.max[1] };
  }

  // Returns an polygon representing the extent wound clockwise.
  polygon(): Vec2[] {
    return [
      [this.min[0], this.min[1]],
      [this.min[0], this.max[1]],
      [this.max[0], this.max[1]],
      [this.max[0], this.min[1]],
      [this.min[0], this.min[1]]
    ];
  }

  // Test whether this extent contains another extent
  contains(other: any): boolean {
    if (!(other instanceof Extent)) other = Reflect.construct(Extent, arguments);
    return (
      other.min[0] >= this.min[0] &&
      other.min[1] >= this.min[1] &&
      other.max[0] <= this.max[0] &&
      other.max[1] <= this.max[1]
    );
  }

  // Test whether this extent intersects another extent
  intersects(other: any): boolean {
    if (!(other instanceof Extent)) other = Reflect.construct(Extent, arguments);
    return (
      other.min[0] <= this.max[0] &&
      other.min[1] <= this.max[1] &&
      other.max[0] >= this.min[0] &&
      other.max[1] >= this.min[1]
    );
  }

  // Returns a new Extent representing the intersection of this and other extents
  intersection(other: any): Extent {
    if (!this.intersects(other)) return new Extent();
    return new Extent(
      [Math.max(other.min[0], this.min[0]), Math.max(other.min[1], this.min[1])],
      [Math.min(other.max[0], this.max[0]), Math.min(other.max[1], this.max[1])]
    );
  }

  // Returns the percent of other extent contained within this extent, by area
  percentContainedIn(other: any): number {
    if (!(other instanceof Extent)) other = Reflect.construct(Extent, arguments);
    const a1 = this.intersection(other).area();
    const a2 = this.area();

    if (a1 === Infinity || a2 === Infinity || a1 === 0 || a2 === 0) {
      return 0;
    } else {
      return a1 / a2;
    }
  }

  // Extend the bounds of an extent, returning a new Extent
  extend(other: any): Extent {
    if (!(other instanceof Extent)) other = Reflect.construct(Extent, arguments);
    return new Extent(
      [Math.min(other.min[0], this.min[0]), Math.min(other.min[1], this.min[1])],
      [Math.max(other.max[0], this.max[0]), Math.max(other.max[1], this.max[1])]
    );
  }

  // Returns a new extent representing the current extent padded by given meters
  padByMeters(meters: number): Extent {
    const dLat = geoMetersToLat(meters);
    const dLon = geoMetersToLon(meters, this.center()[1]);
    return new Extent(
      [this.min[0] - dLon, this.min[1] - dLat],
      [this.max[0] + dLon, this.max[1] + dLat]
    );
  }
}
