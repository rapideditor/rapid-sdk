import { afterEach, describe, expect, it } from 'bun:test';
import * as util from '../src/index.ts';


describe('utilSessionMutex', () => {
  let a, b;

  afterEach(() => {
    if (a) a.unlock();
    if (b) b.unlock();
  });

  describe('#lock', () => {
    it('returns true when it gets a lock', () => {
      a = util.utilSessionMutex('name');
      expect(a.lock()).toBe(true);
    });

    it('returns true when already locked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      expect(a.lock()).toBe(true);
    });

    it('returns false when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      a.lock();

      b = util.utilSessionMutex('name');
      expect(b.lock()).toBe(false);
    });
  });

  describe('#locked', () => {
    it('returns false by default', () => {
      a = util.utilSessionMutex('name');
      expect(a.locked()).toBe(false);
    });

    it('returns true when locked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      expect(a.locked()).toBe(true);
    });

    it('returns false when unlocked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      a.unlock();
      expect(a.locked()).toBe(false);
    });
  });

  describe('#unlock', () => {
    it('unlocks the mutex', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      a.unlock();

      b = util.utilSessionMutex('name');
      expect(b.lock()).toBe(true);
    });

    it('does nothing when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      a.lock();

      b = util.utilSessionMutex('name');
      b.unlock();

      expect(a.locked()).toBe(true);
    });

    it('does nothing when not locked', () => {
      a = util.utilSessionMutex('name');
      a.unlock();
      expect(a.locked()).toBe(false);
    });
  });

  it('namespaces locks', () => {
    a = util.utilSessionMutex('a');
    a.lock();

    b = util.utilSessionMutex('b');
    expect(b.locked()).toBe(false);
    expect(b.lock()).toBe(true);
  });
});
