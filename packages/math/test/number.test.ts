import { describe, expect, it } from 'bun:test';
import * as math from '../src/index.ts';


describe('math/number', () => {
  describe('numClamp', () => {
    it('clamps integers within a min..max range', () => {
      expect(math.numClamp(-1, 0, 10)).toBe(0);
      expect(math.numClamp(5, 0, 10)).toBe(5);
      expect(math.numClamp(11, 0, 10)).toBe(10);
    });
    it('clamps floats within a min..max range', () => {
      expect(math.numClamp(-Math.PI, 0, 2 * Math.PI)).toBe(0);
      expect(math.numClamp(Math.PI, 0, 2 * Math.PI)).toBe(Math.PI);
      expect(math.numClamp(3 * Math.PI, 0, 2 * Math.PI)).toBe(2 * Math.PI);
    });
  });

  describe('numWrap', () => {
    it('wraps integers around a min..max range', () => {
      expect(math.numWrap(-1, 0, 10)).toBe(9);
      expect(math.numWrap(5, 0, 10)).toBe(5);
      expect(math.numWrap(11, 0, 10)).toBe(1);
    });
    it('wraps floats around a min..max range', () => {
      expect(math.numWrap(-Math.PI, 0, 2 * Math.PI)).toBeCloseTo(Math.PI, 9);
      expect(math.numWrap(Math.PI, 0, 2 * Math.PI)).toBeCloseTo(Math.PI, 9);
      expect(math.numWrap(3 * Math.PI, 0, 2 * Math.PI)).toBeCloseTo(Math.PI, 9);
    });
  });
});
