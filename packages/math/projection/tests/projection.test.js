import { Projection } from '..';

describe('math/projection', () => {
  const CLOSE = 6; // digits

  describe('constructor', () => {
    it('creates a default Projection', () => {
      const proj = new Projection();
      const t = proj.transform();
      expect(t.x).toBe(0);
      expect(t.y).toBe(0);
      expect(t.k).toBe(256 / Math.PI); // z1
    });

    it('creates a Projection with parameters', () => {
      const proj = new Projection(20, 30, 512 / Math.PI);
      const t = proj.transform();
      expect(t.x).toBe(20);
      expect(t.y).toBe(30);
      expect(t.k).toBe(512 / Math.PI); // z2
    });
  });

  describe('#project', () => {
    it('Projects [0, 0] -> [0, 0]', () => {
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
  });

  describe('#invert', () => {
    it('Inverse projects [0, 0] -> [0, 0]', () => {
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
  });
});
