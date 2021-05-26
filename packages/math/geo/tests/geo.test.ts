import 'jest-extended';
import * as test from '..'
import { Vec2 } from '@id-sdk/vector'

describe('math/geo', () => {
  describe('geoLatToMeters', () => {
    const CLOSE = 0; // digits

    it('0 degrees latitude is 0 meters', () => {
      expect(test.geoLatToMeters(0)).toBe(0);
    });
    it('1 degree latitude is approx 111 km', () => {
      expect(test.geoLatToMeters(1)).toBeCloseTo(111319, CLOSE);
    });
    it('-1 degree latitude is approx -111 km', () => {
      expect(test.geoLatToMeters(-1)).toBeCloseTo(-111319, CLOSE);
    });
  });

  describe('geoLonToMeters', () => {
    const CLOSE = 0; // digits

    it('0 degrees longitude is 0 km', () => {
      expect(test.geoLonToMeters(0, 0)).toBe(0);
    });
    it('distance of 1 degree longitude varies with latitude', () => {
      expect(test.geoLonToMeters(1, 0)).toBeCloseTo(110946, CLOSE);
      expect(test.geoLonToMeters(1, 15)).toBeCloseTo(107166, CLOSE);
      expect(test.geoLonToMeters(1, 30)).toBeCloseTo(96082, CLOSE);
      expect(test.geoLonToMeters(1, 45)).toBeCloseTo(78451, CLOSE);
      expect(test.geoLonToMeters(1, 60)).toBeCloseTo(55473, CLOSE);
      expect(test.geoLonToMeters(1, 75)).toBeCloseTo(28715, CLOSE);
      expect(test.geoLonToMeters(1, 90)).toBe(0);
    });
    it('distance of -1 degree longitude varies with latitude', () => {
      expect(test.geoLonToMeters(-1, -0)).toBeCloseTo(-110946, CLOSE);
      expect(test.geoLonToMeters(-1, -15)).toBeCloseTo(-107166, CLOSE);
      expect(test.geoLonToMeters(-1, -30)).toBeCloseTo(-96082, CLOSE);
      expect(test.geoLonToMeters(-1, -45)).toBeCloseTo(-78451, CLOSE);
      expect(test.geoLonToMeters(-1, -60)).toBeCloseTo(-55473, CLOSE);
      expect(test.geoLonToMeters(-1, -75)).toBeCloseTo(-28715, CLOSE);
      expect(test.geoLonToMeters(-1, -90)).toBe(0);
    });
  });

  describe('geoMetersToLat', () => {
    const CLOSE = 5; // digits

    it('0 meters is 0 degrees latitude', () => {
      expect(test.geoMetersToLat(0)).toBe(0);
    });
    it('111 km is approx 1 degree latitude', () => {
      expect(test.geoMetersToLat(111319)).toBeCloseTo(1, CLOSE);
    });
    it('-111 km is approx -1 degree latitude', () => {
      expect(test.geoMetersToLat(-111319)).toBeCloseTo(-1, CLOSE);
    });
  });

  describe('geoMetersToLon', () => {
    const CLOSE = 5; // digits

    it('0 meters is 0 degrees longitude', () => {
      expect(test.geoMetersToLon(0, 0)).toBe(0);
    });
    it('distance of 1 degree longitude varies with latitude', () => {
      expect(test.geoMetersToLon(110946, 0)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(107166, 15)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(96082, 30)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(78451, 45)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(55473, 60)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(28715, 75)).toBeCloseTo(1, CLOSE);
      expect(test.geoMetersToLon(1, 90)).toBe(0);
      expect(test.geoMetersToLon(1, 91)).toBe(0);
    });
    it('distance of -1 degree longitude varies with latitude', () => {
      expect(test.geoMetersToLon(-110946, -0)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-107166, -15)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-96082, -30)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-78451, -45)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-55473, -60)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-28715, -75)).toBeCloseTo(-1, CLOSE);
      expect(test.geoMetersToLon(-1, -90)).toBe(0);
      expect(test.geoMetersToLon(-1, -91)).toBe(0);
    });
  });

  describe('geoOffsetToMeters', () => {
    it('[0, 0] pixel offset is [0, -0] meter offset', () => {
      const meters = test.geoOffsetToMeters([0, 0]);
      expect(meters[0]).toBe(0);
      expect(meters[1]).toBe(-0);
    });
    it('[0.00064, -0.00064] pixel offset is roughly [100, 100] meter offset', () => {
      const meters = test.geoOffsetToMeters([0.00064, -0.00064]);
      expect(meters[0]).toBeWithin(99.5, 100.5);
      expect(meters[1]).toBeWithin(99.5, 100.5);
    });
  });

  describe('geoMetersToOffset', () => {
    it('[0, 0] meter offset is [0, -0] pixel offset', () => {
      const offset = test.geoMetersToOffset([0, 0]);
      expect(offset[0]).toBe(0);
      expect(offset[1]).toBe(-0);
    });
    it('[100, 100] meter offset is roughly [0.00064, -0.00064] pixel offset', () => {
      const offset = test.geoMetersToOffset([100, 100]);
      expect(offset[0]).toBeWithin(0.000635, 0.000645);
      expect(offset[1]).toBeWithin(-0.000645, -0.000635);
    });
  });

  describe('geoSphericalDistance', () => {
    const CLOSE = 0; // digits

    it('distance between two same points is zero', () => {
      const a : Vec2 = [0, 0];
      const b : Vec2 = [0, 0];
      expect(test.geoSphericalDistance(a, b)).toBe(0);
    });
    it('a straight 1 degree line at the equator is aproximately 111 km', () => {
      const a : Vec2 = [0, 0];
      const b : Vec2 = [1, 0];
      expect(test.geoSphericalDistance(a, b)).toBeCloseTo(110946, CLOSE);
    });
    it('a pythagorean triangle is (nearly) right', () => {
      const a : Vec2 = [0, 0];
      const b : Vec2 = [4, 3];
      expect(test.geoSphericalDistance(a, b)).toBeCloseTo(555282, CLOSE);
    });
    it('east-west distances at high latitude are shorter', () => {
      const a : Vec2 = [0, 60];
      const b : Vec2= [1, 60];
      expect(test.geoSphericalDistance(a, b)).toBeCloseTo(55473, CLOSE);
    });
    it('north-south distances at high latitude are not shorter', () => {
      const a : Vec2 = [0, 60];
      const b : Vec2 = [0, 61];
      expect(test.geoSphericalDistance(a, b)).toBeCloseTo(111319, CLOSE);
    });
  });

  describe('geoZoomToScale', () => {
    const CLOSE = 6; // digits

    it('converts from zoom to projection scale (tileSize = 256)', () => {
      expect(test.geoZoomToScale(17)).toBeCloseTo(5340353.715440872, CLOSE);
    });
    it('converts from zoom to projection scale (tileSize = 512)', () => {
      expect(test.geoZoomToScale(17, 512)).toBeCloseTo(10680707.430881744, CLOSE);
    });
  });

  describe('geoScaleToZoom', () => {
    const CLOSE = 6; // digits

    it('converts from projection scale to zoom (tileSize = 256)', () => {
      expect(test.geoScaleToZoom(5340353.715440872)).toBeCloseTo(17, CLOSE);
    });
    it('converts from projection scale to zoom (tileSize = 512)', () => {
      expect(test.geoScaleToZoom(10680707.430881744, 512)).toBeCloseTo(17, CLOSE);
    });
  });

  describe('geoSphericalClosestPoint', () => {
    it('returns null if no points', () => {
      expect(test.geoSphericalClosestPoint([], [1, 1])).toBeNull();
    });

    it('returns closest point', () => {
      const CLOSE = 0; // digits
      const points  : Vec2[] = [[0, 0], [1, 0], [2, 0]];
      const result = test.geoSphericalClosestPoint(points, [1, 1]);
      expect(result).toHaveProperty('index', 1);
      expect(result).toHaveProperty('point', [1, 0]);
      expect(result).toHaveProperty('distance');
      expect(result?.distance).toBeCloseTo(111319, CLOSE);
    });
  });
});
