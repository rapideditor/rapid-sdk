import { describe, expect, it } from 'bun:test';
import {
  DEG2RAD, HALF_PI, WORLD_HALF, WORLD_SCALE, WORLD_SIZE,
  Extent, Transform, Viewport
} from '../src/index.ts';


describe('math/viewport', () => {
  describe('constructor', () => {
    it('creates a default Viewport', () => {
      const view = new Viewport();
      const tform = view.transform;
      expect(view).toBeInstanceOf(Viewport);
      expect(tform).toBeInstanceOf(Transform);
      expect(tform.x).toBe(0);
      expect(tform.y).toBe(0);
      expect(tform.z).toBe(1);
    });

    it('creates a Viewport with a Transform-like param', () => {
      const view = new Viewport({ x: '20', y: '30', z: 2, r: HALF_PI } as any);
      const tform = view.transform;
      expect(view).toBeInstanceOf(Viewport);
      expect(tform).toBeInstanceOf(Transform);
      expect(tform.x).toBe(20);
      expect(tform.y).toBe(30);
      expect(tform.z).toBe(2);
      expect(tform.r).toBe(HALF_PI);
      expect(tform.v).toBe(2);
    });

    it('creates a Viewport with a dimensions param', () => {
      const view = new Viewport(undefined, [800, 600]);
      expect(view.dimensions).toEqual([800, 600]);
    });
  });


  describe('#project / #unproject', () => {
    for (const z of [0, 1, 2]) {
      const w = (2 ** z) * 128;  // half the tile size
      const h = w;

      it(`Projects [0°, 0°] -> [0, 0] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const point = view.project([0, 0]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(0, 9);
        expect(point[1]).toBeCloseTo(0, 9);
      });

      it(`Projects [180°, -85.0511287798°] -> [${w}, ${h}] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const point = view.project([180, -85.0511287798]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(w, 9);
        expect(point[1]).toBeCloseTo(h, 9);
      });

      it(`Projects out of bounds [270°, -95°] -> [${w * 1.5}, ${h}] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const point = view.project([270, -95]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(w * 1.5, 9);
        expect(point[1]).toBeCloseTo(h, 9);
      });

      it(`Projects [-180°, 85.0511287798°] -> [${-w}, ${-h}] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const point = view.project([-180, 85.0511287798]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(-w, 9);
        expect(point[1]).toBeCloseTo(-h, 9);
      });

      it(`Projects out of bounds [-270°, 95°] -> [${-w * 1.5}, ${-h}] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const point = view.project([-270, 95]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(-w * 1.5, 9);
        expect(point[1]).toBeCloseTo(-h, 9);
      });

      it(`Applies translation when projecting (at z${z})`, () => {
        const view = new Viewport({ x: 20, y: 30, z: z });
        const point = view.project([-180, 85.0511287798]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(-w + 20, 9);
        expect(point[1]).toBeCloseTo(-h + 30, 9);
      });

      it(`Ignores rotation when projecting, when 'includeRotation' is 'false' (at z${z})`, () => {
        const view = new Viewport({ z: z, r: HALF_PI });  // quarter turn clockwise
        const point = view.project([180, 0]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(w, 9);
        expect(point[1]).toBeCloseTo(0, 9);
      });

      it(`Applies rotation when projecting, when 'includeRotation' is 'true' (at z${z})`, () => {
        const view = new Viewport({ z: z, r: HALF_PI });  // quarter turn clockwise
        const point = view.project([180, 0], true);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(0, 9);
        expect(point[1]).toBeCloseTo(w, 9);
      });

      it(`Unprojects [0, 0] -> [0°, 0°] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const loc = view.unproject([0, 0]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(0, 9);
        expect(loc[1]).toBeCloseTo(0, 9);
      });

      it(`Unprojects [${w}, ${h}] -> [180°, -85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const loc = view.unproject([w, h]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(180, 9);
        expect(loc[1]).toBeCloseTo(-85.0511287798, 9);
      });

      it(`Unprojects out of bounds [${w * 1.5}, Infinity] -> [270°, -85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const loc = view.unproject([w * 1.5, Infinity]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(270, 9);
        expect(loc[1]).toBeCloseTo(-85.0511287798, 9);
      });

      it(`Unprojects [${-w}, ${-h}] -> [-180°, 85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const loc = view.unproject([-w, -h]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(-180, 9);
        expect(loc[1]).toBeCloseTo(85.0511287798, 9);
      });

      it(`Unprojects out of bounds [${-w * 1.5}, -Infinity] -> [-270°, 85.0511287798°] (at z${z})`, () => {
        const view = new Viewport({ z: z });
        const loc = view.unproject([-w * 1.5, -Infinity]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(-270, 9);
        expect(loc[1]).toBeCloseTo(85.0511287798, 9);
      });

      it(`Applies translation when unprojecting (at z${z})`, () => {
        const view = new Viewport({ x: 20, y: 30, z: z });
        const loc = view.unproject([-w + 20, -h + 30]);
        expect(loc).toBeInstanceOf(Array);
        expect(loc[0]).toBeCloseTo(-180, 9);
        expect(loc[1]).toBeCloseTo(85.0511287798, 9);
      });

      it(`Ignores rotation when unprojecting, when 'includeRotation' is 'false' (at z${z})`, () => {
        const view = new Viewport({ z: z, r: HALF_PI });  // quarter turn clockwise
        const point = view.unproject([0, h]);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(0, 9);
        expect(point[1]).toBeCloseTo(-85.0511287798, 9);
      });

      it(`Applies rotation when unprojecting, when 'includeRotation' is 'true' (at z${z})`, () => {
        const view = new Viewport({ z: z, r: HALF_PI });  // quarter turn clockwise
        const point = view.unproject([0, h], true);
        expect(point).toBeInstanceOf(Array);
        expect(point[0]).toBeCloseTo(180, 9);
        expect(point[1]).toBeCloseTo(0, 9);
      });
    }
  });


  describe('#wgs84ToWorld', () => {
    const view = new Viewport();

    it(`Projects [0°, 0°] -> [${WORLD_HALF}, ${WORLD_HALF}]`, () => {
      const point = view.wgs84ToWorld([0, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_HALF, 5);
      expect(point[1]).toBeCloseTo(WORLD_HALF, 5);
    });

    it(`Projects [-180°, 85.0511287798°] -> [0, 0]`, () => {
      const point = view.wgs84ToWorld([-180, 85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 5);
      expect(point[1]).toBeCloseTo(0, 5);
    });

    it(`Projects [-180°, -85.0511287798°] -> [0, ${WORLD_SIZE}]`, () => {
      const point = view.wgs84ToWorld([-180, -85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 5);
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);
    });

    it(`Projects [180°, 85.0511287798°] -> [${WORLD_SIZE}, 0]`, () => {
      const point = view.wgs84ToWorld([180, 85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_SIZE, 5);
      expect(point[1]).toBeCloseTo(0, 5);
    });

    it(`Projects [180°, -85.0511287798°] -> [${WORLD_SIZE}, ${WORLD_SIZE}]`, () => {
      const point = view.wgs84ToWorld([180, -85.0511287798]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(WORLD_SIZE, 5);
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);
    });

    it(`Projects out of bounds [-270°, 95°] -> [${-WORLD_SIZE / 4}, 0]`, () => {
      const point = view.wgs84ToWorld([-270, 95]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-WORLD_SIZE / 4, 5);  // wrap x
      expect(point[1]).toBeCloseTo(0, 5);                // clamp y
    });

    it(`Projects out of bounds [270°, -95°] -> [${5 * WORLD_SIZE / 4}, ${WORLD_SIZE}]`, () => {
      const point = view.wgs84ToWorld([270, -95]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(5 * WORLD_SIZE / 4, 5);  // wrap x
      expect(point[1]).toBeCloseTo(WORLD_SIZE, 5);          // clamp y
    });
  });


  describe('#worldToWgs84', () => {
    const view = new Viewport();

    it(`Unprojects [${WORLD_HALF}, ${WORLD_HALF}] -> [0°, 0°]`, () => {
      const point = view.worldToWgs84([WORLD_HALF, WORLD_HALF]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(0, 9);
      expect(point[1]).toBeCloseTo(0, 9);
    });

    it(`Unprojects [0, 0] -> [-180°, 85.0511287798°]`, () => {
      const point = view.worldToWgs84([0, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-180, 9);
      expect(point[1]).toBeCloseTo(85.0511287798, 9);
    });

    it(`Unprojects [0, ${WORLD_SIZE}] -> [-180°, -85.0511287798°]`, () => {
      const point = view.worldToWgs84([0, WORLD_SIZE]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-180, 9);
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);
    });

    it(`Unprojects [${WORLD_SIZE}, 0] -> [180°, 85.0511287798°]`, () => {
      const point = view.worldToWgs84([WORLD_SIZE, 0]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(180, 9);
      expect(point[1]).toBeCloseTo(85.0511287798, 9);
    });

    it(`Unprojects [${WORLD_SIZE}, ${WORLD_SIZE}] -> [180°, -85.0511287798°]`, () => {
      const point = view.worldToWgs84([WORLD_SIZE, WORLD_SIZE]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(180, 9);
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);
    });

    it(`Unprojects out of bounds [${-WORLD_SIZE / 4}, ${-WORLD_SIZE / 4}] -> [-270°, 85.0511287798°]`, () => {
      const point = view.worldToWgs84([-WORLD_SIZE / 4, -WORLD_SIZE / 4]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(-270, 9);           // wrap x
      expect(point[1]).toBeCloseTo(85.0511287798, 9);  // clamp y
    });

    it(`Unprojects out of bounds [${5 * WORLD_SIZE / 4}, ${5 * WORLD_SIZE / 4}] -> [270°, -85.0511287798°] -> `, () => {
      const point = view.worldToWgs84([5 * WORLD_SIZE / 4, 5 * WORLD_SIZE / 4]);
      expect(point).toBeInstanceOf(Array);
      expect(point[0]).toBeCloseTo(270, 9);             // wrap x
      expect(point[1]).toBeCloseTo(-85.0511287798, 9);  // clamp y
    });
  });


  describe('#transform', () => {
    it('sets/gets transform', () => {
      const view = new Viewport();
      view.transform = { x: '20', y: '30', z: 2, r: HALF_PI } as any;
      const tform = view.transform;
      expect(tform).toBeInstanceOf(Transform);
      expect(tform.x).toBe(20);
      expect(tform.y).toBe(30);
      expect(tform.z).toBe(2);
      expect(tform.r).toBe(HALF_PI);
    });

    it('ignores missing / invalid properties', () => {
      const view = new Viewport({ x: 20, y: 30, z: 2, r: HALF_PI });
      view.transform = { x: 10, fake: 10 } as any;
      const tform = view.transform;
      expect(tform).toBeInstanceOf(Transform);
      expect(tform.x).toBe(10);
      expect(tform.y).toBe(30);
      expect(tform.z).toBe(2);
      expect(tform.r).toBe(HALF_PI);
      expect((tform as any).fake).toBe(undefined);
    });

    it('increments version only on actual change', () => {
      const view = new Viewport({ x: 20, y: 30, z: 2 });
      const v0 = view.v;
      view.transform = { r: HALF_PI };
      expect(view.v).toBe(v0 + 1);  // increment once
      view.transform = { r: HALF_PI };
      expect(view.v).toBe(v0 + 1);  // no increment
    });
  });


  describe('#dimensions', () => {
    it('sets/gets dimensions', () => {
      const view = new Viewport();
      view.dimensions = [800, 600];
      expect(view.dimensions).toEqual([800, 600]);
    });

    it('rounds up fractional dimensions', () => {
      const view = new Viewport();
      view.dimensions = [800.3, 600.6];
      expect(view.dimensions).toEqual([801, 601]);
    });

    it('increments version only on actual change', () => {
      const view = new Viewport();
      const v0 = view.v;
      view.dimensions = [800, 600];
      expect(view.v).toBe(v0 + 1);  // increment once
      view.dimensions = [800, 600];
      expect(view.v).toBe(v0 + 1);  // no increment
    });
  });


  describe('#center', () => {
    it('gets center', () => {
      const view = new Viewport();
      view.dimensions = [800, 600];
      expect(view.center()).toEqual([400, 300]);
    });
  });


  describe('#centerLoc', () => {
    it('gets centerLoc', () => {
      const view = new Viewport({ x: 400, y: 300 }, [800, 600]);
      expect(view.centerLoc()).toEqual([0, 0]);
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
        view.transform = { x: 200, y: 150, z: 1, r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visiblePolygon();
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBe(5);
        for (let i = 0; i < 5; i++) {
          expect(result[i][0]).toBeCloseTo(expected[i][0], 9);
          expect(result[i][1]).toBeCloseTo(expected[i][1], 9);
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
      '45':   [495, 495],
      '90':   [300, 400],
      '135':  [495, 495],
      '180':  [400, 300],
      '225':  [495, 495],
      '270':  [300, 400],
      '315':  [495, 495],
      '360':  [400, 300],
      '-315': [495, 495],
      '-270': [300, 400],
      '-225': [495, 495],
      '-180': [400, 300],
      '-135': [495, 495],
      '-90':  [300, 400],
      '-45':  [495, 495]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible dimensions when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, z: 1, r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visibleDimensions();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBe(expected[0]);
        expect(result[1]).toBe(expected[1]);
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
      '0':    [[-140.6250000000000, -71.96538769913127], [140.6250000000000, 71.96538769913127]],
      '45':   [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '90':   [[-105.4687500000000, -80.17871349622823], [105.4687500000000, 80.17871349622823]],
      '135':  [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '180':  [[-140.6250000000000, -71.96538769913127], [140.6250000000000, 71.96538769913127]],
      '225':  [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '270':  [[-105.4687500000000, -80.17871349622823], [105.4687500000000, 80.17871349622823]],
      '315':  [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '360':  [[-140.6250000000000, -71.96538769913127], [140.6250000000000, 71.96538769913127]],
      '-315': [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '-270': [[-105.4687500000000, -80.17871349622823], [105.4687500000000, 80.17871349622823]],
      '-225': [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '-180': [[-140.6250000000000, -71.96538769913127], [140.6250000000000, 71.96538769913127]],
      '-135': [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]],
      '-90':  [[-105.4687500000000, -80.17871349622823], [105.4687500000000, 80.17871349622823]],
      '-45':  [[-174.0145594326269, -84.50696580103363], [174.0145594326269, 84.50696580103363]]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible extent when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, z: 1, r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visibleExtent();
        expect(result).toBeInstanceOf(Extent);
        expect(result.min[0]).toBeCloseTo(expected[0][0], 9);
        expect(result.min[1]).toBeCloseTo(expected[0][1], 9);
        expect(result.max[0]).toBeCloseTo(expected[1][0], 9);
        expect(result.max[1]).toBeCloseTo(expected[1][1], 9);
      });
    }
  });

  describe('#visibleWorldExtent', () => {
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
    // Viewport setup: transform {x:200, y:150, z:1}, dimensions [400, 300]
    // Screen half-extents are ±100 (x) and ±75 (y) from the center.
    // World offset = screen_px / 2^(z - WORLD_ZOOM) = screen_px * WORLD_SCALE / 2  (at z=1)
    const h = WORLD_HALF;
    const s = WORLD_SCALE;
    const d = 175 * Math.SQRT2 * s / 2;  // 45°-case: half-diagonal of ±(100,75) box in world units
    const tests = {
      '0':    [[h - 100 * s, h - 75 * s], [h + 100 * s, h + 75 * s]],
      '45':   [[h - d, h - d], [h + d, h + d]],
      '90':   [[h - 75 * s, h - 100 * s], [h + 75 * s, h + 100 * s]],
      '135':  [[h - d, h - d], [h + d, h + d]],
      '180':  [[h - 100 * s, h - 75 * s], [h + 100 * s, h + 75 * s]],
      '225':  [[h - d, h - d], [h + d, h + d]],
      '270':  [[h - 75 * s, h - 100 * s], [h + 75 * s, h + 100 * s]],
      '315':  [[h - d, h - d], [h + d, h + d]],
      '360':  [[h - 100 * s, h - 75 * s], [h + 100 * s, h + 75 * s]],
      '-315': [[h - d, h - d], [h + d, h + d]],
      '-270': [[h - 75 * s, h - 100 * s], [h + 75 * s, h + 100 * s]],
      '-225': [[h - d, h - d], [h + d, h + d]],
      '-180': [[h - 100 * s, h - 75 * s], [h + 100 * s, h + 75 * s]],
      '-135': [[h - d, h - d], [h + d, h + d]],
      '-90':  [[h - 75 * s, h - 100 * s], [h + 75 * s, h + 100 * s]],
      '-45':  [[h - d, h - d], [h + d, h + d]]
    };

    for (const [key, expected] of Object.entries(tests)) {
      it(`returns visible world extent when viewport is rotated ${key}°`, () => {
        const degrees = Number.parseInt(key, 10);
        const view = new Viewport();
        view.transform = { x: 200, y: 150, z: 1, r: degrees * DEG2RAD };
        view.dimensions = [400, 300];

        const result = view.visibleWorldExtent();
        expect(result).toBeInstanceOf(Extent);
        expect(result.min[0]).toBeCloseTo(expected[0][0], 0);  // world coords are large; allow 1-unit tolerance
        expect(result.min[1]).toBeCloseTo(expected[0][1], 0);
        expect(result.max[0]).toBeCloseTo(expected[1][0], 0);
        expect(result.max[1]).toBeCloseTo(expected[1][1], 0);
      });
    }
  });

});
