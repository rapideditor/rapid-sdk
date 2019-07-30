'use strict';
/**
 * @module @id-sdk/projection
 * @description 📽 Module containing the Projection class
 */
exports.__esModule = true;
var d3_geo_1 = require('d3-geo');
var d3_zoom_1 = require('d3-zoom');
/**
 * @class
 * @description 📽 Projection class for converting between Lon/Lat (λ,φ) and Cartesian (x,y) coordinates
   The default projection wraps the d3.geo.MercatorRaw projection, but skips several features:
   * Antimeridian clipping
   * Spherical rotation
   * Resampling
 */
var Projection = /** @class */ (function() {
  function Projection() {
    this._proj = d3_geo_1.geoMercatorRaw; // note: D3 projections work in radians
    this._k = 512 / Math.PI;
    this._x = 0;
    this._y = 0;
    this._dimensions = [[0, 0], [0, 0]];
    this.stream = d3_geo_1.geoTransform({
      point: function(x, y) {
        var vec = this._proj([x, y]);
        this.stream.point(vec[0], vec[1]);
      }
    }).stream;
  }
  Projection.prototype.project = function(p) {
    p = this._proj((p[0] * Math.PI) / 180, (p[1] * Math.PI) / 180); // deg2rad
    return [p[0] * this._k + this._x, this._y - p[1] * this._k];
  };
  Projection.prototype.invert = function(p) {
    p = this._proj.invert((p[0] - this._x) / this._k, (this._y - p[1]) / this._k);
    return [(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]; // rad2deg
  };
  Projection.prototype.scale = function(val) {
    if (!arguments.length) return this._k;
    this._k = +val;
    return this;
  };
  Projection.prototype.translate = function(val) {
    if (!arguments.length) return [this._x, this._y];
    this._x = +val[0];
    this._y = +val[1];
    return this;
  };
  Projection.prototype.dimensions = function(val) {
    if (!arguments.length) return this._dimensions;
    this._dimensions = val;
    return this;
  };
  Projection.prototype.transform = function(obj) {
    if (!arguments.length) return d3_zoom_1.zoomIdentity.translate(this._x, this._y).scale(this._k);
    this._x = +obj.x;
    this._y = +obj.y;
    this._k = +obj.k;
    return this;
  };
  return Projection;
})();
exports.Projection = Projection;
