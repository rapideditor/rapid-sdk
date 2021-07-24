import { Projection, Transform } from '../src/projection';
import { Vec2 } from '@id-sdk/vector';

describe('math/projection', () => {
  const CLOSE = 6; // digits

  describe('constructor', () => {
    it('creates a default Projection', () => {
      const proj = new Projection();
      const t: Transform = proj.transform() as Transform;
      expect(t.x).toBe(0);
      expect(t.y).toBe(0);
      expect(t.k).toBe(256 / Math.PI); // z1
    });

    it('creates a Projection with parameters', () => {
      const proj = new Projection(20, 30, 512 / Math.PI);
      const t: Transform = proj.transform() as Transform;
      expect(t.x).toBe(20);
      expect(t.y).toBe(30);
      expect(t.k).toBe(512 / Math.PI); // z2
    });
  });

  describe('#project', () => {
    describe('z0', () => {
      it('Projects [0, 0] -> [0, 0] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Projects [180, -85.0511287798] -> [128, 128] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([180, -85.0511287798]);
        expect(p[0]).toBeCloseTo(128, CLOSE);
        expect(p[1]).toBeCloseTo(128, CLOSE);
      });

      it('Projects [-180, 85.0511287798] -> [-128, -128] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-128, CLOSE);
        expect(p[1]).toBeCloseTo(-128, CLOSE);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30, 128 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-108, CLOSE);
        expect(p[1]).toBeCloseTo(-98, CLOSE);
      });
    });

    describe('z1', () => {
      it('Projects [0, 0] -> [0, 0] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Projects [180, -85.0511287798] -> [256, 256] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([180, -85.0511287798]);
        expect(p[0]).toBeCloseTo(256, CLOSE);
        expect(p[1]).toBeCloseTo(256, CLOSE);
      });

      it('Projects [-180, 85.0511287798] -> [-256, -256] (at z1)', () => {
        const proj = new Projection();
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-256, CLOSE);
        expect(p[1]).toBeCloseTo(-256, CLOSE);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30);
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-236, CLOSE);
        expect(p[1]).toBeCloseTo(-226, CLOSE);
      });
    });

    describe('z2', () => {
      it('Projects [0, 0] -> [0, 0] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Projects [180, -85.0511287798] -> [512, 512] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([180, -85.0511287798]);
        expect(p[0]).toBeCloseTo(512, CLOSE);
        expect(p[1]).toBeCloseTo(512, CLOSE);
      });

      it('Projects [-180, 85.0511287798] -> [-512, -512] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-512, CLOSE);
        expect(p[1]).toBeCloseTo(-512, CLOSE);
      });

      it('Applies translation when projecting', () => {
        const proj = new Projection(20, 30, 512 / Math.PI);
        const p = proj.project([-180, 85.0511287798]);
        expect(p[0]).toBeCloseTo(-492, CLOSE);
        expect(p[1]).toBeCloseTo(-482, CLOSE);
      });
    });
  });

  describe('#invert', () => {
    describe('z0', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Inverse projects [128, 128] -> [180, -85.0511287798] (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([128, 128]);
        expect(p[0]).toBeCloseTo(180, CLOSE);
        expect(p[1]).toBeCloseTo(-85.0511287798, CLOSE);
      });

      it('Inverse projects [-128, -128] -> [-180, 85.0511287798] ->  (at z0)', () => {
        const proj = new Projection(0, 0, 128 / Math.PI);
        const p = proj.invert([-128, -128]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30, 128 / Math.PI);
        const p = proj.invert([-108, -98]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });
    });

    describe('z1', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Inverse projects [256, 256] -> [180, -85.0511287798] (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([256, 256]);
        expect(p[0]).toBeCloseTo(180, CLOSE);
        expect(p[1]).toBeCloseTo(-85.0511287798, CLOSE);
      });

      it('Inverse projects [-256, -256] -> [-180, 85.0511287798] ->  (at z1)', () => {
        const proj = new Projection();
        const p = proj.invert([-256, -256]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30);
        const p = proj.invert([-236, -226]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });
    });

    describe('z2', () => {
      it('Inverse projects [0, 0] -> [0, 0] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([0, 0]);
        expect(p[0]).toBeCloseTo(0, CLOSE);
        expect(p[1]).toBeCloseTo(0, CLOSE);
      });

      it('Inverse projects [512, 512] -> [180, -85.0511287798] (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([512, 512]);
        expect(p[0]).toBeCloseTo(180, CLOSE);
        expect(p[1]).toBeCloseTo(-85.0511287798, CLOSE);
      });

      it('Inverse projects [-512, -512] -> [-180, 85.0511287798] ->  (at z2)', () => {
        const proj = new Projection(0, 0, 512 / Math.PI);
        const p = proj.invert([-512, -512]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });

      it('Applies translation when inverse projecting', () => {
        const proj = new Projection(20, 30, 512 / Math.PI);
        const p = proj.invert([-492, -482]);
        expect(p[0]).toBeCloseTo(-180, CLOSE);
        expect(p[1]).toBeCloseTo(85.0511287798, CLOSE);
      });
    });
  });

  describe('#scale', () => {
    it('sets/gets scale', () => {
      const proj: Projection = new Projection().scale(512 / Math.PI) as Projection;
      expect(proj.scale()).toBe(512 / Math.PI);
    });
  });

  describe('#translate', () => {
    it('sets/gets translate', () => {
      const proj: Projection = new Projection().translate([20, 30]) as Projection;
      expect(proj.translate()).toStrictEqual([20, 30]);
    });
  });

  describe('#dimensions', () => {
    it('sets/gets dimensions', () => {
      const proj: Projection = new Projection().dimensions([
        [0, 0],
        [800, 600]
      ]) as Projection;
      expect(proj.dimensions()).toStrictEqual([
        [0, 0],
        [800, 600]
      ]);
    });
  });

  describe('#transform', () => {
    it('sets/gets transform', () => {
      const t = { x: 20, y: 30, k: 512 / Math.PI };
      const proj: Projection = new Projection().transform(t) as Projection;
      expect(proj.transform()).toMatchObject(t);
    });
  });

  describe('#getStream', () => {
    it('gets a d3 transform stream', () => {
      const proj = new Projection(20, 30);
      let s = proj.getStream()();
      let p;

      s.stream = {
        point: (x, y) => {
          p = [x, y];
        }
      };
      s.point(-180, 85.0511287798);
      expect(p[0]).toBeCloseTo(-236, CLOSE);
      expect(p[1]).toBeCloseTo(-226, CLOSE);
    });
  });
});
