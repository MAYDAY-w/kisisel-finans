import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { InvestmentCard } from './InvestmentCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatPercent } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Coins,
  LineChart,
  Bitcoin,
  Banknote,
  PieChart,
  ShieldCheck
} from 'lucide-react';

export function InvestmentList() {
  const {
    investments,
    financialSummary,
    formatMoney,
    openAddInvestmentModal,
  } = useFinance();

  const [selectedAssetType, setSelectedAssetType] = useState('all');

  const assetTypes = [
    { id: 'all', label: 'Tümü', icon: PieChart },
    { id: 'gold', label: 'Altın', icon: Coins },
    { id: 'stocks', label: 'Borsa & Hisse', icon: LineChart },
    { id: 'crypto', label: 'Kripto', icon: Bitcoin },
    { id: 'currency', label: 'Döviz', icon: Banknote },
  ];

  const filteredInvestments = useMemo(() => {
    if (selectedAssetType === 'all') return investments;
    return investments.filter((inv) => inv.type === selectedAssetType);
  }, [investments, selectedAssetType]);

  const isOverallProfit = financialSummary.totalInvestmentProfit >= 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Yatırım Portföyü
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Altın, hisse senedi, döviz ve kripto varlıklarınızı takip edin
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openAddInvestmentModal()}
          icon={Plus}
          className="text-xs"
        >
          Varlık Ekle
        </Button>
      </div>

      {/* Portfolio Overview Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Toplam Portföy Değeri
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isOverallProfit
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isOverallProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{formatPercent(financialSummary.totalInvestmentProfitPercent)}</span>
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {formatMoney(financialSummary.totalInvestmentCurrentValue)}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/60 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Toplam Yatırılan Maliyet</div>
              <div className="text-base font-bold text-slate-200 mt-0.5">
                {formatMoney(financialSummary.totalInvestmentCost)}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">Toplam Net Kâr / Zarar</div>
              <div
                className={`text-base font-extrabold mt-0.5 ${
                  isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMoney(financialSummary.totalInvestmentProfit, true)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {assetTypes.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedAssetType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedAssetType(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Asset Cards Grid */}
      {filteredInvestments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInvestments.map((inv) => (
            <InvestmentCard key={inv.id} investment={inv} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
            <Coins className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Varlık Kaydı Bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mb-5">
            Altın, borsa hissesi, döviz veya fon gibi varlıklarınızı ekleyerek kâr/zarar durumunuzu takip edin.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openAddInvestmentModal()}
          >
            Yeni Varlık Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
