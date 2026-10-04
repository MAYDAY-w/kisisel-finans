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
    if (day === currentDay) return { days: 0, label: 'Bugün vadesi!' };
    if (day > currentDay) {
      const diff = day - currentDay;
      return { days: diff, label: `${diff} gün kaldı` };
    }
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const diff = daysInMonth - currentDay + day;
    return { days: diff, label: `Gelecek ay (${diff} gün)` };
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-emerald-600" />
            <span>Maaş Günü & Otomatik Abonelikler</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maaş gününüzü ve her ay otomatik yenilenen aboneliklerinizi kontrol edin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Zap}
            onClick={handleManualCheck}
            className="text-xs font-semibold text-teal-700 border-teal-200 hover:bg-teal-50"
          >
            Otomatik Denetle
          </Button>

          <Button
            size="sm"
            onClick={() => openRecurringModal()}
            icon={Plus}
            className="text-xs font-bold"
          >
            Abonelik Ekle
          </Button>
        </div>
      </div>

      {/* Temporary Feedback Message */}
      {manualCheckMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
                Maaş Günü Takibi
              </span>

              {salaryConfig?.amount > 0 && salaryConfig?.autoProcess !== false && (
                <span className="text-[11px] font-bold bg-emerald-400/25 border border-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> Otomatik Hesaba Yatar
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
                    <span>Her ayın <strong>{salaryDay}. günü</strong></span>
                    <span>•</span>
                    <span>Yatacağı Hesap: <strong>{salaryAccount?.name || 'Seçilmedi'}</strong></span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    Maaş Gününüzü Belirleyin
                  </div>
                  <p className="text-xs text-emerald-100 font-medium mt-1">
                    Aylık net maaşınızı ve ödeme gününüzü girerek günü geldiğinde otomatik hesaba yatmasını sağlayın.
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
                  Maaş Durumu
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{salaryCountdown.label}</span>
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">
                  {isSalaryProcessedThisMonth
                    ? '✅ Bu ayki maaş otomatik işlendi'
                    : `Sıradaki: ${salaryDay} ${now.toLocaleDateString('tr-TR', { month: 'long' })}`}
                </div>
              </div>
            ) : (
              <div className="text-left md:text-right">
                <div className="text-sm font-bold text-white">
                  Henüz Ayarlanmadı
                </div>
                <div className="text-[11px] text-emerald-100 mt-0.5">
                  1 tıkla maaş gününüzü tanımlayın
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={openSalaryModal}
              className="w-full sm:w-auto px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{salaryConfig?.amount > 0 ? 'Maaş Gününü Düzenle' : 'Maaş Gününü Ayarla'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 2. CASHFLOW SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Düzenli Gelir */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Aylık Düzenli Gelir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">
            +{formatMoney(totalRegularIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Maaş ve periyodik gelirler</div>
        </Card>

        {/* Düzenli Gider & Abonelikler */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sabit Abonelik & Gider</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-2">
            -{formatMoney(totalRegularExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kira, fatura, dijital servisler</div>
        </Card>

        {/* Net Düzenli Tasarruf */}
        <Card padding="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sabitlerden Kalan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold mt-2 ${netRegularCashflow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatMoney(netRegularCashflow, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Serbest harcama potansiyeli</div>
        </Card>
      </div>

      {/* 📋 3. RECURRING SUBSCRIPTIONS & PAYMENTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Abonelikler ve Düzenli İşlemler
            </h3>
            <p className="text-xs text-slate-500">
              Günü geldiğinde otomatik hesaptan düşen veya eklenen işlemler
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({recurring.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Abonelikler / Gider
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'income' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Düzenli Gelir
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
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm relative ${
                    item.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
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
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            {item.isSalary && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                                Maaş
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Her ayın {item.dayOfMonth}. günü</span>
                            {account && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600 font-medium">{account.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRecurring(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Middle: Amount & Status */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Tutar</div>
                        <div
                          className={`text-xl font-black ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatMoney(item.amount)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-slate-500">
                          {isProcessedThisMonth ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Bu ay işlendi
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {countdown.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.dayOfMonth} {now.toLocaleDateString('tr-TR', { month: 'long' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Auto-process toggle badge & Manual execute button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* Auto Process Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleRecurringAutoProcess(item.id)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                        item.autoProcess !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Otomatik Yenileme Durumunu Değiştir"
                    >
                      <Zap className={`w-3 h-3 ${item.autoProcess !== false ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span>{item.autoProcess !== false ? 'Otomatik Aktif' : 'Otomatik Kapalı'}</span>
                    </button>

                    {/* Manual execute now */}
                    <Button
                      size="sm"
                      variant="outline"
                      icon={CheckCircle}
                      onClick={() => {
                        processRecurringPayment(item.id);
                        alert(`"${item.title}" işlemi bugünün gelir/gider kayıtlarına başarıyla eklendi!`);
                      }}
                      className="text-xs py-1.5 px-3 h-auto text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200"
                    >
                      Şimdi İşle
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
            <Repeat className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {filterType === 'all'
                ? 'Henüz Düzenli Ödeme Eklenmemiş'
                : 'Bu filtreye uygun düzenli işlem bulunamadı'}
            </h3>
            <p className="text-xs text-slate-500 mb-5 max-w-sm">
              Netflix, Spotify, ev kirası veya düzenli gelirlerinizi ekleyerek her ay otomatik hesaba yansımasını sağlayın.
            </p>
            <Button size="sm" icon={Plus} onClick={() => openRecurringModal()}>
              Abonelik Ekle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
