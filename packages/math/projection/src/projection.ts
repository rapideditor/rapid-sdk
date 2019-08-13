/**
 * @module @id-sdk/projection
 * @description 📽 Module containing the Projection class
 */

import { geoMercatorRaw as d3_geoMercatorRaw, geoTransform as d3_geoTransform } from 'd3-geo';
import { zoomIdentity as d3_zoomIdentity } from 'd3-zoom';

type Vec2 = [number, number];

interface Transform {
  x: number;
  y: number;
  k: number;
}

/**
 * @class
 * @description 📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * The default projection wraps the d3.geo.MercatorRaw projection, but works in degrees instead of radians,
 * and skips several features:
 *   - Antimeridian clipping
 *   - Spherical rotation
 *   - Resampling
 */

export class Projection {
  private _proj: any = d3_geoMercatorRaw; // note: D3 projections work in radians

  private _k: number;
  private _x: number;
  private _y: number;
  private _dimensions: Vec2[] = [[0, 0], [0, 0]];

  /** Constructs a new Projection
   * @param {number} [x] - x translation
   * @param {number} [y] - y translation
   * @param {number} [k] - k scale
   * @returns {Projection} new Projection
   */
  constructor(x?: number, y?: number, k?: number) {
    this._x = x || 0;
    this._y = y || 0;
    this._k = k || 256 / Math.PI; // z1
  }

  /** Projects from given Lon/Lat (λ,φ) to Cartesian (x,y)
   * @param {Vec2} p - Point in Lon/Lat (λ,φ) (degrees)
   * @returns {Vec2} Point in Cartesian (x,y)
   */
  project(p: Vec2): Vec2 {
    p = this._proj((p[0] * Math.PI) / 180, (p[1] * Math.PI) / 180); // deg2rad
    return [p[0] * this._k + this._x, this._y - p[1] * this._k];
  }

  /** Inverse projects from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param {Vec2} p - Point in Cartesian (x,y)
   * @returns {Vec2} Point in Lon/Lat (λ,φ) (degrees)
   */
  invert(p: Vec2): Vec2 {
    p = this._proj.invert((p[0] - this._x) / this._k, (this._y - p[1]) / this._k);
    return [(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]; // rad2deg
  }

  /** Sets/Gets the scale factor
   * @param {number} [val] - Projection scale
   * @returns {number|Projection} The current scale or the current projection for method chaining
   */
  scale(val: number): number | Projection {
    if (!arguments.length) return this._k;
    this._k = +val;
    return this;
  }

  /** Sets/Gets the translation factor
   * @param {Vec2} [val] - Projection translation
   * @returns {Vec2|Projection} The current translation or the current projection for method chaining
   */
  translate(val: Vec2): Vec2 | Projection {
    if (!arguments.length) return [this._x, this._y];
    this._x = +val[0];
    this._y = +val[1];
    return this;
  }

  /** Sets/Gets the current viewport dimensions
   * @param {Vec2[]} [val] - viewport dimensions
   * @returns {Vec2[]|Projection} The current viewport dimensions or the current projection for method chaining
   */
  dimensions(val: Vec2[]): Vec2[] | Projection {
    if (!arguments.length) return this._dimensions;
    this._dimensions = val;
    return this;
  }

  /** Sets/Gets an object representing the current translation and scale
   * @param {Transform} [obj] - Transform object with x,y,k properties
   * @returns {Transform|Projection} The current transform or the current projection for method chaining
   */
  transform(obj: Transform): Transform | Projection {
    if (!arguments.length) return d3_zoomIdentity.translate(this._x, this._y).scale(this._k);
    this._x = +obj.x;
    this._y = +obj.y;
    this._k = +obj.k;
    return this;
  }

  getStream(): any {
    const thiz = this;
    return d3_geoTransform({
      point: function(x: number, y: number): void {
        const p: Vec2 = thiz.project([x, y]);
        this.stream.point(p[0], p[1]);
      }
    }).stream();
  }
}
