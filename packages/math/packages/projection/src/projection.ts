/**
 * 📽 Projection module for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * @module
 * @description
 * The default projection wraps a [d3.geoMercatorRaw](https://github.com/d3/d3-geo#geoMercatorRaw) projection
 * but works in degrees instead of radians, and skips several features:
 * Antimeridian clipping, Spherical rotation, Resampling
 */

import { geoMercatorRaw as d3_geoMercatorRaw, geoTransform as d3_geoTransform } from 'd3-geo';
import { zoomIdentity as d3_zoomIdentity } from 'd3-zoom';
import { Vec2 } from '@id-sdk/vector';

/** An Object containing `x`, `y`, `k` numbers */
export interface Transform {
  x: number;
  y: number;
  k: number;
}

/** Class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates */
export class Projection {
  private _proj: any = d3_geoMercatorRaw; // note: D3 projections work in radians

  private _k: number;
  private _x: number;
  private _y: number;
  private _dimensions: Vec2[] = [
    [0, 0],
    [0, 0]
  ];

  /** Constructs a new Projection
   * @description Default corresponds to the world at zoom 1 and centered on "Null Island" [0, 0].
   * @param x x coordinate value
   * @param y y coordinate value
   * @param k zoom level
   * @example ```
   * const p1 = new Projection();
   * const p2 = new Projection(20, 30, 512 / Math.PI);
   * ```
   */
  constructor(x?: number, y?: number, k?: number) {
    this._x = x || 0;
    this._y = y || 0;
    this._k = k || 256 / Math.PI; // z1
  }

  /** Projects from given Lon/Lat (λ,φ) to Cartesian (x,y)
   * @param p Lon/Lat (λ,φ)
   * @returns Cartesian (x,y)
   * @example ```
   * const p = new Projection();
   * p.project([0, 0]);                  // returns [0, 0]
   * p.project([180, -85.0511287798]);   // returns [256, 256]
   * p.project([-180, 85.0511287798]);   // returns [-256, -256]
   * ```
   */
  project(p: Vec2): Vec2 {
    p = this._proj((p[0] * Math.PI) / 180, (p[1] * Math.PI) / 180); // deg2rad
    return [p[0] * this._k + this._x, this._y - p[1] * this._k];
  }

  /** Inverse projects from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param p Cartesian (x,y)
   * @returns Lon/Lat (λ,φ)
   * @example ```
   * const p = new Projection();
   * p.invert([0, 0]);         // returns [0, 0]
   * p.invert([256, 256]);     // returns [180, -85.0511287798]
   * p.invert([-256, -256]);   // returns [-180, 85.0511287798]
   * ```
   */
  invert(p: Vec2): Vec2 {
    p = this._proj.invert((p[0] - this._x) / this._k, (this._y - p[1]) / this._k);
    return [(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]; // rad2deg
  }

  /** Sets/Gets the scale factor
   * @param val scale factor
   * @returns When passed a numeric argument, sets the scale factor and returns `this` for method chaining.
   * Returns the scale factor otherwise
   * @example ```
   * const p = new Projection().scale(512 / Math.PI);   // sets scale
   * p.scale();   // gets scale - returns 512 / Math.PI;
   * ```
   */
  scale(val?: number): number | Projection {
    if (val === undefined) return this._k;
    this._k = +val;
    return this;
  }

  /** Sets/Gets the translation factor
   * @param val translation factor
   * @returns When passed a numeric argument, sets the `x`,`y` translation values and returns `this` for method chaining
   * Returns the `x`,`y` translation values otherwise
   * @example ```
   * const p = new Projection().translate([20, 30]);    // sets translation
   * p.translate();   // gets translation - returns [20, 30]
   * ```
   */
  translate(val?: Vec2): Vec2 | Projection {
    if (val === undefined) return [this._x, this._y];
    this._x = +val[0];
    this._y = +val[1];
    return this;
  }

  /** Sets/Gets the current viewport dimensions
   * @param val viewport dimensions
   * @returns When an argument is passed, sets the viewport min/max dimensions and returns `this` for method chaining
   * Returns the viewport min/max dimensions otherwise
   * @example ```
   * const p = new Projection().dimensions([[0, 0], [800, 600]]);    // sets viewport dimensions
   * p.dimensions();   // gets viewport dimensions - returns [[0, 0], [800, 600]]
   * ```
   */
  dimensions(val?: Vec2[]): Vec2[] | Projection {
    if (val === undefined) return this._dimensions;
    this._dimensions = val;
    return this;
  }

  /** Sets/Gets a transform object
   * @param val an object representing the current translation and scale
   * @returns When an argument is passed, sets `x`,`y`,`k` from the Transform and returns `this` for method chaining
   * Returns a Transform object containing the current `x`,`y`,`k` values otherwise
   * @example ```
   * const t = { x: 20, y: 30, k: 512 / Math.PI };
   * const p = new Projection().transform(t);    // sets `x`,`y`,`k` from given Transform object
   * p.transform();   // gets transform - returns { x: 20, y: 30, k: 512 / Math.PI }
   * ```
   */
  transform(obj?: Transform): Transform | Projection {
    if (obj === undefined) return d3_zoomIdentity.translate(this._x, this._y).scale(this._k);
    this._x = +obj.x;
    this._y = +obj.y;
    this._k = +obj.k;
    return this;
  }

  /** Returns a d3.geoTransform stream that uses this Projection to project geometry points.
   * @returns d3.geoTransform stream
   * @example ```
   * const proj = new Projection();
   * let s = proj.getStream();
   * let p;
   *
   * s.stream = {
   *   point: (x, y) => {
   *     p = [x, y];
   *   }
   * };
   * s.point(-180, 85.0511287798);  // returns [256, 256]
   * ```
   */
  getStream(): any {
    const thiz = this;
    return d3_geoTransform({
      point: function (x: number, y: number): void {
        const p: Vec2 = thiz.project([x, y]);
        this.stream.point(p[0], p[1]);
      }
    }).stream;
  }
}
