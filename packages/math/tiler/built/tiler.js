'use strict';
/**
 * @module @id-sdk/tiler
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
 * https://developers.google.com/maps/documentation/javascript/coordinates
 */
var Tiler = /** @class */ (function() {
  /** Constructs a new Tiler
   * @returns {Tiler} new Tiler
   */
  function Tiler() {
    this._tileSize = 256;
    this._zoomRange = [0, 24];
    this._margin = 0;
    this._skipNullIsland = false;
  }
  Tiler.prototype.getTiles = function(projection) {
    var dimensions = projection.dimensions();
    var translate = projection.translate();
    var scale = projection.scale();
    var origin = [scale * Math.PI - translate[0], scale * Math.PI - translate[1]];
    var zFrac = geo_1.geoScaleToZoom(scale, this._tileSize);
    var z = clamp(Math.round(zFrac), this._zoomRange[0], this._zoomRange[1]);
    var minTile = 0;
    var maxTile = Math.pow(2, z) - 1;
    var log2ts = Math.log(this._tileSize) * Math.LOG2E;
    var k = Math.pow(2, zFrac - z + log2ts);
    var cols = range(
      clamp(Math.floor(dimensions[0][0] / k - origin[0]) - this._margin, minTile, maxTile),
      clamp(Math.ceil(dimensions[1][0] / k - origin[0]) + this._margin, minTile, maxTile)
    );
    var rows = range(
      clamp(Math.floor(dimensions[0][1] / k - origin[1]) - this._margin, minTile, maxTile),
      clamp(Math.ceil(dimensions[1][1] / k - origin[1]) + this._margin, minTile, maxTile)
    );
    var tiles = [];
    for (var i = 0; i < rows.length; i++) {
      var y = rows[i];
      for (var j = 0; j < cols.length; j++) {
        var x = cols[j];
        var xyz = [x, y, z];
        if (this._skipNullIsland && Tiler.isNearNullIsland(x, y, z)) continue;
        var isVisible =
          i >= this._margin &&
          i <= rows.length - this._margin &&
          j >= this._margin &&
          j <= cols.length - this._margin;
        var minX = x * this._tileSize;
        var minY = y * this._tileSize;
        var maxX = (x + 1) * this._tileSize;
        var maxY = (y + 1) * this._tileSize;
        var tile = {
          id: xyz.toString(),
          xyz: xyz,
          extent: new extent_1.Extent(
            projection.invert([minX, minY]),
            projection.invert([maxX, maxY])
          ),
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
      tiles: tiles
      // translate: origin,
      // scale: k
    };
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
   * Tests whether the given tile coordinate is near [0,0] (Null Island)
   * It is considered "near" if it >= z7 and around the center of the map
   * within these or descendent tiles (roughly within about 2.8° of 0,0)
   * +---------+---------+
   * |         |         |
   * | 63,63,7 | 63,64,7 |
   * |         |         |
   * +-------[0,0]-------+
   * |         |         |
   * | 64,63,7 | 64,64,7 |
   * |         |         |
   * +---------+---------+
   */
  Tiler.isNearNullIsland = function(x, y, z) {
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
