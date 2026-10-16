import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionItem } from '../transactions/TransactionItem';
import { Button } from '../common/Button';
import { ArrowRight, Plus, History } from 'lucide-react';

export function RecentTransactions() {
  const {
    transactions,
    setActiveTab,
    openAddTransactionModal,
    t,
  } = useFinance();

  const recentList = transactions.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('dashboard.recentTransactions', 'Son İşlemler')}</h3>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 hover:underline"
          >
            <span>{t('common.viewAll', 'Tümünü Gör')} ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      {recentList.length > 0 ? (
        <div className="space-y-2">
          {recentList.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('transactions.noTransactions', 'Henüz bir işlem kaydedilmedi.')}</p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openAddTransactionModal()}
          >
            {t('dashboard.addTransaction', 'İlk İşlemi Ekle')}
          </Button>
        </div>
      )}
    </div>
  );
}
