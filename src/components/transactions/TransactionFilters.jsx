import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TRANSACTION_TYPES } from '../../types';
import { Search, Filter, Calendar, X } from 'lucide-react';

export function TransactionFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories,
  onResetFilters,
  hasActiveFilters,
}) {
  const { t, getTransactionTypeName, getCategoryName } = useFinance();

  const typeFilterTabs = [
    { id: 'all', label: t('transactions.filterAll') },
    { id: TRANSACTION_TYPES.INCOME, label: t('transactions.income') },
    { id: TRANSACTION_TYPES.EXPENSE, label: t('transactions.expense') },
    { id: TRANSACTION_TYPES.PURCHASE, label: t('transactions.purchase') },
    { id: TRANSACTION_TYPES.SALE, label: t('transactions.sale') },
    { id: TRANSACTION_TYPES.INVESTMENT, label: t('transactions.investment') },
    { id: TRANSACTION_TYPES.OTHER, label: t('transactions.other') },
  ];

  const dateRangeOptions = [
    { id: 'all', label: t('dashboard.allTime') },
    { id: 'this_month', label: t('budget.thisMonth') },
    { id: 'last_month', label: t('daily.prevMonth') },
    { id: 'this_year', label: t('dashboard.thisYear') },
    { id: 'custom', label: t('transactions.customDate', 'Özel Tarih') },
  ];

  return (
    <div className="space-y-3">
      {/* Search & Main Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('transactions.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Range Selector */}
        <div className="sm:col-span-3">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm cursor-pointer"
          >
            {dateRangeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="all">{t('transactions.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat.id, cat.name)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Picker (if 'custom' is selected) */}
      {dateRange === 'custom' && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800/70 rounded-xl flex items-center gap-3 flex-wrap animate-slide-up border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Başlangıç:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bitiş:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

      {/* Horizontal Scrolling Transaction Type Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {typeFilterTabs.map((tab) => {
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTypeChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 whitespace-nowrap flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            <span>{t('transactions.clearFilters')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
