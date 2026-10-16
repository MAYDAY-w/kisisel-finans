import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { formatDate, addMonthsToDate, getTodayDateString } from '../../utils/formatters.js';
import {
  Handshake,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Percent,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export function DebtView() {
  const {
    debts,
    recordDebtPayment,
    deleteDebt,
    openDebtModal,
    accounts,
    formatMoney,
    t,
    language,
  } = useFinance();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'lent' | 'borrowed'
  const [activePaymentDebt, setActivePaymentDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [expandedScheduleDebtId, setExpandedScheduleDebtId] = useState(null);

  // Totals
  let totalLent = 0;
  let totalBorrowed = 0;
  debts.forEach((d) => {
    const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
    if (d.type === 'lent') totalLent += remaining;
    if (d.type === 'borrowed') totalBorrowed += remaining;
  });

  const filteredDebts = debts.filter((d) => {
    if (filterType === 'all') return true;
    return d.type === filterType;
  });

  const handleMakePayment = (e) => {
    e.preventDefault();
    if (!activePaymentDebt) return;
    const parsed = parseFloat(paymentAmount.toString().replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir tutar giriniz.');
      return;
    }
    recordDebtPayment(
      activePaymentDebt.id,
      parsed,
      paymentAccountId || null,
      paymentNote.trim()
    );
    setActivePaymentDebt(null);
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentAccountId('');
  };

  const openPaymentForDebt = (debt, defaultAmount = null, defaultNote = '') => {
    const remaining = Math.max(0, (debt.amount || 0) - (debt.paidAmount || 0));
    const amt = defaultAmount !== null ? Math.min(remaining, defaultAmount) : remaining;
    setActivePaymentDebt(debt);
    setPaymentAmount(amt > 0 ? String(amt) : '');
    setPaymentNote(defaultNote);
    setPaymentAccountId(debt.repaymentAccountId || debt.accountId || '');
  };

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

  const toggleSchedule = (debtId) => {
    setExpandedScheduleDebtId((prev) => (prev === debtId ? null : debtId));
  };

  // Helper to build installment schedule for a debt
  const getInstallmentSchedule = (debt) => {
    const list = [];
    const count = Math.max(1, debt.installmentCount || 1);
    const instAmt = debt.installmentAmount || (debt.amount / count);
    const startDate = debt.firstDueDate || debt.dueDate || debt.createdAt?.slice(0, 10) || getTodayDateString();
    const paid = Number(debt.paidAmount) || 0;
    const today = getTodayDateString();

    for (let i = 1; i <= count; i++) {
      const instDueDate = addMonthsToDate(startDate, i - 1);
      const targetCumulative = i * instAmt;
      const prevCumulative = (i - 1) * instAmt;

      let status = 'pending';
      if (paid >= targetCumulative - 0.5) {
        status = 'paid';
      } else if (paid >= prevCumulative - 0.5) {
        status = instDueDate < today ? 'overdue' : 'next';
      } else {
        status = instDueDate < today ? 'overdue' : 'pending';
      }

      list.push({
        number: i,
        dueDate: instDueDate,
        amount: instAmt,
        status,
      });
    }
    return list;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Handshake className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>{t('debts.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('debts.subtitle')}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openDebtModal()}
          icon={Plus}
          className="text-xs font-bold"
        >
          {t('debts.newDebt')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t('debts.lent')}</span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              +{formatMoney(totalLent)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">{t('debts.borrowed')}</span>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
              -{formatMoney(totalBorrowed)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Net</span>
            <div className={`text-xl font-black mt-1 ${totalLent >= totalBorrowed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(totalLent - totalBorrowed, true)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Handshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: t('transactions.filterAll') },
          { id: 'lent', label: t('debts.lent') },
          { id: 'borrowed', label: t('debts.borrowed') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Debt Cards List */}
      {filteredDebts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((d) => {
            const isLent = d.type === 'lent';
            const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
            const isCompleted = remaining === 0;
            const percentPaid = d.amount > 0 ? Math.min(100, ((d.paidAmount || 0) / d.amount) * 100) : 0;

            const isInst = Boolean(d.isInstallment && d.installmentCount > 1);
            const instCount = d.installmentCount || 1;
            const instAmt = d.installmentAmount || (d.amount / instCount);
            const paidInstCount = isInst
              ? Math.min(instCount, Math.floor(((d.paidAmount || 0) + 0.5) / instAmt))
              : 0;
            const remainingInstCount = Math.max(0, instCount - paidInstCount);
            const nextInstallmentAmt = Math.min(remaining, instAmt);

            const hasInterest = Boolean(d.interestRate && d.interestRate > 0);
            const schedule = isInst ? getInstallmentSchedule(d) : [];
            const isScheduleOpen = expandedScheduleDebtId === d.id;

            return (
              <div
                key={d.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header: Badges & Person Name & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isLent
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
                        }`}
                      >
                        {isLent ? t('debts.lent') : t('debts.borrowed')}
                      </span>

                      {hasInterest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/50 flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" />
                          <span>%{d.interestRate} {t('debts.withInterest')}</span>
                        </span>
                      )}

                      {isInst && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/50 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>{t('debts.installmentBadge', { count: instCount })}</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{d.personName}</h4>
                    {d.note && <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{d.note}"</p>}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {d.accountId && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                            {isLent ? t('debts.lentEntryAccountLabel', 'Çıkan Hesap') : t('debts.borrowedEntryAccountLabel', 'Yatan Hesap')}:
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {accounts.find((a) => a.id === d.accountId)?.name || t('common.account')}
                          </span>
                        </div>
                      )}
                      {d.repaymentAccountId && d.repaymentAccountId !== d.accountId && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                          <CreditCard className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            {isLent ? t('debts.collectAccountBadge', 'Tahsilat Hesabı') : t('debts.repayAccountBadge', 'Ödeme Hesabı')}:
                          </span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-300">
                            {accounts.find((a) => a.id === d.repaymentAccountId)?.name || t('common.account')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openDebtModal(d)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('debts.deleteConfirmMessage'))) {
                          deleteDebt(d.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    {hasInterest ? (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">
                          {t('debts.principalAmount')}:
                        </span>
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatMoney(d.principalAmount || d.amount)}
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          +{formatMoney(d.interestAmount || 0)} {t('debts.interestAmount')}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">
                          {t('debts.totalAmount')}:
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{formatMoney(d.amount)}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">
                      {t('debts.remainingAmount')}:
                    </span>
                    <div className={`font-black text-base mt-0.5 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isLent ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {isCompleted ? `✓ ${t('common.ok')}` : formatMoney(remaining)}
                    </div>
                    {d.paidAmount > 0 && !isCompleted && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {t('debts.paidAmount')}: {formatMoney(d.paidAmount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Installment Info & Progress */}
                {isInst && (
                  <div className="p-3 bg-sky-50/70 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-900 dark:text-sky-300 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{t('debts.installmentProgress', { paid: paidInstCount, total: instCount })}</span>
                      </span>
                      <span className="text-[11px] font-extrabold text-sky-800 dark:text-sky-300">
                        {formatMoney(instAmt)} / ay
                      </span>
                    </div>

                    {/* Progress Dots / Bar for Installments */}
                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      {Array.from({ length: instCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 rounded-full transition-all ${
                            idx < paidInstCount
                              ? 'bg-emerald-500'
                              : idx === paidInstCount && !isCompleted
                              ? 'bg-sky-500 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                          title={`${idx + 1}. Taksit ${idx < paidInstCount ? '(Ödendi)' : ''}`}
                        />
                      ))}
                    </div>

                    {!isCompleted && remainingInstCount > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-sky-800 dark:text-sky-300 pt-0.5">
                        <span>{t('debts.remainingInstallments', { count: remainingInstCount })}</span>
                        <button
                          type="button"
                          onClick={() => toggleSchedule(d.id)}
                          className="font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 underline flex items-center gap-0.5"
                        >
                          <span>{isScheduleOpen ? t('debts.hideInstallmentSchedule') : t('debts.viewInstallmentSchedule')}</span>
                          {isScheduleOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable Installment Schedule Table */}
                {isInst && isScheduleOpen && (
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 p-3 space-y-2 animate-slide-up text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-700">
                      <span>{t('debts.installmentScheduleTitle')}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{instCount} Ay Planı</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {schedule.map((item) => (
                        <div
                          key={item.number}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                            item.status === 'paid'
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                              : item.status === 'next'
                              ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50 text-sky-950 dark:text-sky-300 font-semibold'
                              : item.status === 'overdue'
                              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-950 dark:text-rose-300'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/80 dark:bg-slate-700/80 flex items-center justify-center font-bold text-[10px] shadow-2xs">
                              {item.number}
                            </span>
                            <div>
                              <div className="font-semibold">{formatDate(item.dueDate)}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{formatMoney(item.amount)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'paid'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                                  : item.status === 'next'
                                  ? 'bg-sky-200 dark:bg-sky-900/40 text-sky-900 dark:text-sky-300'
                                  : item.status === 'overdue'
                                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {item.status === 'paid' && `✓ ${t('debts.statusPaid')}`}
                              {item.status === 'next' && `⏳ ${t('debts.statusNext')}`}
                              {item.status === 'overdue' && `⚠️ ${t('debts.statusOverdue')}`}
                              {item.status === 'pending' && t('debts.statusPending')}
                            </span>

                            {item.status !== 'paid' && (
                              <button
                                type="button"
                                onClick={() =>
                                  openPaymentForDebt(
                                    d,
                                    item.amount,
                                    `${item.number}. Taksit Ödemesi`
                                  )
                                }
                                className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-[10px] font-bold shadow-xs"
                              >
                                {isLent ? 'Tahsil Et' : 'Öde'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Progress Bar (if not installment) */}
                {!isInst && (
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentPaid}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : isLent ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                )}

                {/* Footer & Action Buttons */}
                <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {d.dueDate
                        ? `${isInst ? t('debts.lastInstallmentDate') : t('debts.dueDate')}: ${formatDate(d.dueDate)}`
                        : '-'}
                    </span>
                  </span>

                  {!isCompleted && (
                    <div className="flex items-center gap-1.5">
                      {/* 1 Taksit Quick Pay Button (if installment) */}
                      {isInst && nextInstallmentAmt > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentForDebt(
                              d,
                              nextInstallmentAmt,
                              `${paidInstCount + 1}. Taksit (${formatMoney(nextInstallmentAmt)})`
                            )
                          }
                          className={`text-xs py-1.5 px-3 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1 ${
                            isLent
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          <span>{isLent ? t('debts.collectInstallment') : t('debts.payInstallment')}</span>
                          <span className="opacity-90 text-[11px]">({formatMoney(nextInstallmentAmt)})</span>
                        </button>
                      )}

                      {/* Custom Payment Button */}
                      <Button
                        size="sm"
                        variant={isInst ? 'secondary' : 'outline'}
                        onClick={() => openPaymentForDebt(d)}
                        className="text-[11px] py-1.5 px-2.5 h-auto font-bold"
                      >
                        {isInst ? 'Diğer Tutar' : t('debts.recordPayment')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
          <Handshake className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{t('debts.noDebts')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {t('debts.noDebtsSubtitle')}
          </p>
          <Button size="sm" icon={Plus} onClick={() => openDebtModal()}>
            {t('debts.addFirstDebt')}
          </Button>
        </div>
      )}

      {/* Payment Modal */}
      {activePaymentDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-slide-up">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activePaymentDebt.type === 'lent' ? 'Alacak Tahsilatı' : t('debts.recordPayment')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <strong>{activePaymentDebt.personName}</strong>
                {activePaymentDebt.isInstallment && (
                  <span className="text-sky-700 dark:text-sky-400 font-semibold ml-1.5">
                    ({activePaymentDebt.installmentCount} Taksitli)
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-4">
              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('debts.payAmount')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Payment Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('debts.paymentNote')}
                </label>
                <input
                  type="text"
                  placeholder="1. Taksit, Elden Nakit vs."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Linked Account Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>
                      {activePaymentDebt.type === 'lent'
                        ? t('debts.lentRepayAccountLabel', t('debts.lentAccountLabel'))
                        : t('debts.borrowedRepayAccountLabel', t('debts.borrowedAccountLabel'))}
                    </span>
                  </span>
                  {((activePaymentDebt.repaymentAccountId && paymentAccountId === activePaymentDebt.repaymentAccountId) ||
                    (!activePaymentDebt.repaymentAccountId && activePaymentDebt.accountId && paymentAccountId === activePaymentDebt.accountId)) && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Varsayılan
                    </span>
                  )}
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500"
                >
                  <option value="">{t('debts.noLinkedAccount')}</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {getAccountOptionLabel(acc)}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {activePaymentDebt.type === 'lent'
                    ? (language === 'en' ? 'Collected amount will be deposited into this account as income.' : 'Tahsil edilen tutar seçtiğiniz hesaba gelir olarak işlenir ve bakiye artar.')
                    : (language === 'en' ? 'Paid amount will be deducted from this account/card as an expense.' : 'Ödenen tutar seçtiğiniz hesaptan/karttan gider olarak düşülür.')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="secondary" onClick={() => setActivePaymentDebt(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" className="font-bold">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
