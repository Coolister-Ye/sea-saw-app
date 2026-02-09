/** Round to 2 decimal places */
export const round2 = (num: number) => Math.round(num * 100) / 100;

/** Convert to number, returns null for empty/undefined/null values */
export const toNumber = (val: any): number | null =>
  val !== undefined && val !== null && val !== "" ? Number(val) : null;

/** Convert to number, returns 0 for non-numeric values */
export const toNum = (val: any): number => {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
};
