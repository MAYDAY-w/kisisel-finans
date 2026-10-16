import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sparkles, Calendar, DollarSign, Wallet } from 'lucide-react';

export function SalaryModal() {
  const {
    isSalaryModalOpen,
    closeSalaryModal,
    salaryConfig,
    saveSalaryConfig,
    accounts,
    formatMoney,
    t,
  } = useFinance();

  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [accountId, setAccountId] = useState('');
  const [autoProcess, setAutoProcess] = useState(true);
  const [title, setTitle] = useState('Aylık Maaş');

  useEffect(() => {
    if (isSalaryModalOpen && salaryConfig) {
      setAmount(salaryConfig.amount ? String(salaryConfig.amount) : '');
      setDayOfMonth(salaryConfig.dayOfMonth || 1);
      setAccountId(salaryConfig.accountId || accounts[0]?.id || '');
      setAutoProcess(salaryConfig.autoProcess !== false);
      setTitle(salaryConfig.title || 'Aylık Maaş');
    }
  }, [isSalaryModalOpen, salaryConfig, accounts]);

  const quickDays = [1, 5, 10, 15, 20, 25];

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir maaş tutarı giriniz.');
      return;
    }

    saveSalaryConfig({
      title: title.trim() || 'Aylık Maaş',
      amount: parsedAmount,
      dayOfMonth: parseInt(dayOfMonth) || 1,
      accountId: accountId || accounts[0]?.id || '',
      autoProcess,
      isActive: true,
    });

    closeSalaryModal();
  };

  return (
    <Modal
      isOpen={isSalaryModalOpen}
      onClose={closeSalaryModal}
      title={t('salaryModal.title')}
      subtitle={t('salaryModal.subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Salary Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('salaryModal.amountLabel')}
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all pr-12"
            />
          </div>
        </div>

        {/* Day of Month Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('salaryModal.paydayLabel')}
            </label>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {t('salaryModal.paydayEveryMonth', { day: dayOfMonth })}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-500">{t('salaryModal.quickSelect')}</span>
          </div>

          {/* Quick day buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDayOfMonth(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dayOfMonth === d
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Target Bank Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('salaryModal.targetAccount')}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatMoney(acc.balance)})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('salaryModal.targetAccountHint')}
          </p>
        </div>

        {/* Title / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('salaryModal.titleOptional')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('salaryModal.titlePlaceholder')}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Auto-Process Toggle Card */}
        <div
          onClick={() => setAutoProcess((prev) => !prev)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            autoProcess
              ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                autoProcess ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{t('salaryModal.autoProcessTitle')}</span>
                {autoProcess && (
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    {t('salaryModal.activeBadge')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {t('salaryModal.autoProcessDesc')}
              </p>
            </div>
          </div>

          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              autoProcess ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoProcess ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeSalaryModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {t('salaryModal.saveBtn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
