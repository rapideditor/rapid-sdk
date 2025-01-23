/**
 * 🀄️ Tiler class for splitting the world into rectangular tiles
 * @module
 * @remarks
 * See: https://developers.google.com/maps/documentation/javascript/coordinates
 */

import { MAX_Z, MIN_Z } from './constants';
import { Extent } from './Extent';
import { Viewport } from './Viewport';
import { geomPathHasIntersections, geomPolygonIntersectsPolygon, geomRotatePoints } from './geom';
import { numClamp } from './number';
import { Vec2, Vec3 } from './vector';


/** Contains essential information about a tile */
export interface Tile {
  /** tile identifier string ex. '0,0,0' */
  id: string;
  /** tile coordinate array ex. [0,0,0] */
  xyz: Vec3;
  /** Extent in world coordinates (x,y) */
  tileExtent: Extent;
  /** Extent in WGS84 coordinates(lon,lat) */
  wgs84Extent: Extent;
  /** true if the tile is visible, false if not */
  isVisible: boolean;
}


/** An Object used to return information about the tiles covering a given viewport */
export interface TileResult {
  tiles: Tile[];
}


function range(start: number, end: number): number[] {
  return Array.from(Array(1 + end - start).keys()).map((v) => start + v);
}


export class Tiler {
  private _tileSize = 256;
  private _zoomRange: Vec2 = [MIN_Z, MAX_Z];
  private _margin = 0;
  private _skipNullIsland = false;

  /** Constructs a new Tiler
   * @remarks By default, the tiler uses a 256px tilesize, a zoomRange of 0-24,
   * fetches no margin tiles beyond the viewport, and includes data around "Null Island".
   * (These defaults can be changed at any time by using accessor methods.)
   * @example
   * const t = new Tiler();
   */
  constructor() {}


