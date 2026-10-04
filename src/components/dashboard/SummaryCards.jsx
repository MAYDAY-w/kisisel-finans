import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { formatPercent } from '../../utils/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles
} from 'lucide-react';

export function SummaryCards() {
  const { financialSummary, formatMoney, setActiveTab } = useFinance();

  const isProfit = financialSummary.totalInvestmentProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Hero Net Balance Card */}
      <div className="bg-gradient-to-tr from-emerald-600 via-emerald-600 to-teal-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Net Toplam Varlık & Bakiye</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              {formatMoney(financialSummary.netWorth)}
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100/90 mt-2 flex-wrap">
              <span>Nakit Bakiye: <strong>{formatMoney(financialSummary.totalBalance)}</strong></span>
              <span>•</span>
              <span>Portföy: <strong>{formatMoney(financialSummary.totalInvestmentCurrentValue)}</strong></span>
            </div>
          </div>

          {/* Monthly Net Savings Pill */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl sm:text-right shrink-0">
            <div className="text-[11px] text-emerald-100 font-medium">Bu Ayki Net Tasarruf</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {formatMoney(financialSummary.monthlySavings, true)}
            </div>
            <div className="text-[11px] text-emerald-200 font-semibold">
              Tasarruf Oranı: {formatPercent(financialSummary.monthlySavingsRate)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Bu Ay Gelir */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bu Ay Gelir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-2">
            +{formatMoney(financialSummary.monthlyIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Toplam: {formatMoney(financialSummary.totalIncome)}
          </div>
        </Card>

        {/* Bu Ay Gider */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bu Ay Gider</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 mt-2">
            -{formatMoney(financialSummary.monthlyExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Toplam: {formatMoney(financialSummary.totalExpenses + financialSummary.totalPurchases)}
          </div>
        </Card>

        {/* Toplam Portföy */}
        <Card
          padding="p-4 sm:p-5"
          hover
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Yatırım Portföyü</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            {formatMoney(financialSummary.totalInvestmentCurrentValue)}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            Portföyü Görüntüle →
          </div>
        </Card>

        {/* Portföy Kâr / Zarar */}
        <Card
          padding="p-4 sm:p-5"
          hover
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Portföy K/Z</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-extrabold mt-2 ${
              isProfit ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatMoney(financialSummary.totalInvestmentProfit, true)}
          </div>
          <div
            className={`text-[11px] font-bold mt-1 ${
              isProfit ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPercent(financialSummary.totalInvestmentProfitPercent)}
          </div>
        </Card>
      </div>
    </div>
  );
}
