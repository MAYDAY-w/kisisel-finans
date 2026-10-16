import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import {
  Repeat,
  Plus,
  CheckCircle,
  Trash2,
  Calendar,
  Sparkles,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Clock,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';

export function RecurringView() {
  const {
    recurring,
    formatMoney,
    accounts,
    openRecurringModal,
    deleteRecurring,
    toggleRecurringAutoProcess,
    toggleRecurringActive,
    processRecurringPayment,
    runAutoProcessCheck,
    salaryConfig,
    openSalaryModal,
    t,
    language,
  } = useFinance();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [manualCheckMsg, setManualCheckMsg] = useState(null);

  const now = new Date();
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentPeriodKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Helper for days until scheduled day of month
  const getDaysUntil = (targetDay) => {
    const day = Number(targetDay) || 1;
    if (day === currentDay) return { days: 0, label: language === 'en' ? 'Due today!' : 'Bugün vadesi!' };
    if (day > currentDay) {
      const diff = day - currentDay;
      return { days: diff, label: language === 'en' ? `${diff} days left` : `${diff} gün kaldı` };
    }
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const diff = daysInMonth - currentDay + day;
    return { days: diff, label: language === 'en' ? `Next month (${diff} days)` : `Gelecek ay (${diff} gün)` };
  };

  // Salary calculations
  const salaryDay = salaryConfig?.dayOfMonth || 1;
  const salaryCountdown = getDaysUntil(salaryDay);
  const salaryAccount = accounts.find((a) => a.id === salaryConfig?.accountId);
  const isSalaryProcessedThisMonth = salaryConfig?.lastProcessedPeriod === currentPeriodKey;

  // Monthly sums
  const totalRegularIncome = recurring
    .filter((r) => r.isActive && (r.type === 'income' || r.isSalary))
    .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const totalRegularExpense = recurring
    .filter((r) => r.isActive && r.type !== 'income' && !r.isSalary)
    .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const netRegularCashflow = totalRegularIncome - totalRegularExpense;

  // Filter list (exclude designated salary from subscriptions list to avoid confusion, or display with badge)
  const filteredList = recurring.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'income') return r.type === 'income' || r.isSalary;
    if (filterType === 'expense') return r.type === 'expense' && !r.isSalary;
    return true;
  });

  const handleManualCheck = () => {
    const res = runAutoProcessCheck();
    if (res && res.count > 0) {
      setManualCheckMsg(`${res.count} adet vadesi gelen işlem otomatik gerçekleştirildi!`);
    } else {
      setManualCheckMsg('Tüm düzenli işlemleriniz ve maaş durumunuz güncel!');
    }
    setTimeout(() => setManualCheckMsg(null), 3500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>{t('recurring.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('recurring.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Zap}
            onClick={handleManualCheck}
            className="text-xs font-semibold text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40"
          >
            {language === 'en' ? 'Check Due Now' : 'Otomatik Denetle'}
          </Button>

          <Button
            size="sm"
            onClick={() => openRecurringModal()}
            icon={Plus}
            className="text-xs font-bold"
          >
            {t('recurring.addRecurring', 'Abonelik Ekle')}
          </Button>
        </div>
      </div>

      {/* Temporary Feedback Message */}
      {manualCheckMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{manualCheckMsg}</span>
        </div>
      )}

      {/* 🌟 1. HERO CARD: MAAŞ GÜNÜ & GERİ SAYIM */}
      <div className="bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {t('recurring.salaryTracking', 'Maaş Günü Takibi')}
              </span>

              {salaryConfig?.amount > 0 && salaryConfig?.autoProcess !== false && (
                <span className="text-[11px] font-bold bg-emerald-400/25 border border-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> {language === 'en' ? 'Auto Deposited' : 'Otomatik Hesaba Yatar'}
                </span>
              )}
            </div>

            <div>
              {salaryConfig?.amount > 0 ? (
                <>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">
                    +{formatMoney(salaryConfig.amount)}
                  </div>
                  <p className="text-xs text-emerald-100 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{language === 'en' ? `Day ${salaryDay} of every month` : `Her ayın ${salaryDay}. günü`}</span>
                    <span>•</span>
                    <span>{language === 'en' ? 'Target Account' : 'Yatacağı Hesap'}: <strong>{salaryAccount?.name || (language === 'en' ? 'Not selected' : 'Seçilmedi')}</strong></span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    {t('dashboard.setPayday', 'Maaş Gününüzü Belirleyin')}
                  </div>
                  <p className="text-xs text-emerald-100 font-medium mt-1">
                    {language === 'en'
                      ? 'Set your monthly salary and payment day to automate account deposit tracking.'
                      : 'Aylık net maaşınızı ve ödeme gününüzü girerek günü geldiğinde otomatik hesaba yatmasını sağlayın.'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Countdown & Edit Action */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
            {salaryConfig?.amount > 0 ? (
              <div className="text-left md:text-right">
                <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                  {language === 'en' ? 'Salary Status' : 'Maaş Durumu'}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{salaryCountdown.label}</span>
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5 font-medium">
                  {isSalaryProcessedThisMonth
                    ? (language === 'en' ? '✅ Processed this month (Waiting for next month)' : '✅ Bu ayki maaş işlendi (Gelecek ay bekleniyor)')
                    : `${language === 'en' ? 'Next: ' : 'Sıradaki: '}${salaryDay} ${now.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}`}
                </div>
              </div>
            ) : (
              <div className="text-left md:text-right">
                <div className="text-sm font-bold text-white">
                  {language === 'en' ? 'Not Configured Yet' : 'Henüz Ayarlanmadı'}
                </div>
                <div className="text-[11px] text-emerald-100 mt-0.5">
                  {language === 'en' ? 'Set payday in 1 tap' : '1 tıkla maaş gününüzü tanımlayın'}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {salaryConfig?.amount > 0 && (
                isSalaryProcessedThisMonth ? (
                  <div className="w-full sm:w-auto px-3.5 py-2 bg-emerald-500/40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-300/30">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{language === 'en' ? 'Processed This Month' : 'Bu Ay İşlendi'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      processRecurringPayment(salaryConfig.id);
                      alert(language === 'en'
                        ? `"${salaryConfig.title}" salary processed and deposited for this month! It will not run again until next month.`
                        : `"${salaryConfig.title}" maaşınız bu ay için işlendi ve hesabınıza eklendi! Günü geldiğinde bu ay tekrar otomatik işlenmeyecektir.`);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    title={language === 'en' ? 'Deposit salary for this month now' : 'Maaşı bu ay için hemen hesaba aktar'}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-950" />
                    <span>{language === 'en' ? 'Process Salary Now' : 'Maaşı Şimdi İşle'}</span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={openSalaryModal}
                className="w-full sm:w-auto px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{salaryConfig?.amount > 0 ? t('common.edit') : (language === 'en' ? 'Set Payday' : 'Maaş Gününü Ayarla')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 2. CASHFLOW SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Düzenli Gelir */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{language === 'en' ? 'Regular Monthly Income' : 'Aylık Düzenli Gelir'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">
            +{formatMoney(totalRegularIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'en' ? 'Salary & recurring inflows' : 'Maaş ve periyodik gelirler'}</div>
        </Card>

        {/* Düzenli Gider & Abonelikler */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{language === 'en' ? 'Fixed Subscriptions & Expenses' : 'Sabit Abonelik & Gider'}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-2">
            -{formatMoney(totalRegularExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'en' ? 'Rent, utilities, digital subscriptions' : 'Kira, fatura, dijital servisler'}</div>
        </Card>

        {/* Net Düzenli Tasarruf */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{language === 'en' ? 'Remaining After Fixed Costs' : 'Sabitlerden Kalan'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${netRegularCashflow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatMoney(netRegularCashflow, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{language === 'en' ? 'Free discretionary potential' : 'Serbest harcama potansiyeli'}</div>
        </Card>
      </div>

      {/* 📋 3. RECURRING SUBSCRIPTIONS & PAYMENTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t('recurring.title', 'Abonelikler ve Düzenli İşlemler')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'en'
                ? 'Scheduled payments and automated transactions'
                : 'Günü geldiğinde otomatik hesaptan düşen veya eklenen işlemler'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('common.all')} ({recurring.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'expense' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Subscriptions / Expense' : 'Abonelikler / Gider'}
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'income' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Regular Income' : 'Düzenli Gelir'}
            </button>
          </div>
        </div>

        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredList.map((item) => {
              const countdown = getDaysUntil(item.dayOfMonth);
              const isProcessedThisMonth = item.lastProcessedPeriod === currentPeriodKey;
              const isIncome = item.type === 'income' || item.isSalary;
              const account = accounts.find((a) => a.id === item.accountId);

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm relative ${
                    item.isActive ? 'border-slate-200/90 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <Repeat className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                            {item.isSalary && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full">
                                {language === 'en' ? 'Salary' : 'Maaş'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>{language === 'en' ? `Day ${item.dayOfMonth} of every month` : `Her ayın ${item.dayOfMonth}. günü`}</span>
                            {account && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">{account.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRecurring(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Middle: Amount & Status */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">{t('common.amount')}</div>
                        <div
                          className={`text-xl font-black ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatMoney(item.amount)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {isProcessedThisMonth ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {language === 'en' ? 'Processed this month' : 'Bu ay işlendi'}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {countdown.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                          {isProcessedThisMonth
                            ? `${language === 'en' ? 'Next: ' : 'Gelecek: '}${item.dayOfMonth} ${new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}`
                            : `${item.dayOfMonth} ${now.toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'long' })}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Auto-process toggle badge & Manual execute button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    {/* Auto Process Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleRecurringAutoProcess(item.id)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                        item.autoProcess !== false
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title={language === 'en' ? 'Toggle Auto-process' : 'Otomatik Yenileme Durumunu Değiştir'}
                    >
                      <Zap className={`w-3 h-3 ${item.autoProcess !== false ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span>{item.autoProcess !== false ? (language === 'en' ? 'Auto-Active' : 'Otomatik Aktif') : (language === 'en' ? 'Manual Only' : 'Otomatik Kapalı')}</span>
                    </button>

                    {/* Manual execute now */}
                    {isProcessedThisMonth ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'en' ? 'Processed This Month' : 'Bu Ay İşlendi (Tekrar İşlenmez)'}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={CheckCircle}
                        onClick={() => {
                          processRecurringPayment(item.id);
                          alert(language === 'en'
                            ? `"${item.title}" payment processed for this month! It will not be charged automatically again this month.`
                            : `"${item.title}" işlemi bu ay için işlendi! Günü geldiğinde bu ay tekrar otomatik işlenmeyecektir.`);
                        }}
                        className="text-xs py-1.5 px-3 h-auto text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-slate-200 dark:border-slate-700 font-bold"
                      >
                        {language === 'en' ? 'Process Now' : 'Şimdi İşle'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
            <Repeat className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {filterType === 'all'
                ? (language === 'en' ? 'No Recurring Payments Yet' : 'Henüz Düzenli Ödeme Eklenmemiş')
                : (language === 'en' ? 'No items match this filter' : 'Bu filtreye uygun düzenli işlem bulunamadı')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm">
              {language === 'en'
                ? 'Add subscriptions like Netflix, Spotify, rent, or recurring income to track automated cashflows.'
                : 'Netflix, Spotify, ev kirası veya düzenli gelirlerinizi ekleyerek her ay otomatik hesaba yansımasını sağlayın.'}
            </p>
            <Button size="sm" icon={Plus} onClick={() => openRecurringModal()}>
              {t('recurring.addRecurring', 'Abonelik Ekle')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
