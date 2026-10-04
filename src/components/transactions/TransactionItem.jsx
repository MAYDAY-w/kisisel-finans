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
    openReceiptViewer
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
      <div className="relative group bg-white hover:bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex items-center justify-between gap-3">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${typeConfig.iconBg}`}
          >
            {getIcon()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {transaction.description || transaction.categoryName || 'İşlem'}
              </h4>
              <Badge variant={typeConfig.color} size="sm">
                {typeConfig.label}
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
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                  title="Fiş görselini görüntüle"
                >
                  <Camera className="w-3 h-3 text-emerald-600" />
                  <span>{receiptCount > 1 ? `${receiptCount} Fiş` : 'Fiş'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-medium text-slate-600">{transaction.categoryName || 'Genel'}</span>
              <span>•</span>
              <span>{formatDate(transaction.date, 'relative')}</span>

              {/* Quantity / Unit price if present */}
              {transaction.quantity && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    <Package className="w-3 h-3 text-slate-400" />
                    {transaction.quantity} adet
                    {transaction.unitPrice ? ` @ ${formatMoney(transaction.unitPrice)}` : ''}
                  </span>
                </>
              )}
            </div>

            {transaction.note && (
              <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
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
                isPositive ? 'text-emerald-600' : 'text-slate-900'
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
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-slide-up text-xs font-medium">
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
                      className="w-full text-left px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Fişi Gör</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      openAddTransactionModal(transaction);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      duplicateTransaction(transaction.id);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kopyala</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sil</span>
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
        title="İşlemi Sil"
        message={`"${transaction.description || 'Bu işlem'}" kaydını kalıcı olarak silmek istediğinize emin misiniz?`}
        confirmText="Evet, Sil"
      />
    </>
  );
}