  /** Returns a TileResult object which contains details about all the tiles covering the given viewport
   * @param viewport
   * @returns tile result
   * @example
   * ```
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
   * const v0 = new Viewport();
   * v0.transform = { x: 128, y: 128, z: 0 };
   * v0.dimensions = [256, 256];     // entire world visible
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
   * const v1 = new Viewport();
   * v1.transform = { x: 256, y: 256, z: 1 };
   * v1.dimensions = [512, 512];     // entire world visible
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
   * const v2 = new Viewport();
   * v2.transform = { x: 512, y: 512, z: 2 };
   * v2.dimensions = [1024, 1024];   // entire world visible
   * const result = t2.getTiles(v2);
   * ```
   */
  getTiles(viewport: Viewport): TileResult {

    // The map may be rotated, but the tiles will need to align to north-up,
    // so the region we are tiling is the [E, F, G, H] one.
    // [sx,sy] is [0,0] in screen coordinates, but we need to make [vx,vy] the origin.
    //
    //    visible
    //    [vx,vy] E__
    //           /   ''--..__
    // screen   /           r''--..__
    // [sx,sy] A═══════════════════════D__
    //        /║                       ║  ''H         N
    //       /r║                       ║   /      W._/
    //      /  ║           +           ║  /         /'-E
    //     /   ║                       ║r/         S
    //    F__  ║                       ║/
    //       ''B═══════════════════════C  [sw,sh]
    //            ''--..__r           /
    //                    ''--..__   /
    //                            ''G  [vw,vh]

    const ts = this._tileSize;     // tile size in pizels
    const ms = this._margin * ts;  // margin size in pixels
    const t = viewport.transform.props;
    const [sw, sh] = viewport.dimensions;
    let visiblePolygon = viewport.visiblePolygon() as Vec2[];
    let screenPolygon = [[0, 0], [0, sh], [sw, sh], [sw, 0], [0, 0]] as Vec2[];

    // Consumers can optionally request extra rows/columns of tiles from a "margin".
    // This can be useful for stitching together geometries that appear on adjacent tiles.
    // We add these margin pixels to the un-rotated polygon.
    let marginPolygon = _addMargin(screenPolygon, ms);

    // Un-rotate the polygons back to where they would be on a north-aligned grid.
    if (t.r) {
      const center = viewport.center();
      screenPolygon = geomRotatePoints(screenPolygon, -t.r, center);
      marginPolygon = geomRotatePoints(marginPolygon, -t.r, center);
      visiblePolygon = geomRotatePoints(visiblePolygon, -t.r, center);
    }
    if (ms) {  // now that visible is un-rotated, we can apply margin to it if needed.
      visiblePolygon = _addMargin(visiblePolygon, ms);
    }

    // Convert all polygons to world coordinates..
    for (let i = 0; i < 5; i++) {
      visiblePolygon[i] = viewport.screenToWorld(visiblePolygon[i]);
      screenPolygon[i] = viewport.screenToWorld(screenPolygon[i]);
      marginPolygon[i] = viewport.screenToWorld(marginPolygon[i]);
    }

    const worldMin = visiblePolygon[0];  // point E
    const worldMax = visiblePolygon[2];  // point G

    // Pick the zoom `z` we will tile at.  It will be whatever integer is closest to
    // the zoom of the viewport, and within the ranges allowed by the tiler.
    const log2ts = Math.log2(ts);
    const adjust = log2ts - 8;   // adjust zoom for tile sizes not 256px (log2(256) = 8)
    const zOrig = t.z - adjust;
    const z = numClamp(Math.round(zOrig), this._zoomRange[0], this._zoomRange[1]);
    const pow2z = Math.pow(2, z);
    const worldScale = pow2z / 256;
    const tileScale = 256 / pow2z;
    const min = 0;
    const max = pow2z - 1;

    const cols = range(
      numClamp(Math.floor(worldMin[0] * worldScale), min, max),
      numClamp(Math.floor(worldMax[0] * worldScale), min, max)
    );
    const rows = range(
      numClamp(Math.floor(worldMin[1] * worldScale), min, max),
      numClamp(Math.floor(worldMax[1] * worldScale), min, max)
    );

    const tiles: Tile[] = [];
    for (const y of rows) {
      for (const x of cols) {
        if (this._skipNullIsland && Tiler.isNearNullIsland(x, y, z)) continue;

        // The tile bounds in world coordinates
        const tileMin: Vec2 = [x * tileScale, y * tileScale];
        const tileMax: Vec2 = [(x + 1) * tileScale, (y + 1) * tileScale];
        const tileExtent = new Extent(tileMin, tileMax);
        const tilePolygon = tileExtent.polygon();

        // If it's not even in the margin, we can exclude this tile from the resultset.
        // Test both ways, maybe the tile covers the margin, maybe the margin covers the tile?
        let isIncluded =
          geomPolygonIntersectsPolygon(marginPolygon, tilePolygon, false) ||    // false = fast test
          geomPolygonIntersectsPolygon(tilePolygon, marginPolygon, false);

        // Note, for rotated viewports, we need the strict test,
        // because the tile corners may be rotated out of the viewport - see rapid-sdk#281
        if (!isIncluded && t.r !== 0) {
          isIncluded = geomPathHasIntersections(marginPolygon, tilePolygon);
        }
        if (!isIncluded) continue;    // no need to include this tile in the result

        // Within the margin but not on screen?
        let isVisible =
          geomPolygonIntersectsPolygon(screenPolygon, tilePolygon, false) ||
          geomPolygonIntersectsPolygon(tilePolygon, screenPolygon, false);

        if (!isVisible && t.r !== 0) {
          isVisible = geomPathHasIntersections(screenPolygon, tilePolygon);
        }

        // back to lon/lat
        const wgs84Min = viewport.worldToWgs84([tileMin[0], tileMax[1]]);  // bottom left
        const wgs84Max = viewport.worldToWgs84([tileMax[0], tileMin[1]]);  // top right
        const wgs84Extent = new Extent(wgs84Min, wgs84Max);
        const xyz: Vec3 = [x, y, z];

        const tile: Tile = {
          id: xyz.toString(),
          xyz: xyz,
          tileExtent: tileExtent,
          wgs84Extent: wgs84Extent,
          isVisible: isVisible
        };

        if (isVisible) {
          tiles.unshift(tile);  // tiles in view at beginning
        } else {
          tiles.push(tile);     // tiles in margin at the end
        }
      }
    }

    return {
      tiles: tiles
    };


    // add margin pixels to the given polygon
    function _addMargin(poly: Vec2[], m: number): Vec2[] {
      return [
        [poly[0][0] - m, poly[0][1] - m],
        [poly[1][0] - m, poly[1][1] + m],
        [poly[2][0] + m, poly[2][1] + m],
        [poly[3][0] + m, poly[3][1] - m],
        [poly[4][0] - m, poly[4][1] - m]
      ];
    }
  }


