import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { DEG2RAD, Extent, Transform, Viewport, geoZoomToScale } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
};

describe('math/viewport', () => {
  describe('constructor', () => {
    it('creates a default Viewport', () => {
      const view = new Viewport();
      const tform = view.transform;
      assert.ok(view instanceof Viewport);
      assert.ok(tform instanceof Transform);
      assert.equal(tform.x, 0);
      assert.equal(tform.y, 0);
      assert.equal(tform.k, 256 / Math.PI); // z1
    });

    it('creates a Viewport with a Transform-like param', () => {
      const view = new Viewport({ x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 });
      const tform = view.transform;
      assert.ok(view instanceof Viewport);
      assert.ok(tform instanceof Transform);
      assert.equal(tform.x, 20);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI); // z2
      assert.equal(tform.r, Math.PI / 2);
      assert.equal(tform.v, 2);
    });

    it('creates a Viewport with a dimensions param', () => {
      const view = new Viewport(null, [800, 600]);
      assert.deepEqual(view.dimensions, [800, 600]);
    });
  });


  describe('#project / #unproject', () => {
    for (const z of [0, 1, 2]) {
      const k = geoZoomToScale(z);
      const w = Math.pow(2, z) * 128;  // half the tile size
      const h = w;

      it(`Projects [0°, 0°] -> [0, 0] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const point = view.project([0, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 0);
      });

      it(`Projects [180°, -85.0511287798°] -> [${w}, ${h}] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const point = view.project([180, -85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], w);
        assert.closeTo(point[1], h);
      });

      it(`Projects out of bounds [270°, -95°] -> [${w * 1.5}, ${h}] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const point = view.project([270, -95]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], w * 1.5);
        assert.closeTo(point[1], h);
      });

      it(`Projects [-180°, 85.0511287798°] -> [${-w}, ${-h}] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -w);
        assert.closeTo(point[1], -h);
      });

      it(`Projects out of bounds [-270°, 95°] -> [${-w * 1.5}, ${-h}] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const point = view.project([-270, 95]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -w * 1.5);
        assert.closeTo(point[1], -h);
      });

      it(`Applies translation when projecting (at z${z})`, () => {
        const view = new Viewport({ x: 20, y: 30, k: k });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -w + 20);
        assert.closeTo(point[1], -h + 30);
      });

      it(`Ignores rotation when projecting, when 'includeRotation' is 'false' (at z${z})`, () => {
        const view = new Viewport({ k: k, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.project([180, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], w);
        assert.closeTo(point[1], 0);
      });

      it(`Applies rotation when projecting, when 'includeRotation' is 'true' (at z${z})`, () => {
        const view = new Viewport({ k: k, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.project([180, 0], true);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], w);
      });

      it(`Unprojects [0, 0] -> [0°, 0°] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const loc = view.unproject([0, 0]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 0);
        assert.closeTo(loc[1], 0);
      });

      it(`Unprojects [${w}, ${h}] -> [180°, -85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const loc = view.unproject([w, h]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], -85.0511287798);
      });

      it(`Unprojects out of bounds [${w * 1.5}, Infinity] -> [270°, -85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const loc = view.unproject([w * 1.5, Infinity]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 270);
        assert.closeTo(loc[1], -85.0511287798);
      });

      it(`Unprojects [${-w}, ${-h}] -> [-180°, 85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const loc = view.unproject([-w, -h]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it(`Unprojects out of bounds [${-w * 1.5}, -Infinity] -> [-270°, 85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ k: k });
        const loc = view.unproject([-w * 1.5, -Infinity]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -270);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it(`Applies translation when unprojecting (at z${z})`, () => {
        const view = new Viewport({ x: 20, y: 30, k: k });
        const loc = view.unproject([-w + 20, -h + 30]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it(`Ignores rotation when unprojecting, when 'includeRotation' is 'false' (at z${z})`, () => {
        const view = new Viewport({ k: k, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.unproject([0, h]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], -85.0511287798);
      });

      it(`Applies rotation when unprojecting, when 'includeRotation' is 'true' (at z${z})`, () => {
        const view = new Viewport({ k: k, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.unproject([0, h], true);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 180);
        assert.closeTo(point[1], 0);
      });
    }
  });


  describe('#transform', () => {
    it('sets/gets transform', () => {
      const view = new Viewport();
      view.transform = { x: '20', y: '30', k: 512 / Math.PI, r: Math.PI / 2 };
      const tform = view.transform;
      assert.ok(tform instanceof Transform);
      assert.equal(tform.x, 20);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI);
      assert.equal(tform.r, Math.PI / 2);
    });

    it('ignores missing / invalid properties', () => {
      const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 });
      view.transform = { x: 10, fake: 10 };
      const tform = view.transform;
      assert.ok(tform instanceof Transform);
      assert.equal(tform.x, 10);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI);
      assert.equal(tform.r, Math.PI / 2);
      assert.equal(tform.fake, undefined);
    });

    it('increments version only on actual change', () => {
      const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI });
      const v0 = view.v;
      view.transform = { r: Math.PI / 2 };
      assert.equal(view.v, v0 + 1);  // increment once
      view.transform = { r: Math.PI / 2 };
      assert.equal(view.v, v0 + 1);  // no increment
    });
  });


  describe('#dimensions', () => {
    it('sets/gets dimensions', () => {
      const view = new Viewport();
      view.dimensions = [800, 600];
      assert.deepEqual(view.dimensions, [800, 600]);
    });

    it('rounds up fractional dimensions', () => {
      const view = new Viewport();
      view.dimensions = [800.3, 600.6];
      assert.deepEqual(view.dimensions, [801, 601]);
    });

    it('increments version only on actual change', () => {
      const view = new Viewport();
      const v0 = view.v;
      view.dimensions = [800, 600];
      assert.equal(view.v, v0 + 1);  // increment once
      view.dimensions = [800, 600];
      assert.equal(view.v, v0 + 1);  // no increment
    });
  });


  describe('#center', () => {
    it('gets center', () => {
      const view = new Viewport();
      view.dimensions = [800, 600];
      assert.deepEqual(view.center(), [400, 300]);
    });
  });


  describe('#centerLoc', () => {
    it('gets centerLoc', () => {
      const view = new Viewport({ x: 400, y: 300 }, [800, 600]);
      assert.deepEqual(view.centerLoc(), [0, 0]);
    });
  });


  describe('#visiblePolygon', () => {
    //
    //        |  E__
    //        |r/   ''--..__
    //        |/           r''--..__
    //  [0,0] A═══════════════════════D__
    //       /║                       ║  ''H         N
    //      /r║                       ║   /      W._/
    //     /  ║           +           ║  /         /'-E
    //    /   ║                       ║r/         S
    //   F__  ║                       ║/
    //      ''B═══════════════════════C [w,h]
    //           ''--..__r           /|
    //                   ''--..__   /r|
    //                           ''G  |
    //
    //  Here we are testing the coordinates of the extended viewport, [E, F, G, H, E]
    //
    const tests = {
      '0':    [[0, 0], [0, 300], [400, 300], [400, 0], [0, 0]],
      '45':   [[200, -200], [-150, 150], [200, 500], [550, 150], [200, -200]],
      '90':   [[400, 0], [0, 0], [0, 300], [400, 300], [400, 0]],
      '135':  [[550, 150], [200, -200], [-150, 150], [200, 500], [550, 150]],
      '180':  [[400, 300], [400, 0], [0, 0], [0, 300], [400, 300]],
      '225':  [[200, 500], [550, 150], [200, -200], [-150, 150], [200, 500]],
      '270':  [[0, 300], [400, 300], [400, 0], [0, 0], [0, 300]],
      '315':  [[-150, 150], [200, 500], [550, 150], [200, -200], [-150, 150]],
      '360':  [[0, 0], [0, 300], [400, 300], [400, 0], [0, 0]],
      '-315': [[200, -200], [-150, 150], [200, 500], [550, 150], [200, -200]],
      '-270': [[400, 0], [0, 0], [0, 300], [400, 300], [400, 0]],
      '-225': [[550, 150], [200, -200], [-150, 150], [200, 500], [550, 150]],
      '-180': [[400, 300], [400, 0], [0, 0], [0, 300], [400, 300]],
      '-135': [[200, 500], [550, 150], [200, -200], [-150, 150], [200, 500]],
      '-90':  [[0, 300], [400, 300], [400, 0], [0, 0], [0, 300]],
      '-45':  [[-150, 150], [200, 500], [550, 150], [200, -200], [-150, 150]]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible polygon when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, k: geoZoomToScale(1), r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visiblePolygon();
        assert.ok(result instanceof Array);
        assert.equal(result.length, 5);
        for (let i = 0; i < 5; i++) {
          assert.closeTo(result[i][0], expected[i][0]);
          assert.closeTo(result[i][1], expected[i][1]);
        }
      });
    }
  });

  describe('#visibleDimensions', () => {
    //
    //        |  E__
    //        |r/   ''--..__
    //        |/           r''--..__
    //  [0,0] A═══════════════════════D__
    //       /║                       ║  ''H         N
    //      /r║                       ║   /      W._/
    //     /  ║           +           ║  /         /'-E
    //    /   ║                       ║r/         S
    //   F__  ║                       ║/
    //      ''B═══════════════════════C [w,h]
    //           ''--..__r           /|
    //                   ''--..__   /r|
    //                           ''G  |
    //
    //  Here we are testing the dimensions of the extended viewport, [w2,h2], or [EDH, HCG]
    //
    const tests = {
      '0':    [400, 300],
      '45':   [500, 500],
      '90':   [300, 400],
      '135':  [500, 500],
      '180':  [400, 300],
      '225':  [500, 500],
      '270':  [300, 400],
      '315':  [500, 500],
      '360':  [400, 300],
      '-315': [500, 500],
      '-270': [300, 400],
      '-225': [500, 500],
      '-180': [400, 300],
      '-135': [500, 500],
      '-90':  [300, 400],
      '-45':  [500, 500]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible dimensions when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, k: geoZoomToScale(1), r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visibleDimensions();
        assert.ok(result instanceof Array);
        assert.equal(result[0][0], expected[0][0]);
        assert.equal(result[1][1], expected[0][1]);
      });
    }
  });


  describe('#visibleExtent', () => {
    //
    //        |  E__
    //        |r/   ''--..__
    //        |/           r''--..__
    //  [0,0] A═══════════════════════D__
    //       /║                       ║  ''H         N
    //      /r║                       ║   /      W._/
    //     /  ║           +           ║  /         /'-E
    //    /   ║                       ║r/         S
    //   F__  ║                       ║/
    //      ''B═══════════════════════C [w,h]
    //           ''--..__r           /|
    //                   ''--..__   /r|
    //                           ''G  |
    //
    //  Here we are testing the [lon,lat] extent of the extended viewport, where [E, F, G, H]
    //  define the north-up coordinate system (F is bottom-left, H is top-right)
    //
    const tests = {
      '0':    [[-140.625, -71.965387], [140.625, 71.965387]],
      '45':   [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '90':   [[-105.46875, -80.178713], [105.46875, 80.178713]],
      '135':  [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '180':  [[-140.625, -71.965387], [140.625, 71.965387]],
      '225':  [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '270':  [[-105.46875, -80.178713], [105.46875, 80.178713]],
      '315':  [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '360':  [[-140.625, -71.965387], [140.625, 71.965387]],
      '-315': [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '-270': [[-105.46875, -80.178713], [105.46875, 80.178713]],
      '-225': [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '-180': [[-140.625, -71.965387], [140.625, 71.965387]],
      '-135': [[-174.014559, -84.506965], [174.014559, 84.506965]],
      '-90':  [[-105.46875, -80.178713], [105.46875, 80.178713]],
      '-45':  [[-174.014559, -84.506965], [174.014559, 84.506965]]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible dimensions when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, k: geoZoomToScale(1), r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visibleExtent();
        assert.ok(result instanceof Extent);
        assert.closeTo(result.min[0], expected[0][0]);
        assert.closeTo(result.min[1], expected[0][1]);
        assert.closeTo(result.max[0], expected[1][0]);
        assert.closeTo(result.max[1], expected[1][1]);
      });
    }
  });

});
