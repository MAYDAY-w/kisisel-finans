import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StorageService } from '../services/storage.js';
import { SAMPLE_ACCOUNTS } from '../services/sampleData.js';
import { DEFAULT_CATEGORIES, TRANSACTION_TYPES } from '../types/index.js';
import { calculateFinancialSummary } from '../utils/calculations.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useAuth } from './AuthContext.jsx';
import { SyncService } from '../services/syncService.js';
import { useLanguage } from './LanguageContext.jsx';
import { useTheme } from './ThemeContext.jsx';
import { calculateDailyInterestAccrual, getDaysDiff } from '../utils/interestCalculations.js';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const {
    themeMode,
    setThemeMode,
    colorTheme,
    setColorTheme,
    isDarkMode,
    toggleDarkMode,
    currentThemeObj,
    COLOR_THEMES,
  } = useTheme();

  const {
    language,
    setLanguage,
    t,
    getCategoryName: _getCategoryNameFromLanguage,
    getAccountTypeName,
    getTransactionTypeName,
    getAssetTypeName,
    isEn,
    isTr,
  } = useLanguage();

  // Main data states
  const [transactions, setTransactions] = useState(() => StorageService.getTransactions());
  const [investments, setInvestments] = useState(() => StorageService.getInvestments());
  const [categories, setCategories] = useState(() => StorageService.getCategories());
  const [settings, setSettings] = useState(() => StorageService.getSettings());
  const [accounts, setAccounts] = useState(() => StorageService.getAccounts());
  const [budgets, setBudgets] = useState(() => StorageService.getBudgets());
  // Overall budget configuration (totalBudget + tier limits)
  const [overallBudget, setOverallBudget] = useState(() => {
    try {
      const data = localStorage.getItem('finans_overall_budget_v1');
      return data ? JSON.parse(data) : { totalBudget: 0, upperLimit: 0, averageLimit: 0, lowerLimit: 0 };
    } catch { return { totalBudget: 0, upperLimit: 0, averageLimit: 0, lowerLimit: 0 }; }
  });
  const [debts, setDebts] = useState(() => StorageService.getDebts());
  const [recurring, setRecurring] = useState(() => StorageService.getRecurring());

  // Category name translation & lookup (supports i18n keys and user-created custom categories)
  const getCategoryName = useCallback(
    (catId, fallbackName) => {
      if (!catId) return fallbackName || '';
      // 1. Check if translated via i18n
      const key = `categories.${catId}`;
      const translated = t(key);
      if (translated && translated !== key) {
        return translated;
      }
      // 2. If fallbackName was passed and is not the raw ID string
      if (fallbackName && fallbackName !== catId) {
        return fallbackName;
      }
      // 3. Look up in state categories list
      const found = categories.find((c) => c.id === catId);
      if (found && found.name && found.name !== catId) {
        return found.name;
      }
      // 4. Return fallbackName or catId
      return fallbackName || catId;
    },
    [t, categories]
  );

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'daily' | 'accounts' | 'transactions' | 'investments' | 'budget' | 'debts' | 'settings'
  const [initialTransactionFilter, setInitialTransactionFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [priceUpdateTarget, setPriceUpdateTarget] = useState(null);
  const [balanceTargetInvestment, setBalanceTargetInvestment] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState(null);

  // New Feature Modals
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Auto-processing banner notification state
  const [autoProcessBanner, setAutoProcessBanner] = useState(null);
  const hasRunAutoCheck = useRef(false);
  const hasRunInterestCheck = useRef(false);

  // Persist to local storage
  useEffect(() => { StorageService.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { StorageService.saveInvestments(investments); }, [investments]);
  useEffect(() => { StorageService.saveCategories(categories); }, [categories]);
  useEffect(() => { StorageService.saveSettings(settings); }, [settings]);
  useEffect(() => { StorageService.saveAccounts(accounts); }, [accounts]);
  useEffect(() => { StorageService.saveBudgets(budgets); }, [budgets]);
  useEffect(() => { try { localStorage.setItem('finans_overall_budget_v1', JSON.stringify(overallBudget)); } catch {} }, [overallBudget]);
  useEffect(() => { StorageService.saveDebts(debts); }, [debts]);
  useEffect(() => { StorageService.saveRecurring(recurring); }, [recurring]);

  // Cloud Sync
  const { user } = useAuth();
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to cloud changes
    const unsubscribe = SyncService.subscribeToUserData(user.uid, (data) => {
      if (data) {
        // Mark the next render as coming from remote to prevent echo save
        isRemoteUpdate.current = true;
        
        if (data.transactions) setTransactions(data.transactions);
        if (data.investments) setInvestments(data.investments);
        if (data.categories) setCategories(data.categories);
        if (data.settings) setSettings(data.settings);
        if (data.accounts) setAccounts(data.accounts);
        if (data.budgets) setBudgets(data.budgets);
        if (data.debts) setDebts(data.debts);
        if (data.recurring) setRecurring(data.recurring);
      } else {
        // First login: upload local data to cloud
        SyncService.saveUserData(user.uid, {
          transactions, investments, categories, settings, accounts, budgets, debts, recurring
        });
      }
    });
    
    return () => unsubscribe();
  }, [user]); // Only re-run when user changes

  // Upload to cloud on changes (debounced)
  useEffect(() => {
    if (user) {
      if (isRemoteUpdate.current) {
        // Skip saving this time because the state change came from the cloud
        isRemoteUpdate.current = false;
        return;
      }

      const timeoutId = setTimeout(() => {
        SyncService.saveUserData(user.uid, {
          transactions, investments, categories, settings, accounts, budgets, debts, recurring
        });
      }, 1500); // 1.5s debounce to batch writes
      
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, investments, categories, settings, accounts, budgets, debts, recurring, user]);


  // Financial summary
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions, investments, accounts);
  }, [transactions, investments, accounts]);

  // Account total balance
  const totalAccountBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  }, [accounts]);

  // Budgets with spent amount for current month
  const budgetsWithSpent = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Sum expenses per category for this month
    const spentMap = {};
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (
        !isNaN(txDate.getTime()) &&
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth &&
        (tx.type === TRANSACTION_TYPES.EXPENSE || tx.type === TRANSACTION_TYPES.PURCHASE)
      ) {
        const catId = tx.categoryId || 'other';
        spentMap[catId] = (spentMap[catId] || 0) + (Number(tx.amount) || 0);
      }
    });

    return budgets.map((b) => {
      const spent = spentMap[b.categoryId] || 0;
      const limit = Number(b.limit) || 1;
      const percent = Math.min(200, (spent / limit) * 100);
      const remaining = Math.max(0, limit - spent);
      return {
        ...b,
        spent,
        percent,
        remaining,
        isExceeded: spent > limit,
      };
    });
  }, [budgets, transactions]);

  // Currency helper
  const formatMoney = useCallback(
    (amount, showSign = false) => {
      return formatCurrency(amount, settings.currency || 'TRY', showSign);
    },
    [settings.currency]
  );

  // Helper to determine net balance effect of a transaction
  const getTransactionBalanceDelta = (type, amount) => {
    const amt = Number(amount) || 0;
    if (type === TRANSACTION_TYPES.INCOME || type === TRANSACTION_TYPES.SALE) {
      return amt;
    }
    if (
      type === TRANSACTION_TYPES.EXPENSE ||
      type === TRANSACTION_TYPES.PURCHASE ||
      type === TRANSACTION_TYPES.INVESTMENT
    ) {
      return -amt;
    }
    return 0;
  };

  // --- Transaction Actions with Account Balance Sync ---
  const addTransaction = useCallback((txData) => {
    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...txData,
      amount: Number(txData.amount) || 0,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance if accountId is linked
    if (newTx.accountId) {
      const delta = getTransactionBalanceDelta(newTx.type, newTx.amount);
      if (delta !== 0) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => {
            if (acc.id !== newTx.accountId) return acc;
            return { ...acc, balance: acc.balance + delta };
          })
        );
      }
    }

    setSettings((prev) => ({
      ...prev,
      lastUsedCategoryId: txData.categoryId || prev.lastUsedCategoryId,
      lastUsedType: txData.type || prev.lastUsedType,
      lastUsedAccountId: txData.accountId || prev.lastUsedAccountId,
    }));

    return newTx;
  }, []);

  const updateTransaction = useCallback((id, updatedData) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    const newTx = {
      ...oldTx,
      ...updatedData,
      amount: Number(updatedData.amount !== undefined ? updatedData.amount : oldTx.amount) || 0,
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? newTx : t))
    );

    // Calculate balance adjustments on accounts
    const deltas = {};

    // Handle transfer transactions if applicable
    if (oldTx.type === TRANSACTION_TYPES.TRANSFER || newTx.type === TRANSACTION_TYPES.TRANSFER) {
      if (oldTx.type === TRANSACTION_TYPES.TRANSFER) {
        const oldAmt = Number(oldTx.amount) || 0;
        if (oldTx.accountId) deltas[oldTx.accountId] = (deltas[oldTx.accountId] || 0) + oldAmt;
        if (oldTx.toAccountId) deltas[oldTx.toAccountId] = (deltas[oldTx.toAccountId] || 0) - oldAmt;
      }
      if (newTx.type === TRANSACTION_TYPES.TRANSFER) {
        const newAmt = Number(newTx.amount) || 0;
        if (newTx.accountId) deltas[newTx.accountId] = (deltas[newTx.accountId] || 0) - newAmt;
        if (newTx.toAccountId) deltas[newTx.toAccountId] = (deltas[newTx.toAccountId] || 0) + newAmt;
      }
    } else {
      // Standard transactions (income, expense, purchase, sale, investment)
      const oldDelta = getTransactionBalanceDelta(oldTx.type, oldTx.amount);
      const newDelta = getTransactionBalanceDelta(newTx.type, newTx.amount);
      const oldAccId = oldTx.accountId;
      const newAccId = newTx.accountId;

      if (oldAccId && oldAccId === newAccId) {
        // Same account: apply difference between new and old effect
        const diff = newDelta - oldDelta;
        if (diff !== 0) {
          deltas[oldAccId] = (deltas[oldAccId] || 0) + diff;
        }
      } else {
        // Account changed or added/removed
        if (oldAccId && oldDelta !== 0) {
          // Revert old transaction effect on old account
          deltas[oldAccId] = (deltas[oldAccId] || 0) - oldDelta;
        }
        if (newAccId && newDelta !== 0) {
          // Apply new transaction effect on new account
          deltas[newAccId] = (deltas[newAccId] || 0) + newDelta;
        }
      }
    }

    if (Object.keys(deltas).length > 0) {
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (deltas[acc.id] !== undefined) {
            return {
              ...acc,
              balance: acc.balance + deltas[acc.id],
            };
          }
          return acc;
        })
      );
    }
  }, [transactions]);

  const deleteTransaction = useCallback((id) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (!tx) return;

    if (tx.type === TRANSACTION_TYPES.TRANSFER) {
      const amt = Number(tx.amount) || 0;
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (acc.id === tx.accountId) return { ...acc, balance: acc.balance + amt };
          if (acc.id === tx.toAccountId) return { ...acc, balance: acc.balance - amt };
          return acc;
        })
      );
    } else if (tx.accountId) {
      const delta = getTransactionBalanceDelta(tx.type, tx.amount);
      if (delta !== 0) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => {
            if (acc.id === tx.accountId) {
              return { ...acc, balance: acc.balance - delta };
            }
            return acc;
          })
        );
      }
    }
  }, [transactions]);

  const duplicateTransaction = useCallback((id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const { id: _id, createdAt: _created, ...rest } = tx;
    addTransaction({
      ...rest,
      date: new Date().toISOString().slice(0, 10),
      description: `${tx.description} (Kopya)`,
    });
  }, [transactions, addTransaction]);

  // --- Account Actions ---
  const addAccount = useCallback((accData) => {
    const newAcc = {
      id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ...accData,
      balance: Number(accData.balance) || 0,
    };
    setAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  }, []);

  const updateAccount = useCallback((id, updatedData) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData, balance: Number(updatedData.balance) || 0 } : a))
    );
  }, []);

  const deleteAccount = useCallback((id) => {
    setAccounts((prev) =>
      prev
        .filter((a) => a.id !== id)
        .map((a) => (a.parentAccountId === id ? { ...a, parentAccountId: null, limitType: undefined } : a))
    );
  }, []);

  // Compute detailed metrics for credit cards (Main cards, linked cards, limits, debts)
  const getCreditCardDetails = useCallback((account) => {
    if (!account || account.type !== 'credit_card') {
      return null;
    }

    const isSubCard = Boolean(account.parentAccountId);
    const parentCard = isSubCard ? accounts.find((a) => a.id === account.parentAccountId) : null;

    // Sub-cards linked to this card (if it's a main card)
    const subCards = accounts.filter(
      (a) => a.type === 'credit_card' && a.parentAccountId === account.id
    );
    const isMainCard = !isSubCard && subCards.length > 0;

    const balanceNum = Number(account.balance) || 0;
    const ownDebt = balanceNum < 0 ? Math.abs(balanceNum) : 0;
    const ownExcess = balanceNum > 0 ? balanceNum : 0;

    if (isSubCard && parentCard) {
      // Parent's own numbers
      const parentBal = Number(parentCard.balance) || 0;
      const parentOwnDebt = parentBal < 0 ? Math.abs(parentBal) : 0;
      const parentOwnExcess = parentBal > 0 ? parentBal : 0;
      const parentLimit = Number(parentCard.limit) || 0;

      // Siblings & this sub card
      const allFamilySubCards = accounts.filter(
        (a) => a.type === 'credit_card' && a.parentAccountId === parentCard.id
      );
      const familySubCardsDebt = allFamilySubCards.reduce((sum, s) => {
        const b = Number(s.balance) || 0;
        return sum + (b < 0 ? Math.abs(b) : 0);
      }, 0);
      const familySubCardsExcess = allFamilySubCards.reduce((sum, s) => {
        const b = Number(s.balance) || 0;
        return sum + (b > 0 ? b : 0);
      }, 0);

      const totalGroupDebt = parentOwnDebt + familySubCardsDebt;
      const totalGroupExcess = parentOwnExcess + familySubCardsExcess;

      const parentRemainingPool = parentLimit > 0
        ? Math.max(0, parentLimit - totalGroupDebt + totalGroupExcess)
        : totalGroupExcess;

      const isCustomLimit = account.limitType === 'custom' && Number(account.limit) > 0;
      const subLimitCap = isCustomLimit ? Number(account.limit) : null;

      let availableLimit = parentRemainingPool;
      if (subLimitCap !== null) {
        const subCardRemainingSubLimit = Math.max(0, subLimitCap - ownDebt + ownExcess);
        availableLimit = Math.min(subCardRemainingSubLimit, parentRemainingPool);
      }

      const limitUsedPercent = subLimitCap !== null && subLimitCap > 0
        ? Math.min(100, Math.round((ownDebt / subLimitCap) * 100))
        : (parentLimit > 0 ? Math.min(100, Math.round((ownDebt / parentLimit) * 100)) : 0);

      return {
        isCreditCard: true,
        isSubCard: true,
        isMainCard: false,
        parentCard,
        subCards: [],
        subCardsCount: 0,
        ownDebt,
        ownExcess,
        groupDebt: totalGroupDebt,
        groupExcess: totalGroupExcess,
        totalLimit: subLimitCap || parentLimit,
        isCustomLimit,
        subLimitCap,
        availableLimit,
        parentLimit,
        parentRemainingPool,
        limitUsedPercent,
      };
    }

    // Main Card or Standalone Card
    const subCardsDebt = subCards.reduce((sum, s) => {
      const b = Number(s.balance) || 0;
      return sum + (b < 0 ? Math.abs(b) : 0);
    }, 0);
    const subCardsExcess = subCards.reduce((sum, s) => {
      const b = Number(s.balance) || 0;
      return sum + (b > 0 ? b : 0);
    }, 0);

    const groupDebt = ownDebt + subCardsDebt;
    const groupExcess = ownExcess + subCardsExcess;
    const cardLimit = Number(account.limit) || 0;

    const availableLimit = cardLimit > 0
      ? Math.max(0, cardLimit - groupDebt + groupExcess)
      : groupExcess;

    const limitUsedPercent = cardLimit > 0
      ? Math.min(100, Math.round((groupDebt / cardLimit) * 100))
      : 0;

    return {
      isCreditCard: true,
      isSubCard: false,
      isMainCard,
      parentCard: null,
      subCards,
      subCardsCount: subCards.length,
      ownDebt,
      ownExcess,
      subCardsDebt,
      groupDebt,
      groupExcess,
      totalLimit: cardLimit,
      availableLimit,
      limitUsedPercent,
    };
  }, [accounts]);

  // Consolidate all sub-card debts onto the main card statement
  const consolidateSubCardDebts = useCallback((mainCardId) => {
    const mainCard = accounts.find((a) => a.id === mainCardId);
    if (!mainCard || mainCard.type !== 'credit_card') return { success: false, amount: 0 };

    const subCards = accounts.filter(
      (a) => a.type === 'credit_card' && a.parentAccountId === mainCardId
    );

    let totalSubDebtToMove = 0;
    subCards.forEach((s) => {
      const b = Number(s.balance) || 0;
      if (b < 0) {
        totalSubDebtToMove += Math.abs(b);
      }
    });

    if (totalSubDebtToMove <= 0) {
      return { success: false, amount: 0 };
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === mainCardId) {
          return { ...acc, balance: (Number(acc.balance) || 0) - totalSubDebtToMove };
        }
        if (acc.parentAccountId === mainCardId && (Number(acc.balance) || 0) < 0) {
          return { ...acc, balance: 0 };
        }
        return acc;
      })
    );

    return { success: true, amount: totalSubDebtToMove };
  }, [accounts]);

  // Transfer between accounts (Virman)
  const transferFunds = useCallback((fromAccountId, toAccountId, amount, description = 'Hesaplar Arası Transfer') => {
    const amt = Number(amount) || 0;
    if (amt <= 0 || fromAccountId === toAccountId) return;

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    // 1. Deduct from sender
    // 2. Add to recipient
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccountId) return { ...a, balance: a.balance - amt };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amt };
        return a;
      })
    );

    // 3. Record a transfer transaction
    const dateStr = new Date().toISOString().slice(0, 10);
    const tx = {
      id: 'tx-' + Date.now() + '-transfer',
      type: TRANSACTION_TYPES.TRANSFER,
      amount: amt,
      date: dateStr,
      categoryId: 'other',
      categoryName: 'Transfer',
      description: `${fromAcc.name} → ${toAcc.name}: ${description}`,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
  }, [accounts]);

  // --- Budget Actions ---
  const saveOverallBudget = useCallback((data) => {
    setOverallBudget((prev) => ({ ...prev, ...data }));
  }, []);

  const setBudget = useCallback((budgetData) => {
    setBudgets((prev) => {
      const existingIndex = prev.findIndex((b) => b.categoryId === budgetData.categoryId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...budgetData, limit: Number(budgetData.limit) || 0 };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: 'b-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            ...budgetData,
            limit: Number(budgetData.limit) || 0,
          },
        ];
      }
    });
  }, []);

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // --- Debt & Receivable Actions ---
  const addDebt = useCallback((debtData) => {
    const newDebt = {
      id: 'debt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...debtData,
      amount: Number(debtData.amount) || 0,
      paidAmount: Number(debtData.paidAmount) || 0,
      principalAmount: debtData.principalAmount !== undefined ? Number(debtData.principalAmount) : (Number(debtData.amount) || 0),
      interestRate: Number(debtData.interestRate) || 0,
      interestAmount: Number(debtData.interestAmount) || 0,
      interestType: debtData.interestType || 'flat',
      isInstallment: Boolean(debtData.isInstallment),
      installmentCount: Number(debtData.installmentCount) || 1,
      installmentAmount: Number(debtData.installmentAmount) || 0,
      firstDueDate: debtData.firstDueDate || debtData.dueDate || '',
      payments: Array.isArray(debtData.payments) ? debtData.payments : [],
      accountId: debtData.accountId || undefined,
      repaymentAccountId: debtData.repaymentAccountId || debtData.accountId || undefined,
    };
    setDebts((prev) => [newDebt, ...prev]);
    return newDebt;
  }, []);

  const updateDebt = useCallback((id, debtData) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          ...debtData,
          amount: Number(debtData.amount !== undefined ? debtData.amount : d.amount) || 0,
          paidAmount: Number(debtData.paidAmount !== undefined ? debtData.paidAmount : d.paidAmount) || 0,
          principalAmount: debtData.principalAmount !== undefined ? Number(debtData.principalAmount) : (d.principalAmount || d.amount || 0),
          interestRate: debtData.interestRate !== undefined ? Number(debtData.interestRate) : (d.interestRate || 0),
          interestAmount: debtData.interestAmount !== undefined ? Number(debtData.interestAmount) : (d.interestAmount || 0),
          interestType: debtData.interestType || d.interestType || 'flat',
          isInstallment: debtData.isInstallment !== undefined ? Boolean(debtData.isInstallment) : Boolean(d.isInstallment),
          installmentCount: debtData.installmentCount !== undefined ? Number(debtData.installmentCount) : (d.installmentCount || 1),
          installmentAmount: debtData.installmentAmount !== undefined ? Number(debtData.installmentAmount) : (d.installmentAmount || 0),
          firstDueDate: debtData.firstDueDate !== undefined ? debtData.firstDueDate : (d.firstDueDate || d.dueDate || ''),
          accountId: debtData.accountId !== undefined ? (debtData.accountId || undefined) : d.accountId,
          repaymentAccountId: debtData.repaymentAccountId !== undefined ? (debtData.repaymentAccountId || undefined) : (d.repaymentAccountId || d.accountId),
        };
      })
    );
  }, []);

  const recordDebtPayment = useCallback((debtId, paymentAmount, accountId = null, paymentNote = '') => {
    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) return;

    const debt = debts.find((d) => d.id === debtId);
    const targetAccountId = accountId || debt?.repaymentAccountId || debt?.accountId || null;

    const paymentRecord = {
      id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      date: new Date().toISOString(),
      amount: amt,
      accountId: targetAccountId,
      note: paymentNote || '',
    };

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newPaid = (d.paidAmount || 0) + amt;
        const payments = Array.isArray(d.payments) ? [...d.payments, paymentRecord] : [paymentRecord];
        return { ...d, paidAmount: newPaid, payments };
      })
    );

    // If account was selected or linked, record transaction and update account balance
    if (debt && targetAccountId) {
      const isLent = debt.type === 'lent'; // Alacak tahsilatı = Gelir (kasaya girer), Borç ödemesi = Gider (karttan/hesaptan çıkar)
      const actionLabel = isLent ? t('debts.collectionCategory', 'Alacak Tahsilatı') : t('debts.repaymentCategory', 'Borç Ödemesi');
      addTransaction({
        type: isLent ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
        categoryId: 'debt',
        categoryName: actionLabel,
        description: `${debt.personName} - ${actionLabel}${paymentNote ? ` (${paymentNote})` : ''}`,
        accountId: targetAccountId,
        debtId: debt.id,
      });
    }
  }, [debts, addTransaction, t]);

  const deleteDebt = useCallback((id) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // --- Auto-Processing Engine & Recurring Actions ---
  const checkAndAutoProcessRecurring = useCallback((overrideRecurringList = null) => {
    const listToProcess = overrideRecurringList || recurring;
    if (!listToProcess || listToProcess.length === 0) return { count: 0, items: [] };

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const currentPeriodKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const newTransactions = [];
    const processedItems = [];
    const accountDeltas = {};

    let hasChanges = false;
    const updatedRecurringList = listToProcess.map((rec) => {
      // Must be active and autoProcess !== false
      if (!rec.isActive || rec.autoProcess === false) {
        return rec;
      }

      // Check if already processed for this period
      if (rec.lastProcessedPeriod === currentPeriodKey) {
        return rec;
      }

      const recDay = Number(rec.dayOfMonth) || 1;
      // Is due if today >= scheduled day
      if (currentDay >= recDay) {
        hasChanges = true;
        const isIncome = rec.type === 'income' || rec.isSalary;
        const txType = isIncome ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE;
        const txAmount = Number(rec.amount) || 0;

        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const safeDay = Math.min(recDay, daysInMonth);
        const formattedDay = String(safeDay).padStart(2, '0');
        const txDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${formattedDay}`;

        const newTx = {
          id: `tx-auto-${rec.id}-${currentPeriodKey}`,
          type: txType,
          amount: txAmount,
          date: txDate,
          categoryId: rec.categoryId || (isIncome ? 'salary' : 'bills'),
          categoryName: rec.isSalary ? 'Maaş & Gelir' : (isIncome ? 'Düzenli Gelir' : 'Otomatik Abonelik'),
          description: rec.isSalary ? `${rec.title} (Otomatik Maaş)` : `${rec.title} (Otomatik Yenileme)`,
          note: `Sistem tarafından ${safeDay} ${now.toLocaleDateString('tr-TR', { month: 'long' })} tarihinde otomatik işlendi.`,
          accountId: rec.accountId || null,
          autoGenerated: true,
          recurringId: rec.id,
          createdAt: new Date().toISOString(),
        };

        newTransactions.push(newTx);
        processedItems.push({
          id: rec.id,
          title: rec.title,
          amount: txAmount,
          type: txType,
          isSalary: rec.isSalary,
          date: txDate,
        });

        if (rec.accountId) {
          const delta = isIncome ? txAmount : -txAmount;
          accountDeltas[rec.accountId] = (accountDeltas[rec.accountId] || 0) + delta;
        }

        return {
          ...rec,
          lastProcessedPeriod: currentPeriodKey,
          lastProcessedDate: new Date().toISOString(),
        };
      }

      return rec;
    });

    if (hasChanges && newTransactions.length > 0) {
      setTransactions((prev) => [...newTransactions, ...prev]);

      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (accountDeltas[acc.id]) {
            return {
              ...acc,
              balance: acc.balance + accountDeltas[acc.id],
            };
          }
          return acc;
        })
      );

      setRecurring(updatedRecurringList);

      setAutoProcessBanner({
        items: processedItems,
        period: currentPeriodKey,
        periodName: now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        timestamp: Date.now(),
      });

      return { count: processedItems.length, items: processedItems };
    }

    return { count: 0, items: [] };
  }, [recurring]);

  // --- Overnight Interest Engine ---
  const processOvernightInterest = useCallback((manualInvId = null, overrideInvestmentsList = null, forceRun = false) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    const listToScan = overrideInvestmentsList || investments;
    const targets = (listToScan || []).filter((inv) => {
      if (manualInvId) return inv.id === manualInvId;
      return inv.type === 'daily_interest' && Number(inv.interestRate) > 0;
    });

    if (targets.length === 0) return { count: 0, items: [] };

    const newTransactions = [];
    const processedItems = [];
    const accountDeltas = {};
    let hasChanges = false;

    const updatedInvestments = listToScan.map((inv) => {
      if (!targets.some((t) => t.id === inv.id)) return inv;

      const linkedAcc = accounts.find((a) => a.id === inv.accountId);
      const balanceToUse = linkedAcc ? Number(linkedAcc.balance) : Number(inv.purchasePrice || 0);

      const uninvested = Number(inv.uninvestedAmount) || 0;
      const rate = Number(inv.interestRate) || 0;
      const taxRate = inv.stopajRate !== undefined ? Number(inv.stopajRate) : 10;

      const activePrincipal = Math.max(0, balanceToUse - uninvested);
      if (activePrincipal <= 0 || rate <= 0) {
        return {
          ...inv,
          lastInterestProcessedDate: todayStr,
        };
      }

      // Calculate accrued interest from purchaseDate up to today
      const accrualRes = calculateDailyInterestAccrual({
        purchasePrice: activePrincipal,
        purchaseDate: inv.purchaseDate || todayStr,
        interestRate: rate,
        stopajRate: taxRate,
        uninvestedAmount: 0,
        additions: inv.additions,
        targetDate: todayStr,
      });

      // If purchaseDate is today (baseDays === 0), minimum yield to credit is 1 day's net interest
      const totalExpectedNet = Number(
        (accrualRes.totalAccruedNet > 0
          ? accrualRes.totalAccruedNet
          : accrualRes.currentDailyNet
        ).toFixed(2)
      );

      const alreadyEarned = Number(inv.totalEarnedInterest) || 0;
      let missingNetGain = Number((totalExpectedNet - alreadyEarned).toFixed(2));

      // If already processed today and not forced / manual, skip if nothing missing
      if (inv.lastInterestProcessedDate === todayStr && !forceRun && !manualInvId) {
        if (missingNetGain <= 0.01) {
          return inv;
        }
      }

      // If forced or manual, and missingNetGain <= 0, credit at least 1 day's return
      if ((forceRun || manualInvId) && missingNetGain <= 0.01) {
        missingNetGain = Number(accrualRes.currentDailyNet.toFixed(2));
      }

      if (missingNetGain <= 0) return inv;

      hasChanges = true;
      const targetAccountId = inv.accountId || null;
      const txId = `tx-interest-${inv.id}-${todayStr}-${Date.now()}`;
      const elapsedDays = Math.max(1, accrualRes.baseDays);

      const newTx = {
        id: txId,
        type: TRANSACTION_TYPES.INCOME,
        amount: missingNetGain,
        date: todayStr,
        categoryId: 'interest',
        categoryName: t('categories.interest', 'Faiz Kazancı'),
        description: `${inv.name} - ${t('categories.interest', 'Faiz Kazancı')}${elapsedDays > 1 ? ` (${elapsedDays} ${t('common.days', 'Gün')})` : ''}`,
        note: `Faiz işletimi: ${formatMoney(activePrincipal)} ana para üzerinden %${rate} yıllık faiz ve %${taxRate} stopaj ile net +${formatMoney(missingNetGain)} hesaba aktarıldı. (Başlangıç: ${formatDate(inv.purchaseDate || todayStr)})`,
        accountId: targetAccountId,
        autoGenerated: true,
        investmentId: inv.id,
        createdAt: new Date().toISOString(),
      };

      newTransactions.push(newTx);
      processedItems.push({
        id: inv.id,
        name: inv.name,
        accountName: linkedAcc ? linkedAcc.name : (t('common.account') || 'Hesap'),
        netDaily: missingNetGain,
        days: elapsedDays,
        activePrincipal,
        taxRate,
      });

      if (targetAccountId) {
        accountDeltas[targetAccountId] = (accountDeltas[targetAccountId] || 0) + missingNetGain;
      }

      const newTotalEarned = Number((alreadyEarned + missingNetGain).toFixed(2));
      const newLiveBalance = linkedAcc
        ? Number((Number(linkedAcc.balance) + missingNetGain).toFixed(2))
        : Number(((inv.currentPrice || activePrincipal) + missingNetGain).toFixed(2));

      return {
        ...inv,
        lastInterestProcessedDate: todayStr,
        totalEarnedInterest: newTotalEarned,
        currentPrice: newLiveBalance,
      };
    });

    if (hasChanges && newTransactions.length > 0) {
      setTransactions((prev) => [...newTransactions, ...prev]);

      if (Object.keys(accountDeltas).length > 0) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => {
            if (accountDeltas[acc.id]) {
              return {
                ...acc,
                balance: Number((acc.balance + accountDeltas[acc.id]).toFixed(2)),
              };
            }
            return acc;
          })
        );
      }

      setInvestments(updatedInvestments);

      setAutoProcessBanner({
        isNightlyInterest: true,
        items: processedItems,
        period: todayStr,
        periodName: `${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} Gecelik Faiz`,
        timestamp: Date.now(),
      });

      return { count: processedItems.length, items: processedItems };
    }

    return { count: 0, items: [] };
  }, [investments, accounts, formatMoney, t]);

  // Auto-check engine for recurring transactions and overnight daily interest
  useEffect(() => {
    // Initial mount check
    if (!hasRunAutoCheck.current && recurring.length > 0) {
      hasRunAutoCheck.current = true;
      checkAndAutoProcessRecurring();
    }
    if (!hasRunInterestCheck.current && investments.length > 0) {
      hasRunInterestCheck.current = true;
      processOvernightInterest();
    }

    const runChecks = () => {
      checkAndAutoProcessRecurring();
      processOvernightInterest();
    };

    // Re-check automatically on tab/window focus and visibility change
    window.addEventListener('focus', runChecks);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runChecks();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic check every 60 seconds (catches midnight 00:00 transition in real time)
    const interval = setInterval(runChecks, 60000);

    return () => {
      window.removeEventListener('focus', runChecks);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [recurring, checkAndAutoProcessRecurring, investments, processOvernightInterest]);

  // Manual trigger for user button
  const runAutoProcessCheck = useCallback(() => {
    const recResult = checkAndAutoProcessRecurring();
    const intResult = processOvernightInterest();
    return {
      count: (recResult?.count || 0) + (intResult?.count || 0),
      items: [...(recResult?.items || []), ...(intResult?.items || [])],
    };
  }, [checkAndAutoProcessRecurring, processOvernightInterest]);

  // Salary configuration helper
  const salaryConfig = useMemo(() => {
    const found = recurring.find((r) => r.isSalary);
    if (found) return { ...found, isConfigured: true };
    return {
      id: 'rec-salary',
      title: 'Aylık Maaş',
      amount: 0,
      dayOfMonth: 1,
      accountId: accounts[0]?.id || '',
      autoProcess: true,
      isActive: true,
      type: 'income',
      categoryId: 'salary',
      isSalary: true,
      isConfigured: false,
    };
  }, [recurring, accounts]);

  const saveSalaryConfig = useCallback((salaryData) => {
    let finalRecurringList = null;

    setRecurring((prev) => {
      const existingIndex = prev.findIndex((r) => r.isSalary);
      const updatedSalary = {
        id: existingIndex >= 0 ? prev[existingIndex].id : 'rec-salary',
        title: salaryData.title || 'Aylık Maaş',
        amount: Number(salaryData.amount) || 0,
        dayOfMonth: Number(salaryData.dayOfMonth) || 1,
        accountId: salaryData.accountId,
        categoryId: 'salary',
        type: 'income',
        frequency: 'monthly',
        isSalary: true,
        autoProcess: salaryData.autoProcess !== false,
        isActive: salaryData.isActive !== false,
        lastProcessedPeriod: existingIndex >= 0 ? prev[existingIndex].lastProcessedPeriod : null,
      };

      if (existingIndex >= 0) {
        finalRecurringList = [...prev];
        finalRecurringList[existingIndex] = { ...finalRecurringList[existingIndex], ...updatedSalary };
      } else {
        finalRecurringList = [updatedSalary, ...prev];
      }

      return finalRecurringList;
    });

    // Run side-effect OUTSIDE the setState updater!
    setTimeout(() => {
      if (finalRecurringList) {
        checkAndAutoProcessRecurring(finalRecurringList);
      }
    }, 50);
  }, [checkAndAutoProcessRecurring]);

  const addRecurring = useCallback((recData) => {
    const newRec = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...recData,
      amount: Number(recData.amount) || 0,
      dayOfMonth: Number(recData.dayOfMonth) || 1,
      autoProcess: recData.autoProcess !== false,
      isActive: true,
    };
    
    let finalNextList = null;
    
    setRecurring((prev) => {
      finalNextList = [newRec, ...prev];
      return finalNextList;
    });

    // Run side-effect OUTSIDE the setState updater
    setTimeout(() => {
      if (finalNextList) {
        checkAndAutoProcessRecurring(finalNextList);
      }
    }, 50);
    
    return newRec;
  }, [checkAndAutoProcessRecurring]);

  const updateRecurring = useCallback((id, updatedData) => {
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updatedData,
              amount: updatedData.amount !== undefined ? Number(updatedData.amount) : r.amount,
              dayOfMonth: updatedData.dayOfMonth !== undefined ? Number(updatedData.dayOfMonth) : r.dayOfMonth,
            }
          : r
      )
    );
  }, []);

  const toggleRecurringAutoProcess = useCallback((id) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, autoProcess: r.autoProcess === false } : r))
    );
  }, []);

  const toggleRecurringActive = useCallback((id) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }, []);

  const deleteRecurring = useCallback((id) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const processRecurringPayment = useCallback((recId) => {
    let rec = recurring.find((r) => r.id === recId);
    if (!rec && recId === 'rec-salary') {
      rec = recurring.find((r) => r.isSalary);
    }
    if (!rec) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentPeriodKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const todayDateStr = now.toISOString().slice(0, 10);

    const isIncome = rec.type === 'income' || rec.isSalary;
    const txType = isIncome ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE;
    const txAmount = Number(rec.amount) || 0;

    // 1. İşlemi ekle
    addTransaction({
      type: txType,
      amount: txAmount,
      date: todayDateStr,
      categoryId: rec.categoryId || (isIncome ? 'salary' : 'bills'),
      categoryName: rec.isSalary ? 'Maaş & Gelir' : (isIncome ? 'Düzenli Gelir' : 'Otomatik Abonelik'),
      description: rec.isSalary ? `${rec.title} (Manuel İşlendi)` : `${rec.title} (Manuel İşlendi)`,
      note: `${now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} dönemi için 'Şimdi İşle' ile işlendi. Günü geldiğinde bu ay tekrar işlenmeyecek.`,
      accountId: rec.accountId || null,
      autoGenerated: false,
      recurringId: rec.id,
    });

    // 2. Bu dönemi işlendi olarak işaretle (Böylece günü geldiğinde tekrar otomatik İŞLENMEZ)
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === rec.id || (rec.isSalary && r.isSalary)
          ? {
              ...r,
              lastProcessedPeriod: currentPeriodKey,
              lastProcessedDate: new Date().toISOString(),
            }
          : r
      )
    );

    return true;
  }, [recurring, addTransaction]);

  // --- Investment Actions ---
  const addInvestment = useCallback((invData) => {
    const newInv = {
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...invData,
      quantity: Number(invData.quantity) || 0,
      purchasePrice: Number(invData.purchasePrice) || 0,
      currentPrice: Number(invData.currentPrice !== undefined ? invData.currentPrice : invData.purchasePrice) || 0,
    };
    
    let nextList = null;
    setInvestments((prev) => {
      nextList = [newInv, ...prev];
      return nextList;
    });

    if (newInv.type === 'daily_interest' && Number(newInv.interestRate) > 0) {
      setTimeout(() => {
        processOvernightInterest(null, nextList);
      }, 50);
    }

    return newInv;
  }, [processOvernightInterest]);

  const updateInvestment = useCallback((id, updatedData) => {
    let nextList = null;
    setInvestments((prev) => {
      nextList = prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              ...updatedData,
              quantity: Number(updatedData.quantity) || 0,
              purchasePrice: Number(updatedData.purchasePrice) || 0,
              currentPrice: Number(updatedData.currentPrice) || 0,
            }
          : inv
      );
      return nextList;
    });

    if (updatedData.type === 'daily_interest' || updatedData.interestRate) {
      setTimeout(() => {
        processOvernightInterest(null, nextList);
      }, 50);
    }
  }, [processOvernightInterest]);

  const updateInvestmentPrice = useCallback((id, newPrice) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              currentPrice: Number(newPrice) || 0,
              lastPriceUpdate: new Date().toISOString(),
            }
          : inv
      )
    );
  }, []);

  const deleteInvestment = useCallback((id) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const addInvestmentBalance = useCallback((investmentId, { amount, date, note, accountId }) => {
    const parsedAmount = parseFloat(amount?.toString().replace(',', '.')) || 0;
    if (parsedAmount <= 0) return null;

    const additionId = 'add-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const additionDate = date || new Date().toISOString().split('T')[0];
    const addition = {
      id: additionId,
      amount: parsedAmount,
      date: additionDate,
      note: (note || '').trim(),
      accountId: accountId || null,
      createdAt: new Date().toISOString(),
    };

    let targetInvName = '';
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== investmentId) return inv;
        targetInvName = inv.name;
        const currentAdditions = Array.isArray(inv.additions) ? inv.additions : [];
        const newAdditions = [...currentAdditions, addition];

        const oldCurrent = Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) || 0;
        const newCurrent = oldCurrent + parsedAmount;

        return {
          ...inv,
          additions: newAdditions,
          currentPrice: Number(newCurrent.toFixed(2)),
          lastPriceUpdate: new Date().toISOString(),
        };
      })
    );

    if (accountId) {
      addTransaction({
        type: TRANSACTION_TYPES.EXPENSE,
        amount: parsedAmount,
        accountId,
        category: 'investment',
        date: additionDate,
        description: t('investments.topUpTransactionDesc', { name: targetInvName || 'Faiz Hesabı' }),
      });
    }

    return addition;
  }, [addTransaction, t]);

  const removeInvestmentBalance = useCallback((investmentId, additionId) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== investmentId) return inv;
        const currentAdditions = Array.isArray(inv.additions) ? inv.additions : [];
        const targetAddition = currentAdditions.find((a) => a.id === additionId);
        if (!targetAddition) return inv;

        const newAdditions = currentAdditions.filter((a) => a.id !== additionId);
        const oldCurrent = Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) || 0;
        const newCurrent = Math.max(0, oldCurrent - Number(targetAddition.amount || 0));

        return {
          ...inv,
          additions: newAdditions,
          currentPrice: Number(newCurrent.toFixed(2)),
          lastPriceUpdate: new Date().toISOString(),
        };
      })
    );
  }, []);

  // --- Category Actions ---
  const addCategory = useCallback((categoryData) => {
    const newCat = {
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      isCustom: true,
      ...categoryData,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback((id, updatedData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Settings & Storage ---
  const updateCurrency = useCallback((currencyCode) => {
    setSettings((prev) => ({ ...prev, currency: currencyCode }));
  }, []);

  const updateGeminiApiKey = useCallback((apiKey) => {
    setSettings((prev) => ({ ...prev, geminiApiKey: apiKey }));
  }, []);

  const resetAllData = useCallback(() => {
    StorageService.clearAll();
    setTransactions([]);
    setInvestments([]);
    setCategories(DEFAULT_CATEGORIES);
    setSettings({ currency: 'TRY', theme: 'light' });
    setAccounts(SAMPLE_ACCOUNTS);
    setBudgets([]);
    setDebts([]);
    setRecurring([]);
  }, []);

  const reloadSampleData = useCallback(() => {
    StorageService.loadSampleData();
    setTransactions(StorageService.getTransactions());
    setInvestments(StorageService.getInvestments());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());
    setAccounts(StorageService.getAccounts());
    setBudgets(StorageService.getBudgets());
    setDebts(StorageService.getDebts());
    setRecurring(StorageService.getRecurring());
  }, []);

  const importFromJSON = useCallback((jsonString) => {
    const res = StorageService.importDataJSON(jsonString);
    if (res.success) {
      setTransactions(StorageService.getTransactions());
      setInvestments(StorageService.getInvestments());
      setCategories(StorageService.getCategories());
      setSettings(StorageService.getSettings());
      setAccounts(StorageService.getAccounts());
      setBudgets(StorageService.getBudgets());
      setDebts(StorageService.getDebts());
      setRecurring(StorageService.getRecurring());
    }
    return res;
  }, []);

  // Modal helpers
  const openAddTransactionModal = useCallback((prefillData = null) => {
    setEditingTransaction(prefillData);
    setIsAddModalOpen(true);
  }, []);
  const closeAddTransactionModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const openAddInvestmentModal = useCallback((invToEdit = null) => {
    setEditingInvestment(invToEdit);
    setIsInvestmentModalOpen(true);
  }, []);
  const closeAddInvestmentModal = useCallback(() => {
    setIsInvestmentModalOpen(false);
    setEditingInvestment(null);
  }, []);

  const openPriceUpdateModal = useCallback((investment) => { setPriceUpdateTarget(investment); }, []);
  const closePriceUpdateModal = useCallback(() => { setPriceUpdateTarget(null); }, []);

  const openAddBalanceModal = useCallback((investment) => { setBalanceTargetInvestment(investment); }, []);
  const closeAddBalanceModal = useCallback(() => { setBalanceTargetInvestment(null); }, []);

  const openReceiptViewer = useCallback((receipt) => { setViewingReceipt(receipt); }, []);
  const closeReceiptViewer = useCallback(() => { setViewingReceipt(null); }, []);

  const openDayDetail = useCallback((dateStr) => { setSelectedDayForDetail(dateStr); }, []);
  const closeDayDetail = useCallback(() => { setSelectedDayForDetail(null); }, []);

  // New Modals
  const openAiAdvisor = useCallback(() => setIsAiAdvisorOpen(true), []);
  const closeAiAdvisor = useCallback(() => setIsAiAdvisorOpen(false), []);

  const openInstallApp = useCallback(() => setIsInstallAppOpen(true), []);
  const closeInstallApp = useCallback(() => setIsInstallAppOpen(false), []);

  const openTransferModal = useCallback(() => setIsTransferModalOpen(true), []);
  const closeTransferModal = useCallback(() => setIsTransferModalOpen(false), []);

  const openAccountModal = useCallback((acc = null) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  }, []);
  const closeAccountModal = useCallback(() => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  }, []);

  const openAccountDetail = useCallback((acc) => {
    setSelectedAccountForDetail(acc);
  }, []);
  const closeAccountDetail = useCallback(() => {
    setSelectedAccountForDetail(null);
  }, []);

  const openBudgetModal = useCallback((budget = null) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  }, []);
  const closeBudgetModal = useCallback(() => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  }, []);

  const openDebtModal = useCallback((debt = null) => {
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  }, []);
  const closeDebtModal = useCallback(() => {
    setIsDebtModalOpen(false);
    setEditingDebt(null);
  }, []);

  const openRecurringModal = useCallback((rec = null) => {
    setEditingRecurring(rec);
    setIsRecurringModalOpen(true);
  }, []);
  const closeRecurringModal = useCallback(() => {
    setIsRecurringModalOpen(false);
    setEditingRecurring(null);
  }, []);

  const openSalaryModal = useCallback(() => setIsSalaryModalOpen(true), []);
  const closeSalaryModal = useCallback(() => setIsSalaryModalOpen(false), []);
  const dismissAutoProcessBanner = useCallback(() => setAutoProcessBanner(null), []);

  const value = {
    // Data
    transactions,
    investments,
    categories,
    settings,
    accounts,
    budgets,
    budgetsWithSpent,
    debts,
    recurring,
    financialSummary,
    totalAccountBalance,
    activeTab,
    setActiveTab,
    initialTransactionFilter,
    setInitialTransactionFilter,

    // Helpers
    formatMoney,

    // Transaction functions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,

    // Account functions
    addAccount,
    updateAccount,
    deleteAccount,
    transferFunds,

    // Budget functions
    setBudget,
    deleteBudget,
    overallBudget,
    saveOverallBudget,

    // Debt functions
    addDebt,
    updateDebt,
    recordDebtPayment,
    deleteDebt,

    // Recurring & Salary functions
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringAutoProcess,
    toggleRecurringActive,
    processRecurringPayment,
    runAutoProcessCheck,
    salaryConfig,
    saveSalaryConfig,

    // Investment functions
    addInvestment,
    updateInvestment,
    updateInvestmentPrice,
    deleteInvestment,
    addInvestmentBalance,
    removeInvestmentBalance,
    processOvernightInterest,

    // Category functions
    addCategory,
    updateCategory,
    deleteCategory,

    // Settings / Storage
    updateCurrency,
    updateGeminiApiKey,
    resetAllData,
    reloadSampleData,
    importFromJSON,
    exportJSON: () => StorageService.exportDataJSON(),
    exportCSV: () => StorageService.exportTransactionsCSV(),

    // Modal controls
    isAddModalOpen,
    editingTransaction,
    openAddTransactionModal,
    closeAddTransactionModal,

    isInvestmentModalOpen,
    editingInvestment,
    openAddInvestmentModal,
    closeAddInvestmentModal,

    priceUpdateTarget,
    openPriceUpdateModal,
    closePriceUpdateModal,

    balanceTargetInvestment,
    openAddBalanceModal,
    closeAddBalanceModal,

    viewingReceipt,
    openReceiptViewer,
    closeReceiptViewer,

    selectedDayForDetail,
    openDayDetail,
    closeDayDetail,

    // New Modals
    isAiAdvisorOpen,
    openAiAdvisor,
    closeAiAdvisor,

    isInstallAppOpen,
    openInstallApp,
    closeInstallApp,

    isTransferModalOpen,
    openTransferModal,
    closeTransferModal,

    isAccountModalOpen,
    editingAccount,
    openAccountModal,
    closeAccountModal,
    selectedAccountForDetail,
    openAccountDetail,
    closeAccountDetail,
    getCreditCardDetails,
    consolidateSubCardDebts,

    isBudgetModalOpen,
    editingBudget,
    openBudgetModal,
    closeBudgetModal,

    isDebtModalOpen,
    editingDebt,
    openDebtModal,
    closeDebtModal,

    isRecurringModalOpen,
    editingRecurring,
    openRecurringModal,
    closeRecurringModal,

    isSalaryModalOpen,
    openSalaryModal,
    closeSalaryModal,

    autoProcessBanner,
    dismissAutoProcessBanner,

    // Language & Internationalization
    language,
    setLanguage,
    t,
    getCategoryName,
    getAccountTypeName,
    getTransactionTypeName,
    getAssetTypeName,
    isEn,
    isTr,

    // Theme & Appearance
    themeMode,
    setThemeMode,
    colorTheme,
    setColorTheme,
    isDarkMode,
    toggleDarkMode,
    currentThemeObj,
    COLOR_THEMES,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
