/**
 * 📺 Viewport module for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * @module
 */

import { Extent } from './Extent';
import { Vec2 } from './vector';

// constants
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const HALF_PI = Math.PI / 2;


/** The parameters that define the viewport */
export interface Transform {
  x: number;
  y: number;
  k: number;
  r: number;
}


/** Class for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates */
export class Viewport {
  private _transform: Transform;
  private _dimensions: Extent;


  /** Constructs a new Viewport
   * @description Default viewport corresponds to the world at zoom 1 and centered on "Null Island" [0, 0].
   * @param transform
   * @param dimensions
   * @example ```
   * const view1 = new Viewport();
   * const view2 = new Viewport({x: 20, y: 30, k: 512 / Math.PI });
   * ```
   */
  constructor(transform?: any, dimensions?: Extent) {
    this._transform = {
      x: transform?.x || 0,
      y: transform?.y || 0,
      k: transform?.k || 256 / Math.PI,  // z1
      r: transform?.r || 0
    };

    this._dimensions = dimensions ? new Extent(dimensions) : new Extent([0, 0], [0, 0]);
  }


  /** Projects a coordinate from Lon/Lat (λ,φ) to Cartesian (x,y)
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
    const { x, y, k, r } = this._transform;
    const lambda = loc[0] * DEG2RAD;
    const phi = loc[1] * DEG2RAD;
    const mercX = lambda;
    const mercY = Math.log(Math.tan((HALF_PI + phi) / 2));
    return [ mercX * k + x, y - mercY * k ];
  }


  /** Unprojects a coordinate from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param point Cartesian (x,y)
   * @returns Lon/Lat (λ,φ)
   * @example ```
   * const view = new Viewport();
   * view.unproject([0, 0]);         // returns [0, 0]
   * view.unproject([256, 256]);     // returns [180, -85.0511287798]
   * view.unproject([-256, -256]);   // returns [-180, 85.0511287798]
   * ```
   */
  unproject(point: Vec2): Vec2 {
    const { x, y, k, r } = this._transform;
    const mercX = (point[0] - x) / k;
    const mercY = (y - point[1]) / k;
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
  transform(obj?: any): Transform | Viewport {
    if (obj === undefined) return Object.assign({}, this._transform);  // copy
    Object.assign(this._transform, obj);
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
