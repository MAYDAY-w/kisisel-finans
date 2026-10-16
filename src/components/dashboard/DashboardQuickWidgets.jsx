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
    openAccountDetail,
    openAiAdvisor,
    openSalaryModal,
    t,
    language,
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
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t('dashboard.walletsAndBanks')}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{accounts.length} {t('accounts.accountCount', 'Hesap')}</p>
              </div>
            </div>
            <button
              onClick={openTransferModal}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              title={t('transfer.title', 'Virman')}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{t('transfer.button', 'Virman')}</span>
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            {accounts.slice(0, 3).map((acc) => {
              const config = ACCOUNT_TYPE_CONFIG[acc.type] || ACCOUNT_TYPE_CONFIG.cash;
              return (
                <div
                  key={acc.id}
                  onClick={() => openAccountDetail(acc)}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100/80 dark:border-slate-700/60 text-xs cursor-pointer transition-colors"
                  title={t('accounts.clickToViewDetail')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{config.icon}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{acc.name}</span>
                  </div>
                  <span className={`font-bold ${
                    acc.type === 'credit_card' && acc.balance > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : acc.balance < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {acc.type === 'credit_card' && acc.balance > 0 ? `+${formatMoney(acc.balance)}` : formatMoney(acc.balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('accounts')}
          className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center justify-between w-full group"
        >
          <span>{t('accounts.allAccounts', 'Tüm Hesaplar')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 2. Monthly Budget Progress Widget */}
      <Card padding="p-4 sm:p-5" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t('dashboard.budgetTracking')}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{t('budget.limitTracking', 'Limit Takibi')}</p>
              </div>
            </div>
            {hasExceededBudget && (
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> {t('dashboard.budgetExceeded')}
              </span>
            )}
          </div>

          <div className="mt-3.5">
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.budgetSpent')}:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatMoney(totalBudgetSpent)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetRatio > 90
                    ? 'bg-rose-500'
                    : budgetRatio > 70
                    ? 'bg-amber-500'
                    : 'bg-primary-500'
                }`}
                style={{ width: `${budgetRatio}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-500 dark:text-slate-400">
              <span>{t('dashboard.budgetLimit')}: %{budgetRatio}</span>
              <span>{t('dashboard.budgetRemaining')}: {formatMoney(Math.max(0, totalBudgetLimit - totalBudgetSpent))}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('budget')}
          className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center justify-between w-full group"
        >
          <span>{t('dashboard.budgetDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 3. 🌟 Salary & Subscriptions Countdown Widget */}
      <Card padding="p-4 sm:p-5" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t('dashboard.salaryAndSubs')}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.autoTracking')}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-500" /> {t('dashboard.automatic')}
            </span>
          </div>

          <div className="mt-3.5 space-y-2">
            {/* Salary snapshot */}
            <div
              onClick={openSalaryModal}
              className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 hover:bg-primary-100/80 dark:hover:bg-primary-900/40 border border-primary-100 dark:border-primary-900/50 text-xs cursor-pointer transition-colors"
            >
              {salaryConfig?.amount > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-800 dark:text-primary-300">{t('dashboard.payday')}</span>
                    <span className="font-extrabold text-primary-600 dark:text-primary-400">
                      +{formatMoney(salaryConfig.amount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-primary-700 dark:text-primary-300 font-medium mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary-500" />
                    <span>
                      {isSalaryProcessedThisMonth
                        ? t('dashboard.salaryProcessed')
                        : daysUntilSalary === 0
                        ? t('dashboard.todayPayday')
                        : t('dashboard.daysUntilSalary', { days: daysUntilSalary })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary-800 dark:text-primary-300 block">{t('dashboard.setPayday')}</span>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400">{t('dashboard.setPaydaySubtitle')}</span>
                  </div>
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-200/60 dark:bg-primary-900/60 px-2 py-0.5 rounded-lg">
                    {language === 'en' ? 'Set +' : 'Ayarla +'}
                  </span>
                </div>
              )}
            </div>

            {/* Next subscription snapshot */}
            {nextSubscription && (
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs flex items-center justify-between">
                <div className="truncate">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{t('dashboard.nextPayment')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{nextSubscription.title}</span>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">
                  -{formatMoney(nextSubscription.amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('recurring')}
          className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center justify-between w-full group"
        >
          <span>{t('recurring.title', 'Abonelikleri Yönet')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* 4. AI Financial Coach Widget */}
      <Card
        padding="p-4 sm:p-5"
        className="flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-850 to-primary-950 text-white shadow-md relative overflow-hidden border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary-200 uppercase tracking-wider">{t('nav.aiCoach')}</h3>
                <p className="text-[11px] text-slate-400">{language === 'en' ? 'Smart Advisor' : 'Akıllı Koç'}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> {language === 'en' ? 'Live' : 'Canlı'}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {language === 'en'
              ? 'Analyzes spending habits, debts, and savings potential to deliver tailored financial advice.'
              : 'Harcama alışkanlıklarınızı, borç durumunuzu ve tasarruf potansiyelinizi analiz ederek size özel tasarruf tavsiyeleri sunar.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAiAdvisor}
          className="relative z-10 mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center justify-between w-full group"
        >
          <span>{t('dashboard.consultCoach', 'Finans Koçuna Danış')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
    </div>
  );
}
