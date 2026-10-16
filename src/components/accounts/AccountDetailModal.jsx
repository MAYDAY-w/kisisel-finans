import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { TRANSACTION_TYPES, ACCOUNT_TYPE_CONFIG } from '../../types';
import {
  Wallet,
  Landmark,
  CreditCard,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ArrowRight,
  Calendar,
  Search,
  Plus,
  Camera,
  X,
  Clock,
  Tag,
  Edit2,
  Trash2,
  FileText,
  Moon,
  Sparkles,
  Link2,
  Layers,
  Crown,
} from 'lucide-react';

export function AccountDetailModal() {
  const {
    selectedAccountForDetail,
    closeAccountDetail,
    openAccountDetail,
    accounts,
    transactions,
    investments,
    formatMoney,
    openAddTransactionModal,
    openTransferModal,
    openReceiptViewer,
    deleteTransaction,
    processOvernightInterest,
    getCreditCardDetails,
    consolidateSubCardDebts,
    t,
    getAccountTypeName,
    getCategoryName,
    isEn,
    language,
  } = useFinance();

  const [timeRange, setTimeRange] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'
  const [directionFilter, setDirectionFilter] = useState('all'); // 'all' | 'inflow' | 'outflow'
  const [searchQuery, setSearchQuery] = useState('');
  const [statementMode, setStatementMode] = useState('consolidated'); // 'consolidated' | 'single'
  const [showConsolidateConfirm, setShowConsolidateConfirm] = useState(false);

  // Keep account synced with live state
  const currentAccount = useMemo(() => {
    if (!selectedAccountForDetail) return null;
    return accounts.find((a) => a.id === selectedAccountForDetail.id) || selectedAccountForDetail;
  }, [accounts, selectedAccountForDetail]);

  const isCredit = currentAccount?.type === 'credit_card';
  const ccDetails = useMemo(() => {
    if (!currentAccount || !isCredit) return null;
    return getCreditCardDetails(currentAccount);
  }, [currentAccount, isCredit, getCreditCardDetails]);

  // Compute investments linked to this account
  const linkedInvestments = useMemo(() => {
    if (!currentAccount) return [];
    return (investments || []).filter((inv) => inv.accountId === currentAccount.id);
  }, [investments, currentAccount]);

  // Compute all transactions related to this account
  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];

    const accId = currentAccount.id;
    const isMain = ccDetails?.isMainCard;
    const isConsolidated = isMain && statementMode === 'consolidated';
    const subCardIds = isMain ? ccDetails.subCards.map((sc) => sc.id) : [];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Week calculation (Monday to Sunday)
    const dayOfWeek = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = startOfWeek.toISOString().slice(0, 10);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const endOfWeekStr = endOfWeek.toISOString().slice(0, 10);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((tx) => {
        let isPrimary = tx.accountId === accId;
        let isTarget = tx.toAccountId === accId;

        if (isConsolidated) {
          if (!isPrimary && subCardIds.includes(tx.accountId)) isPrimary = true;
          if (!isTarget && subCardIds.includes(tx.toAccountId)) isTarget = true;
        }

        if (!isPrimary && !isTarget) return false;

        // Date range filter
        if (timeRange === 'daily') {
          if (tx.date !== todayStr) return false;
        } else if (timeRange === 'weekly') {
          if (tx.date < startOfWeekStr || tx.date > endOfWeekStr) return false;
        } else if (timeRange === 'monthly') {
          const d = new Date(tx.date);
          if (isNaN(d.getTime())) return false;
          if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return false;
        } else if (timeRange === 'yearly') {
          const d = new Date(tx.date);
          if (isNaN(d.getTime())) return false;
          if (d.getFullYear() !== currentYear) return false;
        }
        // 'all' includes all dates

        return true;
      })
      .map((tx) => {
        const isTarget = tx.toAccountId === accId || (isConsolidated && subCardIds.includes(tx.toAccountId));
        const isPrimary = tx.accountId === accId || (isConsolidated && subCardIds.includes(tx.accountId));

        let direction = 'outflow'; // 'inflow' | 'outflow'
        let counterAccountName = '';

        if (tx.type === TRANSACTION_TYPES.TRANSFER) {
          if (isTarget) {
            direction = 'inflow';
            const sourceAcc = accounts.find((a) => a.id === tx.accountId);
            counterAccountName = sourceAcc?.name || t('transfer.fromAccount');
          } else {
            direction = 'outflow';
            const destAcc = accounts.find((a) => a.id === tx.toAccountId);
            counterAccountName = destAcc?.name || t('transfer.toAccount');
          }
        } else if (tx.type === TRANSACTION_TYPES.INCOME || tx.type === TRANSACTION_TYPES.SALE) {
          direction = 'inflow';
        } else {
          direction = 'outflow';
        }

        const subCardAccount = isConsolidated && tx.accountId !== accId
          ? accounts.find((a) => a.id === tx.accountId)
          : null;

        return {
          ...tx,
          direction,
          counterAccountName,
          isTransfer: tx.type === TRANSACTION_TYPES.TRANSFER,
          isTarget,
          subCardName: subCardAccount?.name || null,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [currentAccount, ccDetails, statementMode, transactions, timeRange, accounts, t]);

  // Compute summary stats for the current time period
  const periodSummary = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;

    accountTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.direction === 'inflow') {
        totalInflow += amt;
      } else {
        totalOutflow += amt;
      }
    });

    return {
      totalInflow,
      totalOutflow,
      netChange: totalInflow - totalOutflow,
      count: accountTransactions.length,
      inflowCount: accountTransactions.filter((t) => t.direction === 'inflow').length,
      outflowCount: accountTransactions.filter((t) => t.direction === 'outflow').length,
    };
  }, [accountTransactions]);

  // Apply direction and search filters
  const filteredList = useMemo(() => {
    return accountTransactions.filter((tx) => {
      if (directionFilter !== 'all' && tx.direction !== directionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const desc = (tx.description || '').toLowerCase();
        const note = (tx.note || '').toLowerCase();
        const cat = (tx.categoryName || '').toLowerCase();
        const counter = (tx.counterAccountName || '').toLowerCase();
        if (!desc.includes(q) && !note.includes(q) && !cat.includes(q) && !counter.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [accountTransactions, directionFilter, searchQuery]);

  if (!currentAccount) return null;

  const config = ACCOUNT_TYPE_CONFIG[currentAccount.type] || ACCOUNT_TYPE_CONFIG.cash;
  const cardLimit = Number(currentAccount.limit) || 0;
  const balanceNum = Number(currentAccount.balance) || 0;
  const currentDebt = isCredit ? (balanceNum < 0 ? Math.abs(balanceNum) : 0) : 0;
  const excessBalance = isCredit ? (balanceNum > 0 ? balanceNum : 0) : 0;
  const remainingLimit = isCredit
    ? (cardLimit > 0 ? (cardLimit - currentDebt + excessBalance) : excessBalance)
    : 0;
  const limitUsedPercent = cardLimit > 0
    ? Math.min(100, Math.max(0, Math.round((currentDebt / cardLimit) * 100)))
    : 0;

  const getIcon = () => {
    switch (currentAccount.type) {
      case 'bank': return <Landmark className="w-6 h-6 text-blue-600" />;
      case 'credit_card': return <CreditCard className="w-6 h-6 text-purple-600" />;
      case 'investment': return <TrendingUp className="w-6 h-6 text-amber-600" />;
      default: return <Wallet className="w-6 h-6 text-emerald-600" />;
    }
  };

  const timeRangeTabs = [
    { id: 'daily', label: t('accounts.daily', 'Günlük') },
    { id: 'weekly', label: t('accounts.weekly', 'Haftalık') },
    { id: 'monthly', label: t('accounts.monthly', 'Aylık') },
    { id: 'yearly', label: t('accounts.yearly', 'Yıllık') },
    { id: 'all', label: t('accounts.allTime', 'Tüm Zamanlar') },
  ];

  return (
    <Modal
      isOpen={Boolean(selectedAccountForDetail)}
      onClose={closeAccountDetail}
      title={t('accounts.accountHistoryTitle', { name: currentAccount.name })}
      subtitle={t('accounts.accountHistorySubtitle')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Account Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-700/60 relative overflow-hidden space-y-3">
          <div className="flex items-start justify-between gap-3 relative z-10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.bgColor}`}>
                {getIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {currentAccount.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                    {getAccountTypeName(currentAccount.type, config.label)}
                  </span>
                  {ccDetails?.isMainCard && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      👑 {t('accounts.mainCardBadge')} • {ccDetails.subCards.length} {t('accounts.subCardBadge')}
                    </span>
                  )}
                  {ccDetails?.isSubCard && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      🔗 {ccDetails.parentCard?.name || 'Ana Kart'} {t('accounts.subCardBadge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isCredit
                    ? (ccDetails?.isMainCard
                        ? `${t('accounts.totalLimitLabel')} (Havuz): ${formatMoney(ccDetails.poolLimit)}`
                        : ccDetails?.isSubCard && ccDetails.subLimitCap
                        ? `Özel Alt Limit: ${formatMoney(ccDetails.subLimitCap)}`
                        : cardLimit > 0 ? `${t('accounts.totalLimitLabel')}: ${formatMoney(cardLimit)}` : t('accounts.currentDebt'))
                    : t('accounts.availableBalance')}
                </p>
              </div>
            </div>

            {/* Quick Actions in Banner */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  closeAccountDetail();
                  openTransferModal();
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/10 shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('accounts.transfer')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeAccountDetail();
                  openAddTransactionModal({ accountId: currentAccount.id });
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('transactions.newTransaction')}</span>
              </button>
            </div>
          </div>

          {/* Balance Metrics Strip */}
          <div className="pt-2 border-t border-slate-800/80">
            {isCredit ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Left Column: Debt */}
                  {ccDetails?.isMainCard ? (
                    <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider block">
                          {t('accounts.consolidatedDebt')}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
                          {ccDetails.subCards.length + 1} Kart
                        </span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-purple-200 mt-0.5">
                        {formatMoney(ccDetails.groupDebt)}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-medium flex items-center justify-between mt-1 pt-1 border-t border-purple-800/30">
                        <span>Ana: {formatMoney(ccDetails.ownDebt)}</span>
                        <span>Ek: {formatMoney(ccDetails.subCardsDebt)}</span>
                      </div>
                    </div>
                  ) : excessBalance > 0 ? (
                    <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
                          {t('accounts.excessBalance')}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {t('accounts.noDebt')}
                        </span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
                        +{formatMoney(excessBalance)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                      <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider block">
                        {t('accounts.currentDebt')}
                      </span>
                      <div className="text-base sm:text-lg font-black text-purple-200 mt-0.5">
                        {formatMoney(currentDebt)}
                      </div>
                      {ccDetails?.isSubCard && (
                        <div className="text-[9.5px] text-indigo-300 font-medium mt-1">
                          {currentAccount.limitType === 'custom' ? `Özel Limit: ${formatMoney(currentAccount.subLimit || 0)}` : 'Ortak Limit'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Middle Column: Available Limit */}
                  <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block truncate">
                        {ccDetails?.isSubCard ? t('accounts.subCardRemainingLimit') : t('accounts.availableLimit')}
                      </span>
                      {excessBalance > 0 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300" title={t('accounts.temporaryLimitBoost')}>
                          +{formatMoney(excessBalance)}
                        </span>
                      )}
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-200 mt-0.5">
                      {formatMoney(ccDetails ? ccDetails.availableLimit : (cardLimit > 0 || excessBalance > 0 ? remainingLimit : 0))}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-medium mt-1 truncate">
                      {ccDetails?.isMainCard
                        ? `Havuz Limiti: ${formatMoney(ccDetails.poolLimit)}`
                        : ccDetails?.isSubCard && ccDetails.subLimitCap
                        ? `Tavan: ${formatMoney(ccDetails.subLimitCap)}`
                        : cardLimit > 0
                        ? `${t('accounts.totalLimitLabel')}: ${formatMoney(cardLimit)}`
                        : 'Belirtilmedi'}
                    </div>
                  </div>

                  {/* Right Column: Limit summary */}
                  {(ccDetails?.isMainCard ? ccDetails.poolLimit > 0 : cardLimit > 0 || ccDetails?.subLimitCap) && (
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        {ccDetails?.isMainCard ? 'Havuz Limiti' : t('accounts.totalLimitLabel')}
                      </span>
                      <div className="text-base sm:text-lg font-black text-white mt-0.5">
                        {formatMoney(ccDetails?.isMainCard ? ccDetails.poolLimit : (ccDetails?.subLimitCap || cardLimit))}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-medium mt-1 truncate">
                        {ccDetails?.isMainCard ? `${ccDetails.subCards.length} Ek Kart Ortak` : ccDetails?.isSubCard ? 'Ek Kart' : 'Bağımsız Kart'}
                      </div>
                    </div>
                  )}
                </div>

                {(ccDetails?.isMainCard ? ccDetails.poolLimit > 0 : cardLimit > 0 || ccDetails?.subLimitCap) && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      {excessBalance > 0 ? (
                        <>
                          <span className="text-emerald-400 font-semibold">
                            {t('accounts.temporaryLimitBoost')}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            +{formatMoney(excessBalance)} {isEn ? 'Extra Limit' : 'Ekstra Limit'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {t('accounts.limitUsed', {
                              percent: ccDetails?.isMainCard ? ccDetails.groupLimitUsedPercent : (ccDetails?.limitUsedPercent || limitUsedPercent),
                            })}
                          </span>
                          <span>
                            %{100 - (ccDetails?.isMainCard ? ccDetails.groupLimitUsedPercent : (ccDetails?.limitUsedPercent || limitUsedPercent))} {isEn ? 'Remaining' : 'Kalan'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          excessBalance > 0
                            ? 'bg-emerald-500'
                            : (ccDetails?.isMainCard ? ccDetails.groupLimitUsedPercent : limitUsedPercent) > 90
                            ? 'bg-rose-500'
                            : (ccDetails?.isMainCard ? ccDetails.groupLimitUsedPercent : limitUsedPercent) > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: excessBalance > 0
                            ? '100%'
                            : `${ccDetails?.isMainCard ? ccDetails.groupLimitUsedPercent : limitUsedPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  {t('accounts.availableBalance')}
                </span>
                <div className={`text-2xl font-black tracking-tight mt-0.5 ${currentAccount.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {formatMoney(currentAccount.balance)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supplementary Cards Breakdown for Main Cards */}
        {ccDetails?.isMainCard && ccDetails.subCards.length > 0 && (
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('accounts.linkedCardsBreakdown')} ({ccDetails.subCards.length})</span>
              </span>
              {ccDetails.subCardsDebt > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConsolidateConfirm(true)}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  <span>{t('accounts.consolidateDebtsBtn')} ({formatMoney(ccDetails.subCardsDebt)})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ccDetails.subCards.map((sc) => {
                const scDebt = sc.balance < 0 ? Math.abs(sc.balance) : 0;
                const scDetails = getCreditCardDetails(sc);
                return (
                  <div
                    key={sc.id}
                    onClick={() => openAccountDetail(sc)}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                        <span>🔗 {sc.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {sc.limitType === 'custom'
                          ? `Alt Limit: ${formatMoney(sc.subLimit || 0)}`
                          : 'Ortak Havuz'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-purple-700 dark:text-purple-300">
                        {formatMoney(scDebt)}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Kalan: {formatMoney(scDetails.availableLimit)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Parent Card Info for Sub-Cards */}
        {ccDetails?.isSubCard && ccDetails.parentCard && (
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                👑
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {t('accounts.parentCard')}: {ccDetails.parentCard.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentAccount.limitType === 'custom'
                    ? `${t('accounts.subLimit')}: ${formatMoney(currentAccount.subLimit || 0)}`
                    : t('accounts.sharedPoolInfo')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAccountDetail(ccDetails.parentCard)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>{t('accounts.jumpToParentCard')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Linked Investments / Interest Accounts */}
        {linkedInvestments.length > 0 && (
          <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('investments.linkedInvestmentsTitle')} ({linkedInvestments.length})</span>
              </span>
              <span className="text-xs font-black text-teal-800">
                {formatMoney(
                  linkedInvestments.reduce((sum, inv) => {
                    if (inv.type === 'daily_interest') {
                      return sum + (Number(currentAccount.balance) || 0);
                    }
                    return (
                      sum +
                      (Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) *
                        Number(inv.quantity || 1))
                    );
                  }, 0)
                )}
              </span>
            </div>

            <div className="space-y-2.5">
              {linkedInvestments.map((inv) => {
                const isDaily = inv.type === 'daily_interest';
                const uninvested = Number(inv.uninvestedAmount) || 0;
                const rate = Number(inv.interestRate) || 0;
                const stopaj = inv.stopajRate !== undefined ? Number(inv.stopajRate) : 10;
                const activePrincipal = Math.max(0, (Number(currentAccount.balance) || 0) - uninvested);
                const grossDaily = rate > 0 ? (activePrincipal * (rate / 100)) / 365 : 0;
                const dailyNet = grossDaily - grossDaily * (stopaj / 100);
                const todayStr = new Date().toISOString().slice(0, 10);
                const isPaidToday = inv.lastInterestProcessedDate === todayStr;

                if (isDaily) {
                  return (
                    <div
                      key={inv.id}
                      className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 font-bold">
                            <Moon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{inv.name}</div>
                            <div className="text-[10px] text-teal-700 font-medium">
                              {t('assetTypes.daily_interest')} • %{rate} {t('investments.annualRate')}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded border border-teal-200">
                          %{stopaj} {t('investments.stopajAmount')}
                        </span>
                      </div>

                      {/* Liquid metrics */}
                      <div className="grid grid-cols-2 gap-2 p-2 bg-teal-50/50 rounded-lg border border-teal-100/80 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-500 block">
                            {t('investments.nightlyRunningPrincipal')}
                          </span>
                          <strong className="text-teal-900 font-extrabold">
                            {formatMoney(activePrincipal)}
                          </strong>
                          {uninvested > 0 && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              ({formatMoney(uninvested)} boşta alt limit)
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">
                            {t('investments.nightlyEstYield')}
                          </span>
                          <strong className="text-emerald-700 font-extrabold">
                            ~+{formatMoney(dailyNet)} / {t('investments.dailyGain')}
                          </strong>
                          {inv.totalEarnedInterest > 0 && (
                            <span className="text-[9px] text-teal-600 block mt-0.5 font-medium">
                              {formatMoney(inv.totalEarnedInterest)} toplam faiz ödendi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Manual Payout Action */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => processOvernightInterest(inv.id)}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                            isPaidToday
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>
                            {isPaidToday
                              ? t('investments.nightlyInterestAlreadyPaid')
                              : `${t('investments.processNightlyInterestNow')} (+${formatMoney(dailyNet)})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={inv.id}
                    className="p-2.5 bg-white rounded-xl border border-teal-100 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{inv.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>
                          {inv.type === 'deposit'
                            ? t('assetTypes.deposit')
                            : inv.typeName || inv.type}
                        </span>
                        {inv.interestRate && (
                          <span className="font-semibold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-100">
                            %{inv.interestRate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-teal-900">
                        {formatMoney(
                          Number(inv.currentPrice !== undefined ? inv.currentPrice : inv.purchasePrice) *
                            Number(inv.quantity || 1)
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10.5px] text-teal-900/80 bg-teal-100/60 p-2.5 rounded-xl border border-teal-200/50 leading-relaxed">
              {t('investments.liquidDailyNotice')}
            </div>
          </div>
        )}

        {/* Time Range Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
          {timeRangeTabs.map((tab) => {
            const isActive = timeRange === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id)}
                className={`flex-1 min-w-[70px] py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Selected Period KPI Cards (Inflow, Outflow, Net) */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('accounts.totalIncoming')}</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1">
              +{formatMoney(periodSummary.totalInflow)}
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('accounts.totalOutgoing')}</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-rose-700 mt-1">
              -{formatMoney(periodSummary.totalOutflow)}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-600">
              {t('accounts.netChange')}
            </div>
            <div className={`text-sm sm:text-base font-extrabold mt-1 ${periodSummary.netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatMoney(periodSummary.netChange, true)}
            </div>
          </div>
        </div>

        {/* Search & Sub-Filter Bar */}
        <div className="space-y-2 pt-1">
          {/* Main Card Statement Mode Toggle (Consolidated vs Only This Card) */}
          {ccDetails?.isMainCard && ccDetails.subCards.length > 0 && (
            <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2">
                Ekstre Görünümü:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatementMode('consolidated')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statementMode === 'consolidated'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  👑 {t('accounts.consolidatedView')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatementMode('single')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statementMode === 'single'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('accounts.onlyThisCard')}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap justify-between">
            {/* Direction Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDirectionFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  directionFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('accounts.allMovements')} ({periodSummary.count})
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter('inflow')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  directionFilter === 'inflow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('accounts.inflow')} ({periodSummary.inflowCount})
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter('outflow')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  directionFilter === 'outflow'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('accounts.outflow')} ({periodSummary.outflowCount})
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t('accounts.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto overscroll-contain pr-1">
          {filteredList.length > 0 ? (
            filteredList.map((tx) => {
              const isInflow = tx.direction === 'inflow';
              const catName = getCategoryName(tx.categoryId, tx.categoryName) || 'Diğer';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-750 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isInflow
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      {tx.isTransfer ? (
                        <ArrowRightLeft className="w-4 h-4" />
                      ) : isInflow ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.description || catName}
                        </span>

                        {/* Ek Kart Indicator if in consolidated mode */}
                        {tx.subCardName && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            🔗 {tx.subCardName}
                          </span>
                        )}

                        {tx.isTransfer ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${isInflow ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                            {isInflow ? t('accounts.transferIncoming') : t('accounts.transferOutgoing')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                            {catName}
                          </span>
                        )}

                        {tx.receiptImages && tx.receiptImages.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReceiptViewer(tx.receiptImages[0]);
                            }}
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800"
                            title="Fiş Görselini İncele"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{tx.receiptImages.length}</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span>{formatDate(tx.date)}</span>
                        {tx.isTransfer && tx.counterAccountName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {isInflow ? `Kaynak: ${tx.counterAccountName}` : `Hedef: ${tx.counterAccountName}`}
                            </span>
                          </>
                        )}
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              "{tx.note}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isInflow ? '+' : '-'}{formatMoney(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center flex flex-col items-center justify-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                {t('accounts.noTransactionsForPeriod')}
              </p>
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={() => {
                  closeAccountDetail();
                  openAddTransactionModal({ accountId: currentAccount.id });
                }}
                className="text-xs"
              >
                {t('accounts.addTransactionForAccount')}
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={closeAccountDetail} className="flex-1">
            {t('common.close')}
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              closeAccountDetail();
              openAddTransactionModal({ accountId: currentAccount.id });
            }}
            className="flex-1 font-bold"
          >
            {t('accounts.addTransactionForAccount')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConsolidateConfirm}
        onClose={() => setShowConsolidateConfirm(false)}
        onConfirm={() => {
          consolidateSubCardDebts(currentAccount.id);
          setShowConsolidateConfirm(false);
        }}
        title={t('accounts.consolidateDebtsBtn')}
        message={t('accounts.consolidateDebtsConfirm', {
          amount: formatMoney(ccDetails?.subCardsDebt || 0),
        })}
        confirmText={t('common.confirm', 'Onayla')}
      />
    </Modal>
  );
}
