import { TRANSACTION_TYPES } from '../types/index.js';

export const INITIAL_SETTINGS = {
  currency: 'TRY',
  lastUsedCategoryId: 'food',
  lastUsedType: TRANSACTION_TYPES.EXPENSE,
  theme: 'light',
  hasSeenWelcome: true,
};

// Sıfırlanmış, kullanıma hazır temiz başlangıç verileri
export const SAMPLE_TRANSACTIONS = [];
export const SAMPLE_INVESTMENTS = [];
export const SAMPLE_BUDGETS = [];
export const SAMPLE_DEBTS = [];
export const SAMPLE_RECURRING = [];

// Kullanıma hazır 0 ₺ bakiyeli temel hesaplar
export const SAMPLE_ACCOUNTS = [
  {
    id: 'acc-cash',
    name: 'Nakit Cüzdan',
    type: 'cash',
    balance: 0,
    currency: 'TRY',
    color: '#10b981',
    isDefault: true,
  },
  {
    id: 'acc-bank',
    name: 'Banka Hesabı',
    type: 'bank',
    balance: 0,
    currency: 'TRY',
    color: '#3b82f6',
    isDefault: false,
  },
  {
    id: 'acc-card',
    name: 'Kredi Kartı',
    type: 'credit_card',
    balance: 0,
    limit: 0,
    currency: 'TRY',
    color: '#8b5cf6',
  },
];
