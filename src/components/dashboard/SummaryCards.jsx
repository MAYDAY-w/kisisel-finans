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
  const { financialSummary, formatMoney, setActiveTab, setInitialTransactionFilter, t } = useFinance();

  const isProfit = financialSummary.totalInvestmentProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Hero Net Balance Card with Dynamic Theme Gradient */}
      <div
        style={{ background: 'var(--primary-gradient)' }}
        className="rounded-3xl p-6 text-white shadow-xl shadow-primary-600/25 relative overflow-hidden transition-all duration-300"
      >
        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
              <span>{t('dashboard.netWorth')}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
              {formatMoney(financialSummary.netWorth)}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90 mt-2 flex-wrap">
              <span>{t('dashboard.walletsAndBanks')}: <strong>{formatMoney(financialSummary.totalBalance)}</strong></span>
              <span>•</span>
              <span>{t('nav.investments')}: <strong>{formatMoney(financialSummary.totalInvestmentCurrentValue)}</strong></span>
            </div>
          </div>

          {/* Monthly Net Savings Pill */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl sm:text-right shrink-0">
            <div className="text-[11px] text-white/80 font-medium">{t('dashboard.netSavings')}</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {formatMoney(financialSummary.monthlySavings, true)}
            </div>
            <div className="text-[11px] text-white/90 font-semibold">
              {t('dashboard.savingsRate')}: {formatPercent(financialSummary.monthlySavingsRate)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Bu Ay Gelir */}
        <Card 
          padding="p-4 sm:p-5" 
          hover 
          onClick={() => {
            setInitialTransactionFilter('income_this_month');
            setActiveTab('transactions');
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.monthlyIncome')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            +{formatMoney(financialSummary.monthlyIncome)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t('common.total')}: {formatMoney(financialSummary.totalIncome)}
          </div>
        </Card>

        {/* Bu Ay Gider */}
        <Card 
          padding="p-4 sm:p-5" 
          hover
          onClick={() => {
            setInitialTransactionFilter('expense_this_month');
            setActiveTab('transactions');
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.monthlyExpenses')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            -{formatMoney(financialSummary.monthlyExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {t('common.total')}: {formatMoney(financialSummary.totalExpenses + financialSummary.totalPurchases)}
          </div>
        </Card>

        {/* Toplam Portföy */}
        <Card
          padding="p-4 sm:p-5"
          hover
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('nav.investments')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
            {formatMoney(financialSummary.totalInvestmentCurrentValue)}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            {t('common.details')} →
          </div>
        </Card>

        {/* Portföy Kâr / Zarar */}
        <Card
          padding="p-4 sm:p-5"
          hover
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investments.totalProfit')}</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isProfit
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-extrabold mt-2 ${
              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(financialSummary.totalInvestmentProfit, true)}
          </div>
          <div
            className={`text-[11px] font-bold mt-1 ${
              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatPercent(financialSummary.totalInvestmentProfitPercent)}
          </div>
        </Card>
      </div>
    </div>
  );
}
