import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_CONFIG } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Coins,
  TrendingUp,
  MoreHorizontal,
  Package,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export function TransactionItem({ transaction }) {
  const {
    formatMoney,
    openAddTransactionModal,
    duplicateTransaction,
    deleteTransaction,
    openReceiptViewer,
    t,
    getCategoryName,
    getTransactionTypeName,
    language,
  } = useFinance();

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type] || TRANSACTION_TYPE_CONFIG[TRANSACTION_TYPES.EXPENSE];

  const getIcon = () => {
    switch (transaction.type) {
      case TRANSACTION_TYPES.INCOME:
        return <ArrowUpRight className="w-5 h-5 text-emerald-600" />;
      case TRANSACTION_TYPES.EXPENSE:
        return <ArrowDownLeft className="w-5 h-5 text-rose-600" />;
      case TRANSACTION_TYPES.PURCHASE:
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case TRANSACTION_TYPES.SALE:
        return <Coins className="w-5 h-5 text-amber-600" />;
      case TRANSACTION_TYPES.INVESTMENT:
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <MoreHorizontal className="w-5 h-5 text-slate-600" />;
    }
  };

  const isPositive = transaction.type === TRANSACTION_TYPES.INCOME || transaction.type === TRANSACTION_TYPES.SALE;
  const amountFormatted = formatMoney(transaction.amount);
  const receiptCount = transaction.receiptImages?.length || 0;

  return (
    <>
      <div className="relative group bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${typeConfig.iconBg}`}
          >
            {getIcon()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {transaction.description || getCategoryName(transaction.categoryId, transaction.categoryName) || t('transactions.transaction', 'İşlem')}
              </h4>
              <Badge variant={typeConfig.color} size="sm">
                {getTransactionTypeName(transaction.type, typeConfig.label)}
              </Badge>

              {/* Receipt indicator badge */}
              {receiptCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openReceiptViewer({
                      ...transaction.receiptImages[0],
                      description: transaction.description,
                      amountFormatted: isPositive ? `+${amountFormatted}` : `-${amountFormatted}`,
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md transition-colors"
                  title={language === 'en' ? 'View receipt image' : 'Fiş görselini görüntüle'}
                >
                  <Camera className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{receiptCount > 1 ? `${receiptCount} ${language === 'en' ? 'Receipts' : 'Fiş'}` : (language === 'en' ? 'Receipt' : 'Fiş')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {getCategoryName(transaction.categoryId, transaction.categoryName) || (language === 'en' ? 'General' : 'Genel')}
              </span>
              <span>•</span>
              <span>{formatDate(transaction.date, 'relative')}</span>

              {/* Quantity / Unit price if present */}
              {transaction.quantity && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                    <Package className="w-3 h-3 text-slate-400" />
                    {transaction.quantity} {language === 'en' ? 'pcs' : 'adet'}
                    {transaction.unitPrice ? ` @ ${formatMoney(transaction.unitPrice)}` : ''}
                  </span>
                </>
              )}
            </div>

            {transaction.note && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 leading-relaxed whitespace-pre-wrap">
                "{transaction.note}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Amount & Actions Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div
              className={`text-sm sm:text-base font-extrabold tracking-tight ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {isPositive ? `+${amountFormatted}` : `-${amountFormatted}`}
            </div>
          </div>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-30 animate-slide-up text-xs font-medium text-slate-700 dark:text-slate-200">
                  {receiptCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        openReceiptViewer({
                          ...transaction.receiptImages[0],
                          description: transaction.description,
                          amountFormatted: isPositive ? `+${amountFormatted}` : `-${amountFormatted}`,
                        });
                      }}
                      className="w-full text-left px-3.5 py-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'View Receipt' : 'Fişi Gör'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      openAddTransactionModal(transaction);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{t('common.edit')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      duplicateTransaction(transaction.id);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{t('common.copy')}</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTransaction(transaction.id)}
        title={t('common.delete')}
        message={language === 'en' ? `Are you sure you want to delete "${transaction.description || 'this transaction'}"? This action cannot be undone.` : `"${transaction.description || 'Bu işlem'}" kaydını kalıcı olarak silmek istediğinize emin misiniz?`}
        confirmText={language === 'en' ? 'Yes, Delete' : 'Evet, Sil'}
      />
    </>
  );
}
