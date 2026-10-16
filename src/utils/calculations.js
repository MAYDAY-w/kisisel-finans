import { TRANSACTION_TYPES } from '../types/index.js';

/**
 * Calculates total balance, total income, total expenses, net savings, etc.
 * @param {Array} transactions
 * @param {Array} investments
 * @param {Array} accounts
 * @returns {Object}
 */
export function calculateFinancialSummary(transactions = [], investments = [], accounts = []) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalPurchases = 0;
  let totalSales = 0;
  let totalInvestmentOutlay = 0;

  // Monthly stats (current month)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const txDate = new Date(tx.date);
    const isThisMonth =
      !isNaN(txDate.getTime()) &&
      txDate.getFullYear() === currentYear &&
      txDate.getMonth() === currentMonth;

    switch (tx.type) {
      case TRANSACTION_TYPES.INCOME:
        totalIncome += amount;
        if (isThisMonth) monthlyIncome += amount;
        break;
      case TRANSACTION_TYPES.EXPENSE:
        totalExpenses += amount;
        if (isThisMonth) monthlyExpenses += amount;
        break;
      case TRANSACTION_TYPES.PURCHASE:
        totalPurchases += amount;
        if (isThisMonth) monthlyExpenses += amount; // Cash outflow
        break;
      case TRANSACTION_TYPES.SALE:
        totalSales += amount;
        if (isThisMonth) monthlyIncome += amount; // Cash inflow
        break;
      case TRANSACTION_TYPES.INVESTMENT:
        totalInvestmentOutlay += amount;
        if (isThisMonth) monthlyExpenses += amount;
        break;
      case TRANSACTION_TYPES.OTHER:
        // neutral or counted as signed amount
        break;
      default:
        break;
    }
  });

  // Net Cash Balance: Sum of all account balances
  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  // Investment Portfolio calculations
  let totalInvestmentCost = 0;
  let totalInvestmentCurrentValue = 0;
  let liquidInterestValue = 0;

  investments.forEach((inv) => {
    const isLiquidAccount = inv.type === 'daily_interest' && inv.accountId;
    const linkedAcc = isLiquidAccount ? accounts.find((a) => a.id === inv.accountId) : null;

    const qty = Number(inv.quantity) || 1;
    const additionsTotal = (inv.additions || []).reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0
    );
    const cumulativeEarned = Number(inv.totalEarnedInterest) || 0;
    const liveBal = linkedAcc ? Number(linkedAcc.balance) : (Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) || 0);

    const cost = isLiquidAccount
      ? Math.max(0, liveBal - cumulativeEarned)
      : ((qty * (Number(inv.purchasePrice) || 0)) + additionsTotal);
    const val = isLiquidAccount ? liveBal : (qty * (Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) || 0));

    if (isLiquidAccount) {
      liquidInterestValue += val;
    }

    totalInvestmentCost += cost;
    totalInvestmentCurrentValue += val;
  });

  const totalInvestmentProfit = totalInvestmentCurrentValue - totalInvestmentCost;
  const totalInvestmentProfitPercent =
    totalInvestmentCost > 0 ? (totalInvestmentProfit / totalInvestmentCost) * 100 : 0;

  // Monthly Net Savings
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const monthlySavingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Net Worth (Balance + Current Non-Liquid Investment Portfolio Value)
  // Liquid daily interest is already in totalBalance (account balance), so we don't count it twice
  const nonLiquidInvestmentsValue = totalInvestmentCurrentValue - liquidInterestValue;
  const netWorth = totalBalance + nonLiquidInvestmentsValue;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    totalPurchases,
    totalSales,
    totalInvestmentOutlay,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    monthlySavingsRate,
    totalInvestmentCost,
    totalInvestmentCurrentValue,
    totalInvestmentProfit,
    totalInvestmentProfitPercent,
    netWorth,
  };
}

/**
 * Groups expenses by category for pie/bar chart representation.
 * @param {Array} transactions
 * @param {Array} categories
 * @returns {Array} [{ id, name, color, total, percentage }]
 */
export function calculateExpensesByCategory(transactions = [], categories = []) {
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = { ...cat, total: 0 };
  });

  let grandTotal = 0;

  transactions.forEach((tx) => {
    // Count expense and purchase
    if (tx.type === TRANSACTION_TYPES.EXPENSE || tx.type === TRANSACTION_TYPES.PURCHASE) {
      const amount = Number(tx.amount) || 0;
      grandTotal += amount;

      const catId = tx.categoryId || 'other';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: tx.categoryName || 'Diğer',
          color: '#64748b',
          total: 0,
        };
      }
      categoryMap[catId].total += amount;
    }
  });

  const result = Object.values(categoryMap)
    .filter((item) => item.total > 0)
    .map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { categories: result, grandTotal };
}

/**
 * Calculates monthly income and expenses for the last 6 months.
 * @param {Array} transactions
 * @returns {Array} [{ monthKey, label, income, expense, net }]
 */
export function calculateLast6MonthsTrend(transactions = []) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(d);

    months.push({
      monthKey,
      label,
      income: 0,
      expense: 0,
    });
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return;
    const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    const monthObj = months.find((m) => m.monthKey === key);

    if (monthObj) {
      const amount = Number(tx.amount) || 0;
      if (tx.type === TRANSACTION_TYPES.INCOME || tx.type === TRANSACTION_TYPES.SALE) {
        monthObj.income += amount;
      } else if (
        tx.type === TRANSACTION_TYPES.EXPENSE ||
        tx.type === TRANSACTION_TYPES.PURCHASE ||
        tx.type === TRANSACTION_TYPES.INVESTMENT
      ) {
        monthObj.expense += amount;
      }
    }
  });

  return months.map((m) => ({
    ...m,
    net: m.income - m.expense,
  }));
}
