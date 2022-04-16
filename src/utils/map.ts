export const mapToObj = <K, V>(m: Map<K, V>): Record<string, unknown> => {
  return Array.from(m).reduce((obj: Record<string, unknown>, [key, value]) => {
    obj[String(key)] = value;
    return obj;
  }, {});
};

export const ObjToMap = <K>(
  r: Record<string, string>,
  keys: Array<K>
): Map<K, string> => {
  const m = new Map<K, string>();
  Object.entries(r).forEach(([key, value]) => {
    const validKey = keys.find((k) => String(k) === key);
    if (validKey !== undefined) {
      m.set(validKey, value);
    }
  });
  return m;
};
