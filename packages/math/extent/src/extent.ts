import { geoMetersToLat, geoMetersToLon } from '@ideditor/geo';

type Vec2 = [number, number];

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class Extent {
  public min: Vec2 = [Infinity, Infinity];
  public max: Vec2 = [-Infinity, -Infinity];

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

  equals(other: any): boolean {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      this.min[0] === other.min[0] &&
      this.min[1] === other.min[1] &&
      this.max[0] === other.max[0] &&
      this.max[1] === other.max[1]
    );
  }

  extend(other: any) {
    if (!(other instanceof Extent)) other = new Extent(other);
    return new Extent(
      [Math.min(other.min[0], this.min[0]), Math.min(other.min[1], this.min[1])],
      [Math.max(other.max[0], this.max[0]), Math.max(other.max[1], this.max[1])]
    );
  }

  area(): number {
    return Math.abs((this.max[0] - this.min[0]) * (this.max[1] - this.min[1]));
  }

  center(): Vec2 {
    return [(this.min[0] + this.max[0]) / 2, (this.min[1] + this.max[1]) / 2];
  }

  rectangle(): number[] {
    return [this.min[0], this.min[1], this.max[0], this.max[1]];
  }

  bbox(): BBox {
    return { minX: this.min[0], minY: this.min[1], maxX: this.max[0], maxY: this.max[1] };
  }

  polygon(): Vec2[] {
    return [
      [this.min[0], this.min[1]],
      [this.min[0], this.max[1]],
      [this.max[0], this.max[1]],
      [this.max[0], this.min[1]],
      [this.min[0], this.min[1]]
    ];
  }

  contains(other: any): boolean {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other.min[0] >= this.min[0] &&
      other.min[1] >= this.min[1] &&
      other.max[0] <= this.max[0] &&
      other.max[1] <= this.max[1]
    );
  }

  intersects(other: any): boolean {
    if (!(other instanceof Extent)) other = new Extent(other);
    return (
      other.min[0] <= this.max[0] &&
      other.min[1] <= this.max[1] &&
      other.max[0] >= this.min[0] &&
      other.max[1] >= this.min[1]
    );
  }

  intersection(other: any): Extent {
    if (!this.intersects(other)) return new Extent();
    return new Extent(
      [Math.max(other.min[0], this.min[0]), Math.max(other.min[1], this.min[1])],
      [Math.min(other.max[0], this.max[0]), Math.min(other.max[1], this.max[1])]
    );
  }

  percentContainedIn(other: any): number {
    if (!(other instanceof Extent)) other = new Extent(other);
    const a1 = this.intersection(other).area();
    const a2 = this.area();

    if (a1 === Infinity || a2 === Infinity || a1 === 0 || a2 === 0) {
      return 0;
    } else {
      return a1 / a2;
    }
  }

  padByMeters(meters: number): Extent {
    const dLat = geoMetersToLat(meters);
    const dLon = geoMetersToLon(meters, this.center()[1]);
    return new Extent([this.min[0] - dLon, this.min[1] - dLat], [this.max[0] + dLon, this.max[1] + dLat]);
  }

  toParam(): string {
    return this.rectangle().join(',');
  }
}
