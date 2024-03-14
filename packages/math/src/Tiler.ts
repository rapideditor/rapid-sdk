/**
 * 🀄️ Tiler class for splitting the world into rectangular tiles
 * @module
 * @description
 * See: https://developers.google.com/maps/documentation/javascript/coordinates
 */

import { Extent } from './Extent';
import { Transform, Viewport } from './Viewport';
import { geoScaleToZoom, geoZoomToScale } from './geo';
import { numClamp } from './number';
import { Vec2, Vec3, vecAdd, vecRotate } from './vector';


/** Contains essential information about a tile */
export interface Tile {
  /** tile identifier string ex. '0,0,0' */
  id: string;
  /** tile coordinate array ex. [0,0,0] */
  xyz: Vec3;
  /** pixel x/y coordinate extent */
  pxExtent: Extent;
  /** wgs84 lon/lat coordinate extent */
  wgs84Extent: Extent;
  /** true if the tile is visible, false if not */
  isVisible: boolean;
}

/** An Object used to return information about the tiles covering a given viewport */
export interface TileResult {
  tiles: Tile[];
  // translate: Vec2;
  // scale: number;
}


function range(start: number, end: number): number[] {
  return Array.from(Array(1 + end - start).keys()).map((v) => start + v);
}


export class Tiler {
  private _tileSize: number = 256;
  private _zoomRange: Vec2 = [0, 24];
  private _margin: number = 0;
  private _skipNullIsland: boolean = false;

  /** Constructs a new Tiler
   * @description By default, the tiler uses a 256px tilesize, a zoomRange of 0-24,
   * fetches no margin tiles beyond the viewport, and includes data around "Null Island".
   * (These defaults can be changed at any time by using accessor methods.)
   * @example ```
   * const t = new Tiler();
   * ```
   */
  constructor() {}