  /** Returns a GeoJSON FeatureCollection containing a Feature for each rectangular tile
   * @remarks Useful for displaying a tile grid for debugging.
   * @param tileResult
   * @returns FeatureCollection containing a Feature for each rectangular tile
   * @example
   * const t = new Tiler();
   * const v = new Viewport();
   * v.transform = { x: 256, y: 256, k: 256 / Math.PI };  // z1
   * v.dimensions = [512, 512];                           // entire world visible
   * const result = t.getTiles(v);
   * const gj = t.getGeoJSON(result);    // returns a GeoJSON FeatureCollection
   */
  getGeoJSON(tileResult: TileResult): object {
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
   * @example
   * const t = new Tiler().tileSize(512);   // sets tile size
   * t.tileSize();   // gets tile size - returns 512
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
   * @example
   * const t = new Tiler().zoomRange(10, 20);   // sets min/max zoom range
   * t.zoomRange();   // gets min/max zoom range - returns [10, 20]
   */
  zoomRange(min?: number, max?: number): Vec2 | Tiler {
    if (min === undefined) return this._zoomRange;
    if (max === undefined) max = min;
    this._zoomRange = [
      numClamp(min, MIN_Z, MAX_Z),
      numClamp(max, MIN_Z, MAX_Z)
    ];
    return this;
  }


  /** Sets/Gets the current tile margin (number to extend the rows/columns beyond those covering the viewport)
   * @param val
   * @returns When an argument is passed, sets the tile margin and returns `this` for method chaining
   * Returns the tile margin otherwise
   * @example
   * const t = new Tiler().margin(1);   // sets tile margin
   * t.margin();   // gets tile margin - returns 1
   */
  margin(val?: number): number | Tiler {
    if (val === undefined) return this._margin;
    this._margin = +val;
    return this;
  }


  /** Sets/Gets the current skipNullIsland value
   * @remarks When loading data from a tiled service, it is common for invalid data to be located around "Null Island",
   * therefore it can be useful to skip loading these tiles
   * @param val
   * @returns When an argument is passed, sets the `skipNullIsland` value and returns `this` for method chaining
   * Returns the `skipNullIsland` value otherwise
   * @example
   * const t = new Tiler().skipNullIsland(true);   // sets skipNullIsland value
   * t.skipNullIsland();   // gets skipNullIsland value - returns true
   */
  skipNullIsland(val?: boolean): boolean | Tiler {
    if (val === undefined) return this._skipNullIsland;
    this._skipNullIsland = val;
    return this;
  }


  /** Tests whether the given tile coordinate is near [0,0] (Null Island)
   * @remarks A tile is considered "near" if it >= z7 and around the center of the map
   * within these or descendent tiles (roughly within about 2.8° of [0,0]).
   * @param x
   * @param y
   * @param z
   * @returns true if near null island, false otherwise
   * @example
   * ```
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
