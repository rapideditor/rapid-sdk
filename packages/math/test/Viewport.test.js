import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Extent, Viewport } from '../built/math.mjs';


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

  describe('#project', () => {
    describe('z0', () => {
      it('Projects [0, 0] -> [0, 0] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const point = view.project([0, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [128, 128] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const point = view.project([180, -85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 128);
        assert.closeTo(point[1], 128);
      });

      it('Projects [-180, 85.0511287798] -> [-128, -128] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -128);
        assert.closeTo(point[1], -128);
      });

      it('Applies translation when projecting (at z0)', () => {
        const view = new Viewport({ x: 20, y: 30, k: 128 / Math.PI });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -108);
        assert.closeTo(point[1], -98);
      });

      it('Applies rotation when projecting (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.project([180, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 128);
      });
    });

    describe('z1', () => {
      it('Projects [0, 0] -> [0, 0] (at z1)', () => {
        const view = new Viewport();
        const point = view.project([0, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [256, 256] (at z1)', () => {
        const view = new Viewport();
        const point = view.project([180, -85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 256);
        assert.closeTo(point[1], 256);
      });

      it('Projects [-180, 85.0511287798] -> [-256, -256] (at z1)', () => {
        const view = new Viewport();
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -256);
        assert.closeTo(point[1], -256);
      });

      it('Applies translation when projecting (at z1)', () => {
        const view = new Viewport({ x: 20, y: 30 });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -236);
        assert.closeTo(point[1], -226);
      });

      it('Applies rotation when projecting (at z1)', () => {
        const view = new Viewport({ r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.project([180, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 256);
      });
    });

    describe('z2', () => {
      it('Projects [0, 0] -> [0, 0] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const point = view.project([0, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [512, 512] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const point = view.project([180, -85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 512);
        assert.closeTo(point[1], 512);
      });

      it('Projects [-180, 85.0511287798] -> [-512, -512] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -512);
        assert.closeTo(point[1], -512);
      });

      it('Applies translation when projecting (at z2)', () => {
        const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI });
        const point = view.project([-180, 85.0511287798]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], -492);
        assert.closeTo(point[1], -482);
      });

      it('Applies rotation when projecting (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI, r: Math.PI / 2 });  // quarter turn clockwise
        const point = view.project([180, 0]);
        assert.ok(point instanceof Array);
        assert.closeTo(point[0], 0);
        assert.closeTo(point[1], 512);
      });
    });
  });

  describe('#unproject', () => {
    describe('z0', () => {
      it('Unprojects [0, 0] -> [0, 0] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const loc = view.unproject([0, 0]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 0);
        assert.closeTo(loc[1], 0);
      });

      it('Unprojects [128, 128] -> [180, -85.0511287798] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const loc = view.unproject([128, 128]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], -85.0511287798);
      });

      it('Unprojects [-128, -128] -> [-180, 85.0511287798] (at z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI });
        const loc = view.unproject([-128, -128]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies translation when unprojecting at (z0)', () => {
        const view = new Viewport({ x: 20, y: 30, k: 128 / Math.PI });
        const loc = view.unproject([-108, -98]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies rotation when unprojecting at (z0)', () => {
        const view = new Viewport({ k: 128 / Math.PI, r: Math.PI / 2 });  // quarter turn clockwise
        const loc = view.unproject([0, 128]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], 0);
      });
    });

    describe('z1', () => {
      it('Unprojects [0, 0] -> [0, 0] (at z1)', () => {
        const view = new Viewport();
        const loc = view.unproject([0, 0]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 0);
        assert.closeTo(loc[1], 0);
      });

      it('Unprojects [256, 256] -> [180, -85.0511287798] (at z1)', () => {
        const view = new Viewport();
        const loc = view.unproject([256, 256]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], -85.0511287798);
      });

      it('Unprojects [-256, -256] -> [-180, 85.0511287798] (at z1)', () => {
        const view = new Viewport();
        const loc = view.unproject([-256, -256]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies translation when unprojecting (at z1)', () => {
        const view = new Viewport({ x: 20, y: 30 });
        const loc = view.unproject([-236, -226]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies rotation when unprojecting at (z1)', () => {
        const view = new Viewport({ r: Math.PI / 2 });  // quarter turn clockwise
        const loc = view.unproject([0, 256]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], 0);
      });
    });

    describe('z2', () => {
      it('Unprojects [0, 0] -> [0, 0] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const loc = view.unproject([0, 0]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 0);
        assert.closeTo(loc[1], 0);
      });

      it('Unprojects [512, 512] -> [180, -85.0511287798] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const loc = view.unproject([512, 512]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], -85.0511287798);
      });

      it('Unprojects [-512, -512] -> [-180, 85.0511287798] (at z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI });
        const loc = view.unproject([-512, -512]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies translation when unprojecting (at z2)', () => {
        const view = new Viewport({ x: 20, y: 30, k: 512 / Math.PI });
        const loc = view.unproject([-492, -482]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], -180);
        assert.closeTo(loc[1], 85.0511287798);
      });

      it('Applies rotation when unprojecting at (z2)', () => {
        const view = new Viewport({ k: 512 / Math.PI, r: Math.PI / 2 });  // quarter turn clockwise
        const loc = view.unproject([0, 512]);
        assert.ok(loc instanceof Array);
        assert.closeTo(loc[0], 180);
        assert.closeTo(loc[1], 0);
      });
    });
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
    it('returns dimensions when viewport is not rotated', () => {
      const view = new Viewport().dimensions([[0, 0], [800, 600]]);
      const result = view.extent();
      assert.ok(result instanceof Extent);
      assert.deepEqual(result.min, [0, 0]);
      assert.deepEqual(result.max, [800, 600]);
    });

    it('returns visible extent when viewport is rotated', () => {
      const view = new Viewport()
        .dimensions([[0, 0], [800, 600]])
        .transform({ r: Math.PI / 2 });   // quarter turn clockwise
      const result = view.extent();
      assert.ok(result instanceof Extent);
      assert.deepEqual(result.min, [100, -100]);
      assert.deepEqual(result.max, [700, 700]);
    });
  });

});
