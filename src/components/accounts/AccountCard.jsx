import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ACCOUNT_TYPE_CONFIG } from '../../types/index.js';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Wallet,
  Landmark,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightLeft
} from 'lucide-react';

export function AccountCard({ account }) {
  const { formatMoney, openAccountModal, openTransferModal, deleteAccount } = useFinance();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = ACCOUNT_TYPE_CONFIG[account.type] || ACCOUNT_TYPE_CONFIG.cash;

  const getIcon = () => {
    switch (account.type) {
      case 'bank': return <Landmark className="w-5 h-5 text-blue-600" />;
      case 'credit_card': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'investment': return <TrendingUp className="w-5 h-5 text-amber-600" />;
      default: return <Wallet className="w-5 h-5 text-emerald-600" />;
    }
  };

  const isCredit = account.type === 'credit_card';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${config.bgColor}`}>
              {getIcon()}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {account.name}
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {config.label}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 text-xs font-medium animate-slide-up">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openTransferModal();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Para Transferi</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openAccountModal(account);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Düzenle</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sil</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {isCredit ? 'Güncel Borç' : 'Kullanılabilir Bakiye'}
            </span>
            <div
              className={`text-xl font-extrabold tracking-tight mt-0.5 ${
                isCredit && account.balance < 0 ? 'text-purple-700' : account.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatMoney(Math.abs(account.balance))}
              {isCredit && <span className="text-xs text-purple-500 font-normal ml-1">Borç</span>}
            </div>
          </div>

          {account.limit && (
            <div className="text-right text-xs text-slate-500">
              <span>Limit: </span>
              <strong className="text-slate-700">{formatMoney(account.limit)}</strong>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteAccount(account.id)}
        title="Hesabı Sil"
        message={`"${account.name}" hesabını silmek istediğinize emin misiniz?`}
        confirmText="Evet, Sil"
      />
    </>
  );
}
