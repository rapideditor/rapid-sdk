import { geoMetersToLat, geoMetersToLon } from '@id-sdk/math-geo';
import { Vec2 } from '@id-sdk/math-vector';

export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * @class
 * @description 📦 Extent class for creating bounding boxes
 */
export class Extent {
  /** Minimum corner coordinate for the extent
   * @type {Vec2}
   * @public
   */
  public min: Vec2 = [Infinity, Infinity];
    /** Maximum corner coordinate for the extent
   * @type {Vec2}
   * @public
   */
  public max: Vec2 = [-Infinity, -Infinity];

  /** Constructs a new Extent
   * @param {Extent|Vec2} otherOrMin
   * @param {Vec2} [max]
   * @returns {Extent} new Extent
   * @example
   * ```typescript
   * const e1 = new Extent();                // construct an initially empty extent
   * const e2 = new Extent([0, 0]);          // construct as a point (min and max both [0, 0])
   * const e3 = new Extent([0, 0], [5, 5]);  // construct as a point with given min and max
   * const e4 = new Extent(e3);              // copy an Extent to a new Extent
   * ```
   */
  constructor(other?: Extent | Vec2, max?: Vec2) {
    let min;
    if (other instanceof Extent) {
      min = other.min;
      max = other.max;
    } else {
      min = other;
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

  /** Test whether extent equals another extent
   * @param {any} other
   * @returns {boolean} True if equal, false if unequal
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [10, 10]);
   * const b = new Extent([0, 0], [10, 10]);
   * const c = new Extent([0, 0], [12, 12]);
   * a.equals(b);   // returns true
   * a.equals(c);   // returns false
   * ```
   */
  equals(other: Extent | Vec2, max?: Vec2): boolean {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    return (
      this.min[0] === other.min[0] &&
      this.min[1] === other.min[1] &&
      this.max[0] === other.max[0] &&
      this.max[1] === other.max[1]
    );
  }

  /** Returns the area of an extent
   * @returns {number} area
   * @example
   * ```typescript
   * new Extent([0, 0], [5, 10]).area();  // returns 50
   * ```
   */
  area(): number {
    return Math.abs((this.max[0] - this.min[0]) * (this.max[1] - this.min[1]));
  }

  /** Returns the center point of an extent
   * @returns {Vec2} Center point of the extent
   * @example
   * ```typescript
   * new Extent([0, 0], [5, 10]).center();  // returns [2.5, 5]
   * ```
   */
  center(): Vec2 {
    return [(this.min[0] + this.max[0]) / 2, (this.min[1] + this.max[1]) / 2];
  }

  /** Returns an array rectangle as `[minX, minY, maxX, maxY]`
   * @returns {number[]} rectangle
   * @example
   * ```typescript
   * new Extent([0, 0], [5, 10]).rectangle();  // returns [0, 0, 5, 10]
   * ```
   */
  rectangle(): number[] {
    return [this.min[0], this.min[1], this.max[0], this.max[1]];
  }

  /** Returns a string representation of this extent's rectangle formatted as `"minX,minY,maxX,maxY"`
   * @returns {string} rectangle
   * @example
   * ```typescript
   * new Extent([0, 0], [5, 10]).toParam();  // returns '0,0,5,10'
   * ```
   */
  toParam(): string {
    return this.rectangle().join(',');
  }


  bbox(): BBox {
    return { minX: this.min[0], minY: this.min[1], maxX: this.max[0], maxY: this.max[1] };
  }

  /** Returns an polygon representing the extent wound clockwise.
   * @returns {Vec2[]} Polygon array
   * @example
   * ```typescript
   * new Extent([0, 0], [5, 10]).polygon();  // returns [[0, 0], [0, 10], [5, 10], [5, 0], [0, 0]]
   * ```
   */
  polygon(): Vec2[] {
    return [
      [this.min[0], this.min[1]],
      [this.min[0], this.max[1]],
      [this.max[0], this.max[1]],
      [this.max[0], this.min[1]],
      [this.min[0], this.min[1]]
    ];
  }

  /** Test whether this extent contains another extent
   * @param {any} other
   * @returns {boolean} True if this extent contains other, false if not
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [5, 5]);
   * const b = new Extent([1, 1], [2, 2]);
   * a.contains(b);   // returns true
   * b.contains(a);   // returns false
   * ```
   */
  contains(other: Extent | Vec2, max?: Vec2): boolean {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    return (
      other.min[0] >= this.min[0] &&
      other.min[1] >= this.min[1] &&
      other.max[0] <= this.max[0] &&
      other.max[1] <= this.max[1]
    );
  }

  /** Test whether this extent intersects another extent
   * @param {any} other
   * @returns {boolean} True if this extent intersects other, false if not
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [5, 5]);
   * const b = new Extent([1, 1], [6, 6]);
   * a.intersects(b);   // returns true
   * b.intersects(a);   // returns true
   * ```
   */
  intersects(other: Extent | Vec2, max?: Vec2): boolean {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    return (
      other.min[0] <= this.max[0] &&
      other.min[1] <= this.max[1] &&
      other.max[0] >= this.min[0] &&
      other.max[1] >= this.min[1]
    );
  }

  /** Returns a new Extent representing the intersection of this and other extents
   * @param {any} other
   * @returns {Extent} new Extent containing the intersection of this and other
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [5, 5]);
   * const b = new Extent([1, 1], [6, 6]);
   * a.intersection(b);   // returns new Extent { min: [ 1, 1 ], max: [ 5, 5 ] }
   * b.intersection(a);   // returns new Extent { min: [ 1, 1 ], max: [ 5, 5 ] }
   * ```
   */
  intersection(other: Extent | Vec2, max?: Vec2): Extent {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    if (!this.intersects(other)) return new Extent();
    return new Extent(
      [Math.max(other.min[0], this.min[0]), Math.max(other.min[1], this.min[1])],
      [Math.min(other.max[0], this.max[0]), Math.min(other.max[1], this.max[1])]
    );
  }

  /** Returns the percent of other extent contained within this extent, by area
   * @param {any} other
   * @returns {number} percent of other extent contained within this extent
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [4, 1]);
   * const b = new Extent([3, 0], [4, 2]);
   * a.percentContainedIn(b);   // returns 0.25
   * b.percentContainedIn(a);   // returns 0.5
   * ```
   */
  percentContainedIn(other: Extent | Vec2, max?: Vec2): number {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    const a1 = this.intersection(other).area();
    const a2 = this.area();

    if (a1 === Infinity || a2 === Infinity || a1 === 0 || a2 === 0) {
      return 0;
    } else {
      return a1 / a2;
    }
  }

  /** Extend the bounds of an extent, returning a new Extent
   * @param {any} other
   * @returns {Extent} A new extent
   * @example
   * ```typescript
   * const a = new Extent([0, 0], [5, 10]);
   * const b = new Extent([4, -1], [5, 10]);
   * const c = a.extend(b);   // returns new Extent { min: [ 0, -1 ], max: [ 5, 10 ] }
   * ```
   */
  extend(other: Extent | Vec2, max?: Vec2): Extent {
    if (!(other instanceof Extent)) other = new Extent(other, max);
    return new Extent(
      [Math.min(other.min[0], this.min[0]), Math.min(other.min[1], this.min[1])],
      [Math.max(other.max[0], this.max[0]), Math.max(other.max[1], this.max[1])]
    );
  }

  /** Returns a new extent representing the current extent padded by given meters
   * (this extent is assumed to be defined in geographic coordinates)
   * @param {number} meters
   * @returns {Extent} new Extent containing this padded by given meters
   */
  padByMeters(meters: number): Extent {
    const dLat = geoMetersToLat(meters);
    const dLon = geoMetersToLon(meters, this.center()[1]);
    return new Extent(
      [this.min[0] - dLon, this.min[1] - dLat],
      [this.max[0] + dLon, this.max[1] + dLat]
    );
  }
}
