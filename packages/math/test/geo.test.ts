import { describe, expect, it } from 'bun:test';
import * as math from '../src/index.ts';
import type { Vec2 } from '../src/index.ts';


describe('math/geo', () => {
  describe('geoLatToMeters', () => {
    it('0 degrees latitude is 0 meters', () => {
      expect(math.geoLatToMeters(0)).toBe(0);
    });

    it('1 degree latitude is approx 111 km', () => {
      expect(math.geoLatToMeters(1)).toBeCloseTo(110946, 0);
    });

    it('-1 degree latitude is approx -111 km', () => {
      expect(math.geoLatToMeters(-1)).toBeCloseTo(-110946, 0);
    });
  });

  describe('geoLonToMeters', () => {
    it('0 degrees longitude is 0 km', () => {
      expect(math.geoLonToMeters(0, 0)).toBe(0);
    });

    it('distance of 1 degree longitude varies with latitude', () => {
      expect(math.geoLonToMeters(1, 0)).toBeCloseTo(111319, 0);
      expect(math.geoLonToMeters(1, 15)).toBeCloseTo(107526, 0);
      expect(math.geoLonToMeters(1, 30)).toBeCloseTo(96406, 0);
      expect(math.geoLonToMeters(1, 45)).toBeCloseTo(78715, 0);
      expect(math.geoLonToMeters(1, 60)).toBeCloseTo(55660, 0);
      expect(math.geoLonToMeters(1, 75)).toBeCloseTo(28812, 0);
      expect(math.geoLonToMeters(1, 90)).toBe(0);
    });

    it('distance of -1 degree longitude varies with latitude', () => {
      expect(math.geoLonToMeters(-1, -0)).toBeCloseTo(-111319, 0);
      expect(math.geoLonToMeters(-1, -15)).toBeCloseTo(-107526, 0);
      expect(math.geoLonToMeters(-1, -30)).toBeCloseTo(-96406, 0);
      expect(math.geoLonToMeters(-1, -45)).toBeCloseTo(-78715, 0);
      expect(math.geoLonToMeters(-1, -60)).toBeCloseTo(-55660, 0);
      expect(math.geoLonToMeters(-1, -75)).toBeCloseTo(-28812, 0);
      expect(math.geoLonToMeters(-1, -90)).toBe(0);
    });
  });

  describe('geoMetersToLat', () => {
    it('0 meters is 0 degrees latitude', () => {
      expect(math.geoMetersToLat(0)).toBe(0);
    });
    it('111 km is approx 1 degree latitude', () => {
      expect(math.geoMetersToLat(110946)).toBeCloseTo(1, 5);
    });
    it('-111 km is approx -1 degree latitude', () => {
      expect(math.geoMetersToLat(-110946)).toBeCloseTo(-1, 5);
    });
  });

  describe('geoMetersToLon', () => {
    it('0 meters is 0 degrees longitude', () => {
      expect(math.geoMetersToLon(0, 0)).toBe(0);
    });

    it('distance of 1 degree longitude varies with latitude', () => {
      expect(math.geoMetersToLon(111319, 0)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(107526, 15)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(96405, 30)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(78715, 45)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(55660, 60)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(28812, 75)).toBeCloseTo(1, 4);
      expect(math.geoMetersToLon(1, 90)).toBe(0);
      expect(math.geoMetersToLon(1, 91)).toBe(0);
    });

    it('distance of -1 degree longitude varies with latitude', () => {
      expect(math.geoMetersToLon(-111319, -0)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-107526, -15)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-96405, -30)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-78715, -45)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-55660, -60)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-28812, -75)).toBeCloseTo(-1, 4);
      expect(math.geoMetersToLon(-1, -90)).toBe(0);
      expect(math.geoMetersToLon(-1, -91)).toBe(0);
    });
  });

  describe('geoOffsetToMeters', () => {
    it('[0, 0] pixel offset is [0, -0] meter offset', () => {
      const result = math.geoOffsetToMeters([0, 0]);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(-0);
    });

    it('[0.00064, -0.00064] pixel offset is roughly [100, 100] meter offset', () => {
      const result = math.geoOffsetToMeters([0.00064, -0.00064]);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeCloseTo(100, 0);
      expect(result[1]).toBeCloseTo(100, 0);
    });
  });

  describe('geoMetersToOffset', () => {
    it('[0, 0] meter offset is [0, -0] pixel offset', () => {
      const result = math.geoMetersToOffset([0, 0]);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(-0);
    });

    it('[100, 100] meter offset is roughly [0.00064, -0.00064] pixel offset', () => {
      const result = math.geoMetersToOffset([100, 100]);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeCloseTo(0.00064, 5);
      expect(result[1]).toBeCloseTo(-0.00064, 5);
    });
  });

  describe('geoSphericalDistance', () => {
    it('distance between two same points is zero', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [0, 0];
      expect(math.geoSphericalDistance(a, b)).toBe(0);
    });
    it('a straight 1 degree line at the equator is aproximately 111 km', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [1, 0];
      expect(math.geoSphericalDistance(a, b)).toBeCloseTo(111319, 0);
    });
    it('a pythagorean triangle is (nearly) right', () => {
      const a: Vec2 = [0, 0];
      const b: Vec2 = [4, 3];
      expect(math.geoSphericalDistance(a, b)).toBeCloseTo(555804, 0);
    });
    it('east-west distances at high latitude are shorter', () => {
      const a: Vec2 = [0, 60];
      const b: Vec2 = [1, 60];
      expect(math.geoSphericalDistance(a, b)).toBeCloseTo(55660, 0);
    });
    it('north-south distances at high latitude are not shorter', () => {
      const a: Vec2 = [0, 60];
      const b: Vec2 = [0, 61];
      expect(math.geoSphericalDistance(a, b)).toBeCloseTo(110946, 0);
    });
    it('supports scalar overload for hot paths', () => {
      expect(math.geoSphericalDistance(0, 0, 1, 0)).toBeCloseTo(111319, 0);
      expect(math.geoSphericalDistance(0, 0, 0, 0)).toBe(0);
    });
  });

  describe('geoZoomToScale', () => {
    it('converts from zoom to projection scale (tileSize = 256)', () => {
      expect(math.geoZoomToScale(17)).toBeCloseTo(5340353.715440872, 9);
    });

    it('converts from zoom to projection scale (tileSize = 512)', () => {
      expect(math.geoZoomToScale(17, 512)).toBeCloseTo(10680707.430881744, 9);
    });
  });

  describe('geoScaleToZoom', () => {
    it('converts from projection scale to zoom (tileSize = 256)', () => {
      expect(math.geoScaleToZoom(5340353.715440872)).toBeCloseTo(17, 9);
    });

    it('converts from projection scale to zoom (tileSize = 512)', () => {
      expect(math.geoScaleToZoom(10680707.430881744, 512)).toBeCloseTo(17, 9);
    });
  });

  describe('geoSphericalClosestPoint', () => {
    it('returns null if no points', () => {
      expect(math.geoSphericalClosestPoint([], [1, 1])).toBe(null);
    });

    it('returns closest point', () => {
      const points: Vec2[] = [[0, 0], [1, 0], [2, 0]];
      const result = math.geoSphericalClosestPoint(points, [1, 1]);
      expect(result).toBeInstanceOf(Object);
      if (!result) throw new Error('expected closest point result');
      expect(result.index).toBe(1);
      expect(result.point).toEqual([1, 0]);
      expect(result.distance).toBeCloseTo(110946, 0);
    });
  });
});
