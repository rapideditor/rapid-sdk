import { afterEach, describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as test from '../built/util.mjs';


function MockDocument() {
  this._cookies = new Map();
  this.__defineGetter__('cookie', () => {
    const items = [];
    for (const [k, v] of this._cookies) {
      items.push(v !== undefined ? `${k}=${v}` : k);
    }
    return items.join(';');
  });

  this.__defineSetter__('cookie', (s) => {
    const items = s.split(';');
    for (const item of items) {
      const [k, v] = item.split('=');
      this._cookies.set(k.trim(), (v !== undefined ? v.trim() : undefined));
    }
    return s;
  });
}

if (!global.document) {  // mock document.cookie for Node
  global.document = new MockDocument();
}
if (!global.window) {
  global.window = globalThis;
}


describe('utilSessionMutex', () => {
  let a, b;

  afterEach(() => {
    if (a) a.unlock();
    if (b) b.unlock();
  });

  describe('#lock', () => {
    it('returns true when it gets a lock', () => {
      a = test.utilSessionMutex('name');
      assert.equal(a.lock(), true);
    });

    it('returns true when already locked', () => {
      a = test.utilSessionMutex('name');
      a.lock();
      assert.equal(a.lock(), true);
    });

    it('returns false when the lock is held by another session', () => {
      a = test.utilSessionMutex('name');
      a.lock();

      b = test.utilSessionMutex('name');
      assert.equal(b.lock(), false);
    });
  });

  describe('#locked', () => {
    it('returns false by default', () => {
      a = test.utilSessionMutex('name');
      assert.equal(a.locked(), false);
    });

    it('returns true when locked', () => {
      a = test.utilSessionMutex('name');
      a.lock();
      assert.equal(a.locked(), true);
    });

    it('returns false when unlocked', () => {
      a = test.utilSessionMutex('name');
      a.lock();
      a.unlock();
      assert.equal(a.locked(), false);
    });
  });

  describe('#unlock', () => {
    it('unlocks the mutex', () => {
      a = test.utilSessionMutex('name');
      a.lock();
      a.unlock();

      b = test.utilSessionMutex('name');
      assert.equal(b.lock(), true);
    });

    it('does nothing when the lock is held by another session', () => {
      a = test.utilSessionMutex('name');
      a.lock();

      b = test.utilSessionMutex('name');
      b.unlock();

      assert.equal(a.locked(), true);
    });

    it('does nothing when not locked', () => {
      a = test.utilSessionMutex('name');
      a.unlock();
      assert.equal(a.locked(), false);
    });
  });

  it('namespaces locks', () => {
    a = test.utilSessionMutex('a');
    a.lock();

    b = test.utilSessionMutex('b');
    assert.equal(b.locked(), false);
    assert.equal(b.lock(), true);
  });
});
