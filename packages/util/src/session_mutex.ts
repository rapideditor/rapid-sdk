/** A per-domain session mutex backed by a cookie and dead man's switch
 * @remarks If the session crashes, the mutex will auto-release after 5 seconds.
 * @param name string name
 * @returns object that complies with utilSessionMutexType
 */
export function utilSessionMutex(name: string) {

  if (!globalThis.document) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).document = new MockDocument();
  }

  let _intervalID;

  function renew() {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 5);
    globalThis.document.cookie = name + '=1; expires=' + expires.toUTCString() + '; sameSite=strict';
  }

  const _mutex = {
    lock: () => {
      if (_intervalID) return true;
      const cookie = globalThis.document.cookie.replace(
        new RegExp('(?:(?:^|.*;)\\s*' + name + '\\s*\\=\\s*([^;]*).*$)|^.*$'),
        '$1'
      );
      if (cookie) return false;
      renew();
      _intervalID = globalThis.setInterval(renew, 4000);
      return true;
    },
    unlock: () => {
      if (!_intervalID) return;
      globalThis.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict';
      globalThis.clearInterval(_intervalID);
      _intervalID = null;
    },
    locked: () => {
      return !!_intervalID;
    }
  };

  return _mutex;
}


// Mock document for environments like Node
/* c8 ignore start */
class MockDocument {
  private _cookies = new Map<string, string | undefined>();

  get cookie(): string {
    const items: string[] = [];
    for (const [k, v] of this._cookies) {
      items.push(v !== undefined ? `${k}=${v}` : k);
    }
    return items.join(';');
  }
  set cookie(s: string) {
    const items = s.split(';');
    for (const item of items) {
      const [k, v] = item.split('=');
      this._cookies.set(k.trim(), (v !== undefined ? v.trim() : undefined));
    }
  }
}
/* c8 ignore stop */