  /** Returns a TileResult object which contains details about all the tiles covering the given viewport
   * @param viewport
   * @returns tile result
   * @example ```
   * At zoom 0:
   *
   *   +-------+  +85.0511
   *   |       |
   *   | 0,0,0 |
   *   |       |
   *   +-------+  -85.0511
   * -180    +180
   *
   * const t0 = new Tiler();
   * const v0 = new Viewport()
   *   .transform({ x: 128, y: 128, k: 128 / Math.PI })  // z0
   *   .dimensions([256, 256]);                          // entire world visible
   * const result = t0.getTiles(v0);
   *
   * At zoom 1:
   *
   *   +-------+-------+  +85.0511
   *   |       |       |
   *   | 0,0,1 | 1,0,1 |
   *   |       |       |
   *   +-------+-------+   0
   *   |       |       |
   *   | 0,1,1 | 1,1,1 |
   *   |       |       |
   *   +-------+-------+  -85.0511
   * -180      0     +180
   *
   * const t1 = new Tiler();
   * const v1 = new Viewport()
   *   .transform({ x: 256, y: 256, k: 256 / Math.PI })  // z1
   *   .dimensions([512, 512]);                          // entire world visible
   * const result = t1.getTiles(v1);
   *
   * At zoom 2:
   *
   *   +-------+-------+-------+-------+  +85.0511
   *   |       |       |       |       |
   *   | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
   *   |       |       |       |       |
   *   +-------+-------+-------+-------+  +66.5133
   *   |       |       |       |       |
   *   | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
   *   |       |       |       |       |
   *   +-------+-------+-------+-------+   0
   *   |       |       |       |       |
   *   | 0,2,2 | 1,2,2 | 2,2,2 | 3,2,2 |
   *   |       |       |       |       |
   *   +-------+-------+-------+-------+  -66.5133
   *   |       |       |       |       |
   *   | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
   *   |       |       |       |       |
   *   +-------+-------+-------+-------+  -85.0511
   * -180     -90      0      +90    +180
   *
   * const t2 = new Tiler();
   * const v2 = new Viewport()
   *   .transform({ x: 512, y: 512, k: 512 / Math.PI })  // z2
   *   .dimensions([1024, 1024]);                        // entire world visible
   * const result = t2.getTiles(v2);
   *```
   */
  getTiles(viewport: Viewport): TileResult {
    const t = viewport.transform() as Transform;
    const polygon = viewport.visiblePolygon();
    const [w, h] = viewport.visibleDimensions();

    // If there is a rotation, origin won't be at [0,0].
    // Un-rotate the origin back to where it would be on a north-aligned tile grid.
    let origin = polygon[0];
    if (t.r) {
      origin = vecRotate(origin, -t.r, viewport.center());
    }

    // Perform calculations in pixel coordinates, where origin is top-left viewport pixel
    const viewMin: Vec2 = [t.k * Math.PI - t.x + origin[0], t.k * Math.PI - t.y + origin[1]];
    const viewMax: Vec2 = vecAdd(viewMin, [w, h]);
    const viewExtent = new Extent(viewMin, viewMax);

    // Pick the zoom we will tile at
    const zOrig = geoScaleToZoom(t.k, this._tileSize);
    const z = numClamp(Math.round(zOrig), this._zoomRange[0], this._zoomRange[1]);
    const minTile = 0;
    const maxTile = Math.pow(2, z) - 1;
    const log2ts = Math.log(this._tileSize) * Math.LOG2E;
    const tilek = Math.pow(2, zOrig - z + log2ts);

    const cols = range(
      numClamp(Math.floor(viewMin[0] / tilek) - this._margin, minTile, maxTile),
      numClamp(Math.floor(viewMax[0] / tilek) + this._margin, minTile, maxTile)
    );
    const rows = range(
      numClamp(Math.floor(viewMin[1] / tilek) - this._margin, minTile, maxTile),
      numClamp(Math.floor(viewMax[1] / tilek) + this._margin, minTile, maxTile)
    );

    // A viewport based on tile coordinates and centered at Null Island,
    // so we can unproject back to lon/lat later
    const worldOrigin = (Math.pow(2, z) / 2) * this._tileSize;
    const worldScale = geoZoomToScale(z, this._tileSize);
    const worldViewport = new Viewport({ x: worldOrigin, y: worldOrigin, k: worldScale });

    const tiles: Tile[] = [];
    for (const y of rows) {
      for (const x of cols) {
        if (this._skipNullIsland && Tiler.isNearNullIsland(x, y, z)) continue;
        const xyz: Vec3 = [x, y, z];

        // still in pixel coordinates
        const pxMin: Vec2 = [x * this._tileSize, y * this._tileSize];
        const pxMax: Vec2 = [(x + 1) * this._tileSize, (y + 1) * this._tileSize];
        const pxExtent = new Extent(pxMin, pxMax);
        const isVisible = viewExtent.intersects(pxExtent);

        // back to lon/lat
        const wgs84Min = worldViewport.unproject([pxMin[0], pxMax[1]]);
        const wgs84Max = worldViewport.unproject([pxMax[0], pxMin[1]]);

        const tile: Tile = {
          id: xyz.toString(),
          xyz: xyz,
          pxExtent: pxExtent,
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


  /** Returns a GeoJSON FeatureCollection containing a Feature for each rectangular tile
   * @description Useful for displaying a tile grid for debugging.
   * @param tileResult
   * @returns FeatureCollection containing a Feature for each rectangular tile
   * @example ```
   * const t = new Tiler();
   * const v = new Viewport(256, 256, 256 / Math.PI)  // z1
   *   .dimensions([512, 512]);                       // entire world visible
   * const result = t.getTiles(v);
   * const gj = t.getGeoJSON(result);    // returns a GeoJSON FeatureCollection
   * ```
   */
  getGeoJSON(tileResult: TileResult): Object {
    const features = tileResult.tiles.map((tile) => {
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


  /** Sets/Gets the current tileSize
   * @param val tile size value
   * @returns When passed a numeric argument, sets the tile size and returns `this` for method chaining
   * Returns the tile size otherwise
   * @example ```
   * const t = new Tiler().tileSize(512);   // sets tile size
   * t.tileSize();   // gets tile size - returns 512
   * ```
   */
  tileSize(val?: number): number | Tiler {
    if (val === undefined) return this._tileSize;
    this._tileSize = val;
    return this;
  }


  /** Sets/Gets the current zoomRange
   * @param min
   * @param max
   * @returns When arguments are passed, sets the min/max zoom range and returns `this` for method chaining
   * Returns the min/max zoom range otherwise
   * @example ```
   * const t = new Tiler().zoomRange(10, 20);   // sets min/max zoom range
   * t.zoomRange();   // gets min/max zoom range - returns [10, 20]
   * ```
   */
  zoomRange(min?: number, max?: number): Vec2 | Tiler {
    if (min === undefined) return this._zoomRange;
    if (max === undefined) max = min;
    this._zoomRange = [min, max];
    return this;
  }


  /** Sets/Gets the current tile margin (number to extend the rows/columns beyond those covering the viewport)
   * @param val
   * @returns When an argument is passed, sets the tile margin and returns `this` for method chaining
   * Returns the tile margin otherwise
   * @example ```
   * const t = new Tiler().margin(1);   // sets tile margin
   * t.margin();   // gets tile margin - returns 1
   * ```
   */
  margin(val?: number): number | Tiler {
    if (val === undefined) return this._margin;
    this._margin = +val;
    return this;
  }


  /** Sets/Gets the current skipNullIsland value
   * @description When loading data from a tiled service, it is common for invalid data to be located around "Null Island",
   * therefore it can be useful to skip loading these tiles
   * @param val
   * @returns When an argument is passed, sets the `skipNullIsland` value and returns `this` for method chaining
   * Returns the `skipNullIsland` value otherwise
   * @example ```
   * const t = new Tiler().skipNullIsland(true);   // sets skipNullIsland value
   * t.skipNullIsland();   // gets skipNullIsland value - returns true
   * ```
   */
  skipNullIsland(val?: boolean): boolean | Tiler {
    if (val === undefined) return this._skipNullIsland;
    this._skipNullIsland = val;
    return this;
  }


  /** Tests whether the given tile coordinate is near [0,0] (Null Island)
   * @description A tile is considered "near" if it >= z7 and around the center of the map
   * within these or descendent tiles (roughly within about 2.8° of [0,0]).
   * @param x
   * @param y
   * @param z
   * @returns true if near null island, false otherwise
   * @example ```
   * +---------+---------+
   * |         |         |
   * | 63,63,7 | 64,63,7 |
   * |         |         |
   * +-------[0,0]-------+
   * |         |         |
   * | 63,64,7 | 64,64,7 |
   * |         |         |
   * +---------+---------+
   * Tiler.isNearNullIsland(31, 31, 6);    // returns false (zoom 6)
   * Tiler.isNearNullIsland(63, 65, 7);    // returns false (south of Null Island region)
   *
   * Tiler.isNearNullIsland(63, 63, 7);    // returns true
   * Tiler.isNearNullIsland(127, 127, 8);  // returns true
   * ```
   */
  static isNearNullIsland(x: number, y: number, z: number): boolean {
    if (z >= 7) {
      const center = Math.pow(2, z - 1);
      const width = Math.pow(2, z - 6);
      const min = center - width / 2;
      const max = center + width / 2 - 1;
      return x >= min && x <= max && y >= min && y <= max;
    }
    return false;
  }
}
