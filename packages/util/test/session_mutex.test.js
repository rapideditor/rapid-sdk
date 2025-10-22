import { afterEach, describe, it } from 'bun:test';
import { strict as assert } from 'bun:assert';
import * as util from '../src/util.ts';


describe('utilSessionMutex', () => {
  let a, b;

  afterEach(() => {
    if (a) a.unlock();
    if (b) b.unlock();
  });

  describe('#lock', () => {
    it('returns true when it gets a lock', () => {
      a = util.utilSessionMutex('name');
      assert.equal(a.lock(), true);
    });

    it('returns true when already locked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      assert.equal(a.lock(), true);
    });

    it('returns false when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      a.lock();

      b = util.utilSessionMutex('name');
      assert.equal(b.lock(), false);
    });
  });

  describe('#locked', () => {
    it('returns false by default', () => {
      a = util.utilSessionMutex('name');
      assert.equal(a.locked(), false);
    });

    it('returns true when locked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      assert.equal(a.locked(), true);
    });

    it('returns false when unlocked', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      a.unlock();
      assert.equal(a.locked(), false);
    });
  });

  describe('#unlock', () => {
    it('unlocks the mutex', () => {
      a = util.utilSessionMutex('name');
      a.lock();
      a.unlock();

      b = util.utilSessionMutex('name');
      assert.equal(b.lock(), true);
    });

    it('does nothing when the lock is held by another session', () => {
      a = util.utilSessionMutex('name');
      a.lock();

      b = util.utilSessionMutex('name');
      b.unlock();

      assert.equal(a.locked(), true);
    });

    it('does nothing when not locked', () => {
      a = util.utilSessionMutex('name');
      a.unlock();
      assert.equal(a.locked(), false);
    });
  });

  it('namespaces locks', () => {
    a = util.utilSessionMutex('a');
    a.lock();

    b = util.utilSessionMutex('b');
    assert.equal(b.locked(), false);
    assert.equal(b.lock(), true);
  });
});
