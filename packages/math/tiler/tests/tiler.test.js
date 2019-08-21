import { Tiler } from '..';
import { Projection } from '@id-sdk/projection';

describe('math/tiler', () => {
  describe('constructor', () => {
    it('constructs a Tiler', () => {
      const t = new Tiler();
      expect(t).toBeDefined();
    });
  });

  describe('getTiles', () => {
    const CLOSE = 6; // digits

    describe('z0', () => {
      //
      //  +-------+  +85.0511
      //  |       |
      //  | 0,0,0 |
      //  |       |
      //  +-------+  -85.0511
      //-180    +180
      //
      const t = new Tiler();
      const p = new Projection(128, 128, 128 / Math.PI) // z0, entire world visible
        .dimensions([[0, 0], [256, 256]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;

      it('gets a single tile at z0', () => {
        expect(tiles).toBeArrayOfSize(1);
      });

      it('tiles have an id property', () => {
        expect(tiles[0].id).toBe('0,0,0');
      });

      it('tiles have an xyz property', () => {
        expect(tiles[0].xyz).toStrictEqual([0, 0, 0]);
      });

      it('tiles that intersect viewport are visible', () => {
        expect(tiles[0].isVisible).toBeTrue();
      });

      it('tiles have a pxExtent property', () => {
        const pxExtent = tiles[0].pxExtent;
        expect(pxExtent.min[0]).toBe(0);
        expect(pxExtent.min[1]).toBe(0);
        expect(pxExtent.max[0]).toBe(256);
        expect(pxExtent.max[1]).toBe(256);
      });

      it('tiles have a wgs84Extent property', () => {
        const wgs84Extent = tiles[0].wgs84Extent;
        expect(wgs84Extent.min[0]).toBeCloseTo(-180, CLOSE);
        expect(wgs84Extent.min[1]).toBeCloseTo(-85.0511287798, CLOSE);
        expect(wgs84Extent.max[0]).toBeCloseTo(180, CLOSE);
        expect(wgs84Extent.max[1]).toBeCloseTo(85.0511287798, CLOSE);
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
      const t = new Tiler();
      const p = new Projection(256, 256, 256 / Math.PI) // z1, entire world visible
        .dimensions([[0, 0], [512, 512]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;

      // prettier-ignore
      const expected = [
        [0,0,1], [1,0,1],
        [0,1,1], [1,1,1]
      ].reverse();

      it('gets 4 tiles at z1', () => {
        expect(tiles).toBeArrayOfSize(4);
      });

      it('tiles have an id property', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].id).toBe(xyz.join(','));
        });
      });

      it('tiles have an xyz property', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].xyz).toStrictEqual(xyz);
        });
      });

      it('tiles that intersect viewport are visible', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].isVisible).toBeTrue();
        });
      });

      it('tiles have a pxExtent property', () => {
        expected.forEach((xyz, i) => {
          const pxExtent = tiles[i].pxExtent;
          const x = xyz[0];
          const y = xyz[1];
          expect(pxExtent.min[0]).toBe(x * 256);
          expect(pxExtent.min[1]).toBe(y * 256);
          expect(pxExtent.max[0]).toBe((x + 1) * 256);
          expect(pxExtent.max[1]).toBe((y + 1) * 256);
        });
      });

      it('tiles have a wgs84Extent property', () => {
        const lons = [-180, 0, 180];
        const lats = [85.0511287798, 0, -85.0511287798];
        expected.forEach((xyz, i) => {
          const wgs84Extent = tiles[i].wgs84Extent;
          const x = xyz[0];
          const y = xyz[1];
          expect(wgs84Extent.min[0]).toBeCloseTo(lons[x], CLOSE);
          expect(wgs84Extent.min[1]).toBeCloseTo(lats[y + 1], CLOSE);
          expect(wgs84Extent.max[0]).toBeCloseTo(lons[x + 1], CLOSE);
          expect(wgs84Extent.max[1]).toBeCloseTo(lats[y], CLOSE);
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
      const t = new Tiler();
      const p = new Projection(512, 512, 512 / Math.PI) // z2, entire world visible
        .dimensions([[0, 0], [1024, 1024]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;

      // prettier-ignore
      const expected = [
        [0,0,2], [1,0,2], [2,0,2], [3,0,2],
        [0,1,2], [1,1,2], [2,1,2], [3,1,2],
        [0,2,2], [1,2,2], [2,2,2], [3,2,2],
        [0,3,2], [1,3,2], [2,3,2], [3,3,2]
      ].reverse();

      it('gets 16 tiles at z2', () => {
        expect(tiles).toBeArrayOfSize(16);
      });

      it('tiles have an id property', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].id).toBe(xyz.join(','));
        });
      });

      it('tiles have an xyz property', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].xyz).toStrictEqual(xyz);
        });
      });

      it('tiles that intersect viewport are visible', () => {
        expected.forEach((xyz, i) => {
          expect(tiles[i].isVisible).toBeTrue();
        });
      });

      it('tiles have a pxExtent property', () => {
        expected.forEach((xyz, i) => {
          const pxExtent = tiles[i].pxExtent;
          const x = xyz[0];
          const y = xyz[1];
          expect(pxExtent.min[0]).toBe(x * 256);
          expect(pxExtent.min[1]).toBe(y * 256);
          expect(pxExtent.max[0]).toBe((x + 1) * 256);
          expect(pxExtent.max[1]).toBe((y + 1) * 256);
        });
      });

      it('tiles have a wgs84Extent property', () => {
        const lons = [-180, -90, 0, 90, 180];
        const lats = [85.0511287798, 66.5132604431, 0, -66.5132604431, -85.0511287798];
        expected.forEach((xyz, i) => {
          const wgs84Extent = tiles[i].wgs84Extent;
          const x = xyz[0];
          const y = xyz[1];
          expect(wgs84Extent.min[0]).toBeCloseTo(lons[x], CLOSE);
          expect(wgs84Extent.min[1]).toBeCloseTo(lats[y + 1], CLOSE);
          expect(wgs84Extent.max[0]).toBeCloseTo(lons[x + 1], CLOSE);
          expect(wgs84Extent.max[1]).toBeCloseTo(lats[y], CLOSE);
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
      const t = new Tiler();
      const p = new Projection(128, 128, 512 / Math.PI) // z2
        .dimensions([[1, 1], [255, 255]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(4);

      // prettier-ignore
      const expected = [
        [1,1,2], [2,1,2],
        [1,2,2], [2,2,2]
      ].reverse();

      expected.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
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
      const t = new Tiler().margin(1);
      const p = new Projection(128, 128, 512 / Math.PI) // z2
        .dimensions([[1, 1], [255, 255]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(16);

      // note: tiles in view are returned before tiles in margin
      // prettier-ignore
      const expectedVisible = [
        [1,1,2], [2,1,2],
        [1,2,2], [2,2,2]
      ].reverse();

      // prettier-ignore
      const expectedMargin = [
        [0,0,2], [1,0,2], [2,0,2], [3,0,2],
        [0,1,2],                   [3,1,2],
        [0,2,2],                   [3,2,2],
        [0,3,2], [1,3,2], [2,3,2], [3,3,2]
      ];

      expectedVisible.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
      });
      expectedMargin.forEach((xyz, i) => {
        expect(tiles[i+4].id).toBe(xyz.join(','));
        expect(tiles[i+4].xyz).toStrictEqual(xyz);
        expect(tiles[i+4].isVisible).toBeFalse();
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
      // +-------+-------‖---+---‖-------+
      // |       |       ‖       ‖       |
      // | 0,2,2 | 1,2,2 +=======+ 3,2,2 |
      // |       |       | 2,2,2 |       |
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      const t = new Tiler();
      const p = new Projection(0, 128, 512 / Math.PI) // z2
        .dimensions([[1, 1], [255, 255]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(2);

      // prettier-ignore
      const expected = [
        [2,1,2],
        [2,2,2]
      ].reverse();

      expected.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
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
      // +-------+-------‖---+---‖-------+
      // |       |       ‖       ‖       |
      // | 0,2,2 | 1,2,2 +=======+ 3,2,2 |
      // |       |       | 2,2,2 |       |
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      const t = new Tiler().margin(1);
      const p = new Projection(0, 128, 512 / Math.PI) // z2
        .dimensions([[1, 1], [255, 255]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(12);

      // note: tiles in view are returned before tiles in margin
      // prettier-ignore
      const expectedVisible = [
        [2,1,2],
        [2,2,2]
      ].reverse();

      // prettier-ignore
      const expectedMargin = [
        [1,0,2], [2,0,2], [3,0,2],
        [1,1,2],          [3,1,2],
        [1,2,2],          [3,2,2],
        [1,3,2], [2,3,2], [3,3,2]
      ];

      expectedVisible.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
      });
      expectedMargin.forEach((xyz, i) => {
        expect(tiles[i+2].id).toBe(xyz.join(','));
        expect(tiles[i+2].xyz).toStrictEqual(xyz);
        expect(tiles[i+2].isVisible).toBeFalse();
      });
    });
  });


  describe('getGeoJSON', () => {
    it('gets GeoJSON', () => {
      const t = new Tiler();
      const p = new Projection(128, 128, 128 / Math.PI) // z0
        .dimensions([[0, 0], [256, 256]]);

      const result = t.getTiles(p);
      const gj = t.getGeoJSON(result);
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

      expect(gj).toMatchObject(expected);
    });
  });

  describe('isNearNullIsland', () => {
    it('is not near if z < 7', () => {
      // +---------+---------+
      // |         |         |
      // | 31,31,6 | 31,32,6 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 32,31,6 | 32,32,6 |
      // |         |         |
      // +---------+---------+
      expect(Tiler.isNearNullIsland(31, 31, 6)).toBeFalse();
    });

    it('is not near if z >= 7 and outside region', () => {
      // +---------+---------+
      // |         |         |
      // | 63,63,7 | 63,64,7 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 64,63,7 | 64,64,7 |
      // |         |         |
      // +---------+---------+
      expect(Tiler.isNearNullIsland(63, 65, 7)).toBeFalse();
      expect(Tiler.isNearNullIsland(65, 63, 7)).toBeFalse();

      expect(Tiler.isNearNullIsland(125, 129, 8)).toBeFalse();
      expect(Tiler.isNearNullIsland(129, 125, 8)).toBeFalse();
    });

    it('is near if z >= 7 and inside region', () => {
      // +---------+---------+
      // |         |         |
      // | 63,63,7 | 63,64,7 |
      // |         |         |
      // +-------[0,0]-------+
      // |         |         |
      // | 64,63,7 | 64,64,7 |
      // |         |         |
      // +---------+---------+
      expect(Tiler.isNearNullIsland(63, 63, 7)).toBeTrue();
      expect(Tiler.isNearNullIsland(63, 64, 7)).toBeTrue();
      expect(Tiler.isNearNullIsland(64, 63, 7)).toBeTrue();
      expect(Tiler.isNearNullIsland(64, 64, 7)).toBeTrue();

      expect(Tiler.isNearNullIsland(126, 127, 8)).toBeTrue();
      expect(Tiler.isNearNullIsland(127, 127, 8)).toBeTrue();
      expect(Tiler.isNearNullIsland(128, 127, 8)).toBeTrue();
      expect(Tiler.isNearNullIsland(129, 127, 8)).toBeTrue();
    });
  });

  describe('#tileSize', () => {
    it('sets/gets tileSize', () => {
      const t = new Tiler().tileSize(512);
      expect(t.tileSize()).toBe(512);
    });
  });

  describe('#zoomRange', () => {
    it('sets/gets zoomRange', () => {
      const t = new Tiler().zoomRange([10, 20]);
      expect(t.zoomRange()).toStrictEqual([10, 20]);
    });
  });

  describe('#margin', () => {
    it('sets/gets margin', () => {
      const t = new Tiler().margin(1);
      expect(t.margin()).toBe(1);
    });
  });

  describe('#skipNullIsland', () => {
    it('sets/gets skipNullIsland', () => {
      const t = new Tiler().skipNullIsland(true);
      expect(t.skipNullIsland()).toBeTrue();
    });
  });

});
