import { TRANSACTION_TYPES, DEFAULT_CATEGORIES } from '../types/index.js';

/**
 * Turkish Number word mapping
 */
const TURKISH_NUMBERS = {
  'sıfır': 0, 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4, 'beş': 5,
  'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10,
  'yirmi': 20, 'otuz': 30, 'kırk': 40, 'elli': 50,
  'altmış': 60, 'yetmiş': 70, 'seksen': 80, 'doksan': 90,
  'yüz': 100, 'bin': 1000, 'milyon': 1000000
};

/**
 * Extracts a numeric value from Turkish speech or text.
 * Handles digits (e.g. "350", "1.500", "22500") and phrases like "yirmi bin", "beş yüz".
 * @param {string} text
 * @returns {number|null}
 */
export function extractAmount(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // 1. Look for direct digit patterns: "350 tl", "350,50", "1.500", "1500"
  const digitRegex = /(\d+(?:[\.,]\d+)?)\s*(?:tl|lira|₺|bin)?/i;
  const match = lower.match(digitRegex);
  if (match) {
    let numStr = match[1].replace(/\./g, '').replace(',', '.');
    let val = parseFloat(numStr);
    if (!isNaN(val)) {
      if (lower.includes(`${match[1]} bin`)) {
        val *= 1000;
      }
      return val;
    }
  }

  // 2. Parse written Turkish numbers (e.g. "iki bin beş yüz")
  const words = lower.split(/\s+/);
  let total = 0;
  let currentGroup = 0;
  let hasNumberWord = false;

  for (const w of words) {
    if (TURKISH_NUMBERS[w] !== undefined) {
      hasNumberWord = true;
      const n = TURKISH_NUMBERS[w];
      if (n === 1000) {
        currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 1000;
        total += currentGroup;
        currentGroup = 0;
      } else if (n === 100) {
        currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 100;
      } else {
        currentGroup += n;
      }
    }
  }
  total += currentGroup;

  return hasNumberWord && total > 0 ? total : null;
}

/**
 * Parses Turkish voice commands or free-text descriptions into a structured financial transaction.
 * @param {string} transcript
 * @param {Array} categories
 * @returns {Object} { amount, type, categoryId, description, confidence }
 */
export function parseSpeechTransaction(transcript, categories = DEFAULT_CATEGORIES) {
  if (!transcript) return null;
  const lower = transcript.toLowerCase();

  // 1. Amount
  const amount = extractAmount(transcript);

  // 2. Determine Transaction Type
  let type = TRANSACTION_TYPES.EXPENSE; // Default is expense

  const incomeKeywords = ['maaş', 'gelir', 'yattı', 'kazandım', 'tahsilat', 'prim', 'avans', 'burs', 'alındı', 'geldi', 'ek gelir'];
  const purchaseKeywords = ['aldım', 'alım', 'satın aldım', 'gram altın', 'hisse', 'döviz', 'telefon aldım', 'cihaz'];
  const saleKeywords = ['sattım', 'satış', 'ikinci el sattım'];
  const investmentKeywords = ['yatırım yaptım', 'fona yatırdım', 'kripto aldım', 'borsaya yatırdım', 'hisse aldım'];

  if (incomeKeywords.some((k) => lower.includes(k))) {
    type = TRANSACTION_TYPES.INCOME;
  } else if (saleKeywords.some((k) => lower.includes(k))) {
    type = TRANSACTION_TYPES.SALE;
  } else if (investmentKeywords.some((k) => lower.includes(k))) {
    type = TRANSACTION_TYPES.INVESTMENT;
  } else if (purchaseKeywords.some((k) => lower.includes(k))) {
    type = TRANSACTION_TYPES.PURCHASE;
  }

  // 3. Category matching
  let matchedCategoryId = 'other';
  const categoryKeywords = {
    food: ['market', 'yemek', 'bakkal', 'restoran', 'kafe', 'kahve', 'lokanta', 'ekmek', 'manav', 'kasap', 'süpermarket', 'migros', 'a101', 'bim', 'şok'],
    transport: ['benzin', 'mazot', 'akaryakıt', 'yakıt', 'otobüs', 'metro', 'taksi', 'dolmuş', 'bilet', 'uçak', 'otopark', 'akbil', 'hgs', 'ogs'],
    shopping: ['avm', 'kıyafet', 'ayakkabı', 'giyim', 'trendyol', 'hepsiburada', 'amazon', 'alışveriş', 'pantolon', 'gömlek'],
    bills: ['fatura', 'kira', 'aidat', 'elektrik', 'su', 'doğalgaz', 'internet', 'telefon faturası', 'abonelik', 'netflix', 'spotify'],
    salary: ['maaş', 'ücret', 'aylık', 'prim', 'ikramiye', 'avans'],
    investment: ['fon', 'tefas', 'portföy', 'yatırım', 'eurobond'],
    gold: ['altın', 'gram altın', 'çeyrek', 'yarım', 'kuyumcu', 'bilezik'],
    stocks: ['hisse', 'borsa', 'bist', 'thyao', 'tüpraş', 'eregl', 'senedi'],
    crypto: ['kripto', 'bitcoin', 'btc', 'eth', 'ethereum', 'coin', 'binance'],
    foreign_currency: ['dolar', 'euro', 'döviz', 'sterlin', 'usd', 'eur'],
    electronics: ['bilgisayar', 'telefon', 'laptop', 'tablet', 'kulaklık', 'monitör', 'televizyon'],
    vehicle: ['araba', 'araç', 'bakım', 'muayene', 'sigorta', 'kasko', 'lastik', 'tamir'],
    health: ['eczane', 'ilaç', 'hastane', 'doktor', 'sağlık', 'diş'],
    education: ['kurs', 'kitap', 'okul', 'eğitim', 'harç', 'üniversite'],
    entertainment: ['sinema', 'tiyatro', 'konser', 'oyun', 'tatil', 'otel', 'eğlence'],
  };

  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => lower.includes(k))) {
      matchedCategoryId = catId;
      break;
    }
  }

  // Format a clean description
  let cleanDesc = transcript.trim();
  // Capitalize first letter
  cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);

  return {
    amount: amount || '',
    type,
    categoryId: matchedCategoryId,
    description: cleanDesc,
  };
}

/**
 * Initializes browser Speech Recognition (Web Speech API).
 * @param {Function} onResult - Callback when final speech is recognized
 * @param {Function} onError - Callback on error
 * @param {Function} onEnd - Callback when recognition stops
 * @returns {Object|null} SpeechRecognition instance or null if not supported
 */
export function createSpeechRecognizer(onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'tr-TR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
