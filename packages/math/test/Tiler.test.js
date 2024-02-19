import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Tiler, Viewport } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
}

describe('math/tiler', () => {
  describe('constructor', () => {
    it('constructs a Tiler', () => {
      const t = new Tiler();
      assert.ok(t instanceof Tiler);
    });
  });

  describe('getTiles', () => {
    [256, 512, 1024].forEach((TS) => {
      describe('tileSize ' + TS, () => {
        const TAU = 2 * Math.PI;
        const HALFTS = TS / 2;
        const TWOTS = TS * 2;
        const FOURTS = TS * 4;

        describe('z0', () => {
          //
          //  +-------+  +85.0511
          //  |       |
          //  | 0,0,0 |
          //  |       |
          //  +-------+  -85.0511
          //-180    +180
          //
          const k = (TS * Math.pow(2, 0)) / TAU; // z0
          const t = new Tiler().tileSize(TS);
          const v = new Viewport()
            .transform({ x: HALFTS, y: HALFTS, k: k })
            .dimensions([[0, 0], [TS, TS]]); // entire world visible

          const result = t.getTiles(v);
          const tiles = result.tiles;

          it('gets a single tile at z0', () => {
            assert.ok(tiles instanceof Array);
            assert.equal(tiles.length, 1);
          });

          it('tiles have an id property', () => {
            assert.equal(tiles[0].id, '0,0,0');
          });

          it('tiles have an xyz property', () => {
            assert.deepEqual(tiles[0].xyz, [0, 0, 0]);
          });

          it('tiles that intersect viewport are visible', () => {
            assert.equal(tiles[0].isVisible, true);
          });

          it('tiles have a pxExtent property', () => {
            const pxExtent = tiles[0].pxExtent;
            assert.ok(pxExtent instanceof Object);
            assert.equal(pxExtent.min[0], 0);
            assert.equal(pxExtent.min[1], 0);
            assert.equal(pxExtent.max[0], TS);
            assert.equal(pxExtent.max[1], TS);
          });

          it('tiles have a wgs84Extent property', () => {
            const wgs84Extent = tiles[0].wgs84Extent;
            assert.ok(wgs84Extent instanceof Object);
            assert.closeTo(wgs84Extent.min[0], -180);
            assert.closeTo(wgs84Extent.min[1], -85.0511287798);
            assert.closeTo(wgs84Extent.max[0], 180);
            assert.closeTo(wgs84Extent.max[1], 85.0511287798);
          });
        });

        describe('z1', () => {
          //
          //  +-------+-------+  +85.0511
          //  |       |       |
          //  | 0,0,1 | 1,0,1 |
          //  |       |       |
          //  +-------+-------+   0
          //  |       |       |
          //  | 0,1,1 | 1,1,1 |
          //  |       |       |
          //  +-------+-------+  -85.0511
          //-180      0     +180
          //
          const k = (TS * Math.pow(2, 1)) / TAU; // z1
          const t = new Tiler().tileSize(TS);
          const v = new Viewport()
            .transform({ x: TS, y: TS, k: k })
            .dimensions([[0, 0], [TWOTS, TWOTS]]); // entire world visible

          const result = t.getTiles(v);
          const tiles = result.tiles;

          const expected = [
            [0,0,1], [1,0,1],
            [0,1,1], [1,1,1]
          ].reverse();

          it('gets 4 tiles at z1', () => {
            assert.ok(tiles instanceof Array);
            assert.equal(tiles.length, 4);
          });

          it('tiles have an id property', () => {
            expected.forEach((xyz, i) => {
              assert.equal(tiles[i].id, xyz.join(','));
            });
          });

          it('tiles have an xyz property', () => {
            expected.forEach((xyz, i) => {
              assert.deepEqual(tiles[i].xyz, xyz);
            });
          });

          it('tiles that intersect viewport are visible', () => {
            expected.forEach((xyz, i) => {
              assert.equal(tiles[i].isVisible, true);
            });
          });

          it('tiles have a pxExtent property', () => {
            expected.forEach((xyz, i) => {
              const pxExtent = tiles[i].pxExtent;
              const x = xyz[0];
              const y = xyz[1];
              assert.equal(pxExtent.min[0], x * TS);
              assert.equal(pxExtent.min[1], y * TS);
              assert.equal(pxExtent.max[0], (x + 1) * TS);
              assert.equal(pxExtent.max[1], (y + 1) * TS);
            });
          });

          it('tiles have a wgs84Extent property', () => {
            const lons = [-180, 0, 180];
            const lats = [85.0511287798, 0, -85.0511287798];
            expected.forEach((xyz, i) => {
              const wgs84Extent = tiles[i].wgs84Extent;
              const x = xyz[0];
              const y = xyz[1];
              assert.closeTo(wgs84Extent.min[0], lons[x]);
              assert.closeTo(wgs84Extent.min[1], lats[y + 1]);
              assert.closeTo(wgs84Extent.max[0], lons[x + 1]);
              assert.closeTo(wgs84Extent.max[1], lats[y]);
            });
          });
        });

        describe('z2', () => {
          //
          //  +-------+-------+-------+-------+  +85.0511
          //  |       |       |       |       |
          //  | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
          //  |       |       |       |       |
          //  +-------+-------+-------+-------+  +66.5133
          //  |       |       |       |       |
          //  | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
          //  |       |       |       |       |
          //  +-------+-------+-------+-------+   0
          //  |       |       |       |       |
          //  | 0,2,2 | 1,2,2 | 2,2,2 | 3,2,2 |
          //  |       |       |       |       |
          //  +-------+-------+-------+-------+  -66.5133
          //  |       |       |       |       |
          //  | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
          //  |       |       |       |       |
          //  +-------+-------+-------+-------+  -85.0511
          //-180     -90      0      +90    +180
          //
          const k = (TS * Math.pow(2, 2)) / TAU; // z2
          const t = new Tiler().tileSize(TS);
          const v = new Viewport()
            .transform({ x: TWOTS, y: TWOTS, k: k })
            .dimensions([[0, 0], [FOURTS, FOURTS]]); // entire world visible

          const result = t.getTiles(v);
          const tiles = result.tiles;

          const expected = [
            [0,0,2], [1,0,2], [2,0,2], [3,0,2],
            [0,1,2], [1,1,2], [2,1,2], [3,1,2],
            [0,2,2], [1,2,2], [2,2,2], [3,2,2],
            [0,3,2], [1,3,2], [2,3,2], [3,3,2]
          ].reverse();

          it('gets 16 tiles at z2', () => {
            assert.ok(tiles instanceof Array);
            assert.equal(tiles.length, 16);
          });

          it('tiles have an id property', () => {
            expected.forEach((xyz, i) => {
              assert.equal(tiles[i].id, xyz.join(','));
            });
          });

          it('tiles have an xyz property', () => {
            expected.forEach((xyz, i) => {
              assert.deepEqual(tiles[i].xyz, xyz);
            });
          });

          it('tiles that intersect viewport are visible', () => {
            expected.forEach((xyz, i) => {
              assert.equal(tiles[i].isVisible, true);
            });
          });

          it('tiles have a pxExtent property', () => {
            expected.forEach((xyz, i) => {
              const pxExtent = tiles[i].pxExtent;
              const x = xyz[0];
              const y = xyz[1];
              assert.equal(pxExtent.min[0], x * TS);
              assert.equal(pxExtent.min[1], y * TS);
              assert.equal(pxExtent.max[0], (x + 1) * TS);
              assert.equal(pxExtent.max[1], (y + 1) * TS);
            });
          });

          it('tiles have a wgs84Extent property', () => {
            const lons = [-180, -90, 0, 90, 180];
            const lats = [85.0511287798, 66.5132604431, 0, -66.5132604431, -85.0511287798];
            expected.forEach((xyz, i) => {
              const wgs84Extent = tiles[i].wgs84Extent;
              const x = xyz[0];
              const y = xyz[1];
              assert.closeTo(wgs84Extent.min[0], lons[x]);
              assert.closeTo(wgs84Extent.min[1], lats[y + 1]);
              assert.closeTo(wgs84Extent.max[0], lons[x + 1]);
              assert.closeTo(wgs84Extent.max[1], lats[y]);
            });
          });
        });

        it('gets tiles in 4 tile viewport', () => {
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          // |       | 1,1,2 | 2,1,2 |       |
          // | 0,1,2 |   +=======+   | 3,1,2 |
          // |       |   ‖   |   ‖   |       |
          // +-------+---‖---+---‖---+-------+
          // |       |   ‖   |   ‖   |       |
          // | 0,2,2 |   +=======+   | 3,2,2 |
          // |       | 1,2,2 | 2,2,2 |       |
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          const k = (TS * Math.pow(2, 2)) / TAU; // z2
          const t = new Tiler().tileSize(TS);
          const v = new Viewport()
            .transform({ x: HALFTS, y: HALFTS, k: k })
            .dimensions([[0, 0], [TS, TS]]);

          const result = t.getTiles(v);
          const tiles = result.tiles;
          assert.ok(tiles instanceof Array);
          assert.equal(tiles.length, 4);

          const expected = [
            [1,1,2], [2,1,2],
            [1,2,2], [2,2,2]
          ].reverse();

          expected.forEach((xyz, i) => {
            assert.equal(tiles[i].id, xyz.join(','));
            assert.deepEqual(tiles[i].xyz, xyz);
            assert.equal(tiles[i].isVisible, true);
          });
        });

        it('gets tiles in 4 tile viewport + 1 tile margin', () => {
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          // |       | 1,1,2 | 2,1,2 |       |
          // | 0,1,2 |   +=======+   | 3,1,2 |
          // |       |   ‖   |   ‖   |       |
          // +-------+---‖---+---‖---+-------+
          // |       |   ‖   |   ‖   |       |
          // | 0,2,2 |   +=======+   | 3,2,2 |
          // |       | 1,2,2 | 2,2,2 |       |
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          const k = (TS * Math.pow(2, 2)) / TAU; // z2
          const t = (new Tiler().tileSize(TS)).margin(1);
          const v = new Viewport()
            .transform({ x: HALFTS, y: HALFTS, k: k })
            .dimensions([[0, 0], [TS, TS]]);

          const result = t.getTiles(v);
          const tiles = result.tiles;
          assert.ok(tiles instanceof Array);
          assert.equal(tiles.length, 16);

          // note: tiles in view are returned before tiles in margin
          const expectedVisible = [
            [1,1,2], [2,1,2],
            [1,2,2], [2,2,2]
          ].reverse();

          const expectedMargin = [
            [0,0,2], [1,0,2], [2,0,2], [3,0,2],
            [0,1,2],                   [3,1,2],
            [0,2,2],                   [3,2,2],
            [0,3,2], [1,3,2], [2,3,2], [3,3,2]
          ];

          expectedVisible.forEach((xyz, i) => {
            assert.equal(tiles[i].id, xyz.join(','));
            assert.deepEqual(tiles[i].xyz, xyz);
            assert.equal(tiles[i].isVisible, true);
          });
          expectedMargin.forEach((xyz, i) => {
            assert.equal(tiles[i + 4].id, xyz.join(','));
            assert.deepEqual(tiles[i + 4].xyz, xyz);
            assert.equal(tiles[i + 4].isVisible, false);
          });
        });

        it('gets tiles in 2 tile viewport', () => {
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          // |       |       | 2,1,2 |       |
          // | 0,1,2 | 1,1,2 +=======+ 3,1,2 |
          // |       |       ‖       ‖       |
          // +-------+-------‖-------‖-------+
          // |       |       ‖       ‖       |
          // | 0,2,2 | 1,2,2 +=======+ 3,2,2 |
          // |       |       | 2,2,2 |       |
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          const k = (TS * Math.pow(2, 2)) / TAU; // z2
          const t = new Tiler().tileSize(TS);
          const v = new Viewport()
            .transform({ x: 0, y: HALFTS, k: k })
            .dimensions([[1, 0], [TS - 2, TS]]);

          const result = t.getTiles(v);
          const tiles = result.tiles;
          assert.ok(tiles instanceof Array);
          assert.equal(tiles.length, 2);

          const expected = [
            [2,1,2],
            [2,2,2]
          ].reverse();

          expected.forEach((xyz, i) => {
            assert.equal(tiles[i].id, xyz.join(','));
            assert.deepEqual(tiles[i].xyz, xyz);
            assert.equal(tiles[i].isVisible, true);
          });
        });

        it('gets tiles in 2 tile viewport + 1 tile margin', () => {
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          // |       |       | 2,1,2 |       |
          // | 0,1,2 | 1,1,2 +=======+ 3,1,2 |
          // |       |       ‖       ‖       |
          // +-------+-------‖-------‖-------+
          // |       |       ‖       ‖       |
          // | 0,2,2 | 1,2,2 +=======+ 3,2,2 |
          // |       |       | 2,2,2 |       |
          // +-------+-------+-------+-------+
          // |       |       |       |       |
          // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
          // |       |       |       |       |
          // +-------+-------+-------+-------+
          const k = (TS * Math.pow(2, 2)) / TAU; // z2
          const t = (new Tiler().tileSize(TS)).margin(1);
          const v = new Viewport()
            .transform({ x: 0, y: HALFTS, k: k })
            .dimensions([[1, 0], [TS - 2, TS]]);

          const result = t.getTiles(v);
          const tiles = result.tiles;
          assert.ok(tiles instanceof Array);
          assert.equal(tiles.length, 12);

          // note: tiles in view are returned before tiles in margin
          const expectedVisible = [
            [2,1,2],
            [2,2,2]
          ].reverse();

          const expectedMargin = [
            [1,0,2], [2,0,2], [3,0,2],
            [1,1,2],          [3,1,2],
            [1,2,2],          [3,2,2],
            [1,3,2], [2,3,2], [3,3,2]
          ];

          expectedVisible.forEach((xyz, i) => {
            assert.equal(tiles[i].id, xyz.join(','));
            assert.deepEqual(tiles[i].xyz, xyz);
            assert.equal(tiles[i].isVisible, true);
          });
          expectedMargin.forEach((xyz, i) => {
            assert.equal(tiles[i + 2].id, xyz.join(','));
            assert.deepEqual(tiles[i + 2].xyz, xyz);
            assert.equal(tiles[i + 2].isVisible, false);
          });
        });

        it('skips tiles around null island if skipNullIsland is true', () => {
          // +---------+---------+---------+---------+
          // |         |         |         |         |
          // | 63,62,7 | 64,62,7 | 65,62,7 | 66,62,7 |
          // |         |         |         |         |
          // +---------+---------+---------+---------+
          // |         | 64,63,7 | 65,63,7 |         |
          // | 63,63,7 |     +=======+     | 66,63,7 |
          // |         |     ‖   |   ‖     |         |
          // +-------[0,0]---‖---+---‖-----+---------+
          // |         |     ‖   |   ‖     |         |
          // | 63,64,7 |     +=======+     | 66,64,7 |
          // |         | 64,64,7 | 65,64,7 |         |
          // +---------+---------+---------+---------+
          // |         |         |         |         |
          // | 63,65,7 | 64,65,7 | 65,65,7 | 66,65,7 |
          // |         |         |         |         |
          // +---------+---------+---------+---------+
          const k = (TS * Math.pow(2, 7)) / TAU; // z7
          const t = ((new Tiler().tileSize(TS)).margin(1)).skipNullIsland(true);
          const v = new Viewport()
            .transform({ x: -HALFTS, y: HALFTS, k: k })
            .dimensions([[0, 0], [TS, TS]]);

          const result = t.getTiles(v);
          const tiles = result.tiles;
          assert.ok(tiles instanceof Array);
          assert.equal(tiles.length, 12);

          // note: tiles in view are returned before tiles in margin
          const expectedVisible = [
            [65,63,7],
            [65,64,7]
          ].reverse();

          const expectedMargin = [
            [63,62,7], [64,62,7], [65,62,7], [66,62,7],
                                             [66,63,7],
                                             [66,64,7],
            [63,65,7], [64,65,7], [65,65,7], [66,65,7]
          ];

          expectedVisible.forEach((xyz, i) => {
            assert.equal(tiles[i].id, xyz.join(','));
            assert.deepEqual(tiles[i].xyz, xyz);
            assert.equal(tiles[i].isVisible, true);
          });
          expectedMargin.forEach((xyz, i) => {
            assert.equal(tiles[i + 2].id, xyz.join(','));
            assert.deepEqual(tiles[i + 2].xyz, xyz);
            assert.equal(tiles[i + 2].isVisible, false);
          });
        });

        describe('getGeoJSON', () => {
          it('gets GeoJSON', () => {
            const k = (TS * Math.pow(2, 0)) / TAU; // z0
            const t = new Tiler().tileSize(TS);
            const v = new Viewport()
              .transform({ x: HALFTS, y: HALFTS, k: k })
              .dimensions([[0, 0], [TS, TS]]);

            const result = t.getTiles(v);
            const geojson = t.getGeoJSON(result);
            const tile = result.tiles[0];

            const expected = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {
                    id: '0,0,0',
                    name: '0,0,0'
                  },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [tile.wgs84Extent.polygon()]
                  }
                }
              ]
            };

            assert.deepEqual(geojson, expected);
          });
        });
      });
    });
  });

  describe('isNearNullIsland', () => {
    it('is not near if z < 7', () => {
      // +---------+---------+
      // |         |         |
      // | 31,31,6 | 32,31,6 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 31,32,6 | 32,32,6 |
      // |         |         |
      // +---------+---------+
      assert.equal(Tiler.isNearNullIsland(31, 31, 6), false);
    });

    it('is not near if z >= 7 and outside region', () => {
      // +---------+---------+
      // |         |         |
      // | 63,63,7 | 64,63,7 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 63,64,7 | 64,64,7 |
      // |         |         |
      // +---------+---------+
      assert.equal(Tiler.isNearNullIsland(63, 65, 7), false);
      assert.equal(Tiler.isNearNullIsland(65, 63, 7), false);

      assert.equal(Tiler.isNearNullIsland(125, 129, 8), false);
      assert.equal(Tiler.isNearNullIsland(129, 125, 8), false);
    });

    it('is near if z >= 7 and inside region', () => {
      // +---------+---------+
      // |         |         |
      // | 63,63,7 | 64,63,7 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 63,64,7 | 64,64,7 |
      // |         |         |
      // +---------+---------+
      assert.equal(Tiler.isNearNullIsland(63, 63, 7), true);
      assert.equal(Tiler.isNearNullIsland(63, 64, 7), true);
      assert.equal(Tiler.isNearNullIsland(64, 63, 7), true);
      assert.equal(Tiler.isNearNullIsland(64, 64, 7), true);

      assert.equal(Tiler.isNearNullIsland(126, 127, 8), true);
      assert.equal(Tiler.isNearNullIsland(127, 127, 8), true);
      assert.equal(Tiler.isNearNullIsland(128, 127, 8), true);
      assert.equal(Tiler.isNearNullIsland(129, 127, 8), true);
    });
  });

  describe('#tileSize', () => {
    it('sets/gets tileSize', () => {
      const t = new Tiler().tileSize(512);
      assert.equal(t.tileSize(), 512);
    });
  });

  describe('#zoomRange', () => {
    it('sets/gets zoomRange', () => {
      const t = new Tiler().zoomRange(10, 20);
      assert.deepEqual(t.zoomRange(), [10, 20]);
    });
    it('max defaults to min', () => {
      const t = new Tiler().zoomRange(10);
      assert.deepEqual(t.zoomRange(), [10, 10]);
    });
  });

  describe('#margin', () => {
    it('sets/gets margin', () => {
      const t = new Tiler().margin(1);
      assert.equal(t.margin(), 1);
    });
  });

  describe('#skipNullIsland', () => {
    it('sets/gets skipNullIsland', () => {
      const t = new Tiler().skipNullIsland(true);
      assert.equal(t.skipNullIsland(), true);
    });
  });
});
