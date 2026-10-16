import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AutoProcessBanner() {
  const {
    autoProcessBanner,
    dismissAutoProcessBanner,
    setActiveTab,
    formatMoney,
    t,
  } = useFinance();

  if (!autoProcessBanner || !autoProcessBanner.items || autoProcessBanner.items.length === 0) {
    return null;
  }

  const { items, periodName, isNightlyInterest } = autoProcessBanner;

  return (
    <div
      className={`shadow-lg animate-slide-down ${
        isNightlyInterest
          ? 'bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 text-white'
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            {isNightlyInterest ? (
              <span className="text-sm">🌙</span>
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-100" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                {isNightlyInterest ? t('autoProcess.nightlyTitle') : t('autoProcess.title')}
              </span>
              <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold">
                {periodName}
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>
                {isNightlyInterest ? t('autoProcess.nightlyDesc') : t('autoProcess.dueCount', { count: items.length })}
              </span>
              <div className="inline-flex items-center gap-1 font-semibold text-white">
                {items.map((it, idx) => (
                  <span key={it.id || idx} className="bg-black/20 border border-white/10 px-1.5 py-0.2 rounded-md">
                    {isNightlyInterest ? (
                      <>
                        {it.name} (+{formatMoney(it.netDaily)}) &rarr; {it.accountName}
                      </>
                    ) : (
                      <>
                        {it.title} ({it.type === 'income' || it.isSalary ? '+' : '-'}{formatMoney(it.amount)})
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('transactions');
              dismissAutoProcessBanner();
            }}
            className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
          >
            <span>{t('autoProcess.viewTransactions')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={dismissAutoProcessBanner}
            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
