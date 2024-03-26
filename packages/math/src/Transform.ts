/**
 * 🕹️ Transform module
 * @module
 */

import { TAU, MIN_K, MAX_K } from './constants';
import { numClamp, numWrap } from './number';
import { geoScaleToZoom, geoZoomToScale } from './geo';
import { Vec2 } from './vector';

/** Contains the properties that define the transform */
export interface TransformProps {
  /** translation in x direction from origin */
  x: number;
  /** translation in y direction from origin */
  y: number;
  /** scale factor */
  k: number;
  /** rotation, in radians */
  r: number;
}


/** `Transform` is a class for dealing with transform data
 *   `x`,`y` - translation, (from origin coordinate [0,0], to top-left screen coordinate)
 *   `k`     - scale, (related to the map zoom, how many Mercator coordinates the world contains)
 *   `r`     - rotation, optionally applied post-projection to change the map bearing away from north-up
 */

export class Transform {
  public x = 0;
  public y = 0;
  public k = 256 / Math.PI;  // z1
  public r = 0;
  private _v = 1;


  /** Constructs a new Transform
   * @param other
   */
  constructor(other?: Transform) {
    if (other) {
      this.props = other;
    }
  }


  /** version
   */
  get v(): number {
    return this._v;
  }
  set v(val: number) {
    this._v = val;
  }


  /** translation factor
   */
  get translation(): Vec2 {
    return [this.x, this.y];
  }
  set translation(val: Vec2) {
    this.props = { x: val[0], y: val[1] };
  }


  /** scale factor
   */
  get scale(): number {
    return this.k;
  }
  set scale(val: number) {
    this.props = { k: val };
  }


  /** zoom factor
   *  zoom is related to scale
   */
  get zoom(): number {
    return geoScaleToZoom(this.k);
  }
  set zoom(val: number) {
    this.props = { k: geoZoomToScale(+val) };
  }


  /** rotation factor
   */
  get rotation(): number {
    return this.r;
  }
  set rotation(val: number) {
    this.props = { r: val };
  }


  /**
   */
  get props(): Required<TransformProps> {
    return { x: this.x, y: this.y, k: this.k, r: this.r };
  }
  set props(val: Partial<TransformProps>) {
    let changed = false;

    if (val.x !== undefined && val.x !== null) {
      const x = +val.x;
      if (!isNaN(x) && isFinite(x) && this.x !== x) {
        this.x = x;
        changed = true;
      }
    }

    if (val.y !== undefined && val.y !== null) {
      const y = +val.y;
      if (!isNaN(y) && isFinite(y) && this.y !== y) {
        this.y = y;
        changed = true;
      }
    }

    if (val.k !== undefined && val.k !== null) {
      let k = +val.k;
      if (!isNaN(k) && isFinite(k)) {
        k = numClamp(k, MIN_K, MAX_K);   // constrain to z0..z24
        if (this.k !== k) {
          this.k = k;
          changed = true;
        }
      }
    }

    if (val.r !== undefined && val.r !== null) {
      let r = +val.r;
      if (!isNaN(r) && isFinite(r)) {
        r = numWrap(r, 0, TAU);   // wrap to 0..2π
        if (this.r !== r) {
          this.r = r;
          changed = true;
        }
      }
    }

    if (changed) {
      this.v++;
    }
  }

}
