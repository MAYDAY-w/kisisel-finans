import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatPercent, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit2,
  Trash2,
  Coins,
  LineChart,
  Bitcoin,
  Banknote,
  PieChart,
  MoreVertical
} from 'lucide-react';

export function InvestmentCard({ investment }) {
  const {
    formatMoney,
    openPriceUpdateModal,
    openAddInvestmentModal,
    deleteInvestment,
  } = useFinance();

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const quantity = Number(investment.quantity) || 0;
  const buyPrice = Number(investment.purchasePrice) || 0;
  const currentPrice = Number(
    investment.currentPrice !== undefined ? investment.currentPrice : investment.purchasePrice
  ) || 0;

  const totalCost = quantity * buyPrice;
  const currentValue = quantity * currentPrice;
  const profit = currentValue - totalCost;
  const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const isProfit = profit >= 0;

  const getAssetIcon = (type) => {
    switch (type) {
      case 'gold':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'stocks':
        return <LineChart className="w-5 h-5 text-cyan-600" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5 text-amber-600" />;
      case 'currency':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      default:
        return <PieChart className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between gap-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {getAssetIcon(investment.type)}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {investment.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">
                  {quantity} {investment.unit || 'adet'}
                </span>
                {investment.purchaseDate && (
                  <>
                    <span>•</span>
                    <span>Alış: {formatDate(investment.purchaseDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 text-xs font-medium animate-slide-up">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openPriceUpdateModal(investment);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fiyat Güncelle</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openAddInvestmentModal(investment);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
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

        {/* Pricing Matrix */}
        <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Alış / Maliyet</div>
            <div className="text-slate-800 font-bold mt-0.5">
              {formatMoney(buyPrice)}
              <span className="text-[10px] text-slate-400 font-normal"> / {investment.unit || 'adet'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Toplam: {formatMoney(totalCost)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Güncel Fiyat</span>
              <button
                type="button"
                onClick={() => openPriceUpdateModal(investment)}
                className="text-[10px] text-emerald-600 hover:underline font-semibold"
              >
                Değiştir
              </button>
            </div>
            <div className="text-slate-900 font-bold mt-0.5">
              {formatMoney(currentPrice)}
              <span className="text-[10px] text-slate-400 font-normal"> / {investment.unit || 'adet'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Toplam Değer: <strong>{formatMoney(currentValue)}</strong>
            </div>
          </div>
        </div>

        {/* Profit / Loss Bottom Bar */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Net Kar / Zarar</div>
            <div
              className={`text-sm font-extrabold flex items-center gap-1 mt-0.5 ${
                isProfit ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{formatMoney(profit, true)}</span>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              isProfit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {formatPercent(profitPercent)}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteInvestment(investment.id)}
        title="Varlığı Sil"
        message={`"${investment.name}" portföyünüzden silinsin mi?`}
        confirmText="Evet, Sil"
      />
    </>
  );
}
