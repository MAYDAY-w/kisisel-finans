import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatPercent } from '../../utils/formatters.js';
import { Target, Plus, AlertTriangle, CheckCircle, Edit2, Trash2 } from 'lucide-react';

export function BudgetView() {
  const {
    budgetsWithSpent,
    formatMoney,
    openBudgetModal,
    deleteBudget,
  } = useFinance();

  const totalBudgetLimit = budgetsWithSpent.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgetsWithSpent.reduce((acc, b) => acc + b.spent, 0);
  const overallPercent = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            <span>Bütçe Planlama</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kategori bazlı harcama limitleri koyarak bütçenizi kontrol altında tutun
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openBudgetModal()}
          icon={Plus}
          className="text-xs font-bold"
        >
          Bütçe Belirle
        </Button>
      </div>

      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bu Ayki Toplam Bütçe Durumu
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              overallPercent > 100
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            %{overallPercent.toFixed(0)} Kullanıldı
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Toplam Bütçe Limiti</div>
            <div className="text-2xl font-black mt-0.5">{formatMoney(totalBudgetLimit)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Harcanan Tutar</div>
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

      {/* Budget Cards List */}
      {budgetsWithSpent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetsWithSpent.map((b) => {
            const isOver = b.isExceeded;
            const barColor = isOver ? 'bg-rose-500' : b.percent > 80 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{b.categoryName}</h4>
                    {isOver && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Limit Aşıldı!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openBudgetModal(b)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Harcanan: </span>
                    <strong className="text-slate-800 font-bold">{formatMoney(b.spent)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px]">Limit: </span>
                    <strong className="text-slate-800 font-bold">{formatMoney(b.limit)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Kalan:{' '}
                    <strong className={isOver ? 'text-rose-600' : 'text-emerald-600'}>
                      {isOver ? `-${formatMoney(b.spent - b.limit)} fazla` : formatMoney(b.remaining)}
                    </strong>
                  </span>
                  <span className="font-semibold text-slate-700">%{b.percent.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <Target className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Bütçe Belirlenmedi</h3>
          <p className="text-xs text-slate-500 mb-5">
            Kategorilerinize aylık harcama limitleri koyarak gereksiz harcamaları engelleyin.
          </p>
          <Button size="sm" icon={Plus} onClick={() => openBudgetModal()}>
            İlk Bütçeyi Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
