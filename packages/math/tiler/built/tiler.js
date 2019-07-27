'use strict';
/**
 * @module @id-sdk/extent
 * @description 🀄️ Module containing the Tiler class
 */
exports.__esModule = true;
var extent_1 = require('@id-sdk/extent');
var geo_1 = require('@id-sdk/geo');
var TAU = 2 * Math.PI;
function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}
function range(start, end) {
  return Array.from(Array(1 + end - start).keys()).map(function(v) {
    return start + v;
  });
}
/**
 * @class
 * @description 🀄️ Tiler class for splitting the world into rectangular tiles
 */
var Tiler = /** @class */ (function() {
  /** Constructs a new Tiler
   * @returns {Tiler} new Tiler
   */
  function Tiler() {
    this._tileSize = 256;
    this._zoomRange = [0, 20];
    this._margin = 0;
    this._skipNullIsland = false;
  }
  Tiler.prototype.getTiles = function(dimensions, translate, scale) {
    var zFrac = geo_1.geoScaleToZoom(scale / TAU, this._tileSize);
    var z = clamp(Math.round(zFrac), this._zoomRange[0], this._zoomRange[1]);
    var tileMin = 0;
    var tileMax = Math.pow(2, z) - 1;
    var log2ts = Math.log(this._tileSize) * Math.LOG2E;
    var k = Math.pow(2, zFrac - z + log2ts);
    var origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k];
    var cols = range(
      clamp(Math.floor(dimensions[0][0] / k - origin[0]) - this._margin, tileMin, tileMax + 1),
      clamp(Math.ceil(dimensions[1][0] / k - origin[0]) + this._margin, tileMin, tileMax + 1)
    );
    var rows = range(
      clamp(Math.floor(dimensions[0][1] / k - origin[1]) - this._margin, tileMin, tileMax + 1),
      clamp(Math.ceil(dimensions[1][1] / k - origin[1]) + this._margin, tileMin, tileMax + 1)
    );
    var tiles = [];
    for (var i = 0; i < rows.length; i++) {
      var y = rows[i];
      for (var j = 0; j < cols.length; j++) {
        var x = cols[j];
        var xyz = [x, y, z];
        if (this._skipNullIsland && Tiler.nearNullIsland(x, y, z)) continue;
        var isVisible =
          i >= this._margin &&
          i <= rows.length - this._margin &&
          j >= this._margin &&
          j <= cols.length - this._margin;
        var tile = {
          id: xyz.toString(),
          xyz: xyz,
          extent: new extent_1.Extent(),
          isVisible: isVisible
        };
        if (isVisible) {
          tiles.unshift(tile); // tiles in view at beginning
        } else {
          tiles.push(tile); // tiles in margin at the end
        }
      }
    }
    return {
      tiles: tiles,
      translate: origin,
      scale: k
    };
  };
  /**
   */
  Tiler.prototype.getTilesForProjection = function(projection) {
    // let origin = [
    //   projection.scale() * Math.PI - projection.translate()[0],
    //   projection.scale() * Math.PI - projection.translate()[1]
    // ];
    return this.getTiles(projection.clipExtent(), projection.translate(), projection.scale() * TAU);
    // let ts: number = result.scale;
    // let tiles = result.tiles;
    // return tiles
    //   .map(function(tile) {
    //     let x = tile[0] * ts - origin[0];
    //     let y = tile[1] * ts - origin[1];
    //     return {
    //       id: tile.toString(),
    //       xyz: tile,
    //       extent: geoExtent(projection.invert([x, y + ts]), projection.invert([x + ts, y]))
    //     };
    //   })
    //   .filter(Boolean);
  };
  /**
   * returns a FeatureCollection useful for displaying a tile debug view
   */
  Tiler.prototype.getGeoJSON = function(tileResult) {
    var features = tileResult.tiles.map(function(tile) {
      return {
        type: 'Feature',
        properties: {
          id: tile.id,
          name: tile.id
        },
        geometry: {
          type: 'Polygon',
          coordinates: [tile.extent.polygon()]
        }
      };
    });
    return {
      type: 'FeatureCollection',
      features: features
    };
  };
  /**
   * Tests whether the given tile coordinate is near 0,0 (Null Island)
   */
  Tiler.nearNullIsland = function(x, y, z) {
    if (z >= 7) {
      var center = Math.pow(2, z - 1);
      var width = Math.pow(2, z - 6);
      var min = center - width / 2;
      var max = center + width / 2 - 1;
      return x >= min && x <= max && y >= min && y <= max;
    }
    return false;
  };
  return Tiler;
})();
exports.Tiler = Tiler;
