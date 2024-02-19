/**
 * 📺 Viewport module for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * @module
 */

import { Extent } from './Extent';
import { Vec2, vecRotate } from './vector';

// constants
const TAU = 2 * Math.PI;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const HALF_PI = Math.PI / 2;

function wrap(n, max) {
  if (n < 0) {
    n += Math.ceil(-n / max) * max;
  }
  return n % max;
}


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
      r: wrap(transform?.r || 0, TAU)    // constrain to values in 0..2π
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
    const lambda: number = loc[0] * DEG2RAD;
    const phi: number = loc[1] * DEG2RAD;
    const mercator: Vec2 = [lambda, Math.log(Math.tan((HALF_PI + phi) / 2))];
    const screen: Vec2 = [mercator[0] * k + x, y - mercator[1] * k];
    if (r) {
      return vecRotate(screen, r, this._dimensions.center());
    } else {
      return screen;
    }
  }


  /** Unprojects a coordinate from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param screen Cartesian (x,y)
   * @returns Lon/Lat (λ,φ)
   * @example ```
   * const view = new Viewport();
   * view.unproject([0, 0]);         // returns [0, 0]
   * view.unproject([256, 256]);     // returns [180, -85.0511287798]
   * view.unproject([-256, -256]);   // returns [-180, 85.0511287798]
   * ```
   */
  unproject(screen: Vec2): Vec2 {
    const { x, y, k, r } = this._transform;
    if (r) {
      screen = vecRotate(screen, -r, this._dimensions.center());
    }
    const mercator = [(screen[0] - x) / k, (y - screen[1]) / k];
    const lambda = mercator[0];
    const phi = 2 * Math.atan(Math.exp(mercator[1])) - HALF_PI;
    return [lambda * RAD2DEG, phi * RAD2DEG];
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


  /** Sets/Gets the rotation factor
   * 0 is no rotation, which results in a map with North facing up.
   * @param val rotation factor in radians (clockwise)
   * @returns When argument is provided, sets the rotation factor and returns `this` for method chaining.
   * Returns the rotation factor otherwise
   * @example ```
   * const view = new Viewport().rotate(Math.PI / 2);   // sets rotation
   * p.rotate();   // gets rotation - returns Math.PI / 2;
   * ```
   */
  rotate(val?: number): number | Viewport {
    if (val === undefined) return this._transform.r;
    this._transform.r = wrap(+val, TAU);  // constrain to values in 0..2π
    return this;
  }


  /** Sets/Gets a transform object
   * @param val an object representing the current translation and scale
   * @returns When argument is provided, sets `x`,`y`,`k`,`r` from the Transform and returns `this` for method chaining.
   * Returns a Transform object containing the current `x`,`y`,`k`,`r` values otherwise
   * @example ```
   * const t = { x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 };
   * const view = new Viewport().transform(t);    // sets `x`,`y`,`k` from given Transform object
   * p.transform();   // gets transform - returns { x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 }
   * ```
   */
  transform(obj?: any): Transform | Viewport {
    if (obj === undefined) return Object.assign({}, this._transform);  // copy

    if (obj.x)  this._transform.x = +obj.x;
    if (obj.y)  this._transform.y = +obj.y;
    if (obj.k)  this._transform.k = +obj.k;
    if (obj.r)  this._transform.r = wrap(+obj.r, TAU);  // constrain to values in 0..2π

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
