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
    it('gets a tile at z0', () => {
      // +-------+
      // |       |
      // | 0,0,0 |
      // |       |
      // +-------+
      const t = new Tiler();
      const p = new Projection(128, 128, 128 / Math.PI) // z0
        .dimensions([[0, 0], [256, 256]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(1);

      expect(tiles[0].id).toBe('0,0,0');
      expect(tiles[0].xyz).toStrictEqual([0, 0, 0]);
      expect(tiles[0].isVisible).toBeTrue();
    });

    it('gets tiles at z1', () => {
      // +-------+-------+
      // |       |       |
      // | 0,0,1 | 1,0,1 |
      // |       |       |
      // +-------+-------+
      // |       |       |
      // | 0,1,1 | 1,1,1 |
      // |       |       |
      // +-------+-------+
      const t = new Tiler();
      const p = new Projection(256, 256, 256 / Math.PI) // z1
        .dimensions([[0, 0], [512, 512]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(4);

      // prettier-ignore
      const expected = [
        [0,0,1], [1,0,1],
        [0,1,1], [1,1,1]
      ].reverse();

      expected.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
      });
    });

    it('gets tiles at z2', () => {
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,0,2 | 1,0,2 | 2,0,2 | 3,0,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,1,2 | 1,1,2 | 2,1,2 | 3,1,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,2,2 | 1,2,2 | 2,2,2 | 3,2,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      // |       |       |       |       |
      // | 0,3,2 | 1,3,2 | 2,3,2 | 3,3,2 |
      // |       |       |       |       |
      // +-------+-------+-------+-------+
      const t = new Tiler();
      const p = new Projection(512, 512, 512 / Math.PI) // z2
        .dimensions([[0, 0], [1024, 1024]]);

      const result = t.getTiles(p);
      const tiles = result.tiles;
      expect(tiles).toBeArrayOfSize(16);

      // prettier-ignore
      const expected = [
        [0,0,2], [1,0,2], [2,0,2], [3,0,2],
        [0,1,2], [1,1,2], [2,1,2], [3,1,2],
        [0,2,2], [1,2,2], [2,2,2], [3,2,2],
        [0,3,2], [1,3,2], [2,3,2], [3,3,2]
      ].reverse();

      expected.forEach((xyz, i) => {
        expect(tiles[i].id).toBe(xyz.join(','));
        expect(tiles[i].xyz).toStrictEqual(xyz);
        expect(tiles[i].isVisible).toBeTrue();
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
              coordinates: [tile.extent.polygon()]
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
});
