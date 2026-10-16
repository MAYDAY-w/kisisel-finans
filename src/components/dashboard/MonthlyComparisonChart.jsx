import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { calculateLast6MonthsTrend } from '../../utils/calculations';
import { BarChart3 } from 'lucide-react';

export function MonthlyComparisonChart() {
  const { transactions, formatMoney, t } = useFinance();

  const trendData = useMemo(() => {
    return calculateLast6MonthsTrend(transactions);
  }, [transactions]);

  // Find max value for scaling bar heights
  const maxVal = useMemo(() => {
    let max = 1000;
    trendData.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15;
  }, [trendData]);

  return (
    <Card padding="p-5" className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('dashboard.monthlyTrend', 'Aylık Gelir & Gider Trendi')}</h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('transactions.income', 'Gelir')}
            </span>
            <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> {t('transactions.expense', 'Gider')}
            </span>
          </div>
        </div>

        {/* 6-Month Bar Chart */}
        <div className="h-44 pt-4 flex items-end justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          {trendData.map((d) => {
            const incomeHeight = maxVal > 0 ? (d.income / maxVal) * 100 : 0;
            const expenseHeight = maxVal > 0 ? (d.expense / maxVal) * 100 : 0;

            return (
              <div key={d.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-32 px-1">
                  {/* Income bar */}
                  <div
                    style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                    className="w-full max-w-[14px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-600 relative"
                    title={`Gelir: ${formatMoney(d.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                    className="w-full max-w-[14px] bg-rose-400 rounded-t-md transition-all duration-300 group-hover:bg-rose-500 relative"
                    title={`Gider: ${formatMoney(d.expense)}`}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footnote with current month balance */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{t('dashboard.sixMonthFlow', 'Son 6 aylık nakit akışı')}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Net: {formatMoney(trendData[trendData.length - 1]?.net || 0, true)}
          </span>
        </div>
      </div>
    </Card>
  );
}
