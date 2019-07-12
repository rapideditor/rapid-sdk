import { geoMercatorRaw as d3_geoMercatorRaw, geoTransform as d3_geoTransform } from 'd3-geo';
import { zoomIdentity as d3_zoomIdentity } from 'd3-zoom';

/*
    Bypasses features of D3's default projection stream pipeline that are unnecessary:
    * Antimeridian clipping
    * Spherical rotation
    * Resampling
*/
export function RawMercator() {
  var project = d3_geoMercatorRaw;
  var _k = 512 / Math.PI; // scale
  var _x = 0;
  var _y = 0; // translate
  var _clipExtent = [[0, 0], [0, 0]];

  function projection(point) {
    point = project((point[0] * Math.PI) / 180, (point[1] * Math.PI) / 180);
    return [point[0] * _k + _x, _y - point[1] * _k];
  }

  projection.invert = function(point) {
    point = project.invert((point[0] - _x) / _k, (_y - point[1]) / _k);
    return point && [(point[0] * 180) / Math.PI, (point[1] * 180) / Math.PI];
  };

  projection.scale = function(val) {
    if (!arguments.length) return _k;
    _k = +val;
    return projection;
  };

  projection.translate = function(val) {
    if (!arguments.length) return [_x, _y];
    _x = +val[0];
    _y = +val[1];
    return projection;
  };

  projection.clipExtent = function(val) {
    if (!arguments.length) return _clipExtent;
    _clipExtent = val;
    return projection;
  };

  projection.transform = function(obj) {
    if (!arguments.length) return d3_zoomIdentity.translate(_x, _y).scale(_k);
    _x = +obj.x;
    _y = +obj.y;
    _k = +obj.k;
    return projection;
  };

  projection.stream = d3_geoTransform({
    point: function(x, y) {
      var vec = projection([_x, _y]);
      this.stream.point(vec[0], vec[1]);
    }
  }).stream;

  return projection;
}
