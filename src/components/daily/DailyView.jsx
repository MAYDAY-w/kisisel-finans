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
  Sparkles
} from 'lucide-react';

export function DailyView() {
  const {
    transactions,
    formatMoney,
    openDayDetail,
    openAddTransactionModal,
    openReceiptViewer,
  } = useFinance();

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
    return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(activeDate);
  }, [activeDate]);

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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <span>Günlük Takip & Fişler</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gün gün harcamalarınızı ve alışveriş fişi fotoğraflarınızı inceleyin
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openAddTransactionModal()}
          icon={Plus}
          className="text-xs font-bold"
        >
          Yeni Fiş / İşlem
        </Button>
      </div>

      {/* Month Selector Bar & Month KPI Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Önceki Ay</span>
          </button>

          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
              {monthLabel}
            </h3>
            {selectedMonthOffset !== 0 && (
              <button
                onClick={() => setSelectedMonthOffset(0)}
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                Bu Aya Dön
              </button>
            )}
          </div>

          <button
            onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden sm:inline">Sonraki Ay</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-medium">Ay Geliri</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5">
              +{formatMoney(monthSummary.income)}
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-[11px] text-rose-800 font-medium">Ay Gideri</span>
            <div className="text-base font-bold text-rose-700 mt-0.5">
              -{formatMoney(monthSummary.expense)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Ay Net Fark</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                monthSummary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatMoney(monthSummary.net, true)}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-900 font-medium">Kayıtlı Fiş</span>
              <div className="text-base font-extrabold text-emerald-800 mt-0.5">
                {monthSummary.receiptCount} Adet
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
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
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-slate-700 font-medium">
              Yalnızca fiş fotoğrafı olan günleri göster
            </span>
          </label>

          <span className="text-slate-400 font-medium">
            {dailyData.length} aktif gün
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
                className="group bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col gap-3"
              >
                {/* Top Row: Date & KPI */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 flex flex-col items-center justify-center font-bold shrink-0 transition-colors border border-slate-200/80">
                      <span className="text-sm leading-none">
                        {new Date(day.date).getDate()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                        {new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(new Date(day.date))}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {formatDate(day.date, 'long')}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{day.transactions.length} işlem</span>
                        {hasReceipts && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              <Camera className="w-3 h-3 text-emerald-600" />
                              {day.receipts.length} Fiş
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
                        isProfit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatMoney(day.net, true)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-end mt-0.5">
                      {day.income > 0 && <span className="text-emerald-600">+{formatMoney(day.income)}</span>}
                      {day.expense > 0 && <span className="text-rose-500">-{formatMoney(day.expense)}</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Receipt Image Preview Strip if present */}
                {hasReceipts && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      Fişler:
                    </span>
                    {day.receipts.map((rcpt) => (
                      <div
                        key={rcpt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openReceiptViewer(rcpt);
                        }}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm hover:scale-105 transition-transform"
                        title={`${rcpt.description} (${rcpt.amountFormatted})`}
                      >
                        <img
                          src={rcpt.url}
                          alt={rcpt.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <span className="text-[11px] text-emerald-600 font-semibold ml-auto shrink-0 flex items-center gap-0.5">
                      Detayları Gör <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Bu Ay İçin Kayıt Bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            {filterOnlyWithReceipts
              ? 'Seçili ayda fiş fotoğrafı yüklenmiş bir işlem bulunamadı.'
              : 'Seçili ay için henüz bir harcama veya fiş kaydedilmemiş. İlk fişinizi hemen ekleyin.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openAddTransactionModal()}
          >
            Yeni Fiş / İşlem Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
