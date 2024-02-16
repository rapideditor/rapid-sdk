/**
 * 📺 Viewport module for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * @module
 */

import { Extent } from './extent';
import { Vec2 } from './vector';

// constants
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const HALF_PI = Math.PI / 2;


/** An Object containing `x`, `y`, `k` numbers */
export interface Transform {
  x: number;
  y: number;
  k: number;
}


/** Class for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates */
export class Viewport {
  private _dimensions: Extent;
  private _transform: Transform;


  /** Constructs a new Viewport
   * @description Default viewport corresponds to the world at zoom 1 and centered on "Null Island" [0, 0].
   * @param x x coordinate value
   * @param y y coordinate value
   * @param k zoom level
   * @example ```
   * const view1 = new Viewport();
   * const view2 = new Viewport(20, 30, 512 / Math.PI);
   * ```
   */
  constructor(x?: number, y?: number, k?: number) {
    this._dimensions = new Extent([0, 0], [0, 0]);
    this._transform = {
      x: x || 0,
      y: y || 0,
      k: k || 256 / Math.PI  // z1
    };
  }


  /** Projects from given Lon/Lat (λ,φ) to Cartesian (x,y)
   * @param loc Lon/Lat (λ,φ)
   * @returns Cartesian (x,y)
   * @example ```
   * const view = new Viewport();
   * view.project([0, 0]);                  // returns [0, 0]
   * view.project([180, -85.0511287798]);   // returns [256, 256]
   * view.project([-180, 85.0511287798]);   // returns [-256, -256]
   * ```
   */
  project(loc: Vec2): Vec2 {
    const lambda = loc[0] * DEG2RAD;
    const phi = loc[1] * DEG2RAD;
    const mercX = lambda;
    const mercY = Math.log(Math.tan((HALF_PI + phi) / 2));
    const t = this._transform;
    return [mercX * t.k + t.x, t.y - mercY * t.k];
  }


  /** Inverse projects from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param point Cartesian (x,y)
   * @returns Lon/Lat (λ,φ)
   * @example ```
   * const view = new Viewport();
   * view.invert([0, 0]);         // returns [0, 0]
   * view.invert([256, 256]);     // returns [180, -85.0511287798]
   * view.invert([-256, -256]);   // returns [-180, 85.0511287798]
   * ```
   */
  invert(point: Vec2): Vec2 {
    const t = this._transform;
    const mercX = (point[0] - t.x) / t.k;
    const mercY = (t.y - point[1]) / t.k;
    const lambda = mercX;
    const phi = 2 * Math.atan(Math.exp(mercY)) - HALF_PI;
    return [lambda * RAD2DEG, phi * RAD2DEG];
  }


  /** Sets/Gets the scale factor
   * @param val scale factor
   * @returns When argument is provided, sets the scale factor and returns `this` for method chaining.
   * Returns the scale factor otherwise
   * @example ```
   * const view = new Viewport().scale(512 / Math.PI);   // sets scale
   * p.scale();   // gets scale - returns 512 / Math.PI;
   * ```
   */
  scale(val?: number): number | Viewport {
    if (val === undefined) return this._transform.k;
    this._transform.k = +val;
    return this;
  }


  /** Sets/Gets the translation factor
   * @param val translation factor
   * @returns When argument is provided, sets the `x`,`y` translation values and returns `this` for method chaining.
   * Returns the `x`,`y` translation values otherwise
   * @example ```
   * const p = new Viewport().translate([20, 30]);    // sets translation
   * p.translate();   // gets translation - returns [20, 30]
   * ```
   */
  translate(val?: Vec2): Vec2 | Viewport {
    if (val === undefined) return [this._transform.x, this._transform.y];
    this._transform.x = +val[0];
    this._transform.y = +val[1];
    return this;
  }


  /** Sets/Gets a transform object
   * @param val an object representing the current translation and scale
   * @returns When argument is provided, sets `x`,`y`,`k` from the Transform and returns `this` for method chaining.
   * Returns a Transform object containing the current `x`,`y`,`k` values otherwise
   * @example ```
   * const t = { x: 20, y: 30, k: 512 / Math.PI };
   * const view = new Viewport().transform(t);    // sets `x`,`y`,`k` from given Transform object
   * p.transform();   // gets transform - returns { x: 20, y: 30, k: 512 / Math.PI }
   * ```
   */
  transform(obj?: Transform): Transform | Viewport {
    if (obj === undefined) return Object.assign({}, this._transform);  // copy
    if (obj.x !== undefined) this._transform.x = +obj.x;
    if (obj.y !== undefined) this._transform.y = +obj.y;
    if (obj.k !== undefined) this._transform.k = +obj.k;
    return this;
  }


  /** Sets/Gets the current viewport dimensions
   * @param val viewport dimensions
   * @returns When argument is provided, sets the viewport min/max dimensions and returns `this` for method chaining.
   * Returns the viewport min/max dimensions otherwise
   * @example ```
   * const view = new Viewport().dimensions([[0, 0], [800, 600]]);    // sets viewport dimensions
   * p.dimensions();   // gets viewport dimensions - returns [[0, 0], [800, 600]]
   * ```
   */
  dimensions(val?: Vec2[]): Vec2[] | Viewport {
    if (val === undefined) return [this._dimensions.min, this._dimensions.max];
    this._dimensions.min = val[0];
    this._dimensions.max = val[1];
    return this;
  }

}
