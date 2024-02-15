import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { Projection } from '../built/math.mjs';


assert.closeTo = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a - b) > epsilon) {
    assert.fail(`${a} is not close to ${b} within ${epsilon}`);
  }
}

describe('math/projection', () => {
  describe('constructor', () => {
    it('creates a default Projection', () => {
      const p = new Projection();
      const t = p.transform();
      assert.ok(p instanceof Projection);
      assert.ok(t instanceof Object);
      assert.equal(t.x, 0);
      assert.equal(t.y, 0);
      assert.equal(t.k, 256 / Math.PI); // z1
    });

    it('creates a Projection with parameters', () => {
      const p = new Projection(20, 30, 512 / Math.PI);
      const t = p.transform();
      assert.ok(p instanceof Projection);
      assert.ok(t instanceof Object);
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.k, 512 / Math.PI); // z2
    });
  });

  describe('#project', () => {
    describe('z0', () => {
      it('Projects [0, 0] -> [0, 0] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [128, 128] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([180, -85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 128);
        assert.closeTo(p[1], 128);
      });

      it('Projects [-180, 85.0511287798] -> [-128, -128] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -128);
        assert.closeTo(p[1], -128);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30, 128 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -108);
        assert.closeTo(p[1], -98);
      });
    });

    describe('z1', () => {
      it('Projects [0, 0] -> [0, 0] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [256, 256] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([180, -85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 256);
        assert.closeTo(p[1], 256);
      });

      it('Projects [-180, 85.0511287798] -> [-256, -256] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -256);
        assert.closeTo(p[1], -256);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30);
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -236);
        assert.closeTo(p[1], -226);
      });
    });

    describe('z2', () => {
      it('Projects [0, 0] -> [0, 0] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Projects [180, -85.0511287798] -> [512, 512] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([180, -85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 512);
        assert.closeTo(p[1], 512);
      });

      it('Projects [-180, 85.0511287798] -> [-512, -512] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -512);
        assert.closeTo(p[1], -512);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30, 512 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -492);
        assert.closeTo(p[1], -482);
      });
    });
  });

  describe('#invert', () => {
    describe('z0', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Inverse projects [128, 128] -> [180, -85.0511287798] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([128, 128]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 180);
        assert.closeTo(p[1], -85.0511287798);
      });

      it('Inverse projects [-128, -128] -> [-180, 85.0511287798] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([-128, -128]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30, 128 / Math.PI);
        const p = proj.invert([-108, -98]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });
    });

    describe('z1', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Inverse projects [256, 256] -> [180, -85.0511287798] (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([256, 256]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 180);
        assert.closeTo(p[1], -85.0511287798);
      });

      it('Inverse projects [-256, -256] -> [-180, 85.0511287798] (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([-256, -256]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30);
        const p = proj.invert([-236, -226]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });
    });

    describe('z2', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([0, 0]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 0);
        assert.closeTo(p[1], 0);
      });

      it('Inverse projects [512, 512] -> [180, -85.0511287798] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([512, 512]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], 180);
        assert.closeTo(p[1], -85.0511287798);
      });

      it('Inverse projects [-512, -512] -> [-180, 85.0511287798] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([-512, -512]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30, 512 / Math.PI);
        const p = proj.invert([-492, -482]);
        assert.ok(p instanceof Array);
        assert.closeTo(p[0], -180);
        assert.closeTo(p[1], 85.0511287798);
      });
    });
  });

  describe('#scale', () => {
    it('sets/gets scale', () => {
      const proj = new Projection().scale(512 / Math.PI);
      assert.equal(proj.scale(), 512 / Math.PI);
    });
  });

  describe('#translate', () => {
    it('sets/gets translate', () => {
      const proj = new Projection().translate([20, 30]);
      assert.deepEqual(proj.translate(), [20, 30]);
    });
  });

  describe('#dimensions', () => {
    it('sets/gets dimensions', () => {
      const proj = new Projection().dimensions([[0, 0], [800, 600]]);
      assert.deepEqual(proj.dimensions(), [[0, 0], [800, 600]]);
    });
  });

  describe('#transform', () => {
    it('sets/gets transform', () => {
      const proj = new Projection().transform({ x: 20, y: 30, k: 512 / Math.PI });
      const t = proj.transform();
      assert.ok(t instanceof Object);
      assert.equal(t.x, 20);
      assert.equal(t.y, 30);
      assert.equal(t.k, 512 / Math.PI);
    });
  });
});
