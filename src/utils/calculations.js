import { TRANSACTION_TYPES } from '../types/index.js';

/**
 * Calculates total balance, total income, total expenses, net savings, etc.
 * @param {Array} transactions
 * @param {Array} investments
 * @returns {Object}
 */
export function calculateFinancialSummary(transactions = [], investments = []) {
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

  // Net Cash Balance: (Income + Sales) - (Expenses + Purchases + Investment Outlay)
  const totalBalance = totalIncome + totalSales - (totalExpenses + totalPurchases + totalInvestmentOutlay);

  // Investment Portfolio calculations
  let totalInvestmentCost = 0;
  let totalInvestmentCurrentValue = 0;

  investments.forEach((inv) => {
    const qty = Number(inv.quantity) || 0;
    const buyPrice = Number(inv.purchasePrice) || 0;
    const currPrice = Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) || 0;

    const cost = qty * buyPrice;
    const val = qty * currPrice;

    totalInvestmentCost += cost;
    totalInvestmentCurrentValue += val;
  });

  const totalInvestmentProfit = totalInvestmentCurrentValue - totalInvestmentCost;
  const totalInvestmentProfitPercent =
    totalInvestmentCost > 0 ? (totalInvestmentProfit / totalInvestmentCost) * 100 : 0;

  // Monthly Net Savings
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const monthlySavingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Net Worth (Balance + Current Investment Portfolio Value)
  const netWorth = totalBalance + totalInvestmentCurrentValue;

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
