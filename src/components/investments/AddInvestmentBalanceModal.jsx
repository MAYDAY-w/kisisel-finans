import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { getTodayDateString, formatDate } from '../../utils/formatters';
import {
  calculateDailyInterestAccrual,
  calculateDepositAccrual,
  getDaysDiff,
} from '../../utils/interestCalculations';
import {
  PlusCircle,
  Clock,
  Landmark,
  Calendar,
  Wallet,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export function AddInvestmentBalanceModal() {
  const {
    balanceTargetInvestment,
    closeAddBalanceModal,
    addInvestmentBalance,
    accounts,
    formatMoney,
    t,
  } = useFinance();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (balanceTargetInvestment) {
      setAmount('');
      setDate(getTodayDateString());
      setAccountId(balanceTargetInvestment.accountId || '');
      setNote('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [balanceTargetInvestment]);

  if (!balanceTargetInvestment) return null;

  const inv = balanceTargetInvestment;
  const isDaily = inv.type === 'daily_interest';
  const isDeposit = inv.type === 'deposit';

  const parsedAmount = parseFloat(amount.toString().replace(',', '.')) || 0;
  const existingAdditions = Array.isArray(inv.additions) ? inv.additions : [];
  const existingAdditionsTotal = existingAdditions.reduce(
    (sum, a) => sum + (Number(a.amount) || 0),
    0
  );
  const basePrincipal = Number(inv.purchasePrice) || 0;
  const currentTotalPrincipal = basePrincipal + existingAdditionsTotal;
  const newTotalPrincipal = currentTotalPrincipal + parsedAmount;

  // Live simulation with the new addition included
  const simulatedAdditions = parsedAmount > 0
    ? [...existingAdditions, { amount: parsedAmount, date: date || getTodayDateString() }]
    : existingAdditions;

  let dailyStats = null;
  let depositStats = null;

  if (isDaily) {
    dailyStats = calculateDailyInterestAccrual({
      purchasePrice: inv.purchasePrice,
      purchaseDate: inv.purchaseDate,
      interestRate: inv.interestRate,
      stopajRate: inv.stopajRate !== undefined ? inv.stopajRate : 10,
      uninvestedAmount: inv.uninvestedAmount || 0,
      additions: simulatedAdditions,
    });
  } else if (isDeposit) {
    depositStats = calculateDepositAccrual({
      purchasePrice: inv.purchasePrice,
      purchaseDate: inv.purchaseDate,
      maturityDays: inv.maturityDays || 32,
      interestRate: inv.interestRate,
      stopajRate: inv.stopajRate !== undefined ? inv.stopajRate : 10,
      additions: simulatedAdditions,
    });
  }

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir tutar girin.');
      return;
    }

    addInvestmentBalance(inv.id, {
      amount: parsedAmount,
      date,
      accountId: accountId || null,
      note,
    });

    closeAddBalanceModal();
  };

  return (
    <Modal
      isOpen={Boolean(balanceTargetInvestment)}
      onClose={closeAddBalanceModal}
      title={t('investments.addBalanceModalTitle', 'İşleyen Paraya Bakiye Ekle')}
      subtitle={t(
        'investments.addBalanceModalSubtitle',
        'Mevcut faiz getirisini bozmadan ana paraya ekleme yapın'
      )}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Header Info */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDaily ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isDaily ? <Clock className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{inv.name}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>
                  {t('investments.initialPrincipal')}:{' '}
                  <strong className="text-slate-700">{formatMoney(basePrincipal)}</strong>
                </span>
                {existingAdditionsTotal > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    (+{formatMoney(existingAdditionsTotal)} {t('investments.balanceAdditions')})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                isDaily
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>%{inv.interestRate || 0}</span>
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            {t('investments.addedAmount', 'Eklenecek Tutar (TL)')}
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full text-2xl font-black px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
              ₺
            </span>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar">
            {quickAmounts.map((q) => (
              <button
                type="button"
                key={q}
                onClick={() => setAmount(String(q))}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
              >
                +{formatMoney(q, false)}
              </button>
            ))}
          </div>
        </div>

        {/* Date and Optional Source Account Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('investments.additionDate', 'Ekleme Tarihi')}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('investments.sourceAccount', 'Çekilecek Hesap (İsteğe Bağlı)')}</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="">
                {t('investments.noSourceAccount', 'Hesap seçilmedi (Sadece varlığa ekle)')}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatMoney(acc.balance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
            {t('investments.additionNote', 'Açıklama / Not (İsteğe Bağlı)')}
          </label>
          <input
            type="text"
            placeholder={t('investments.additionNotePlaceholder', 'Örn: Maaştan artan birikim')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Live Calculation Preview Card */}
        {parsedAmount > 0 && (
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-fade-in ${
              isDaily
                ? 'bg-teal-50/70 border-teal-200'
                : 'bg-indigo-50/70 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('investments.newTotalPrincipal', 'Yeni Toplam Ana Para')}:</span>
              </span>
              <span className="font-black text-slate-900 text-sm">
                {formatMoney(currentTotalPrincipal)} + {formatMoney(parsedAmount)} ={' '}
                <span className="text-emerald-700">{formatMoney(newTotalPrincipal)}</span>
              </span>
            </div>

            {isDaily && dailyStats && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex justify-between text-slate-600">
                  <span>{t('investments.newDailyNet', 'Yeni Günlük Net Getiri')}:</span>
                  <strong className="text-teal-800 font-bold">
                    +{dailyStats.currentDailyNet.toFixed(2)} ₺ / {t('investments.dailyGain')}
                  </strong>
                </div>
                <p className="text-[11px] text-teal-800/90 leading-relaxed bg-white/70 p-2 rounded-xl border border-teal-100">
                  ℹ️ {formatMoney(basePrincipal)} tutarındaki ilk ana paranızın geçmiş günlerde kazandığı faiz eksiksiz korunur. Eklenen {formatMoney(parsedAmount)}, belirtilen {formatDate(date)} tarihinden itibaren günlük faiz işletmeye başlar.
                </p>
              </div>
            )}

            {isDeposit && depositStats && (() => {
              const remainingDays = getDaysDiff(date, depositStats.maturityDateStr);
              const grossAdd = (parsedAmount * (inv.interestRate || 0) * remainingDays) / 36500;
              const netAdd = grossAdd * (1 - (inv.stopajRate || 10) / 100);

              return (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('investments.remainingMaturityDays', 'Vade Sonuna Kalan')}:</span>
                    <span className="font-semibold text-slate-800">
                      {remainingDays} {t('common.days')} ({formatDate(depositStats.maturityDateStr)})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t('investments.additionMaturityInterest', 'Bu Eklemenin Getireceği Net Faiz')}:</span>
                    <strong className="text-indigo-800 font-bold">+{netAdd.toFixed(2)} ₺</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1 border-t border-indigo-100">
                    <span className="font-bold">{t('investments.maturityTotal', 'Yeni Vade Sonu Toplamı')}:</span>
                    <strong className="text-indigo-900 font-black text-sm">
                      {depositStats.maturityTotal.toFixed(2)} ₺
                    </strong>
                  </div>
                  <p className="text-[11px] text-indigo-800/90 leading-relaxed bg-white/70 p-2 rounded-xl border border-indigo-100">
                    ℹ️ İlk ana paranız baştan belirlenen vade sonuna kadar tüm faizini alır. Bu ekleme ise vadeye kalan {remainingDays} gün üzerinden bağımsız hesaplanır; kâr hesabı karışmaz.
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeAddBalanceModal} type="button">
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={PlusCircle}
            className="font-bold"
            disabled={parsedAmount <= 0}
          >
            {t('investments.saveBalanceAddition', 'Bakiyeyi Ekle ve Güncelle')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
