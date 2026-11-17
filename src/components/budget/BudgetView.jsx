import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatPercent } from '../../utils/formatters.js';
import { Target, Plus, AlertTriangle, CheckCircle, Edit2, Trash2, Layers, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function BudgetView() {
  const {
    budgetsWithSpent,
    formatMoney,
    openBudgetModal,
    deleteBudget,
    t,
    getCategoryName,
    overallBudget,
    transactions,
  } = useFinance();

  // Calculate total spent this month (all expenses)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const totalMonthlySpent = React.useMemo(() => {
    return transactions
      .filter((tx) => {
        const d = new Date(tx.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth &&
          (tx.type === 'expense' || tx.type === 'purchase')
        );
      })
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }, [transactions, currentYear, currentMonth]);

  const totalBudgetLimit = budgetsWithSpent.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgetsWithSpent.reduce((acc, b) => acc + b.spent, 0);
  const overallPercent = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // Overall budget data
  const hasOverallBudget = overallBudget && overallBudget.totalBudget > 0;
  const overallBudgetPercent = hasOverallBudget ? (totalMonthlySpent / overallBudget.totalBudget) * 100 : 0;

  const getTierColor = (spent, tier) => {
    if (!tier || tier <= 0) return '';
    if (spent > tier) return 'text-rose-500 dark:text-rose-400';
    if (spent > tier * 0.8) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  const renderTierIndicator = (spent, upper, average, lower) => {
    if (!upper && !average && !lower) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {upper > 0 && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            spent > upper
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
              : spent > upper * 0.8
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {t('budget.upper')}: {formatMoney(upper)}
          </span>
        )}
        {average > 0 && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            spent > average
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400'
          }`}>
            <Minus className="w-3 h-3" />
            {t('budget.average')}: {formatMoney(average)}
          </span>
        )}
        {lower > 0 && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            spent > lower
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
              : 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400'
          }`}>
            <TrendingDown className="w-3 h-3" />
            {t('budget.lower')}: {formatMoney(lower)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>{t('budget.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('budget.subtitle')}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openBudgetModal()}
          icon={Plus}
          className="text-xs font-bold"
        >
          {t('budget.newBudget')}
        </Button>
      </div>

      {/* Overall Budget Banner (if set) */}
      {hasOverallBudget && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                {t('budget.totalBudgetOverview')}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                overallBudgetPercent > 100
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : overallBudgetPercent > 80
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {formatPercent(overallBudgetPercent)} {t('budget.spent')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-indigo-300 font-medium">{t('budget.totalBudget')}</div>
              <div className="text-2xl font-black mt-0.5">{formatMoney(overallBudget.totalBudget)}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-medium">{t('budget.spent')}</div>
              <div className={`text-2xl font-black mt-0.5 ${totalMonthlySpent > overallBudget.totalBudget ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatMoney(totalMonthlySpent)}
              </div>
            </div>
          </div>

          {/* Overall Budget Progress Bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(overallBudgetPercent, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                overallBudgetPercent > 100 ? 'bg-rose-500' : overallBudgetPercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            />
          </div>

          {/* Tier Limits for overall */}
          {(overallBudget.upperLimit > 0 || overallBudget.averageLimit > 0 || overallBudget.lowerLimit > 0) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {overallBudget.upperLimit > 0 && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  totalMonthlySpent > overallBudget.upperLimit
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <TrendingUp className="w-3 h-3" /> {t('budget.upper')}: {formatMoney(overallBudget.upperLimit)}
                </span>
              )}
              {overallBudget.averageLimit > 0 && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  totalMonthlySpent > overallBudget.averageLimit
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <Minus className="w-3 h-3" /> {t('budget.average')}: {formatMoney(overallBudget.averageLimit)}
                </span>
              )}
              {overallBudget.lowerLimit > 0 && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  totalMonthlySpent > overallBudget.lowerLimit
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <TrendingDown className="w-3 h-3" /> {t('budget.lower')}: {formatMoney(overallBudget.lowerLimit)}
                </span>
              )}
            </div>
          )}

          {/* Remaining */}
          <div className="flex items-center justify-between text-[11px] text-indigo-200 pt-1">
            <span>
              {t('budget.remaining')}:{' '}
              <strong className={totalMonthlySpent > overallBudget.totalBudget ? 'text-rose-400' : 'text-emerald-400'}>
                {totalMonthlySpent > overallBudget.totalBudget
                  ? `-${formatMoney(totalMonthlySpent - overallBudget.totalBudget)} ${t('budget.exceededBy')}`
                  : formatMoney(overallBudget.totalBudget - totalMonthlySpent)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Category Budgets Overview Banner */}
      {budgetsWithSpent.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('budget.thisMonth')}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                overallPercent > 100
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {formatPercent(overallPercent)} {t('budget.spent')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">{t('budget.monthlyLimit')}</div>
              <div className="text-2xl font-black mt-0.5">{formatMoney(totalBudgetLimit)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">{t('budget.spent')}</div>
              <div className={`text-2xl font-black mt-0.5 ${totalBudgetSpent > totalBudgetLimit ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatMoney(totalBudgetSpent)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100 ? 'bg-rose-500' : overallPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Budget Cards List */}
      {budgetsWithSpent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetsWithSpent.map((b) => {
            const isOver = b.isExceeded;
            const barColor = isOver ? 'bg-rose-500' : b.percent > 80 ? 'bg-amber-500' : 'bg-emerald-500';
            const catName = b.categoryId ? getCategoryName(b.categoryId, b.categoryName) : b.categoryName;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{catName}</h4>
                    {isOver && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> {t('budget.exceededBy')}!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openBudgetModal(b)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t('budget.spent')}: </span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatMoney(b.spent)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t('budget.monthlyLimit')}: </span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatMoney(b.limit)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  />
                </div>

                {/* Tier limits */}
                {renderTierIndicator(b.spent, b.upperLimit, b.averageLimit, b.lowerLimit)}

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    {t('budget.remaining')}:{' '}
                    <strong className={isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {isOver ? `-${formatMoney(b.spent - b.limit)} ${t('budget.exceededBy')}` : formatMoney(b.remaining)}
                    </strong>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPercent(b.percent)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !hasOverallBudget && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{t('budget.noBudget')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {t('budget.noBudgetSubtitle')}
            </p>
            <Button size="sm" icon={Plus} onClick={() => openBudgetModal()}>
              {t('budget.addFirstBudget')}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
