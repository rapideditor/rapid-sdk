/** Creates a new obj from provided obj which does not contain provided keys
 * @param obj
 * @param omitKeys - keys to omit
 * @returns
 */
export function utilObjectOmit<T extends object, Keys extends keyof T>(
  obj: T,
  omitKeys: Keys[],
): Omit<T, Keys> {
  const result = {} as Omit<T, Keys>;
  for (const [k, v] of Object.entries(obj)) {
    if (omitKeys.includes(k as Keys)) continue;
    result[k] = v;  // keep
  }
  return result;
}
