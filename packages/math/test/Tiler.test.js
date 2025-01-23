import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Extent, Tiler, Viewport } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-9) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/tiler', () => {

  describe('constructor', () => {
    it('constructs a Tiler', () => {
      const t = new Tiler();
      assert.ok(t instanceof Tiler);
    });
  });


  describe('getTiles', () => {

    function expectZ0(tiles, tileSize) {
      //
      //  +-------+  +85.0511
      //  |       |
      //  | 0,0,0 |
      //  |       |
      //  +-------+  -85.0511
      //-180    +180
      //
      it(`gets 1 tile (z=0, tileSize=${tileSize})`, () => {
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 1);
      });

      it(`tiles have an id property (z=0, tileSize=${tileSize})`, () => {
        assert.equal(tiles[0].id, '0,0,0');
      });

      it(`tiles have an xyz property (z=0, tileSize=${tileSize})`, () => {
        assert.deepEqual(tiles[0].xyz, [0, 0, 0]);
      });

      it(`tiles that intersect viewport are visible (z=0, tileSize=${tileSize})`, () => {
        assert.equal(tiles[0].isVisible, true);
      });

      it(`tiles have a tileExtent property (z=0, tileSize=${tileSize})`, () => {
        const tileExtent = tiles[0].tileExtent;
        assert.ok(tileExtent instanceof Extent);
        assert.equal(tileExtent.min[0], 0);
        assert.equal(tileExtent.min[1], 0);
        assert.equal(tileExtent.max[0], 256);
        assert.equal(tileExtent.max[1], 256);
      });

      it(`tiles have a wgs84Extent property (z=0, tileSize=${tileSize})`, () => {
        const wgs84Extent = tiles[0].wgs84Extent;
        assert.ok(wgs84Extent instanceof Extent);
        assert.closeTo(wgs84Extent.min[0], -180);
        assert.closeTo(wgs84Extent.min[1], -85.0511287798);
        assert.closeTo(wgs84Extent.max[0], 180);
        assert.closeTo(wgs84Extent.max[1], 85.0511287798);
      });
    }


    function expectZ1(tiles, tileSize) {
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
      const expected = [
        [0,0,1], [1,0,1],
        [0,1,1], [1,1,1]
      ].reverse();

      it(`gets 4 tiles (z=1, tileSize=${tileSize})`, () => {
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 4);
      });

      it(`tiles have an id property (z=1, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.equal(tiles[i].id, xyz.join(','));
        });
      });

      it(`tiles have an xyz property (z=1, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.deepEqual(tiles[i].xyz, xyz);
        });
      });

      it(`tiles that intersect viewport are visible (z=1, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.equal(tiles[i].isVisible, true);
        });
      });

      it(`tiles have a tileExtent property (z=1, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          const [x, y, z] = xyz;
          const tileExtent = tiles[i].tileExtent;
          const tileScale = 256 / Math.pow(2, z);
          assert.equal(tileExtent.min[0], x * tileScale);    // 0..128..256
          assert.equal(tileExtent.min[1], y * tileScale);
          assert.equal(tileExtent.max[0], (x + 1) * tileScale);
          assert.equal(tileExtent.max[1], (y + 1) * tileScale);
        });
      });

      it(`tiles have a wgs84Extent property (z=1, tileSize=${tileSize})`, () => {
        const lons = [-180, 0, 180];
        const lats = [85.0511287798, 0, -85.0511287798];
        expected.forEach((xyz, i) => {
          const wgs84Extent = tiles[i].wgs84Extent;
          const [x, y] = xyz;
          assert.closeTo(wgs84Extent.min[0], lons[x]);
          assert.closeTo(wgs84Extent.min[1], lats[y + 1]);
          assert.closeTo(wgs84Extent.max[0], lons[x + 1]);
          assert.closeTo(wgs84Extent.max[1], lats[y]);
        });
      });
    }


    function expectZ2(tiles, tileSize) {
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
      const expected = [
        [0,0,2], [1,0,2], [2,0,2], [3,0,2],
        [0,1,2], [1,1,2], [2,1,2], [3,1,2],
        [0,2,2], [1,2,2], [2,2,2], [3,2,2],
        [0,3,2], [1,3,2], [2,3,2], [3,3,2]
      ].reverse();

      it(`gets 16 tiles (z=2, tileSize=${tileSize})`, () => {
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 16);
      });

      it(`tiles have an id property (z=2, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.equal(tiles[i].id, xyz.join(','));
        });
      });

      it(`tiles have an xyz property (z=2, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.deepEqual(tiles[i].xyz, xyz);
        });
      });

      it(`tiles that intersect viewport are visible (z=2, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          assert.equal(tiles[i].isVisible, true);
        });
      });

      it(`tiles have a tileExtent property (z=2, tileSize=${tileSize})`, () => {
        expected.forEach((xyz, i) => {
          const [x, y, z] = xyz;
          const tileExtent = tiles[i].tileExtent;
          const tileScale = 256 / Math.pow(2, z);
          assert.equal(tileExtent.min[0], x * tileScale);    // 0..64..128..192..256
          assert.equal(tileExtent.min[1], y * tileScale);
          assert.equal(tileExtent.max[0], (x + 1) * tileScale);
          assert.equal(tileExtent.max[1], (y + 1) * tileScale);
        });
      });

      it(`tiles have a wgs84Extent property (z=2, tileSize=${tileSize})`, () => {
        const lons = [-180, -90, 0, 90, 180];
        const lats = [85.0511287798, 66.5132604431, 0, -66.5132604431, -85.0511287798];
        expected.forEach((xyz, i) => {
          const wgs84Extent = tiles[i].wgs84Extent;
          const [x, y] = xyz;
          assert.closeTo(wgs84Extent.min[0], lons[x]);
          assert.closeTo(wgs84Extent.min[1], lats[y + 1]);
          assert.closeTo(wgs84Extent.max[0], lons[x + 1]);
          assert.closeTo(wgs84Extent.max[1], lats[y]);
        });
      });
    }


    // We will test tiling the view at z0, z1, z2..
    // The results we expect will depend on the `tileSize`.
    // For example, a `tileSize` of 512 (e.g. what Mapbox Vector Tiles would use)
    //  should return a z0 result at view z1 when the world is 512px in size.

    describe('view at z0', () => {
      const v = new Viewport();
      v.transform = { x: 128, y: 128, z: 0 };
      v.dimensions = [256, 256];  // entire world visible

      let tiler, result;
      tiler = new Tiler().tileSize(256);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 256);

      tiler = new Tiler().tileSize(512);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 512);

      tiler = new Tiler().tileSize(1024);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 1024);
    });

    describe('view at z1', () => {
      const v = new Viewport();
      v.transform = { x: 256, y: 256, z: 1 };
      v.dimensions = [512, 512];  // entire world visible

      let tiler, result;
      tiler = new Tiler().tileSize(256);
      result = tiler.getTiles(v);
      expectZ1(result.tiles, 256);

      tiler = new Tiler().tileSize(512);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 512);

      tiler = new Tiler().tileSize(1024);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 1024);
    });

    describe('view at z2', () => {
      const v = new Viewport();
      v.transform = { x: 512, y: 512, z: 2 };
      v.dimensions = [1024, 1024];  // entire world visible

      let tiler, result;
      tiler = new Tiler().tileSize(256);
      result = tiler.getTiles(v);
      expectZ2(result.tiles, 256);

      tiler = new Tiler().tileSize(512);
      result = tiler.getTiles(v);
      expectZ1(result.tiles, 512);

      tiler = new Tiler().tileSize(1024);
      result = tiler.getTiles(v);
      expectZ0(result.tiles, 1024);
    });


    // For the rest of these, test at z2 and 256px tilesize
    describe('north-up viewport', () => {
      it('gets tiles in 4 tile viewport', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       | 1,1,2 | 2,1,2 |       |
        // | 0,1,2 |   ╔═══════╗   | 3,1,2 |
        // |       |   ║   |   ║   |       |
        // +-------+---║---+---║---+-------+
        // |       |   ║   |   ║   |       |
        // | 0,2,2 |   ╚═══════╝   | 3,2,2 |
        // |       | 1,2,2 | 2,2,2 |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+

        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 128, y: 128, z: 2 };
        v.dimensions = [256, 256];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 4);

        const expected = [
          [1,1,2], [2,1,2],
          [1,2,2], [2,2,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });

      it('gets tiles in 4 tile viewport + 1 tile margin', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       | 1,1,2 | 2,1,2 |       |
        // | 0,1,2 |   ╔═══════╗   | 3,1,2 |
        // |       |   ║   |   ║   |       |
        // +-------+---║---+---║---+-------+
        // |       |   ║   |   ║   |       |
        // | 0,2,2 |   ╚═══════╝   | 3,2,2 |
        // |       | 1,2,2 | 2,2,2 |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 128, y: 128, z: 2 };
        v.dimensions = [256, 256];

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
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 4];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });


      it('gets tiles in 2 tile viewport', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       | 2,1,2 |       |
        // | 0,1,2 | 1,1,2 |╔═════╗| 3,1,2 |
        // |       |       |║     ║|       |
        // +-------+-------|║-----║|-------+
        // |       |       |║     ║|       |
        // | 0,2,2 | 1,2,2 |╚═════╝| 3,2,2 |
        // |       |       | 2,2,2 |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: -10, y: 128, z: 2 };
        v.dimensions = [128, 256];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 2);

        const expected = [
          [2,1,2],
          [2,2,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });

      it('gets tiles in 2 tile viewport + 1 tile margin', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       | 2,1,2 |       |
        // | 0,1,2 | 1,1,2 |╔═════╗| 3,1,2 |
        // |       |       |║     ║|       |
        // +-------+-------|║-----║|-------+
        // |       |       |║     ║|       |
        // | 0,2,2 | 1,2,2 |╚═════╝| 3,2,2 |
        // |       |       | 2,2,2 |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: -10, y: 128, z: 2 };
        v.dimensions = [128, 256];

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
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 2];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });

      it('gets a tile when viewport size is smaller than tile size', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       |╔═════╗|       |
        // | 0,2,2 | 1,2,2 |║2,2,2║| 3,2,2 |
        // |       |       |╚═════╝|       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: -10, y: -10, z: 2 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 1);

        const expected = [
          [2,2,2]
        ];

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles when viewport size is smaller than tile size + 1 tile margin', () => {
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        // |       |       |╔═════╗|       |
        // | 0,2,2 | 1,2,2 |║2,2,2║| 3,2,2 |
        // |       |       |╚═════╝|       |
        // +-------+-------+-------+-------+
        // |       |       |       |       |
        // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
        // |       |       |       |       |
        // +-------+-------+-------+-------+
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: -10, y: -10, z: 2 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 9);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
          [2,2,2]
        ];

        const expectedMargin = [
          [1,1,2], [2,1,2], [3,1,2],
          [1,2,2],          [3,2,2],
          [1,3,2], [2,3,2], [3,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 1];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });
    });


    describe('rotated viewport', () => {
      it('gets tiles in 4 tile viewport, rotated', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /2,1,2''+-..__  /
        //           /   ''--+.__╔══════╗    /      '+
        //          / 0,2,2 /    ║'-+.._║   / 3,1,2 /
        //         +__     /1,2,2╚══════╝''+-..__  /
        //        /   ''--+.__    / 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2  /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 64, y: 64, z: 2, r: Math.PI / 4 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 4);

        const expected = [
          [1,1,2], [2,1,2],
          [1,2,2], [2,2,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles in 4 tile viewport + 1 tile margin, rotated', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /2,1,2''+-..__  /
        //           /   ''--+.__╔══════╗    /      '+
        //          / 0,2,2 /    ║'-+.._║   / 3,1,2 /
        //         +__     /1,2,2╚══════╝''+-..__  /
        //        /   ''--+.__    / 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2  /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 64, y: 64, z: 2, r: Math.PI / 4 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 12);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
          [1,1,2], [2,1,2],
          [1,2,2], [2,2,2]
        ].reverse();

        const expectedMargin = [
                   [1,0,2], [2,0,2],
          [0,1,2],                   [3,1,2],
          [0,2,2],                   [3,2,2],
                   [1,3,2], [2,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 4];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });


      it('gets tiles in 3 tile viewport, rotated', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+╔════╗ / 2,1,2 /      '+
        //          / 0,2,2 / ║  ''║+..__   / 3,1,2 /
        //         +__     /  ╚════╝     ''+-..__  /
        //        /   ''--+._1,2,2/ 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 128, y: 0, z: 2, r: Math.PI / 4 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 3);

        const expected = [
          [1,1,2],
          [1,2,2], [2,2,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles in 3 tile viewport + 1 tile margin, rotated', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+╔════╗ / 2,1,2 /      '+
        //          / 0,2,2 / ║  ''║+..__   / 3,1,2 /
        //         +__     /  ╚════╝     ''+-..__  /
        //        /   ''--+._1,2,2/ 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 128, y: 0, z: 2, r: Math.PI / 4 };
        v.dimensions = [128, 128];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 13);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
          [1,1,2],
          [1,2,2], [2,2,2]
        ].reverse();

        const expectedMargin = [
                   [1,0,2], [2,0,2],
          [0,1,2],          [2,1,2], [3,1,2],
          [0,2,2],                   [3,2,2],
          [0,3,2], [1,3,2], [2,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 3];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });


      it('gets tiles in 1 tile viewport, rotated, viewport contained in tile', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+.__    / 2,1,2 /      '+
        //          / 0,2,2 /╔══╗''-+..__   / 3,1,2 /
        //         +__     / ╚══╝  /     ''+-..__  /
        //        /   ''--+._1,2,2/ 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 128, y: -128, z: 2, r: Math.PI / 4 };
        v.dimensions = [5, 5];  // very small

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 1);

        const expected = [
          [1,2,2]
        ];

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles in 1 tile viewport + 1 tile margin, rotated, viewport contained in tile', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+.__    / 2,1,2 /      '+
        //          / 0,2,2 /╔══╗''-+..__   / 3,1,2 /
        //         +__     / ╚══╝  /     ''+-..__  /
        //        /   ''--+._1,2,2/ 2,2,2 /      '+
        //       / 0,3,2 /    ''-+..__   / 3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 128, y: -128, z: 2, r: Math.PI / 4 };
        v.dimensions = [5, 5];  // very small

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 9);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
          [1,2,2]
        ];

        const expectedMargin = [
          [0,1,2], [1,1,2], [2,1,2],
          [0,2,2],          [2,2,2],
          [0,3,2], [1,3,2], [2,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i+1];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });


      it('gets tiles in 9 tile viewport, rotated, tile corners contained in viewport', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 / 2,1,2'+-..__  /
        //           /   ''--+._╔═══════════╗/      '+
        //          / 0,2,2 /   ║''-+..__   ║ 3,1,2 /
        //         +__     / 1,2║2 /     ''+║..__  /
        //        /   ''--+.__  ║ / 2,2,2 / ║    '+
        //       / 0,3,2 /    ''║+..__   / 3║2,2 /
        //      +__     / 1,3,2 ║ 2,3,2'+-..║_  /
        //         ''--+._     /╚═══════════╝ '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 128, y: 128, z: 2, r: Math.PI / 4 };
        v.dimensions = [512, 512];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 9);

        const expected = [
          [1,1,2], [2,1,2], [3,1,2],
          [1,2,2], [2,2,2], [3,2,2],
          [1,3,2], [2,3,2], [3,3,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles in 9 tile viewport + 1 tile margin, rotated, tile corners contained in viewport', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 / 2,1,2'+-..__  /
        //           /   ''--+._╔═══════════╗/      '+
        //          / 0,2,2 /   ║''-+..__   ║ 3,1,2 /
        //         +__     / 1,2║2 /     ''+║..__  /
        //        /   ''--+.__  ║ / 2,2,2 / ║    '+
        //       / 0,3,2 /    ''║+..__   / 3║2,2 /
        //      +__     / 1,3,2 ║ 2,3,2'+-..║_  /
        //         ''--+._     /╚═══════════╝ '+
        //                 ''-+..__   / 3,3,2 /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 128, y: 128, z: 2, r: Math.PI / 4 };
        v.dimensions = [512, 512];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 15);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
          [1,1,2], [2,1,2], [3,1,2],
          [1,2,2], [2,2,2], [3,2,2],
          [1,3,2], [2,3,2], [3,3,2]
        ].reverse();

        const expectedMargin = [
                   [1,0,2], [2,0,2], [3,0,2],
          [0,1,2],
          [0,2,2],
          [0,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 9];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });

      it('gets tiles in 5 tile viewport, rotated, tile corners outside of viewport', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+.__    / 2,1,2 /      '+
        //          / 0,2,2 /    ''-+..__   / 3,1,2 /
        //         +__     / 1,2,2╔═══════╗+-..__  /
        //        /   ''--+.__    ║ 2,2,2 ║      '+
        //       / 0,3,2 /    ''-+╚═══════╝3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2  /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler();
        const v = new Viewport();
        v.transform = { x: 0, y: 0, z: 2, r: Math.PI / 4 };
        v.dimensions = [256, 256];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 5);

        const expected = [
                   [2,1,2],
          [1,2,2], [2,2,2], [3,2,2],  // do we include 2,2,2? - rapid-sdk#281
                   [2,3,2]
        ].reverse();

        expected.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
      });


      it('gets tiles in 5 tile viewport + 1 tile margin, rotated, tile corners outside of viewport', () => {
        //
        //        N         +__
        //    W._/         /   ''--+.__
        //      /'-E      / 0,0,2 /    ''-+..__
        //     S         +__     / 1,0,2 /     ''+-..__
        //              /   ''--+.__    / 2,0,2 /      '+
        //             / 0,1,2 /    ''-+..__   / 3,0,2 /
        //            +__     / 1,1,2 /     ''+-..__  /
        //           /   ''--+.__    / 2,1,2 /      '+
        //          / 0,2,2 /    ''-+..__   / 3,1,2 /
        //         +__     / 1,2,2╔═══════╗+-..__  /
        //        /   ''--+.__    ║ 2,2,2 ║      '+
        //       / 0,3,2 /    ''-+╚═══════╝3,2,2 /
        //      +__     / 1,3,2 /     ''+-..__  /
        //         ''--+.__    / 2,3,2 /      '+
        //                 ''-+..__   / 3,3,2  /
        //                         ''+-..__  /
        //                                 '+
        //
        const t = new Tiler().margin(1);
        const v = new Viewport();
        v.transform = { x: 0, y: 0, z: 2, r: Math.PI / 4 };
        v.dimensions = [256, 256];

        const result = t.getTiles(v);
        const tiles = result.tiles;
        assert.ok(tiles instanceof Array);
        assert.equal(tiles.length, 15);

        // note: tiles in view are returned before tiles in margin
        const expectedVisible = [
                   [2,1,2],
          [1,2,2], [2,2,2], [3,2,2],  // do we include 2,2,2? - rapid-sdk#281
                   [2,3,2]
        ].reverse();

        const expectedMargin = [
                   [1,0,2], [2,0,2], [3,0,2],
          [0,1,2], [1,1,2],          [3,1,2],
          [0,2,2],
          [0,3,2], [1,3,2],          [3,3,2]
        ];

        expectedVisible.forEach((xyz, i) => {
          const tile = tiles[i];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, true);
        });
        expectedMargin.forEach((xyz, i) => {
          const tile = tiles[i + 5];
          assert.equal(tile.id, xyz.join(','));
          assert.deepEqual(tile.xyz, xyz);
          assert.equal(tile.isVisible, false);
        });
      });

    });


    it('skips tiles around null island if skipNullIsland is true', () => {
      // +---------+---------+---------+---------+
      // |         |         |         |         |
      // | 63,62,7 | 64,62,7 | 65,62,7 | 66,62,7 |
      // |         |         |         |         |
      // +---------+---------+---------+---------+
      // |         | 64,63,7 | 65,63,7 |         |
      // | 63,63,7 |     ╔═══════╗     | 66,63,7 |
      // |         |     ║   |   ║     |         |
      // +-------[0,0]---║---+---║-----+---------+
      // |         |     ║   |   ║     |         |
      // | 63,64,7 |     ╚═══════╝     | 66,64,7 |
      // |         | 64,64,7 | 65,64,7 |         |
      // +---------+---------+---------+---------+
      // |         |         |         |         |
      // | 63,65,7 | 64,65,7 | 65,65,7 | 66,65,7 |
      // |         |         |         |         |
      // +---------+---------+---------+---------+
      const t = new Tiler().margin(1).skipNullIsland(true);
      const v = new Viewport();
      v.transform = { x: -128, y: 128, z: 7 };
      v.dimensions = [256, 256];

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
        const tile = tiles[i];
        assert.equal(tile.id, xyz.join(','));
        assert.deepEqual(tile.xyz, xyz);
        assert.equal(tile.isVisible, true);
      });
      expectedMargin.forEach((xyz, i) => {
        const tile = tiles[i + 2];
        assert.equal(tile.id, xyz.join(','));
        assert.deepEqual(tile.xyz, xyz);
        assert.equal(tile.isVisible, false);
      });
    });
  });


  describe('getGeoJSON', () => {
    it('gets GeoJSON', () => {
      const t = new Tiler();
      const v = new Viewport();
      v.transform = { x: 128, y: 128, z: 0 };
      v.dimensions = [256, 256];

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
