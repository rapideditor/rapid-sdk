/**
 * @module @id-sdk/extent
 * @description 🀄️ Module containing the Tiler class
 */

import { Extent } from '@id-sdk/extent';
import { geoScaleToZoom } from '@id-sdk/geo';

type Vec2 = [number, number];
type TileCoord = [number, number, number];

interface Tile {
  id: string;
  xyz: TileCoord;
  extent: Extent;
  isVisible: boolean;
}

interface TileResult {
  tiles: Tile[];
  translate: Vec2;
  scale: number;
}

const TAU = 2 * Math.PI;

function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(num, max));
}

function range(start: number, end: number): number[] {
  return Array.from(Array(1 + end - start).keys()).map((v) => start + v);
}

/**
 * @class
 * @description 🀄️ Tiler class for splitting the world into rectangular tiles
 */
export class Tiler {
  private _tileSize: number = 256;
  private _zoomRange: Vec2 = [0, 20];
  private _margin: number = 0;
  private _skipNullIsland: boolean = false;

  /** Constructs a new Tiler
   * @returns {Tiler} new Tiler
   */
  constructor() {}

  getTiles(dimensions: Vec2[], translate: Vec2, scale: number): TileResult {
    const zFrac: number = geoScaleToZoom(scale / TAU, this._tileSize);
    const z: number = clamp(Math.round(zFrac), this._zoomRange[0], this._zoomRange[1]);
    const tileMin: number = 0;
    const tileMax: number = Math.pow(2, z) - 1;
    const log2ts: number = Math.log(this._tileSize) * Math.LOG2E;
    const k: number = Math.pow(2, zFrac - z + log2ts);
    const origin: Vec2 = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k];

    const cols: number[] = range(
      clamp(Math.floor(dimensions[0][0] / k - origin[0]) - this._margin, tileMin, tileMax + 1),
      clamp(Math.ceil(dimensions[1][0] / k - origin[0]) + this._margin, tileMin, tileMax + 1)
    );
    const rows: number[] = range(
      clamp(Math.floor(dimensions[0][1] / k - origin[1]) - this._margin, tileMin, tileMax + 1),
      clamp(Math.ceil(dimensions[1][1] / k - origin[1]) + this._margin, tileMin, tileMax + 1)
    );

    let tiles: Tile[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const y: number = rows[i];
      for (let j: number = 0; j < cols.length; j++) {
        const x: number = cols[j];

        const xyz: TileCoord = [x, y, z];
        if (this._skipNullIsland && Tiler.nearNullIsland(x, y, z)) continue;

        const isVisible: boolean =
          i >= this._margin &&
          i <= rows.length - this._margin &&
          j >= this._margin &&
          j <= cols.length - this._margin;

        const tile: Tile = {
          id: xyz.toString(),
          xyz: xyz,
          extent: new Extent(),
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
  }

  /**
   */
  getTilesForProjection(projection: any): TileResult {
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
  }

  /**
   * returns a FeatureCollection useful for displaying a tile debug view
   */
  getGeoJSON(tileResult: TileResult): Object {
    let features = tileResult.tiles.map(function(tile) {
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
  }

  /**
   * Tests whether the given tile coordinate is near 0,0 (Null Island)
   */
  static nearNullIsland(x: number, y: number, z: number): boolean {
    if (z >= 7) {
      const center: number = Math.pow(2, z - 1);
      const width: number = Math.pow(2, z - 6);
      const min: number = center - width / 2;
      const max: number = center + width / 2 - 1;
      return x >= min && x <= max && y >= min && y <= max;
    }
    return false;
  }

  // tileSize(val: number) {
  //   if (!arguments.length) return _tileSize;
  //   _tileSize = val;
  //   return tiler;
  // }

  // zoomRange(val: Vec2) {
  //   if (!arguments.length) return _zoomRange;
  //   _zoomRange = val;
  //   return tiler;
  // }

  // // number to extend the rows/columns beyond those covering the viewport
  // margin(val: number) {
  //   if (!arguments.length) return _margin;
  //   _margin = +val;
  //   return tiler;
  // }

  // skipNullIsland(val: number) {
  //   if (!arguments.length) return _skipNullIsland;
  //   _skipNullIsland = val;
  //   return tiler;
  // }
}
