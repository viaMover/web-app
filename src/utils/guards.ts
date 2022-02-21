export function isBoolean(val: any): val is boolean {
  return 'boolean' === typeof val;
}
