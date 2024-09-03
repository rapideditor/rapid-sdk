/**
 * 📺 Viewport module for managing view state and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 * @module
 */

import { TAU, DEG2RAD, RAD2DEG, HALF_PI, MIN_PHI, MAX_PHI } from './constants';
import { Extent } from './Extent';
import { numClamp, numWrap } from './number';
import { Transform, TransformProps } from './Transform';
import { Vec2, vecRotate, vecScale, vecCeil } from './vector';


/** `Viewport` is a class for managing the state of the viewer
 *   and converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
 *
 *  Original geographic coordinate data is in WGS84 (Lon,Lat)
 *  and "projected" into screen space (x,y) using the Web Mercator projection
 *  see: https://en.wikipedia.org/wiki/Web_Mercator_projection
 *
 *  The parameters of this projection are stored in `_transform`
 *  -  `x`,`y` - translation, (from origin coordinate [0,0], to top-left screen coordinate)
 *  -  `k`     - scale, (related to the map zoom, how many Mercator coordinates the world contains)
 *  -  `r`     - rotation, optionally applied post-projection to change the map bearing away from north-up
 *
 *  The viewport (what a user can see) is defined by:
 *  A rectangular Extent A-B-C-D (stored in `_dimensions`), representing the user's screen.
 *  By default, the origin of the screen space is top-left coordinate 'A' [0,0].
 *  When a rotation is applied, the visible extent extends to E-F-G-H and top-left coordinate 'E'.
 *  ```
 *        |  E__
 *        |r/   ''--..__
 *        |/           r''--..__
 *  [0,0] A═══════════════════════D__
 *       /║                       ║  ''H         N
 *      /r║                       ║   /      W._/
 *     /  ║           +           ║  /         /'-E
 *    /   ║                       ║r/         S
 *   F__  ║                       ║/
 *      ''B═══════════════════════C [w,h]
 *           ''--..__r           /|
 *                   ''--..__   /r|
 *                           ''G  |
 * ```
 */
export class Viewport {
  private _transform = new Transform();
  private _dimensions: Vec2 = [0, 0];
  private _v = 1;


  /** Constructs a new Viewport
   * @remarks Default viewport corresponds to the world at zoom 1 with origin at "Null Island" [0, 0].
   * @param transform
   * @param dimensions
   * @example
   * const view1 = new Viewport();
   * const view2 = new Viewport({ x: 20, y: 30, k: 512 / Math.PI });
   */
  constructor(transform?: Partial<TransformProps>, dimensions?: Vec2) {
    if (transform) this.transform = transform;
    if (dimensions) this.dimensions = dimensions;
  }


  /** version
   */
  get v(): number {
    return this._v + this._transform.v;
  }
  set v(val: number) {
    this._v = val - this._transform.v;
  }


  /** Projects a coordinate from Lon/Lat (λ,φ) to Cartesian (x,y)
   * @param loc Lon/Lat (λ,φ)
   * @returns Cartesian (x,y)
   * @example
   * const v = new Viewport();
   * v.project([0, 0]);                  // returns [0, 0]
   * v.project([180, -85.0511287798]);   // returns [256, 256]
   * v.project([-180, 85.0511287798]);   // returns [-256, -256]
   */
  project(loc: Vec2, includeRotation?: boolean): Vec2 {
    const { x, y, k, r } = this._transform;

    const lambda = loc[0] * DEG2RAD;
    const phi = numClamp(loc[1] * DEG2RAD, MIN_PHI, MAX_PHI);
    const mercatorX = lambda;
    const mercatorY = Math.log(Math.tan((HALF_PI + phi) / 2));
    const point: Vec2 = [mercatorX * k + x, y - mercatorY * k];

    if (includeRotation && r) {
      return vecRotate(point, r, this.center());
    } else {
      return point;
    }
  }


  /** Unprojects a coordinate from given Cartesian (x,y) to Lon/Lat (λ,φ)
   * @param point Cartesian (x,y)
   * @returns Lon/Lat (λ,φ)
   * @example
   * const v = new Viewport();
   * v.unproject([0, 0]);         // returns [0, 0]
   * v.unproject([256, 256]);     // returns [180, -85.0511287798]
   * v.unproject([-256, -256]);   // returns [-180, 85.0511287798]
   */
  unproject(point: Vec2, includeRotation?: boolean): Vec2 {
    const { x, y, k, r } = this._transform;

    if (includeRotation && r) {
      point = vecRotate(point, -r, this.center());
    }

    const mercatorX = (point[0] - x) / k;
    const mercatorY = numClamp((y - point[1]) / k, -Math.PI, Math.PI);
    const lambda = mercatorX;
    const phi = 2 * Math.atan(Math.exp(mercatorY)) - HALF_PI;

    return [lambda * RAD2DEG, phi * RAD2DEG];
  }


  /** Sets/Gets a transform object
   * @param val a Transform-like object containing the new Transform properties
   * @returns When argument is provided, sets `x`,`y`,`k`,`r` from the Transform and returns `this` for method chaining.
   * Returns a Transform object containing the current `x`,`y`,`k`,`r` values otherwise
   * @example
   * const t = { x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 };
   * const v = new Viewport();
   * v.transform = t;    // sets transform `x`,`y`,`k`,`r` from given Object
   * v.transform;        // gets transform
   */
  set transform(val: Partial<TransformProps>) {
    this._transform.props = val;
  }
  get transform(): Transform {
    return this._transform;
  }


