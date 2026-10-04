import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StorageService } from '../services/storage.js';
import { SAMPLE_ACCOUNTS } from '../services/sampleData.js';
import { DEFAULT_CATEGORIES, TRANSACTION_TYPES } from '../types/index.js';
import { calculateFinancialSummary } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatters.js';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Main data states
  const [transactions, setTransactions] = useState(() => StorageService.getTransactions());
  const [investments, setInvestments] = useState(() => StorageService.getInvestments());
  const [categories, setCategories] = useState(() => StorageService.getCategories());
  const [settings, setSettings] = useState(() => StorageService.getSettings());
  const [accounts, setAccounts] = useState(() => StorageService.getAccounts());
  const [budgets, setBudgets] = useState(() => StorageService.getBudgets());
  const [debts, setDebts] = useState(() => StorageService.getDebts());
  const [recurring, setRecurring] = useState(() => StorageService.getRecurring());

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'daily' | 'accounts' | 'transactions' | 'investments' | 'budget' | 'debts' | 'settings'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [priceUpdateTarget, setPriceUpdateTarget] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState(null);

  // New Feature Modals
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
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

  // Persist to storage
  useEffect(() => { StorageService.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { StorageService.saveInvestments(investments); }, [investments]);
  useEffect(() => { StorageService.saveCategories(categories); }, [categories]);
  useEffect(() => { StorageService.saveSettings(settings); }, [settings]);
  useEffect(() => { StorageService.saveAccounts(accounts); }, [accounts]);
  useEffect(() => { StorageService.saveBudgets(budgets); }, [budgets]);
  useEffect(() => { StorageService.saveDebts(debts); }, [debts]);
  useEffect(() => { StorageService.saveRecurring(recurring); }, [recurring]);

  // Financial summary
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions, investments);
  }, [transactions, investments]);

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
    if (txData.accountId) {
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (acc.id !== txData.accountId) return acc;
          const amt = Number(txData.amount) || 0;
          let newBalance = acc.balance;
          if (txData.type === TRANSACTION_TYPES.INCOME || txData.type === TRANSACTION_TYPES.SALE) {
            newBalance += amt;
          } else {
            newBalance -= amt;
          }
          return { ...acc, balance: newBalance };
        })
      );
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
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedData, amount: Number(updatedData.amount) || 0 } : tx))
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const duplicateTransaction = useCallback((id) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const duplicated = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      description: `${tx.description} (Kopya)`,
    };

    setTransactions((prev) => [duplicated, ...prev]);
  }, [transactions]);

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
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

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
    };
    setDebts((prev) => [newDebt, ...prev]);
    return newDebt;
  }, []);

  const recordDebtPayment = useCallback((debtId, paymentAmount, accountId = null) => {
    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) return;

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newPaid = (d.paidAmount || 0) + amt;
        return { ...d, paidAmount: newPaid };
      })
    );

    // If account was selected, record transaction and update account balance
    const debt = debts.find((d) => d.id === debtId);
    if (debt) {
      const isLent = debt.type === 'lent'; // Alacak tahsilatı = Gelir, Borç ödemesi = Gider
      addTransaction({
        type: isLent ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
        categoryId: 'other',
        categoryName: isLent ? 'Alacak Tahsilatı' : 'Borç Ödemesi',
        description: `${debt.personName} - ${isLent ? 'Alacak Tahsilatı' : 'Borç Ödemesi'}`,
        accountId: accountId || undefined,
      });
    }
  }, [debts, addTransaction]);

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
          accountId: rec.accountId || undefined,
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

  // Initial mount auto-check
  useEffect(() => {
    if (!hasRunAutoCheck.current && recurring.length > 0) {
      hasRunAutoCheck.current = true;
      checkAndAutoProcessRecurring();
    }
  }, [recurring, checkAndAutoProcessRecurring]);

  // Manual trigger for user button
  const runAutoProcessCheck = useCallback(() => {
    return checkAndAutoProcessRecurring();
  }, [checkAndAutoProcessRecurring]);

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

      let newRecurringList;
      if (existingIndex >= 0) {
        newRecurringList = [...prev];
        newRecurringList[existingIndex] = { ...newRecurringList[existingIndex], ...updatedSalary };
      } else {
        newRecurringList = [updatedSalary, ...prev];
      }

      setTimeout(() => {
        checkAndAutoProcessRecurring(newRecurringList);
      }, 50);

      return newRecurringList;
    });
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
    setRecurring((prev) => {
      const next = [newRec, ...prev];
      setTimeout(() => checkAndAutoProcessRecurring(next), 50);
      return next;
    });
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
    const rec = recurring.find((r) => r.id === recId);
    if (!rec) return;

    const isIncome = rec.type === 'income' || rec.isSalary;
    addTransaction({
      type: isIncome ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE,
      amount: rec.amount,
      date: new Date().toISOString().slice(0, 10),
      categoryId: rec.categoryId || (isIncome ? 'salary' : 'bills'),
      description: `Planlı: ${rec.title}`,
      accountId: rec.accountId || undefined,
    });
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
    setInvestments((prev) => [newInv, ...prev]);
    return newInv;
  }, []);

  const updateInvestment = useCallback((id, updatedData) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              ...updatedData,
              quantity: Number(updatedData.quantity) || 0,
              purchasePrice: Number(updatedData.purchasePrice) || 0,
              currentPrice: Number(updatedData.currentPrice) || 0,
            }
          : inv
      )
    );
  }, []);

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

  // --- Category Actions ---
  const addCategory = useCallback((categoryData) => {
    const newCat = {
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ...categoryData,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Settings & Storage ---
  const updateCurrency = useCallback((currencyCode) => {
    setSettings((prev) => ({ ...prev, currency: currencyCode }));
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

    // Debt functions
    addDebt,
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

    // Category functions
    addCategory,
    deleteCategory,

    // Settings / Storage
    updateCurrency,
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
