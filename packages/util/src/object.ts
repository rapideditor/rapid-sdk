/** Creates a new obj from provided obj which does not contain provided keys
 * @param obj
 * @param omitKeys - keys to omit
 * @returns
 */
export function utilObjectOmit(obj: object, omitKeys: string[]): object {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (omitKeys.includes(k)) continue;
    result[k] = v;  // keep
  }
  return result;
}
