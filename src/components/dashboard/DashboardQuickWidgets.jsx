import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  Wallet,
  Landmark,
  CreditCard,
  Target,
  Bot,
  ArrowRightLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Repeat,
  Clock,
  Zap
} from 'lucide-react';
import { ACCOUNT_TYPE_CONFIG } from '../../types/index.js';

export function DashboardQuickWidgets() {
  const {
    accounts,
    budgetsWithSpent,
    recurring,
    salaryConfig,
    formatMoney,
    setActiveTab,
    openTransferModal,
    openAiAdvisor,
    openSalaryModal,
  } = useFinance();

  const now = new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentPeriodKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Budget computations
  const totalBudgetLimit = budgetsWithSpent.reduce((acc, b) => acc + (b.limit || 0), 0);
  const totalBudgetSpent = budgetsWithSpent.reduce((acc, b) => acc + (b.spent || 0), 0);
  const budgetRatio = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100)) : 0;
  const hasExceededBudget = budgetsWithSpent.some((b) => b.isExceeded);

  // Salary computations
  const salaryDay = salaryConfig?.dayOfMonth || 1;
  let daysUntilSalary = 0;
  if (salaryDay === currentDay) {
    daysUntilSalary = 0;
  } else if (salaryDay > currentDay) {
    daysUntilSalary = salaryDay - currentDay;
  } else {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    daysUntilSalary = daysInMonth - currentDay + salaryDay;
  }

  const isSalaryProcessedThisMonth = salaryConfig?.lastProcessedPeriod === currentPeriodKey;

  // Next recurring item
  const nextSubscription = recurring.find(
    (r) => !r.isSalary && r.isActive && r.dayOfMonth >= currentDay
  ) || recurring.find((r) => !r.isSalary && r.isActive);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Accounts & Wallets Quick Widget */}
      <Card padding="p-4 sm:p-5" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cüzdan & Bankalar</h3>
                <p className="text-[11px] text-slate-400">{accounts.length} Hesap</p>
              </div>
            </div>
            <button
              onClick={openTransferModal}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              title="Virman / Transfer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Virman</span>
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            {accounts.slice(0, 3).map((acc) => {
              const config = ACCOUNT_TYPE_CONFIG[acc.type] || ACCOUNT_TYPE_CONFIG.cash;
              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/80 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{config.icon}</span>
                    <span className="font-semibold text-slate-800 truncate">{acc.name}</span>
                  </div>
                  <span className={`font-bold ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatMoney(acc.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('accounts')}
          className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-between w-full group"
        >
          <span>Tüm Hesaplar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 2. Monthly Budget Progress Widget */}
      <Card padding="p-4 sm:p-5" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aylık Bütçe</h3>
                <p className="text-[11px] text-slate-400">Limit Takibi</p>
              </div>
            </div>
            {hasExceededBudget && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Aşım
              </span>
            )}
          </div>

          <div className="mt-3.5">
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-medium">Harcanan:</span>
              <span className="font-bold text-slate-900">
                {formatMoney(totalBudgetSpent)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetRatio > 90
                    ? 'bg-rose-500'
                    : budgetRatio > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetRatio}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-500">
              <span>Limit: %{budgetRatio}</span>
              <span>Kalan: {formatMoney(Math.max(0, totalBudgetLimit - totalBudgetSpent))}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('budget')}
          className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-between w-full group"
        >
          <span>Bütçe Detayları</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 3. 🌟 Salary & Subscriptions Countdown Widget */}
      <Card padding="p-4 sm:p-5" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Maaş & Abonelik</h3>
                <p className="text-[11px] text-slate-400">Otomatik Takip</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-500" /> Otomatik
            </span>
          </div>

          <div className="mt-3.5 space-y-2">
            {/* Salary snapshot */}
            <div
              onClick={openSalaryModal}
              className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 text-xs cursor-pointer transition-colors"
            >
              {salaryConfig?.amount > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-800">Maaş Günü</span>
                    <span className="font-extrabold text-emerald-600">
                      +{formatMoney(salaryConfig.amount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>
                      {daysUntilSalary === 0
                        ? '🎉 Bugün Maaş Günü!'
                        : `${daysUntilSalary} gün kaldı (${salaryDay} ${now.toLocaleDateString('tr-TR', { month: 'short' })})`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-800 block">Maaş Gününü Belirle</span>
                    <span className="text-[10px] text-emerald-600">Aylık gelir için tıklayın</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-lg">
                    Ayarla +
                  </span>
                </div>
              )}
            </div>

            {/* Next subscription snapshot */}
            {nextSubscription && (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <div className="truncate">
                  <span className="text-[11px] text-slate-500 block truncate">Sıradaki Ödeme:</span>
                  <span className="font-bold text-slate-800 truncate">{nextSubscription.title}</span>
                </div>
                <span className="font-bold text-rose-600 shrink-0">
                  -{formatMoney(nextSubscription.amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('recurring')}
          className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-between w-full group"
        >
          <span>Abonelikleri Yönet</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 4. AI Financial Coach Widget */}
      <Card
        padding="p-4 sm:p-5"
        className="flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">AI Finans Danışmanı</h3>
                <p className="text-[11px] text-slate-400">Akıllı Koç</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Canlı
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Harcama alışkanlıklarınızı, borç durumunuzu ve tasarruf potansiyelinizi analiz ederek size özel tasarruf tavsiyeleri sunar.
          </p>
        </div>

        <button
          type="button"
          onClick={openAiAdvisor}
          className="relative z-10 mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between w-full group"
        >
          <span>Finans Koçuna Danış</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
    </div>
  );
}
