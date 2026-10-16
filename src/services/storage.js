import { DEFAULT_CATEGORIES } from '../types/index.js';
import {
  INITIAL_SETTINGS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_INVESTMENTS,
  SAMPLE_ACCOUNTS,
  SAMPLE_BUDGETS,
  SAMPLE_DEBTS,
  SAMPLE_RECURRING,
} from './sampleData.js';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finans_transactions_v2',
  INVESTMENTS: 'finans_investments_v2',
  CATEGORIES: 'finans_categories_v2',
  SETTINGS: 'finans_settings_v2',
  ACCOUNTS: 'finans_accounts_v2',
  BUDGETS: 'finans_budgets_v2',
  DEBTS: 'finans_debts_v2',
  RECURRING: 'finans_recurring_v2',
};

// Cleanup old v1 keys if present
try {
  const oldKeys = [
    'finans_transactions_v1',
    'finans_investments_v1',
    'finans_categories_v1',
    'finans_settings_v1',
    'finans_accounts_v1',
    'finans_budgets_v1',
    'finans_debts_v1',
    'finans_recurring_v1',
  ];
  oldKeys.forEach((k) => localStorage.removeItem(k));
} catch (e) {}

/**
 * Storage Service - handles persistent storage in localStorage
 */
export const StorageService = {
  // Load Transactions
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        this.saveTransactions(SAMPLE_TRANSACTIONS);
        return SAMPLE_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load transactions:', e);
      return [];
    }
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  // Load Investments
  getInvestments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
      if (!data) {
        this.saveInvestments(SAMPLE_INVESTMENTS);
        return SAMPLE_INVESTMENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load investments:', e);
      return [];
    }
  },

  saveInvestments(investments) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
    } catch (e) {
      console.error('Failed to save investments:', e);
    }
  },

  // Load Categories
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      const loaded = JSON.parse(data);
      if (Array.isArray(loaded)) {
        const existingIds = new Set(loaded.map((c) => c.id));
        const missingDefaults = DEFAULT_CATEGORIES.filter((dc) => !existingIds.has(dc.id));
        let hasUpdates = false;
        const updatedList = loaded.map((c) => {
          if (c.id === 'interest' && c.name !== 'Faiz Kazancı') {
            hasUpdates = true;
            return { ...c, name: 'Faiz Kazancı' };
          }
          return c;
        });

        if (missingDefaults.length > 0 || hasUpdates) {
          const merged = [...updatedList, ...missingDefaults];
          this.saveCategories(merged);
          return merged;
        }
        return updatedList;
      }
      return DEFAULT_CATEGORIES;
    } catch (e) {
      console.error('Failed to load categories:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  },

  // Load Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(INITIAL_SETTINGS);
        return INITIAL_SETTINGS;
      }
      return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings:', e);
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Load Accounts
  getAccounts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        this.saveAccounts(SAMPLE_ACCOUNTS);
        return SAMPLE_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load accounts:', e);
      return SAMPLE_ACCOUNTS;
    }
  },

  saveAccounts(accounts) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  },

  // Load Budgets
  getBudgets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        this.saveBudgets(SAMPLE_BUDGETS);
        return SAMPLE_BUDGETS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load budgets:', e);
      return SAMPLE_BUDGETS;
    }
  },

  saveBudgets(budgets) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  },

  // Load Debts
  getDebts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
      if (!data) {
        this.saveDebts(SAMPLE_DEBTS);
        return SAMPLE_DEBTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load debts:', e);
      return SAMPLE_DEBTS;
    }
  },

  saveDebts(debts) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    } catch (e) {
      console.error('Failed to save debts:', e);
    }
  },

  // Load Recurring Transactions
  getRecurring() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (!data) {
        this.saveRecurring(SAMPLE_RECURRING);
        return SAMPLE_RECURRING;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load recurring:', e);
      return SAMPLE_RECURRING;
    }
  },

  saveRecurring(recurring) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
    } catch (e) {
      console.error('Failed to save recurring:', e);
    }
  },

  // Full Export as JSON
  exportDataJSON() {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions: this.getTransactions(),
      investments: this.getInvestments(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      accounts: this.getAccounts(),
      budgets: this.getBudgets(),
      debts: this.getDebts(),
      recurring: this.getRecurring(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `kisisel-muhasebe-yedek-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Export Transactions as CSV
  exportTransactionsCSV() {
    const transactions = this.getTransactions();
    const headers = ['ID', 'Tarih', 'İşlem Türü', 'Kategori', 'Açıklama', 'Tutar (TL)', 'Hesap', 'Kalem/Varlık', 'Miktar', 'Birim Fiyat', 'Not'];

    const typeMap = {
      income: 'Gelir',
      expense: 'Gider',
      purchase: 'Alış',
      sale: 'Satış',
      investment: 'Yatırım',
      transfer: 'Transfer',
      other: 'Diğer'
    };

    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      typeMap[tx.type] || tx.type,
      tx.categoryName || tx.categoryId || '',
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.accountName || '').replace(/"/g, '""')}"`,
      `"${(tx.itemName || '').replace(/"/g, '""')}"`,
      tx.quantity || '',
      tx.unitPrice || '',
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);

    // Add BOM for Excel UTF-8 support
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `kisisel-muhasebe-islemler-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Import JSON Backup with validation
  importDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Geçersiz dosya biçimi.');
      }

      if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
      if (Array.isArray(data.investments)) this.saveInvestments(data.investments);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (Array.isArray(data.accounts)) this.saveAccounts(data.accounts);
      if (Array.isArray(data.budgets)) this.saveBudgets(data.budgets);
      if (Array.isArray(data.debts)) this.saveDebts(data.debts);
      if (Array.isArray(data.recurring)) this.saveRecurring(data.recurring);
      if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);

      return { success: true, count: data.transactions?.length || 0 };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  },

  // Reset all data
  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVESTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
  },

  // Load fresh sample demo data
  loadSampleData() {
    this.saveTransactions(SAMPLE_TRANSACTIONS);
    this.saveInvestments(SAMPLE_INVESTMENTS);
    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveSettings(INITIAL_SETTINGS);
    this.saveAccounts(SAMPLE_ACCOUNTS);
    this.saveBudgets(SAMPLE_BUDGETS);
    this.saveDebts(SAMPLE_DEBTS);
    this.saveRecurring(SAMPLE_RECURRING);
  }
};
