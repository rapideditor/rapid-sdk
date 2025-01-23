import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-9) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/geo', () => {
  describe('geoLatToMeters', () => {
    it('0 degrees latitude is 0 meters', () => {
      assert.equal(test.geoLatToMeters(0), 0);
    });

    it('1 degree latitude is approx 111 km', () => {
      assert.closeTo(test.geoLatToMeters(1), 110946, 1);
    });

    it('-1 degree latitude is approx -111 km', () => {
      assert.closeTo(test.geoLatToMeters(-1), -110946, 1);
    });
  });

  describe('geoLonToMeters', () => {
    it('0 degrees longitude is 0 km', () => {
      assert.equal(test.geoLonToMeters(0, 0), 0);
    });

    it('distance of 1 degree longitude varies with latitude', () => {
      assert.closeTo(test.geoLonToMeters(1, 0),  111319, 1);
      assert.closeTo(test.geoLonToMeters(1, 15), 107526, 1);
      assert.closeTo(test.geoLonToMeters(1, 30), 96406, 1);
      assert.closeTo(test.geoLonToMeters(1, 45), 78715, 1);
      assert.closeTo(test.geoLonToMeters(1, 60), 55660, 1);
      assert.closeTo(test.geoLonToMeters(1, 75), 28812, 1);
      assert.equal(test.geoLonToMeters(1, 90), 0);
    });

    it('distance of -1 degree longitude varies with latitude', () => {
      assert.closeTo(test.geoLonToMeters(-1, -0), -111319, 1);
      assert.closeTo(test.geoLonToMeters(-1, -15), -107526, 1);
      assert.closeTo(test.geoLonToMeters(-1, -30), -96406, 1);
      assert.closeTo(test.geoLonToMeters(-1, -45), -78715, 1);
      assert.closeTo(test.geoLonToMeters(-1, -60), -55660, 1);
      assert.closeTo(test.geoLonToMeters(-1, -75), -28812, 1);
      assert.equal(test.geoLonToMeters(-1, -90), 0);
    });
  });

  describe('geoMetersToLat', () => {
    it('0 meters is 0 degrees latitude', () => {
      assert.equal(test.geoMetersToLat(0), 0);
    });
    it('111 km is approx 1 degree latitude', () => {
      assert.closeTo(test.geoMetersToLat(110946), 1, 1e-5);
    });
    it('-111 km is approx -1 degree latitude', () => {
      assert.closeTo(test.geoMetersToLat(-110946), -1, 1e-5);
    });
  });

  describe('geoMetersToLon', () => {
    it('0 meters is 0 degrees longitude', () => {
      assert.equal(test.geoMetersToLon(0, 0), 0);
    });

    it('distance of 1 degree longitude varies with latitude', () => {
      assert.closeTo(test.geoMetersToLon(111319, 0), 1, 1e-4);
      assert.closeTo(test.geoMetersToLon(107526, 15), 1, 1e-4);
      assert.closeTo(test.geoMetersToLon(96405, 30), 1, 1e-4);
      assert.closeTo(test.geoMetersToLon(78715, 45), 1, 1e-4);
      assert.closeTo(test.geoMetersToLon(55660, 60), 1, 1e-4);
      assert.closeTo(test.geoMetersToLon(28812, 75), 1, 1e-4);
      assert.equal(test.geoMetersToLon(1, 90), 0);
      assert.equal(test.geoMetersToLon(1, 91), 0);
    });

    it('distance of -1 degree longitude varies with latitude', () => {
      assert.closeTo(test.geoMetersToLon(-111319, -0), -1, 1e-4);
      assert.closeTo(test.geoMetersToLon(-107526, -15), -1, 1e-4);
      assert.closeTo(test.geoMetersToLon(-96405, -30), -1, 1e-4);
      assert.closeTo(test.geoMetersToLon(-78715, -45), -1, 1e-4);
      assert.closeTo(test.geoMetersToLon(-55660, -60), -1, 1e-4);
      assert.closeTo(test.geoMetersToLon(-28812, -75), -1, 1e-4);
      assert.equal(test.geoMetersToLon(-1, -90), 0);
      assert.equal(test.geoMetersToLon(-1, -91), 0);
    });
  });

  describe('geoOffsetToMeters', () => {
    it('[0, 0] pixel offset is [0, -0] meter offset', () => {
      const result = test.geoOffsetToMeters([0, 0]);
      assert.ok(result instanceof Array);
      assert.equal(result[0], 0);
      assert.equal(result[1], -0);
    });

    it('[0.00064, -0.00064] pixel offset is roughly [100, 100] meter offset', () => {
      const result = test.geoOffsetToMeters([0.00064, -0.00064]);
      assert.ok(result instanceof Array);
      assert.closeTo(result[0], 100, 1);
      assert.closeTo(result[1], 100, 1);
    });
  });

  describe('geoMetersToOffset', () => {
    it('[0, 0] meter offset is [0, -0] pixel offset', () => {
      const result = test.geoMetersToOffset([0, 0]);
      assert.ok(result instanceof Array);
      assert.equal(result[0], 0);
      assert.equal(result[1], -0);
    });

    it('[100, 100] meter offset is roughly [0.00064, -0.00064] pixel offset', () => {
      const result = test.geoMetersToOffset([100, 100]);
      assert.ok(result instanceof Array);
      assert.closeTo(result[0], 0.00064, 1e-5);
      assert.closeTo(result[1], -0.00064, 1e-5);
    });
  });

  describe('geoSphericalDistance', () => {
    it('distance between two same points is zero', () => {
      const a = [0, 0];
      const b = [0, 0];
      assert.equal(test.geoSphericalDistance(a, b), 0);
    });
    it('a straight 1 degree line at the equator is aproximately 111 km', () => {
      const a = [0, 0];
      const b = [1, 0];
      assert.closeTo(test.geoSphericalDistance(a, b), 111319, 1);
    });
    it('a pythagorean triangle is (nearly) right', () => {
      const a = [0, 0];
      const b = [4, 3];
      assert.closeTo(test.geoSphericalDistance(a, b), 555804, 1);
    });
    it('east-west distances at high latitude are shorter', () => {
      const a = [0, 60];
      const b = [1, 60];
      assert.closeTo(test.geoSphericalDistance(a, b), 55660, 1);
    });
    it('north-south distances at high latitude are not shorter', () => {
      const a = [0, 60];
      const b = [0, 61];
      assert.closeTo(test.geoSphericalDistance(a, b), 110946, 1);
    });
  });

  describe('geoZoomToScale', () => {
    it('converts from zoom to projection scale (tileSize = 256)', () => {
      assert.closeTo(test.geoZoomToScale(17), 5340353.715440872);
    });

    it('converts from zoom to projection scale (tileSize = 512)', () => {
      assert.closeTo(test.geoZoomToScale(17, 512), 10680707.430881744);
    });
  });

  describe('geoScaleToZoom', () => {
    it('converts from projection scale to zoom (tileSize = 256)', () => {
      assert.closeTo(test.geoScaleToZoom(5340353.715440872), 17);
    });

    it('converts from projection scale to zoom (tileSize = 512)', () => {
      assert.closeTo(test.geoScaleToZoom(10680707.430881744, 512), 17);
    });
  });

  describe('geoSphericalClosestPoint', () => {
    it('returns null if no points', () => {
      assert.equal(test.geoSphericalClosestPoint([], [1, 1]), null);
    });

    it('returns closest point', () => {
      const points = [ [0, 0], [1, 0], [2, 0] ];
      const result = test.geoSphericalClosestPoint(points, [1, 1]);
      assert.ok(result instanceof Object);
      assert.equal(result.index, 1);
      assert.deepEqual(result.point, [1, 0]);
      assert.closeTo(result.distance, 110946, 1);
    });
  });
});
