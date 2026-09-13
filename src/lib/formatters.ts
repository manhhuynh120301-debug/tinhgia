/**
 * @file lib/formatters.ts
 * Formatting utilities for Vietnamese currency, numbers, percentages, and timestamps.
 */

/**
 * Format a number as Vietnamese currency (VND) with 'đ' suffix.
 * Example: 50000 -> "50.000đ"
 */
export function formatVND(amount: number, includeSymbol = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return includeSymbol ? '0đ' : '0';
  }
  
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return includeSymbol ? `${formatted}đ` : formatted;
}

/**
 * Format a number with custom decimal places in Vietnamese locale.
 * Example: 12.5 -> "12,5"
 */
export function formatNumberVN(val: number, maxDecimals = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(val);
}

/**
 * Format a percentage with % symbol.
 * Example: 15.25 -> "15,25%"
 */
export function formatPercentVN(percent: number, decimals = 1): string {
  if (isNaN(percent) || percent === null || percent === undefined) return '0%';
  return `${formatNumberVN(percent, decimals)}%`;
}

/**
 * Format hours into a friendly Vietnamese string.
 * Example: 4.5 -> "4h 30m" or "4,5 giờ"
 */
export function formatPrintingTime(hours: number): string {
  if (isNaN(hours) || hours <= 0) return '0 giờ';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  if (h > 0 && m > 0) {
    return `${h}h ${m}p (${formatNumberVN(hours, 2)} giờ)`;
  }
  if (h > 0) {
    return `${h} giờ`;
  }
  return `${m} phút`;
}

/**
 * Format weight in grams with optional kg note.
 * Example: 1250 -> "1.250g (1,25 kg)"
 */
export function formatWeightGrams(grams: number): string {
  if (isNaN(grams) || grams <= 0) return '0g';
  if (grams >= 1000) {
    return `${formatNumberVN(grams, 0)}g (${formatNumberVN(grams / 1000, 2)} kg)`;
  }
  return `${formatNumberVN(grams, 1)}g`;
}

/**
 * Format ISO date string into Vietnamese localized date-time.
 */
export function formatDateVN(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Parse a localized input string or sanitize a numeric input.
 */
export function parseNumberInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  
  // Remove thousand dots or commas, replace comma with dot for decimal
  const sanitized = value
    .replace(/\s+/g, '')
    .replace(/\./g, '') // remove thousands separators
    .replace(/,/g, '.'); // allow comma as decimal point
  
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
