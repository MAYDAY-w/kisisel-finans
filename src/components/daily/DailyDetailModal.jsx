import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TransactionItem } from '../transactions/TransactionItem';
import { formatDate } from '../../utils/formatters';
import { TRANSACTION_TYPES } from '../../types';
import {
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  Plus,
  Inbox,
  Eye,
  Wallet,
  Sparkles
} from 'lucide-react';

export function DailyDetailModal() {
  const {
    selectedDayForDetail,
    closeDayDetail,
    transactions,
    formatMoney,
    openAddTransactionModal,
    openReceiptViewer,
    t,
  } = useFinance();

  // Filter transactions for this day
  const dayTransactions = useMemo(() => {
    if (!selectedDayForDetail) return [];
    return transactions.filter((tx) => tx.date === selectedDayForDetail);
  }, [selectedDayForDetail, transactions]);

  // Compute daily totals
  const daySummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const allReceipts = [];

    dayTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === TRANSACTION_TYPES.INCOME || tx.type === TRANSACTION_TYPES.SALE) {
        income += amt;
      } else {
        expense += amt;
      }

      if (tx.receiptImages && tx.receiptImages.length > 0) {
        tx.receiptImages.forEach((img) => {
          allReceipts.push({
            ...img,
            description: tx.description,
            amountFormatted: formatMoney(tx.amount),
            type: tx.type,
            transactionId: tx.id,
          });
        });
      }
    });

    return {
      income,
      expense,
      net: income - expense,
      receipts: allReceipts,
      count: dayTransactions.length,
    };
  }, [dayTransactions, formatMoney]);

  if (!selectedDayForDetail) return null;

  const handleAddForThisDay = () => {
    closeDayDetail();
    openAddTransactionModal({
      date: selectedDayForDetail,
    });
  };

  const isNetPositive = daySummary.net >= 0;

  return (
    <Modal
      isOpen={Boolean(selectedDayForDetail)}
      onClose={closeDayDetail}
      title={`${formatDate(selectedDayForDetail, 'long')} - ${t('daily.modalTitle')}`}
      subtitle={t('daily.modalSubtitle')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Day Metric Banner */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{t('dashboard.netWorth')}</span>
            </div>
            <span className="font-semibold text-slate-300">
              {daySummary.count} {t('nav.transactions')} • {daySummary.receipts.length} {t('daily.savedReceipts')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">{t('dashboard.monthlyIncome')}</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                +{formatMoney(daySummary.income)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">{t('dashboard.monthlyExpense')}</div>
              <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
                -{formatMoney(daySummary.expense)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Net</div>
              <div
                className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                  isNetPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMoney(daySummary.net, true)}
              </div>
            </div>
          </div>
        </div>

        {/* RECEIPT PHOTO GALLERY FOR THIS DAY */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {t('daily.receiptsTitle')}
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {t('daily.receiptCountBadge', { count: daySummary.receipts.length })}
            </span>
          </div>

          {daySummary.receipts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {daySummary.receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  onClick={() => openReceiptViewer(receipt)}
                  className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    <img
                      src={receipt.url}
                      alt={receipt.name || 'Receipt'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-white/90 rounded-full text-slate-900 shadow">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 text-xs flex flex-col justify-between flex-1 bg-white">
                    <span className="font-bold text-slate-900 truncate">
                      {receipt.description || 'Receipt'}
                    </span>
                    <span className="text-emerald-600 font-extrabold mt-1">
                      {receipt.amountFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center py-5">
              <Camera className="w-6 h-6 text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-500">
                {t('daily.noTxToday')}
              </p>
            </div>
          )}
        </div>

        {/* TRANSACTIONS OF THIS DAY */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              {t('daily.allDayTx')}
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {dayTransactions.length} {t('nav.transactions')}
            </span>
          </div>

          {dayTransactions.length > 0 ? (
            <div className="space-y-2">
              {dayTransactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-xs text-slate-500">{t('daily.noTxToday')}</p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
          <Button variant="secondary" onClick={closeDayDetail} className="flex-1">
            {t('common.close')}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddForThisDay}
            className="flex-1 font-bold"
          >
            {t('daily.addTxToDay')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
