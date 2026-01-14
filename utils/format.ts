/**
 * Formatting utilities for numbers, currency, and percentages
 */

/**
 * Format a number with fixed decimal places
 * @param v - Value to format
 * @param fixed - Number of decimal places (default: 2)
 * @returns Formatted number string or "-" if value is null/undefined
 */
export function formatNumber(v?: string | number, fixed = 2): string {
  return v !== undefined && v !== null ? Number(v).toFixed(fixed) : "-";
}

/**
 * Format a number with trailing zeros trimmed
 * @param v - Value to format
 * @param fixed - Number of decimal places (default: 2)
 * @returns Formatted number string with trailing zeros removed, or "-" if invalid
 */
export function formatNumberTrim(v?: string | number, fixed = 2): string {
  if (v === undefined || v === null || v === "") return "-";

  const num = Number(v);
  if (Number.isNaN(num)) return "-";

  return num.toFixed(fixed).replace(/\.?0+$/, "");
}

/**
 * Format a value as currency (USD)
 * @param value - Value to format as currency
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: any, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a decimal as a percentage
 * @param value - Decimal value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "15.00%") or "NaN" if invalid
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) {
    return "NaN";
  }

  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate percentage between two numbers
 * @param a - Numerator
 * @param b - Denominator
 * @returns Percentage as string with 1 decimal place, or null if invalid
 */
export function calcPercent(a?: string | number, b?: string | number): string | null {
  return a && b ? ((Number(a) / Number(b)) * 100).toFixed(1) : null;
}
