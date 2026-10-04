import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { calculateExpensesByCategory } from '../../utils/calculations';
import { formatPercent } from '../../utils/formatters';
import { PieChart, ShoppingBag } from 'lucide-react';

export function ExpenseCategoryChart() {
  const { transactions, categories, formatMoney } = useFinance();

  const { categories: categoryData, grandTotal } = useMemo(() => {
    return calculateExpensesByCategory(transactions, categories);
  }, [transactions, categories]);

  if (grandTotal === 0 || categoryData.length === 0) {
    return (
      <Card padding="p-5">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Kategori Dağılımı</h3>
        </div>
        <p className="text-xs text-slate-400 py-6 text-center">
          Henüz harcama kaydı bulunmuyor.
        </p>
      </Card>
    );
  }

  // Top 5 categories + Others
  const topCategories = categoryData.slice(0, 5);
  const otherTotal = categoryData.slice(5).reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card padding="p-5" className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Kategoriye Göre Harcamalar</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Toplam: {formatMoney(grandTotal)}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5 shadow-inner">
          {topCategories.map((cat) => (
            <div
              key={cat.id}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color || '#64748b',
              }}
              title={`${cat.name}: %${cat.percentage.toFixed(1)}`}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            />
          ))}
          {otherTotal > 0 && (
            <div
              style={{
                width: `${(otherTotal / grandTotal) * 100}%`,
                backgroundColor: '#cbd5e1',
              }}
              title={`Diğer: %${((otherTotal / grandTotal) * 100).toFixed(1)}`}
              className="h-full rounded-r-full"
            />
          )}
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {topCategories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#64748b' }}
                  />
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-slate-900 font-bold">{formatMoney(cat.total)}</span>
                  <span className="text-slate-400 text-[11px] w-10 text-right">
                    {formatPercent(cat.percentage)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || '#64748b',
                  }}
                />
              </div>
            </div>
          ))}

          {otherTotal > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="font-medium">Diğer Kategoriler</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">{formatMoney(otherTotal)}</span>
                  <span className="text-slate-400 text-[11px] w-10 text-right">
                    {formatPercent((otherTotal / grandTotal) * 100)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
