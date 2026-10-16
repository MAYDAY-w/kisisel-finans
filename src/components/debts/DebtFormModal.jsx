import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEBT_TYPES, TRANSACTION_TYPES } from '../../types/index.js';
import { getTodayDateString, addMonthsToDate, formatDate } from '../../utils/formatters.js';
import { Calendar, Percent, Layers, Clock, AlertCircle, CreditCard } from 'lucide-react';

export function DebtFormModal() {
  const { isDebtModalOpen, closeDebtModal, editingDebt, addDebt, updateDebt, formatMoney, accounts, t, language, addTransaction } = useFinance();

  const [type, setType] = useState(DEBT_TYPES.LENT);
  const [personName, setPersonName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [debtDate, setDebtDate] = useState(getTodayDateString());
  const [hasInterest, setHasInterest] = useState(false);
  const [interestRate, setInterestRate] = useState('10');
  const [interestType, setInterestType] = useState('flat'); // 'flat' | 'monthly'
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('6');
  const [customInstallmentAmount, setCustomInstallmentAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [repaymentAccountId, setRepaymentAccountId] = useState('');
  const [syncAccountBalance, setSyncAccountBalance] = useState(true);
  const [note, setNote] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');

  useEffect(() => {
    if (isDebtModalOpen) {
      if (editingDebt) {
        setType(editingDebt.type || DEBT_TYPES.LENT);
        setPersonName(editingDebt.personName || '');
        const pAmt = editingDebt.principalAmount !== undefined ? editingDebt.principalAmount : editingDebt.amount;
        setPrincipalAmount(pAmt ? String(pAmt) : '');
        setDebtDate(editingDebt.debtDate || editingDebt.createdAt?.slice(0, 10) || getTodayDateString());
        const rate = Number(editingDebt.interestRate) || 0;
        setHasInterest(rate > 0);
        setInterestRate(rate > 0 ? String(rate) : '10');
        setInterestType(editingDebt.interestType || 'flat');
        setIsInstallment(Boolean(editingDebt.isInstallment));
        setInstallmentCount(editingDebt.installmentCount ? String(editingDebt.installmentCount) : '6');
        setCustomInstallmentAmount(editingDebt.installmentAmount ? String(editingDebt.installmentAmount) : '');
        setDueDate(editingDebt.firstDueDate || editingDebt.dueDate || getTodayDateString());
        setAccountId(editingDebt.accountId || '');
        setRepaymentAccountId(editingDebt.repaymentAccountId || editingDebt.accountId || '');
        setSyncAccountBalance(false);
        setNote(editingDebt.note || '');
        setPaidAmount(editingDebt.paidAmount !== undefined ? String(editingDebt.paidAmount) : '0');
      } else {
        const today = getTodayDateString();
        setType(DEBT_TYPES.LENT);
        setPersonName('');
        setPrincipalAmount('');
        setDebtDate(today);
        setHasInterest(false);
        setInterestRate('10');
        setInterestType('flat');
        setIsInstallment(false);
        setInstallmentCount('6');
        setCustomInstallmentAmount('');
        setDueDate(addMonthsToDate(today, 1));
        setAccountId('');
        setRepaymentAccountId('');
        setSyncAccountBalance(true);
        setNote('');
        setPaidAmount('0');
      }
    }
  }, [isDebtModalOpen, editingDebt]);

  const getAccountOptionLabel = (acc) => {
    if (acc.type === 'credit_card') {
      const bNum = Number(acc.balance) || 0;
      const cardLimit = Number(acc.limit) || 0;
      if (bNum > 0) {
        const boostLimit = cardLimit > 0 ? cardLimit + bNum : bNum;
        return `${acc.name} (${language === 'en' ? 'Excess: +' : 'Artı Bakiye: +'}${formatMoney(bNum)} | ${language === 'en' ? 'Limit: ' : 'Limit: '}${formatMoney(boostLimit)})`;
      } else if (bNum < 0) {
        const debt = Math.abs(bNum);
        const rem = cardLimit > 0 ? Math.max(0, cardLimit - debt) : null;
        return `${acc.name} (${language === 'en' ? 'Debt: ' : 'Borç: '}${formatMoney(debt)}${rem !== null ? ` | ${language === 'en' ? 'Remaining: ' : 'Kalan: '}${formatMoney(rem)}` : ''})`;
      } else {
        return `${acc.name} (${language === 'en' ? 'No Debt' : 'Borç Yok'}${cardLimit > 0 ? ` | ${language === 'en' ? 'Limit: ' : 'Limit: '}${formatMoney(cardLimit)}` : ''})`;
      }
    }
    return `${acc.name} (${formatMoney(acc.balance)})`;
  };

  // Calculations
  const numPrincipal = parseFloat(principalAmount.toString().replace(',', '.')) || 0;
  const numRate = hasInterest ? (parseFloat(interestRate.toString().replace(',', '.')) || 0) : 0;
  const numInstallments = isInstallment ? Math.max(1, parseInt(installmentCount.toString(), 10) || 1) : 1;

  let computedInterestAmount = 0;
  if (hasInterest && numRate > 0) {
    if (interestType === 'monthly' && isInstallment) {
      computedInterestAmount = numPrincipal * (numRate / 100) * numInstallments;
    } else {
      computedInterestAmount = numPrincipal * (numRate / 100);
    }
  }

  const computedTotalAmount = Math.round((numPrincipal + computedInterestAmount) * 100) / 100;
  const autoMonthlyAmount = isInstallment && numInstallments > 0
    ? Math.round((computedTotalAmount / numInstallments) * 100) / 100
    : computedTotalAmount;

  const effectiveMonthlyAmount = customInstallmentAmount !== ''
    ? (parseFloat(customInstallmentAmount.toString().replace(',', '.')) || autoMonthlyAmount)
    : autoMonthlyAmount;

  const plannedEndDate = (dueDate && isInstallment && numInstallments > 1)
    ? addMonthsToDate(dueDate, numInstallments - 1)
    : dueDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personName.trim()) {
      alert(t('debts.personName') + ' gereklidir.');
      return;
    }
    if (numPrincipal <= 0) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir ana para tutarı giriniz.');
      return;
    }

    const payload = {
      type,
      personName: personName.trim(),
      amount: computedTotalAmount,
      principalAmount: numPrincipal,
      interestRate: numRate,
      interestAmount: Math.round(computedInterestAmount * 100) / 100,
      interestType,
      isInstallment,
      installmentCount: isInstallment ? numInstallments : 1,
      installmentAmount: isInstallment ? effectiveMonthlyAmount : computedTotalAmount,
      debtDate: debtDate || getTodayDateString(),
      firstDueDate: dueDate || undefined,
      dueDate: plannedEndDate || dueDate || undefined,
      paidAmount: parseFloat(paidAmount.toString().replace(',', '.')) || 0,
      note: note.trim(),
      accountId: accountId || undefined,
      repaymentAccountId: repaymentAccountId || accountId || undefined,
    };

    if (editingDebt?.id) {
      updateDebt(editingDebt.id, payload);
    } else {
      const createdDebt = addDebt(payload);

      if (accountId && syncAccountBalance && numPrincipal > 0) {
        if (type === DEBT_TYPES.BORROWED) {
          // Borç Aldım: Para hesaba yatar (+Gelir)
          addTransaction({
            type: TRANSACTION_TYPES.INCOME,
            amount: numPrincipal,
            date: debtDate || getTodayDateString(),
            accountId,
            categoryId: 'debt',
            categoryName: t('debts.borrowedCategory', 'Alınan Borç'),
            description: `${personName.trim()} - ${t('debts.borrowedTxDesc', 'Borç Alındı')}`,
            note: note.trim() || undefined,
            debtId: createdDebt?.id,
          });
        } else if (type === DEBT_TYPES.LENT) {
          // Borç Verdim: Para hesaptan düşer (-Gider)
          addTransaction({
            type: TRANSACTION_TYPES.EXPENSE,
            amount: numPrincipal,
            date: debtDate || getTodayDateString(),
            accountId,
            categoryId: 'debt',
            categoryName: t('debts.lentCategory', 'Verilen Borç'),
            description: `${personName.trim()} - ${t('debts.lentTxDesc', 'Borç Verildi')}`,
            note: note.trim() || undefined,
            debtId: createdDebt?.id,
          });
        }
      }
    }

    closeDebtModal();
  };

  const INTEREST_PRESETS = ['5', '10', '15', '20', '30', '50'];
  const INSTALLMENT_PRESETS = [2, 3, 4, 6, 9, 12, 18, 24, 36];

  return (
    <Modal
      isOpen={isDebtModalOpen}
      onClose={closeDebtModal}
      title={editingDebt ? t('debts.editDebt') : t('debts.newDebt')}
      subtitle={t('debts.subtitle')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('transactions.type')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(DEBT_TYPES.LENT)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === DEBT_TYPES.LENT
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {t('debts.lent')}
            </button>
            <button
              type="button"
              onClick={() => setType(DEBT_TYPES.BORROWED)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === DEBT_TYPES.BORROWED
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {t('debts.borrowed')}
            </button>
          </div>
        </div>

        {/* Person / Institution Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('debts.personName')}
          </label>
          <input
            type="text"
            placeholder="Ahmet Yılmaz, Banka, Arkadaşım..."
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Principal Amount (Ana Para) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {hasInterest ? t('debts.principalAmount') : t('debts.totalAmount')}
          </label>
          <input
            type="number"
            step="any"
            placeholder="10000"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            required
            className="w-full text-2xl font-bold px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Interest Configuration Card */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('debts.interestOption')}</span>
            </span>
            <div className="flex bg-amber-100/70 dark:bg-amber-900/40 p-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <button
                type="button"
                onClick={() => setHasInterest(false)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  !hasInterest ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs' : 'text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100'
                }`}
              >
                {t('debts.noInterest')}
              </button>
              <button
                type="button"
                onClick={() => setHasInterest(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  hasInterest ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100'
                }`}
              >
                {t('debts.withInterest')}
              </button>
            </div>
          </div>

          {hasInterest && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase mb-1">
                    {t('debts.interestRate')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="10"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase mb-1">
                    {t('debts.interestType')}
                  </label>
                  <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="flat">{t('debts.flatInterest')}</option>
                    <option value="monthly">{t('debts.monthlyInterest')}</option>
                  </select>
                </div>
              </div>

              {/* Quick Interest Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium whitespace-nowrap">Hızlı:</span>
                {INTEREST_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInterestRate(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      interestRate === val
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/50 dark:hover:bg-amber-900/30'
                    }`}
                  >
                    %{val}
                  </button>
                ))}
              </div>

              {/* Interest Breakdown preview */}
              {numPrincipal > 0 && numRate > 0 && (
                <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t('debts.principalAmount')}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatMoney(numPrincipal)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>
                      {t('debts.interestAmount')} (%{numRate}
                      {interestType === 'monthly' && isInstallment ? ` x ${numInstallments} ay` : ''}):
                    </span>
                    <span className="font-bold">+{formatMoney(computedInterestAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-slate-100 pt-1 border-t border-amber-100 dark:border-amber-900/40 font-bold">
                    <span>{t('debts.totalRepayment')}:</span>
                    <span className="text-amber-800 dark:text-amber-300 text-sm font-extrabold">{formatMoney(computedTotalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Installment Plan Card */}
        <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t('debts.isInstallment')}</span>
            </span>
            <div className="flex bg-sky-100/70 dark:bg-sky-900/40 p-0.5 rounded-lg border border-sky-200 dark:border-sky-800/50">
              <button
                type="button"
                onClick={() => setIsInstallment(false)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  !isInstallment ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs' : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-100'
                }`}
              >
                {t('debts.singlePayment')}
              </button>
              <button
                type="button"
                onClick={() => setIsInstallment(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  isInstallment ? 'bg-sky-600 text-white shadow-2xs' : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-sky-100'
                }`}
              >
                {t('debts.installmentPlan')}
              </button>
            </div>
          </div>

          {isInstallment && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-sky-800 dark:text-sky-300 uppercase mb-1">
                    {t('debts.installmentCount')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="6"
                    value={installmentCount}
                    onChange={(e) => {
                      setInstallmentCount(e.target.value);
                      setCustomInstallmentAmount('');
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/60 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-sky-800 dark:text-sky-300 uppercase mb-1">
                    {t('debts.monthlyInstallment')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={autoMonthlyAmount ? autoMonthlyAmount.toFixed(2) : '0'}
                    value={customInstallmentAmount !== '' ? customInstallmentAmount : (autoMonthlyAmount > 0 ? autoMonthlyAmount : '')}
                    onChange={(e) => setCustomInstallmentAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/60 rounded-lg text-xs font-bold text-sky-900 dark:text-sky-300 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Installment count presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-sky-700 dark:text-sky-400 font-medium whitespace-nowrap">Taksit:</span>
                {INSTALLMENT_PRESETS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setInstallmentCount(String(cnt));
                      setCustomInstallmentAmount('');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      parseInt(installmentCount, 10) === cnt
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white dark:bg-slate-800 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60 hover:bg-sky-100/50 dark:hover:bg-sky-900/30'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>

              {/* Installment Summary Info */}
              <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-sky-200/80 dark:border-sky-800/40 text-xs space-y-1">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span>{t('debts.monthlyInstallment')}:</span>
                  <span className="text-sky-700 dark:text-sky-400 font-bold">{formatMoney(effectiveMonthlyAmount)} / ay</span>
                </div>
                {plannedEndDate && dueDate && (
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-sky-100 dark:border-sky-900/40">
                    <span>{t('debts.lastInstallmentDate')}:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(plannedEndDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dates: Debt / Transaction Date & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('debts.debtDate', 'Borç / İşlem Tarihi')}
            </label>
            <input
              type="date"
              value={debtDate}
              onChange={(e) => setDebtDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {isInstallment ? t('debts.firstInstallmentDate') : t('debts.dueDate')}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Linked Accounts Section: 1) Initial Cash Flow, 2) Future Repayments */}
        <div className="space-y-3">
          {/* Account 1: Entry / Exit Account (Initial Cash Flow) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>
                {type === DEBT_TYPES.BORROWED
                  ? t('debts.borrowedEntryAccountLabel', 'Paranın Yatacağı Hesap (Borç Aldığım Tutar Hangi Hesabıma Yatsın?)')
                  : t('debts.lentEntryAccountLabel', 'Paranın Çıktığı Hesap (Borç Verdiğim Tutar Hangi Hesabımdan Düşsün?)')}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {type === DEBT_TYPES.BORROWED
                ? t('debts.borrowedEntryAccountSubtitle', 'Borç aldığınız tutar seçtiğiniz bu hesaba hemen yatırılarak bakiyeniz artırılır.')
                : t('debts.lentEntryAccountSubtitle', 'Borç verdiğiniz tutar seçtiğiniz bu hesaptan hemen düşülerek bakiyeniz azaltılır.')}
            </p>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 mt-1 shadow-2xs"
            >
              <option value="">{t('debts.noLinkedAccount')}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {getAccountOptionLabel(acc)}
                </option>
              ))}
            </select>

            {/* Sync Account Balance Checkbox on Initial Creation */}
            {!editingDebt && accountId && numPrincipal > 0 ? (
              <label className="flex items-start gap-2.5 cursor-pointer mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={syncAccountBalance}
                  onChange={(e) => setSyncAccountBalance(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer mt-0.5 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <span className="leading-snug">
                  {type === DEBT_TYPES.BORROWED
                    ? t('debts.borrowedSyncCheckbox', { amount: formatMoney(numPrincipal) })
                    : t('debts.lentSyncCheckbox', { amount: formatMoney(numPrincipal) })}
                </span>
              </label>
            ) : editingDebt && accountId ? (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                {t('debts.editModeAccountNotice')}
              </div>
            ) : null}
          </div>

          {/* Account 2: Repayment / Collection Account (Future Cash Flow) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {type === DEBT_TYPES.BORROWED
                  ? t('debts.borrowedRepayAccountLabel', 'Borcu Ödeyeceğim Hesap (Hangi Hesabımla Ödeyeceğim?)')
                  : t('debts.lentRepayAccountLabel', 'Alacağın Geleceği Hesap (Alacağım Borç Hangi Hesabıma Gelecek?)')}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {type === DEBT_TYPES.BORROWED
                ? t('debts.borrowedRepayAccountSubtitle', 'İleride borç taksitleri veya ödemeleri varsayılan olarak bu hesabımdan/kartımdan düşecek.')
                : t('debts.lentRepayAccountSubtitle', 'İleride bu alacağın geri ödemesi varsayılan olarak bu banka veya cüzdanıma yatacak.')}
            </p>
            <select
              value={repaymentAccountId}
              onChange={(e) => setRepaymentAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 mt-1 shadow-2xs"
            >
              <option value="">
                {accountId
                  ? `↪ ${t('debts.sameAsEntryAccount', 'Giriş/Çıkış Hesabı ile Aynı')}`
                  : t('debts.noLinkedAccount')}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {getAccountOptionLabel(acc)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('transactions.note')}
          </label>
          <input
            type="text"
            placeholder="Açıklama veya borç nedeni..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Form Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeDebtModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingDebt ? t('common.edit') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
