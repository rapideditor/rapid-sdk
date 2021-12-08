import { remove as removeDiacritics } from 'diacritics';

/** Calculates Levenshtein distance between two strings
 * @description See: https://en.wikipedia.org/wiki/Levenshtein_distance
 * First converts the strings to lowercase and replaces diacritic marks with ascii equivalents.
 * @param a
 * @param b
 * @returns levenshtein distance
 */
export function utilEditDistance(a, b) {
  a = removeDiacritics(a.toLowerCase());
  b = removeDiacritics(b.toLowerCase());
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }
  return matrix[b.length][a.length];
}

/** Returns hash code of a string
 * @description https://stackoverflow.com/questions/194846/is-there-any-kind-of-hash-code-function-in-javascript
 * https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param str
 * @returns
 */
export function utilHashcode(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/** Transforms object into Query string
 * @param obj
 * @param noencode
 * @returns query string
 */
export function utilQsString(obj, noencode) {
  // encode everything except special characters used in certain hash parameters:
  // "/" in map states, ":", ",", {" and "}" in background
  function softEncode(s) {
    return encodeURIComponent(s).replace(/(%2F|%3A|%2C|%7B|%7D)/g, decodeURIComponent);
  }

  return Object.keys(obj)
    .sort()
    .map((key) => {
      return (
        encodeURIComponent(key) +
        '=' +
        (noencode ? softEncode(obj[key]) : encodeURIComponent(obj[key]))
      );
    })
    .join('&');
}

/** Transforms query string into object
 * @param str
 * @returns object
 */
export function utilStringQs(str) {
  let i = 0; // advance past any leading '?' or '#' characters
  while (i < str.length && (str[i] === '?' || str[i] === '#')) i++;
  str = str.slice(i);

  return str.split('&').reduce((obj, pair) => {
    const parts = pair.split('=');
    if (parts.length === 2) {
      obj[parts[0]] = decodeURIComponent(parts[1]);
    }
    return obj;
  }, {});
}

/** Returns the length of `str` in unicode characters
 * @description `String.length()` since a single unicode character can be composed of multiple JavaScript UTF-16 code units
 * @param str target string
 * @returns length
 */
export function utilUnicodeCharsCount(str) {
  // Native ES2015 implementations of `Array.from` split strings into unicode characters
  return Array.from(str).length;
}

/** Returns a new string representing `str` cut from its start to `limit`
 * @description Note that this runs the risk of splitting graphemes
 * @param str target string
 * @param limit length in unicode characters
 * @returns
 */
export function utilUnicodeCharsTruncated(str, limit) {
  return Array.from(str).slice(0, limit).join('');
}

/** Returns version of `str` with all runs of special characters replaced by `_`
 * @description Suitable for HTML ids, classes, selectors, etc.
 * @param str
 * @returns
 */
export function utilSafeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

/** Returns string based on `val` that is highly unlikely to collide with an id used previously or that's present elsewhere in the document
 * @descirption Useful for preventing browser-provided autofills or when embedding iD on pages with unknown elements
 * @param val
 * @returns
 */
export function utilUniqueString(val) {
  return 'ideditor-' + utilSafeString(val.toString()) + '-' + new Date().getTime().toString();
}

// Returns a comparator function for sorting strings alphabetically in ascending order,
// regardless of case or diacritics.
// If supported, will use the browser's language sensitive string comparison, see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator
export function utilSortString(locale = 'en'): (x: string, y: string) => number {
  if (typeof Intl === 'object' && 'Collator' in Intl) {
    return new Intl.Collator(locale, {
      sensitivity: 'base',
      numeric: true
    }).compare;
  } else {
    return (a, b) => {
      a = removeDiacritics(a.toLowerCase());
      b = removeDiacritics(b.toLowerCase());
      return a < b ? -1 : a > b ? 1 : 0;
    };
  }
}
