/** @jest-environment jsdom */
import * as util from '../src/index';

describe('utilSessionMutex', () => {
  let a, b;

  // Hack: Rename methods so esbuild-jest doesn't mistransform them...
  function esbuildJestHack(obj) {
    obj.lok = obj.lock;
    obj.unlok = obj.unlock;
  }

  afterEach(() => {
    if (a) a.unlok();
    if (b) b.unlok();
  });

  describe('#lock', () => {
    it('returns true when it gets a lock', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      expect(a.lok()).toBeTrue();
    });

    it('returns true when already locked', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();
      expect(a.lok()).toBeTrue();
    });

    it('returns false when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();

      b = util.utilSessionMutex('name');
      esbuildJestHack(b);
      expect(b.lok()).toBeFalse();
    });
  });

  describe('#locked', () => {
    it('returns false by default', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      expect(a.locked()).toBeFalse();
    });

    it('returns true when locked', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();
      expect(a.locked()).toBeTrue();
    });

    it('returns false when unlocked', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();
      a.unlok();
      expect(a.locked()).toBeFalse();
    });
  });

  describe('#unlock', () => {
    it('unlocks the mutex', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();
      a.unlok();

      b = util.utilSessionMutex('name');
      esbuildJestHack(b);
      expect(b.lok()).toBeTrue();
    });

    it('does nothing when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.lok();

      b = util.utilSessionMutex('name');
      esbuildJestHack(b);
      b.unlok();

      expect(a.locked()).toBeTrue();
    });

    it('does nothing when not locked', () => {
      a = util.utilSessionMutex('name');
      esbuildJestHack(a);
      a.unlok();
      expect(a.locked()).toBeFalse();
    });
  });

  it('namespaces locks', () => {
    a = util.utilSessionMutex('a');
    esbuildJestHack(a);
    a.lok();

    b = util.utilSessionMutex('b');
    esbuildJestHack(b);
    expect(b.locked()).toBeFalse();
    expect(b.lok()).toBeTrue();
  });
});
