import { CURRENCIES } from '../types/index.js';

function getActiveLocale() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('finans_language') === 'en') {
    return 'en-US';
  }
  return 'tr-TR';
}

/**
 * Formats a numeric amount with the active currency symbol and locale.
 * @param {number} amount
 * @param {string} currencyCode - 'TRY', 'USD', 'EUR', 'GBP'
 * @param {boolean} showSign - whether to prepend + for positive numbers
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = 'TRY', showSign = false) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES.TRY;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const locale = getActiveLocale();

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  let result = '';
  if (currency.position === 'before') {
    result = `${currency.symbol}${formattedNumber}`;
  } else {
    result = `${formattedNumber} ${currency.symbol}`;
  }

  if (isNegative) {
    return `-${result}`;
  } else if (showSign && amount > 0) {
    return `+${result}`;
  }
  return result;
}

/**
 * Formats a plain number with active decimal separator.
 * @param {number} num
 * @param {number} maxDecimals
 * @returns {string}
 */
export function formatNumber(num, maxDecimals = 2) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  const locale = getActiveLocale();
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxDecimals,
  }).format(num);
}

/**
 * Formats a percentage string (e.g. +14.5% or -2.3%).
 * @param {number} percent
 * @returns {string}
 */
export function formatPercent(percent) {
  if (percent === undefined || percent === null || isNaN(percent)) return '%0.0';
  const locale = getActiveLocale();
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(Math.abs(percent));

  const isEn = locale === 'en-US';

  if (percent > 0) {
    return isEn ? `+${formatted}%` : `+%${formatted}`;
  } else if (percent < 0) {
    return isEn ? `-${formatted}%` : `-%${formatted}`;
  }
  return isEn ? `${formatted}%` : `%${formatted}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into readable date.
 * @param {string} dateString
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string}
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const locale = getActiveLocale();
  const isEn = locale === 'en-US';

  if (format === 'relative') {
    const today = new Date();
    const isToday = today.toISOString().split('T')[0] === dateString.split('T')[0];
    if (isToday) return isEn ? 'Today' : 'Bugün';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toISOString().split('T')[0] === dateString.split('T')[0]) return isEn ? 'Yesterday' : 'Dün';
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns today's date in YYYY-MM-DD format.
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds months to a date string (YYYY-MM-DD) and returns the new date string (YYYY-MM-DD).
 * @param {string} dateString
 * @param {number} monthsToAdd
 * @returns {string}
 */
export function addMonthsToDate(dateString, monthsToAdd = 0) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month + monthsToAdd, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

