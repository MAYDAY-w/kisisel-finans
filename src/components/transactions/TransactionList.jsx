import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionItem } from './TransactionItem';
import { TransactionFilters } from './TransactionFilters';
import { Button } from '../common/Button';
import { Plus, Download, Inbox, ArrowDownUp } from 'lucide-react';
import { TRANSACTION_TYPES } from '../../types';
import { formatDate } from '../../utils/formatters';

export function TransactionList() {
  const {
    transactions,
    categories,
    openAddTransactionModal,
    exportCSV,
    formatMoney,
  } = useFinance();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = (tx.description || '').toLowerCase().includes(query);
        const matchesCategory = (tx.categoryName || '').toLowerCase().includes(query);
        const matchesItem = (tx.itemName || '').toLowerCase().includes(query);
        const matchesNote = (tx.note || '').toLowerCase().includes(query);

        if (!matchesDesc && !matchesCategory && !matchesItem && !matchesNote) {
          return false;
        }
      }

      // 2. Transaction Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // 4. Date Range
      if (dateRange !== 'all') {
        const txDate = new Date(tx.date);
        if (isNaN(txDate.getTime())) return true;
        const now = new Date();

        if (dateRange === 'this_month') {
          if (
            txDate.getFullYear() !== now.getFullYear() ||
            txDate.getMonth() !== now.getMonth()
          ) {
            return false;
          }
        } else if (dateRange === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (
            txDate.getFullYear() !== lastMonth.getFullYear() ||
            txDate.getMonth() !== lastMonth.getMonth()
          ) {
            return false;
          }
        } else if (dateRange === 'this_year') {
          if (txDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateRange === 'custom') {
          if (startDate && tx.date < startDate) return false;
          if (endDate && tx.date > endDate) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date); // default 'date_desc'
    });
  }, [transactions, searchQuery, selectedType, selectedCategory, dateRange, startDate, endDate, sortBy]);

  // Total amount of filtered transactions
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === TRANSACTION_TYPES.INCOME || tx.type === TRANSACTION_TYPES.SALE) {
        income += amt;
      } else {
        expense += amt;
      }
    });

    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    dateRange !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
  };

  // Group transactions by date for clean readability
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date || 'Tarihsiz';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });
    return Object.entries(groups);
  }, [filteredTransactions]);

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header & Export */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            İşlem Geçmişi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tüm gelir, gider, alış ve satış hareketlerinizi inceleyin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            icon={Download}
            className="text-xs"
          >
            CSV / Excel İndir
          </Button>
          <Button
            size="sm"
            onClick={() => openAddTransactionModal()}
            icon={Plus}
            className="text-xs"
          >
            İşlem Ekle
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          categories={categories}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Filtered Overview Stats Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>
              <strong>{filteredSummary.count}</strong> işlem bulundu
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">
              +{formatMoney(filteredSummary.income)}
            </span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">
              -{formatMoney(filteredSummary.expense)}
            </span>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Tarihe Göre (En Yeni)</option>
              <option value="date_asc">Tarihe Göre (En Eski)</option>
              <option value="amount_desc">Tutara Göre (En Yüksek)</option>
              <option value="amount_asc">Tutara Göre (En Düşük)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List Grouped by Date */}
      {groupedTransactions.length > 0 ? (
        <div className="space-y-6">
          {groupedTransactions.map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {formatDate(dateKey, 'long')}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {items.length} işlem
                </span>
              </div>

              <div className="space-y-2">
                {items.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            İşlem Bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mb-5">
            {hasActiveFilters
              ? 'Belirttiğiniz filtreleme kriterlerine uygun kayıt bulunamadı.'
              : 'Henüz kaydedilmiş bir finansal işlem yok. İlk işleminizi hemen ekleyin.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Filtreleri Temizle
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => openAddTransactionModal()}
            >
              Yeni İşlem Ekle
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
