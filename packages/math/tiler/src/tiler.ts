import { Extent } from '@id-sdk/extent';
import { Projection } from '@id-sdk/projection';
import { geoScaleToZoom } from '@id-sdk/geo';

type Vec2 = [number, number];
type TileCoord = [number, number, number];

interface Tile {
  id: string; // tile identifier string ex. '0,0,0'
  xyz: TileCoord; // tile coordinate array ex. [0,0,0]
  pxExtent: Extent; // pixel x/y coordinate extent
  wgs84Extent: Extent; // wgs84 lon/lat coordinate extent
  isVisible: boolean; // true if the tile is visible, false if not
}

interface TileResult {
  tiles: Tile[];
  // translate: Vec2;
  // scale: number;
}

function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(num, max));
}

function range(start: number, end: number): number[] {
  return Array.from(Array(1 + end - start).keys()).map((v) => start + v);
}

export class Tiler {
  private _tileSize: number = 256;
  private _zoomRange: Vec2 = [0, 24];
  private _margin: number = 0;
  private _skipNullIsland: boolean = false;

  constructor() {}

  // Returns a TileResult object which contains details about
  // all the tiles covering the given projection and viewport.
  getTiles(projection: Projection): TileResult {
    const dimensions: Vec2[] = projection.dimensions() as Vec2[];
    const translate: Vec2 = projection.translate() as Vec2;
    const scale: number = projection.scale() as number;

    const zFrac: number = geoScaleToZoom(scale, this._tileSize);
    const z: number = clamp(Math.round(zFrac), this._zoomRange[0], this._zoomRange[1]);
    const minTile: number = 0;
    const maxTile: number = Math.pow(2, z) - 1;

    const log2ts: number = Math.log(this._tileSize) * Math.LOG2E;
    const k: number = Math.pow(2, zFrac - z + log2ts);

    // perform calculations in "world" pixel coordinates, where origin is top left viewport pixel
    const origin: Vec2 = [scale * Math.PI - translate[0], scale * Math.PI - translate[1]];
    const viewMin: Vec2 = [origin[0] + dimensions[0][0], origin[1] + dimensions[0][1]];
    const viewMax: Vec2 = [origin[0] + dimensions[1][0], origin[1] + dimensions[1][1]];
    const viewExtent: Extent = new Extent(viewMin, viewMax);

    const cols: number[] = range(
      clamp(Math.floor(viewMin[0] / k) - this._margin, minTile, maxTile),
      clamp(Math.floor(viewMax[0] / k) + this._margin, minTile, maxTile)
    );
    const rows: number[] = range(
      clamp(Math.floor(viewMin[1] / k) - this._margin, minTile, maxTile),
      clamp(Math.floor(viewMax[1] / k) + this._margin, minTile, maxTile)
    );

    let tiles: Tile[] = [];
    for (let i: number = 0; i < rows.length; i++) {
      const y: number = rows[i];
      for (let j: number = 0; j < cols.length; j++) {
        const x: number = cols[j];

        const xyz: TileCoord = [x, y, z];
        if (this._skipNullIsland && Tiler.isNearNullIsland(x, y, z)) continue;

        // still world pixel coordinates
        const tileMin: Vec2 = [x * this._tileSize, y * this._tileSize];
        const tileMax: Vec2 = [(x + 1) * this._tileSize, (y + 1) * this._tileSize];
        const tileExtent: Extent = new Extent(tileMin, tileMax);
        const isVisible: boolean = viewExtent.intersects(tileExtent);

        // back to lon/lat
        const wgs84Min: Vec2 = projection.invert([tileMin[0], tileMax[1]]);
        const wgs84Max: Vec2 = projection.invert([tileMax[0], tileMin[1]]);

        const tile: Tile = {
          id: xyz.toString(),
          xyz: xyz,
          pxExtent: new Extent(tileMin, tileMax),
          wgs84Extent: new Extent(wgs84Min, wgs84Max),
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
  }

  // Returns a GeoJSON FeatureCollection containing a Feature for each rectangular tile.
  // Useful for displaying a tile grid for debugging.
  getGeoJSON(tileResult: TileResult): Object {
    let features = tileResult.tiles.map(function (tile) {
      return {
        type: 'Feature',
        properties: {
          id: tile.id,
          name: tile.id
        },
        geometry: {
          type: 'Polygon',
          coordinates: [tile.wgs84Extent.polygon()]
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features: features
    };
  }

  // Sets/Gets the current tileSize
  tileSize(val?: number): number | Tiler {
    if (val === undefined) return this._tileSize;
    this._tileSize = val;
    return this;
  }

  // Sets/Gets the current zoomRange
  zoomRange(val?: Vec2): Vec2 | Tiler {
    if (val === undefined) return this._zoomRange;
    this._zoomRange = val;
    return this;
  }

  // Sets/Gets the current tile margin
  // (number to extend the rows/columns beyond those covering the viewport)
  margin(val?: number): number | Tiler {
    if (val === undefined) return this._margin;
    this._margin = +val;
    return this;
  }

  // Sets/Gets the current skipNullIsland value
  skipNullIsland(val?: boolean): boolean | Tiler {
    if (val === undefined) return this._skipNullIsland;
    this._skipNullIsland = val;
    return this;
  }

  /**
   * Tests whether the given tile coordinate is near [0,0] (Null Island)
   * It is considered "near" if it >= z7 and around the center of the map
   * within these or descendent tiles (roughly within about 2.8° of 0,0)
   * +---------+---------+
   * |         |         |
   * | 63,63,7 | 64,63,7 |
   * |         |         |
   * +-------[0,0]-------+
   * |         |         |
   * | 63,64,7 | 64,64,7 |
   * |         |         |
   * +---------+---------+
   */
  static isNearNullIsland(x: number, y: number, z: number): boolean {
    if (z >= 7) {
      const center: number = Math.pow(2, z - 1);
      const width: number = Math.pow(2, z - 6);
      const min: number = center - width / 2;
      const max: number = center + width / 2 - 1;
      return x >= min && x <= max && y >= min && y <= max;
    }
    return false;
  }
}
