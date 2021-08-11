// A per-domain session mutex backed by a cookie and dead man's
// switch. If the session crashes, the mutex will auto-release
// after 5 seconds.

// This accepts a string and returns an object that complies with utilSessionMutexType
export function utilSessionMutex(name) {
  // let _mutex = {};
  let _intervalID;

  function renew() {
    let expires = new Date();
    expires.setSeconds(expires.getSeconds() + 5);
    document.cookie = name + '=1; expires=' + expires.toUTCString() + '; sameSite=strict';
  }

  let _mutex = {
    lock: () => {
      if (_intervalID) return true;
      let cookie = document.cookie.replace(
        new RegExp('(?:(?:^|.*;)\\s*' + name + '\\s*\\=\\s*([^;]*).*$)|^.*$'),
        '$1'
      );
      if (cookie) return false;
      renew();
      _intervalID = window.setInterval(renew, 4000);
      return true;
    },
    unlock: () => {
      if (!_intervalID) return;
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict';
      clearInterval(_intervalID);
      _intervalID = null;
    },
    locked: () => {
      return !!_intervalID;
    }
  };

  return _mutex;
}
