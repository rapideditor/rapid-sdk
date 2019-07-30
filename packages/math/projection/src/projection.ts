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
   The default projection wraps the d3.geo.MercatorRaw projection, but skips several features:
   * Antimeridian clipping
   * Spherical rotation
   * Resampling
 */

export class Projection {
  private _proj: any = d3_geoMercatorRaw; // note: D3 projections work in radians

  private _k: number = 512 / Math.PI;
  private _x: number = 0;
  private _y: number = 0;
  private _dimensions: Vec2[] = [[0, 0], [0, 0]];

  project(p: Vec2): Vec2 {
    p = this._proj((p[0] * Math.PI) / 180, (p[1] * Math.PI) / 180); // deg2rad
    return [p[0] * this._k + this._x, this._y - p[1] * this._k];
  }

  invert(p: Vec2): Vec2 {
    p = this._proj.invert((p[0] - this._x) / this._k, (this._y - p[1]) / this._k);
    return [(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]; // rad2deg
  }

  scale(val: number): number | Projection {
    if (!arguments.length) return this._k;
    this._k = +val;
    return this;
  }

  translate(val: Vec2): Vec2 | Projection {
    if (!arguments.length) return [this._x, this._y];
    this._x = +val[0];
    this._y = +val[1];
    return this;
  }

  dimensions(val: Vec2[]): Vec2[] | Projection {
    if (!arguments.length) return this._dimensions;
    this._dimensions = val;
    return this;
  }

  transform(obj: Transform): Transform | Projection {
    if (!arguments.length) return d3_zoomIdentity.translate(this._x, this._y).scale(this._k);
    this._x = +obj.x;
    this._y = +obj.y;
    this._k = +obj.k;
    return this;
  }

  stream = d3_geoTransform({
    point: function(x: number, y: number): any {
      var vec = this._proj([x, y]);
      this.stream.point(vec[0], vec[1]);
    }
  }).stream;
}