  /** Sets/Gets the screen dimensions
   * @param val viewport dimensions
   * @returns When argument is provided, sets the viewport max dimensions and returns `this` for method chaining.
   * Returns the viewport max dimensions otherwise
   * @example
   * const v = new Viewport();
   * v.dimensions = [800, 600];  // sets dimensions
   * v.dimensions;               // gets dimensions, returns [800, 600]
   */
  set dimensions(val: Vec2) {
    const [w, h] = vecCeil([+val[0], +val[1]]);
    if (!isNaN(w) && isFinite(w) && !isNaN(h) && isFinite(h) && (this._dimensions[0] !== w || this._dimensions[1] !== h)) {
      this._dimensions = [w, h];
      this.v++;
    }
  }
  get dimensions(): Vec2 {
    return this._dimensions;
  }


  /** Returns the screen center coordinate in [x, y]
   * @returns viewport screen center coordinate in [x, y]
   * @example
   * const v = new Viewport()
   * v.dimensions = [800, 600];
   * v.center();   // returns [400, 300]
   */
  center(): Vec2 {
    return vecScale(this._dimensions, 0.5);
  }


  /** Returns the screen center coordinate in [lon, lat]
   * @returns viewport screen center coordinate in [lon, lat]
   * @example
   * const v = new Viewport();
   * v.dimensions = [800, 600]
   * v.transform = { x: 400, y: 300 };
   * v.centerLoc();   // returns [0, 0]  ("Null Island")
   */
  centerLoc(): Vec2 {
    return this.unproject(this.center());
  }


  /** Returns the viewport's visible polygon (wound counterclockwise)
   *  We construct a rotated rectangle that contains the original screen rectangle.
   *  The rotated rectangle has the same center point as the original screen rectangle.
   *  see https://math.stackexchange.com/questions/1628657/dimensions-of-a-rectangle-containing-a-rotated-rectangle
   *  The first coordinate in the rotated rectangle is the rotated origin (E)
   *  ```
   *        |  E__
   *        |r/   ''--..__
   *        |/           r''--..__
   *  [0,0] A═══════════════════════D__
   *       /║                       ║  ''H         N
   *      /r║                       ║   /      W._/
   *     /  ║           +           ║  /         /'-E
   *    /   ║                       ║r/         S
   *   F__  ║                       ║/
   *      ''B═══════════════════════C [w,h]
   *           ''--..__r           /|
   *                   ''--..__   /r|
   *                           ''G  |
   *  ```
   */
  visiblePolygon(): Vec2[] {
    const [w, h] = this._dimensions;
    const r = numWrap(this._transform.r, 0, TAU);  // just in case, wrap to 0..2π

    if (r) {
      const sinr = Math.abs(Math.sin(r));
      const cosr = Math.abs(Math.cos(r));

      const ae = w * sinr;
      const af = h * cosr;

      const ex = ae * sinr;
      const ey = ae * cosr;
      const fx = af * sinr;
      const fy = af * cosr;

      let E, F, G, H;

      if (r > 0 && r <= HALF_PI) {   // ex = 0..w, fy = h..0
        E = [ex, -ey];
        F = [-fx, fy];
        G = [w - ex, h + ey];
        H = [w + fx, h - fy];
      } else if (r > HALF_PI && r <= Math.PI) {   // ex = w..0, fy = 0..h
        E = [w + fx, fy];
        F = [w - ex, -ey];
        G = [-fx, h - fy];
        H = [ex, h + ey];
      } else if (r > Math.PI && r <= 3 * HALF_PI) {  // ex = 0..w, fy = h..0
        E = [w - ex, h + ey];
        F = [w + fx, h - fy];
        G = [ex, -ey];
        H = [-fx, fy];
      } else {   // ex = w..0, fy = 0..h
        E = [-fx, h - fy];
        F = [ex, h + ey];
        G = [w + fx, fy];
        H = [w - ex, -ey];
      }
      //console.log(`ex: ${ex}, ey: ${ey}, fx: ${fx}, fy: ${fy}`);
      //console.log(`E: ${E}, F: ${F}, G: ${G}, H: ${H}`);
      return [E, F, G, H, E];

    } else {
      return [[0, 0], [0, h], [w, h], [w, 0], [0, 0]];
    }
  }


  /** Gets the visible dimensions
   */
  visibleDimensions(): Vec2 {
    const [w, h] = this._dimensions;
    const r = this._transform.r;

    if (r) {
      const sinr = Math.abs(Math.sin(r));
      const cosr = Math.abs(Math.cos(r));

      const w2 = w * cosr + h * sinr;    // ed + fb
      const h2 = h * cosr + w * sinr;    // af + ae

      return vecCeil([w2, h2]);
    } else {
      return [w, h];
    }
  }


  /** Gets the visible Extent
   */
  visibleExtent(): Extent {
    const polygon = this.visiblePolygon();
    const min = this.unproject(polygon[1], true);  // bottom-left
    const max = this.unproject(polygon[3], true);  // top-right
    return new Extent(min, max);
  }

}
