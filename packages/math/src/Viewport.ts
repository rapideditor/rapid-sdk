/**
 * 📺 Viewport module for managing view state and converting between Lon/Lat [λ,φ] and Cartesian [x,y] coordinates
 * @module
 */

import { TAU, DEG2RAD, RAD2DEG, HALF_PI, MAX_PHI, MIN_PHI, WORLD_HALF, WORLD_SIZE, WORLD_ZOOM, ANGLE_EPSILON } from './constants.ts';
import { Extent } from './Extent.ts';
import { numClamp, numWrap } from './number.ts';
import { Transform } from './Transform.ts';
import { vecRotate, vecScale, vecCeil } from './vector.ts';

import type { Quad, TransformProps, Vec2 } from './types.ts';


/** `Viewport` is a class for managing the state of the viewer
 *   and converting between Lon/Lat [λ,φ] and Cartesian [x,y] coordinates
 *
 *  Original geographic coordinate data is in WGS84 (Lon,Lat)
 *  and "projected" into screen space [x,y] using the Web Mercator projection
 *  see: https://en.wikipedia.org/wiki/Web_Mercator_projection
 *
 *  Some nomenclature on the coordinates that this code uses:
 *  - "WGS84 coordinates" - These are Lon/Lat [λ,φ]
 *  - "world coordinates" - These are Mercator projected into Cartesian [x,y] and pre-scaled to WORLD_ZOOM
 *     - origin puts [0,0] at top left of world and [WORLD_SIZE, WORLD_SIZE] (256 × 2^WORLD_ZOOM) at bottom right.
 *     - pre-scaling to z=WORLD_ZOOM means geometry projected once can be rendered at any zoom without recalculating.
 *  - "screen coordinates" - These are the Cartesian coordinates with view transform applied
 *     - origin puts [0,0] at top left of screen and they are in pixels
 *
 *  The parameters of this projection are stored in `_transform`
 *  -  `x`,`y` - translation, (from origin coordinate [0,0], to top-left screen coordinate)
 *  -  `z`     - zoom (the scale factor is 2^z)
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
   * const view2 = new Viewport({ x: 20, y: 30, z: 2 });
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


  /** Projects a coordinate from Lon/Lat [λ,φ] to Cartesian [x,y]
   * @param loc Lon/Lat [λ,φ]
   * @param includeRotation - if true, consider rotation when working with the screen coordinate
   * @returns Cartesian [x,y]
   * @example
   * const v = new Viewport();
   * v.project([0, 0]);                  // returns [0, 0]
   * v.project([180, -85.0511287798]);   // returns [256, 256]
   * v.project([-180, 85.0511287798]);   // returns [-256, -256]
   */
  project(loc: Vec2, includeRotation?: boolean): Vec2 {
    return this.worldToScreen(this.wgs84ToWorld(loc), includeRotation);
  }


  /** Unprojects a coordinate from given Cartesian [x,y] to Lon/Lat [λ,φ]
   * @param point Cartesian [x,y]
   * @param includeRotation - if true, consider rotation when working with the screen coordinate
   * @returns Lon/Lat [λ,φ]
   * @example
   * const v = new Viewport();
   * v.unproject([0, 0]);         // returns [0, 0]
   * v.unproject([256, 256]);     // returns [180, -85.0511287798]
   * v.unproject([-256, -256]);   // returns [-180, 85.0511287798]
   */
  unproject(point: Vec2, includeRotation?: boolean): Vec2 {
    return this.worldToWgs84(this.screenToWorld(point, includeRotation));
  }


  /** Converts from Lon/Lat [λ,φ] WGS84 coordinate to Cartesian [x,y] world coordinate
   * @see https://gis.stackexchange.com/questions/66247/what-is-the-formula-for-calculating-world-coordinates-for-a-given-latlng-in-goog
   * @param    loc - The WGS84 coordinate Lon/Lat [λ,φ]
   * @returns  The world coordinate [x,y]
   */
  wgs84ToWorld(loc: Vec2): Vec2 {
    const x = (loc[0] + 180) / 360 * WORLD_SIZE;
    const phi = numClamp(loc[1] * DEG2RAD, MIN_PHI, MAX_PHI);
    const y = ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * WORLD_SIZE;
    return [x, y];
  }


  /** Converts from Cartesian [x,y] world coordinate to Lon/Lat [λ,φ] WGS84 coordinate
   * @see https://gis.stackexchange.com/questions/66247/what-is-the-formula-for-calculating-world-coordinates-for-a-given-latlng-in-goog
   * @param    world - The world coordinate [x,y]
   * @returns  The WGS84 coordinate Lon/Lat [λ,φ]
   */
  worldToWgs84(world: Vec2): Vec2 {
    const lon = (world[0] / WORLD_SIZE) * 360 - 180;
    const n = Math.PI - TAU * (world[1] / WORLD_SIZE);
    const phi = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    const lat = numClamp(phi, MIN_PHI, MAX_PHI) * RAD2DEG;
    return [lon, lat];
  }


  /** Converts from world coordinate to screen coordinate applying view transform
   * @param    world  - the world coordinate [x,y]
   * @param    includeRotation - if true, consider rotation when working with the screen coordinate
   * @returns  The screen coordinate [x,y]
   */
  worldToScreen(world: Vec2, includeRotation?: boolean): Vec2 {
    const { x, y, z, r } = this._transform;
    const scale = 2 ** (z - WORLD_ZOOM);  // world coords are pre-scaled to WORLD_ZOOM

    const point: Vec2 = [
      ((world[0] - WORLD_HALF) * scale) + x,
      ((world[1] - WORLD_HALF) * scale) + y
    ];

    if (includeRotation && Math.abs(r) > ANGLE_EPSILON) {
      return vecRotate(point, r, this.center());
    } else {
      return point;
    }
  }


  /** Converts from screen coordinate to world coordinate applying view transform
   * @param    screen  - the screen coordinate [x,y]
   * @param    includeRotation - if true, consider rotation when working with the screen coordinate
   * @returns  The world coordinate [x,y]
   */
  screenToWorld(screen: Vec2, includeRotation?: boolean): Vec2 {
    const { x, y, z, r } = this._transform;

    if (includeRotation && Math.abs(r) > ANGLE_EPSILON) {
      screen = vecRotate(screen, -r, this.center());
    }

    const scale = 2 ** (z - WORLD_ZOOM);  // world coords are pre-scaled to WORLD_ZOOM
    const point: Vec2 = [
      ((screen[0] - x) / scale) + WORLD_HALF,
      ((screen[1] - y) / scale) + WORLD_HALF
    ];
    return point;
  }


  /** Sets/Gets a transform object
   * @param val a Transform-like object containing the new Transform properties
   * @returns When argument is provided, sets `x`,`y`,`z`,`r` from the Transform and returns `this` for method chaining.
   * Returns a Transform object containing the current `x`,`y`,`z`,`r` values otherwise
   * @example
   * const t = { x: 20, y: 30, z: 1, r: Math.PI / 2 };
   * const v = new Viewport();
   * v.transform = t;    // sets transform `x`,`y`,`z`,`r` from given Object
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
   *  (in "screen" coordinates)
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
  visiblePolygon(): Quad {
    const [w, h] = this._dimensions;
    const wrapped = numWrap(this._transform.r, 0, TAU);  // just in case, wrap to 0..2π
    const r = (wrapped < ANGLE_EPSILON || (TAU - wrapped) < ANGLE_EPSILON) ? 0 : wrapped;

    if (r) {
      const sinr = Math.abs(Math.sin(r));
      const cosr = Math.abs(Math.cos(r));
      const sin = sinr < ANGLE_EPSILON ? 0 : sinr;
      const cos = cosr < ANGLE_EPSILON ? 0 : cosr;

      const ae = w * sin;
      const af = h * cos;

      const ex = ae * sin;
      const ey = ae * cos;
      const fx = af * sin;
      const fy = af * cos;

      let E: Vec2, F: Vec2, G: Vec2, H: Vec2;

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
    const wrapped = numWrap(this._transform.r, 0, TAU);
    const r = (wrapped < ANGLE_EPSILON || (TAU - wrapped) < ANGLE_EPSILON) ? 0 : wrapped;

    if (r) {
      const sinr = Math.abs(Math.sin(r));
      const cosr = Math.abs(Math.cos(r));
      const sin = sinr < ANGLE_EPSILON ? 0 : sinr;
      const cos = cosr < ANGLE_EPSILON ? 0 : cosr;

      const w2 = w * cos + h * sin;    // ed + fb
      const h2 = h * cos + w * sin;    // af + ae

      return vecCeil([w2, h2]);
    } else {
      return [w, h];
    }
  }


  /** Gets the visible Extent (in WGS84 coordinates)
   */
  visibleExtent(): Extent {
    const polygon = this.visiblePolygon();
    const min = this.unproject(polygon[1], true);  // bottom-left
    const max = this.unproject(polygon[3], true);  // top-right
    return new Extent(min, max);
  }

  /** Gets the visible Extent (in world coordinates)
   */
  visibleWorldExtent(): Extent {
    const polygon = this.visiblePolygon();
    const min = this.screenToWorld(polygon[0], true);  // top-left
    const max = this.screenToWorld(polygon[2], true);  // bottom-right
    return new Extent(min, max);
  }

}
