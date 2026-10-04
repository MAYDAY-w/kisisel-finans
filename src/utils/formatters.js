import { CURRENCIES } from '../types/index.js';

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

  const formattedNumber = new Intl.NumberFormat('tr-TR', {
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
 * Formats a plain number with Turkish decimal separator.
 * @param {number} num
 * @param {number} maxDecimals
 * @returns {string}
 */
export function formatNumber(num, maxDecimals = 2) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: maxDecimals,
  }).format(num);
}

/**
 * Formats a percentage string (e.g. +14.5% or -2.3%).
 * @param {number} percent
 * @returns {string}
 */
export function formatPercent(percent) {
  if (percent === undefined || percent === null || isNaN(percent)) return '%0,0';
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(Math.abs(percent));

  if (percent > 0) {
    return `+%${formatted}`;
  } else if (percent < 0) {
    return `-%${formatted}`;
  }
  return `%${formatted}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into readable Turkish date.
 * @param {string} dateString
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string}
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (format === 'relative') {
    const today = new Date();
    const isToday = today.toISOString().split('T')[0] === dateString.split('T')[0];
    if (isToday) return 'Bugün';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toISOString().split('T')[0] === dateString.split('T')[0]) return 'Dün';
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat('tr-TR', {
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
