import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Extent, Viewport, geoZoomToScale } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
}

describe('math/viewport', () => {
  describe('constructor', () => {
    it('creates a default Viewport', () => {
      const view = new Viewport();
      const tform = view.transform();
      assert.ok(view instanceof Viewport);
      assert.ok(tform instanceof Object);
      assert.equal(tform.x, 0);
      assert.equal(tform.y, 0);
      assert.equal(tform.k, 256 / Math.PI); // z1
    });

    it('creates a Viewport with a transform param', () => {
      const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 });
      const tform = view.transform();
      assert.ok(view instanceof Viewport);
      assert.ok(tform instanceof Object);
      assert.equal(tform.x, 20);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI); // z2
      assert.equal(tform.r, Math.PI / 2);
    });

    it('constrains scale to values in z0..z24', () => {
      const view1 = new Viewport({ k: geoZoomToScale(-1) });
      assert.closeTo(view1.scale(), geoZoomToScale(0));
      const view2 = new Viewport({ k: geoZoomToScale(25) });
      assert.closeTo(view2.scale(), geoZoomToScale(24));
    });

    it('constrains rotation to values in 0..2π', () => {
      const view1 = new Viewport({ r: 3 * Math.PI });
      assert.closeTo(view1.rotate(), Math.PI);
      const view2 = new Viewport({ r: -Math.PI });
      assert.closeTo(view2.rotate(), Math.PI);
    });

    it('creates a Viewport with a dimensions param', () => {
      const view = new Viewport(null, new Extent([0, 0], [800, 600]));
      assert.deepEqual(view.dimensions(), [[0, 0], [800, 600]]);
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


  describe('#translate', () => {
    it('sets/gets translate', () => {
      const view = new Viewport().translate([20, 30]);
      assert.deepEqual(view.translate(), [20, 30]);
    });
  });

  describe('#scale', () => {
    it('sets/gets scale', () => {
      const view = new Viewport().scale(512 / Math.PI);
      assert.equal(view.scale(), 512 / Math.PI);
    });

    it('constrains scale to values in z0..z24', () => {
      const view1 = new Viewport().scale(geoZoomToScale(-1));
      assert.closeTo(view1.scale(), geoZoomToScale(0));
      const view2 = new Viewport().scale(geoZoomToScale(25));
      assert.closeTo(view2.scale(), geoZoomToScale(24));
    });
  });

  describe('#rotation', () => {
    it('sets/gets rotation', () => {
      const view = new Viewport().rotate(Math.PI);
      assert.equal(view.rotate(), Math.PI);
    });

    it('constrains rotation to values in 0..2π', () => {
      const view = new Viewport();
      view.rotate(3 * Math.PI)
      assert.closeTo(view.rotate(), Math.PI);
      view.rotate(-Math.PI)
      assert.closeTo(view.rotate(), Math.PI);
    });
  });

  describe('#transform', () => {
    it('sets/gets transform', () => {
      const view = new Viewport().transform({ x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 });
      const tform = view.transform();
      assert.ok(tform instanceof Object);
      assert.equal(tform.x, 20);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI);
      assert.equal(tform.r, Math.PI / 2);
    });

    it('ignores missing / invalid properties', () => {
      const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI, r: Math.PI / 2 });
      view.transform({ x: 10, fake: 10 });
      const tform = view.transform();
      assert.ok(tform instanceof Object);
      assert.equal(tform.x, 10);
      assert.equal(tform.y, 30);
      assert.equal(tform.k, 512 / Math.PI);
      assert.equal(tform.r, Math.PI / 2);
      assert.equal(tform.fake, undefined);
    });

    it('constrains scale to values in z0..z24', () => {
      const view1 = new Viewport().transform({ k: geoZoomToScale(-1) });
      assert.closeTo(view1.scale(), geoZoomToScale(0));
      const view2 = new Viewport().transform({ k: geoZoomToScale(25) });
      assert.closeTo(view2.scale(), geoZoomToScale(24));
    });

    it('constrains rotation to values in 0..2π', () => {
      const view1 = new Viewport().transform({ r: 3 * Math.PI });
      assert.closeTo(view1.rotate(), Math.PI);
      const view2 = new Viewport().transform({ r: -Math.PI });
      assert.closeTo(view2.rotate(), Math.PI);
    });
  });

  describe('#dimensions', () => {
    it('sets/gets dimensions', () => {
      const view = new Viewport().dimensions([[0, 0], [800, 600]]);
      assert.deepEqual(view.dimensions(), [[0, 0], [800, 600]]);
    });
  });

  describe('#extent', () => {
    it('returns visible Extent (lon,lat) when viewport is not rotated', () => {
      // Test at zoom 1
      //
      //  +--------+--------+  +85.0511°
      //  | 0,0,1  |  1,0,1 |                 ^
      //  |        |        |                 N
      //  |  +===========+  |               W + E
      //  |  ‖     |     ‖  |                 S
      //  +--‖-----+-----‖--+   0°
      //  |  ‖     |     ‖  |
      //  |  +===========+  |
      //  |        |        |
      //  | 0,1,1  |  1,1,1 |
      //  +--------+--------+  -85.0511°
      //-180°      0°     +180°
      //
      const view = new Viewport()
        .transform({ x: 150, y: 100, k: geoZoomToScale(1) })
        .dimensions([[0, 0], [300, 200]]);
      const result = view.extent();
      assert.ok(result instanceof Extent);
      assert.closeTo(result.min[0], -105.46875);
      assert.closeTo(result.min[1], -57.326521);
      assert.closeTo(result.max[0], 105.46875);
      assert.closeTo(result.max[1], 57.326521);
    });

    it('returns visible Extent (lon,lat) when viewport is rotated', () => {
      // Test at zoom 1
      //
      //  +--------+--------+  -180°
      //  | 0,1,1  |  0,0,1 |
      //  |        |        |                 W
      //  |  +===========+  |               S + N >
      //  |  ‖     |     ‖  |                 E
      //  +--‖-----+-----‖--+   0°
      //  |  ‖     |     ‖  |
      //  |  +===========+  |
      //  |        |        |
      //  | 1,1,1  |  1,0,1 |
      //  +--------+--------+  +180°
      //-85.0511°  0°  +85.0511°
      //
      const view = new Viewport()
        .transform({ x: 150, y: 100, k: geoZoomToScale(1), r: Math.PI / 2 }) // quarter turn clockwise
        .dimensions([[0, 0], [300, 200]]);
      const result = view.extent();
      assert.ok(result instanceof Extent);
      assert.closeTo(result.min[0], -70.3125);
      assert.closeTo(result.min[1], -71.965387);
      assert.closeTo(result.max[0], 70.3125);
      assert.closeTo(result.max[1], 71.965387);
    });
  });

});
