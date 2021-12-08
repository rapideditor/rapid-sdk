/** Creates a new obj from provided obj which does not contain provided keys
 * @param obj
 * @param omitKeys - keys to omit
 * @returns
 */
export function utilObjectOmit(obj, omitKeys) {
  return Object.keys(obj).reduce((result, key) => {
    if (omitKeys.indexOf(key) === -1) {
      result[key] = obj[key]; // keep
    }
    return result;
  }, {});
}
