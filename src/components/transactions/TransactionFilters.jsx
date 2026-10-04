import React from 'react';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_CONFIG } from '../../types';
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
  const typeFilterTabs = [
    { id: 'all', label: 'Tümü' },
    { id: TRANSACTION_TYPES.INCOME, label: 'Gelir' },
    { id: TRANSACTION_TYPES.EXPENSE, label: 'Gider' },
    { id: TRANSACTION_TYPES.PURCHASE, label: 'Alış' },
    { id: TRANSACTION_TYPES.SALE, label: 'Satış' },
    { id: TRANSACTION_TYPES.INVESTMENT, label: 'Yatırım' },
    { id: TRANSACTION_TYPES.OTHER, label: 'Diğer' },
  ];

  const dateRangeOptions = [
    { id: 'all', label: 'Tüm Zamanlar' },
    { id: 'this_month', label: 'Bu Ay' },
    { id: 'last_month', label: 'Geçen Ay' },
    { id: 'this_year', label: 'Bu Yıl' },
    { id: 'custom', label: 'Özel Tarih' },
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
            placeholder="Açıklama, varlık adı veya notlarda ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
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
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range Picker (if 'custom' is selected) */}
      {dateRange === 'custom' && (
        <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-3 flex-wrap animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Başlangıç:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Bitiş:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 whitespace-nowrap flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" />
            <span>Filtreleri Temizle</span>
          </button>
        )}
      </div>
    </div>
  );
}
