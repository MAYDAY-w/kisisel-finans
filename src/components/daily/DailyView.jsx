import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/formatters';
import { TRANSACTION_TYPES } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Receipt,
  FileImage,
  Sparkles,
  Loader2
} from 'lucide-react';
import { compressMultipleImages } from '../../utils/imageCompressor';

export function DailyView() {
  const {
    transactions,
    formatMoney,
    openDayDetail,
    openAddTransactionModal,
    openReceiptViewer,
    t,
    isEn,
  } = useFinance();

  const fileInputRef = React.useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Selected Month & Year for filtering
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month...
  const [filterOnlyWithReceipts, setFilterOnlyWithReceipts] = useState(false);

  const activeDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const activeYear = activeDate.getFullYear();
  const activeMonth = activeDate.getMonth();

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'tr-TR', { month: 'long', year: 'numeric' }).format(activeDate);
  }, [activeDate, isEn]);

  // Aggregate transactions by date
  const dailyData = useMemo(() => {
    const dateMap = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return;

      // Filter by selected month/year
      if (txDate.getFullYear() !== activeYear || txDate.getMonth() !== activeMonth) {
        return;
      }

      const key = tx.date;
      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          income: 0,
          expense: 0,
          transactions: [],
          receipts: [],
        };
      }

      const amt = Number(tx.amount) || 0;
      if (tx.type === TRANSACTION_TYPES.INCOME || tx.type === TRANSACTION_TYPES.SALE) {
        dateMap[key].income += amt;
      } else {
        dateMap[key].expense += amt;
      }

      dateMap[key].transactions.push(tx);

      if (tx.receiptImages && tx.receiptImages.length > 0) {
        tx.receiptImages.forEach((img) => {
          dateMap[key].receipts.push({
            ...img,
            description: tx.description,
            amountFormatted: formatMoney(tx.amount),
          });
        });
      }
    });

    let list = Object.values(dateMap).map((d) => ({
      ...d,
      net: d.income - d.expense,
    }));

    // Filter if "only with receipts" is checked
    if (filterOnlyWithReceipts) {
      list = list.filter((d) => d.receipts.length > 0);
    }

    // Sort descending (latest day first)
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, activeYear, activeMonth, filterOnlyWithReceipts, formatMoney]);

  // Month Total Summary
  const monthSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalReceipts = 0;

    dailyData.forEach((d) => {
      totalIncome += d.income;
      totalExpense += d.expense;
      totalReceipts += d.receipts.length;
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      receiptCount: totalReceipts,
      daysWithActivity: dailyData.length,
    };
  }, [dailyData]);

  const handleDirectCameraUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const compressedList = await compressMultipleImages(files);
      if (compressedList.length > 0) {
        // Open modal and tell it to auto-analyze this image
        openAddTransactionModal({
          receiptImages: compressedList,
          autoAnalyzeOnMount: true
        });
      }
    } catch (err) {
      alert('Görsel işlenirken bir hata oluştu: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>{t('daily.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('daily.subtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => handleDirectCameraUpload(e.target.files)}
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={isUploading ? Loader2 : Camera}
            disabled={isUploading}
            className={`text-[11px] sm:text-xs font-bold ${isUploading ? 'animate-pulse' : ''} bg-indigo-600 hover:bg-indigo-700 text-white`}
          >
            {isUploading ? t('daily.scanning') : t('daily.quickScan')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddTransactionModal()}
            icon={Plus}
            className="text-[11px] sm:text-xs font-bold w-10 sm:w-auto px-0 sm:px-3 flex justify-center"
            title={t('daily.addTransaction')}
          >
            <span className="hidden sm:inline">{t('daily.addTransaction')}</span>
          </Button>
        </div>
      </div>

      {/* Month Selector Bar & Month KPI Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('daily.prevMonth')}</span>
          </button>

          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
              {monthLabel}
            </h3>
            {selectedMonthOffset !== 0 && (
              <button
                onClick={() => setSelectedMonthOffset(0)}
                className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline font-semibold"
              >
                {t('daily.backToThisMonth')}
              </button>
            )}
          </div>

          <button
            onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden sm:inline">{t('daily.nextMonth')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">{t('daily.monthIncome')}</span>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              +{formatMoney(monthSummary.income)}
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-800/50">
            <span className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">{t('daily.monthExpense')}</span>
            <div className="text-base font-bold text-rose-700 dark:text-rose-400 mt-0.5">
              -{formatMoney(monthSummary.expense)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('daily.monthNet')}</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                monthSummary.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatMoney(monthSummary.net, true)}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">{t('daily.savedReceipts')}</span>
              <div className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 mt-0.5">
                {monthSummary.receiptCount} {t('daily.unitPcs')}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterOnlyWithReceipts}
              onChange={(e) => setFilterOnlyWithReceipts(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {t('daily.onlyWithReceipts')}
            </span>
          </label>

          <span className="text-slate-400 dark:text-slate-500 font-medium">
            {t('daily.activeDays', { count: dailyData.length })}
          </span>
        </div>
      </div>

      {/* Days List */}
      {dailyData.length > 0 ? (
        <div className="space-y-3">
          {dailyData.map((day) => {
            const isProfit = day.net >= 0;
            const hasReceipts = day.receipts.length > 0;

            return (
              <div
                key={day.date}
                onClick={() => openDayDetail(day.date)}
                className="group bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-500/50 transition-all cursor-pointer flex flex-col gap-3"
              >
                {/* Top Row: Date & KPI */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 flex flex-col items-center justify-center font-bold shrink-0 transition-colors border border-slate-200/80 dark:border-slate-700">
                      <span className="text-sm leading-none">
                        {new Date(day.date).getDate()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {new Intl.DateTimeFormat(isEn ? 'en-US' : 'tr-TR', { weekday: 'short' }).format(new Date(day.date))}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {formatDate(day.date, 'long')}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{day.transactions.length} {t('nav.transactions')}</span>
                        {hasReceipts && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 rounded text-[11px]">
                              <Camera className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              {t('daily.receiptCountBadge', { count: day.receipts.length })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Total on the right */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm sm:text-base font-extrabold ${
                        isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatMoney(day.net, true)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 justify-end mt-0.5">
                      {day.income > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{formatMoney(day.income)}</span>}
                      {day.expense > 0 && <span className="text-rose-500 dark:text-rose-400">-{formatMoney(day.expense)}</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Receipt Image Preview Strip if present */}
                {hasReceipts && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      {t('daily.savedReceipts')}:
                    </span>
                    {day.receipts.map((rcpt) => (
                      <div
                        key={rcpt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openReceiptViewer(rcpt);
                        }}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm hover:scale-105 transition-transform"
                        title={`${rcpt.description} (${rcpt.amountFormatted})`}
                      >
                        <img
                          src={rcpt.url}
                          alt={rcpt.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <span className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold ml-auto shrink-0 flex items-center gap-0.5">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            {t('daily.noTxToday')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
            {t('daily.subtitle')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Camera}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('daily.quickScan')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => openAddTransactionModal()}
            >
              {t('daily.addTransaction')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
