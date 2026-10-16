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
  Landmark,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function InvestmentList() {
  const {
    investments,
    financialSummary,
    formatMoney,
    openAddInvestmentModal,
    t,
    getAssetTypeName,
    language,
  } = useFinance();

  const [selectedAssetType, setSelectedAssetType] = useState('all');

  const assetTypes = [
    { id: 'all', label: t('common.all', 'Tümü'), icon: PieChart },
    { id: 'gold', label: getAssetTypeName('gold', 'Altın'), icon: Coins },
    { id: 'stocks', label: getAssetTypeName('stocks', 'Borsa & Hisse'), icon: LineChart },
    { id: 'crypto', label: getAssetTypeName('crypto', 'Kripto'), icon: Bitcoin },
    { id: 'currency', label: getAssetTypeName('currency', 'Döviz'), icon: Banknote },
    { id: 'deposit', label: getAssetTypeName('deposit', 'Vadeli Mevduat'), icon: Landmark },
    { id: 'daily_interest', label: getAssetTypeName('daily_interest', 'Günlük Faiz'), icon: Clock },
  ];

  const filteredInvestments = useMemo(() => {
    if (selectedAssetType === 'all') return investments;
    return investments.filter((inv) => inv.type === selectedAssetType);
  }, [investments, selectedAssetType]);

  const isOverallProfit = (financialSummary?.totalInvestmentProfit ?? 0) >= 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('investments.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('investments.subtitle')}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openAddInvestmentModal()}
          icon={Plus}
          className="text-xs"
        >
          {t('investments.addAsset', 'Varlık Ekle')}
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
              {t('investments.totalPortfolioValue', 'Toplam Portföy Değeri')}
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isOverallProfit
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isOverallProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{formatPercent(financialSummary?.totalInvestmentProfitPercent || 0)}</span>
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {formatMoney(financialSummary?.totalInvestmentCurrentValue || 0)}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/60 text-xs">
            <div>
              <div className="text-slate-400 font-medium">{t('investments.totalCost', 'Toplam Yatırılan Maliyet')}</div>
              <div className="text-base font-bold text-slate-200 mt-0.5">
                {formatMoney(financialSummary?.totalInvestmentCost || 0)}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">{t('investments.totalProfit', 'Toplam Net Kâr / Zarar')}</div>
              <div
                className={`text-base font-extrabold mt-0.5 ${
                  isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatMoney(financialSummary?.totalInvestmentProfit || 0, true)}
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
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <Coins className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            {t('investments.noAssets', 'Varlık Kaydı Bulunamadı')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
            {t('investments.noAssetsDesc', 'Altın, borsa hissesi, döviz veya fon gibi varlıklarınızı ekleyerek kâr/zarar durumunuzu takip edin.')}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openAddInvestmentModal()}
          >
            {t('investments.addAsset', 'Yeni Varlık Ekle')}
          </Button>
        </div>
      )}
    </div>
  );
}
