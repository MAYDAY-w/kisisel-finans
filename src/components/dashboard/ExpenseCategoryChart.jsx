import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { calculateExpensesByCategory } from '../../utils/calculations';
import { formatPercent, formatDate } from '../../utils/formatters';
import { TRANSACTION_TYPES } from '../../types';
import {
  PieChart,
  Calendar,
  X,
  Receipt,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Wallet
} from 'lucide-react';

export function ExpenseCategoryChart() {
  const { transactions, categories, formatMoney, t, getCategoryName, language } = useFinance();

  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly', 'monthly', 'yearly', 'all'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => {
      if (tx.type !== TRANSACTION_TYPES.EXPENSE && tx.type !== TRANSACTION_TYPES.PURCHASE) {
        return false;
      }
      if (!tx.date) return false;

      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return false;

      if (timeRange === 'weekly') {
        const day = now.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
        return txDate >= startOfWeek;
      } else if (timeRange === 'monthly') {
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      } else if (timeRange === 'yearly') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  }, [transactions, timeRange]);

  const { categories: categoryData, grandTotal } = useMemo(() => {
    return calculateExpensesByCategory(filteredTransactions, categories);
  }, [filteredTransactions, categories]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categoryData.find((c) => c.id === selectedCategoryId) || null;
  }, [categoryData, selectedCategoryId]);

  // Specific transactions for selected category
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return filteredTransactions
      .filter((tx) => (tx.categoryId || 'other') === selectedCategoryId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredTransactions, selectedCategoryId]);

  const timeRangeButtons = [
    { id: 'weekly', label: t('dashboard.filterWeekly') },
    { id: 'monthly', label: t('dashboard.filterMonthly') },
    { id: 'yearly', label: t('dashboard.filterYearly') },
    { id: 'all', label: t('dashboard.filterAll') },
  ];

  // SVG Donut calculation
  // Radius = 82, Circumference = 2 * PI * 82 = 515.221
  const R = 82;
  const C = 2 * Math.PI * R;

  let accumulatedPercent = 0;
  const slices = categoryData.map((cat) => {
    const slicePercent = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
    const strokeDash = (slicePercent / 100) * C;
    const gap = categoryData.length > 1 && strokeDash > 4 ? 2 : 0;
    const segmentLength = Math.max(1, strokeDash - gap);
    const offset = (accumulatedPercent / 100) * C;
    accumulatedPercent += slicePercent;

    const isSelected = selectedCategoryId === cat.id;
    const isHovered = hoveredId === cat.id;

    return {
      ...cat,
      strokeDasharray: `${segmentLength} ${C - segmentLength}`,
      strokeDashoffset: -offset,
      isSelected,
      isHovered,
    };
  });

  return (
    <Card padding="p-5" className="flex flex-col justify-between">
      <div>
        {/* Header & Time Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('dashboard.categoryDistribution')}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.categoryDistributionSubtitle')}</p>
            </div>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-0.5 self-start sm:self-auto overflow-x-auto max-w-full">
            {timeRangeButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setTimeRange(btn.id);
                  setSelectedCategoryId(null);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap ${
                  timeRange === btn.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {grandTotal === 0 || categoryData.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-2">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-slate-400">
              {t('dashboard.noExpenseInPeriod', { period: timeRangeButtons.find((b) => b.id === timeRange)?.label || '' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Donut Chart */}
            <div className="relative flex items-center justify-center my-2">
              <svg
                viewBox="0 0 240 240"
                className="w-52 h-52 sm:w-56 sm:h-56 transform -rotate-90 select-none overflow-visible"
              >
                {/* Background Ring */}
                <circle
                  cx="120"
                  cy="120"
                  r={R}
                  fill="none"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="20"
                />

                {/* Slices */}
                {slices.map((slice) => {
                  const isAnySelected = Boolean(selectedCategoryId);
                  const isThisSelected = slice.isSelected;
                  const isThisHovered = slice.isHovered;

                  return (
                    <circle
                      key={slice.id}
                      cx="120"
                      cy="120"
                      r={R}
                      fill="none"
                      stroke={slice.color || '#64748b'}
                      strokeWidth={isThisSelected ? 26 : isThisHovered ? 24 : 20}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      opacity={isAnySelected && !isThisSelected ? 0.35 : 1}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease',
                        filter: isThisSelected
                          ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))'
                          : isThisHovered
                          ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                          : 'none',
                      }}
                      onMouseEnter={() => setHoveredId(slice.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() =>
                        setSelectedCategoryId(selectedCategoryId === slice.id ? null : slice.id)
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Info Overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {selectedCategory ? getCategoryName(selectedCategory.id, selectedCategory.name) : t('dashboard.totalExpense')}
                </span>
                <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {formatMoney(selectedCategory ? selectedCategory.total : grandTotal)}
                </span>
                <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  {selectedCategory
                    ? (language === 'en' ? `${selectedCategory.percentage.toFixed(1)}% Share` : `%${selectedCategory.percentage.toFixed(1)} Pay`)
                    : t('dashboard.categoryCount', { count: categoryData.length })}
                </span>
              </div>
            </div>

            {/* If a category is selected: Show category banner and transaction list */}
            {selectedCategory ? (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: selectedCategory.color || '#64748b' }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('dashboard.categoryExpenses', { name: getCategoryName(selectedCategory.id, selectedCategory.name) })}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedCategoryTransactions.length} {language === 'en' ? 'transactions' : 'işlem'} • {t('common.total')}: {formatMoney(selectedCategory.total)} ({language === 'en' ? `${selectedCategory.percentage.toFixed(1)}%` : `%${selectedCategory.percentage.toFixed(1)}`})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors shadow-xs"
                  >
                    <X className="w-3 h-3" />
                    <span>{t('dashboard.allCategories')}</span>
                  </button>
                </div>

                {/* Transaction Items */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50">
                  {selectedCategoryTransactions.length > 0 ? (
                    selectedCategoryTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 px-1 hover:bg-slate-50/70 rounded-lg transition-colors text-xs"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-slate-800 truncate">
                            {tx.description || tx.itemName || getCategoryName(selectedCategory.id, selectedCategory.name)}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{formatDate(tx.date)}</span>
                            {tx.accountName && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-500">{tx.accountName}</span>
                              </>
                            )}
                            {tx.note && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[120px]">"{tx.note}"</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="font-extrabold text-rose-600 shrink-0">
                          -{formatMoney(Number(tx.amount) || 0)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      {t('common.empty')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* If no category is selected: Show clickable categories list */
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  <span>{t('common.category')}</span>
                  <span>{t('common.amount')} / {language === 'en' ? 'Share' : 'Oran'}</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {categoryData.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      onMouseEnter={() => setHoveredId(cat.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                        hoveredId === cat.id
                          ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color || '#64748b' }}
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                          {getCategoryName(cat.id, cat.name)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatMoney(cat.total)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 w-11 text-right">
                          {language === 'en' ? `${cat.percentage.toFixed(1)}%` : `%${cat.percentage.toFixed(1)}`}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
