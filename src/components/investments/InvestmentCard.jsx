import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatPercent, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit2,
  Trash2,
  Coins,
  LineChart,
  Bitcoin,
  Banknote,
  PieChart,
  Landmark,
  Clock,
  MoreVertical,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Moon,
  Sparkles,
} from 'lucide-react';

export function InvestmentCard({ investment }) {
  const {
    formatMoney,
    openPriceUpdateModal,
    openAddInvestmentModal,
    openAddBalanceModal,
    removeInvestmentBalance,
    deleteInvestment,
    processOvernightInterest,
    accounts,
    t,
    getAssetTypeName,
  } = useFinance();

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdditions, setShowAdditions] = useState(false);

  const linkedAccount = accounts?.find((a) => a.id === investment.accountId);
  const isInterestAsset = investment.type === 'daily_interest' || investment.type === 'deposit';
  const isDailyLinked = investment.type === 'daily_interest' && Boolean(linkedAccount);
  const liveBalance = isDailyLinked ? (Number(linkedAccount.balance) || 0) : 0;

  const quantity = Number(investment.quantity) || 1;
  const cumulativeEarned = Number(investment.totalEarnedInterest) || 0;
  const additions = Array.isArray(investment.additions) ? investment.additions : [];
  const additionsTotal = additions.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  const totalCost = isDailyLinked
    ? Math.max(0, liveBalance - cumulativeEarned)
    : ((quantity * (Number(investment.purchasePrice) || 0)) + additionsTotal);
  const buyPrice = isDailyLinked
    ? (Number(investment.purchasePrice) || totalCost)
    : (Number(investment.purchasePrice) || 0);

  const currentPrice = isDailyLinked
    ? liveBalance
    : (Number(investment.currentPrice !== undefined ? investment.currentPrice : investment.purchasePrice) || 0);

  const currentValue = isDailyLinked ? liveBalance : (quantity * currentPrice);
  const profit = isDailyLinked ? cumulativeEarned : (currentValue - totalCost);
  const profitPercent = isDailyLinked
    ? (totalCost > 0 ? (cumulativeEarned / totalCost) * 100 : 0)
    : (totalCost > 0 ? (profit / totalCost) * 100 : 0);
  const isProfit = profit >= 0;

  const stopajRate = investment.stopajRate !== undefined ? Number(investment.stopajRate) : 10;
  const uninvested = Number(investment.uninvestedAmount) || 0;
  const activePrincipal = isDailyLinked
    ? Math.max(0, liveBalance - uninvested)
    : Math.max(0, totalCost - uninvested);

  const grossDaily = investment.interestRate
    ? (activePrincipal * (Number(investment.interestRate) / 100)) / 365
    : 0;
  const dailyTax = grossDaily * (stopajRate / 100);
  const dailyNet = grossDaily - dailyTax;

  const todayStr = new Date().toISOString().slice(0, 10);
  const isPaidToday = investment.lastInterestProcessedDate === todayStr;

  const getAssetIcon = (type) => {
    switch (type) {
      case 'gold':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'stocks':
        return <LineChart className="w-5 h-5 text-cyan-600" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5 text-amber-600" />;
      case 'currency':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      case 'deposit':
        return <Landmark className="w-5 h-5 text-indigo-600" />;
      case 'daily_interest':
        return <Clock className="w-5 h-5 text-teal-600" />;
      default:
        return <PieChart className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
              {getAssetIcon(investment.type)}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {investment.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isInterestAsset ? (investment.unit || 'TL') : `${quantity} ${investment.unit || 'adet'}`}
                </span>
                {investment.purchaseDate && (
                  <>
                    <span>•</span>
                    <span>{t('investments.purchaseDate')}: {formatDate(investment.purchaseDate)}</span>
                  </>
                )}
              </div>
              {isDailyLinked ? (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md mt-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('investments.liquidBalanceSynced')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{linkedAccount.name}</span>
                </div>
              ) : linkedAccount ? (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-md mt-1.5 shadow-2xs">
                  <Landmark className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('investments.linkedAccountBadge')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{linkedAccount.name}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-30 text-xs font-medium animate-slide-up">
                  {isInterestAsset && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        openAddBalanceModal(investment);
                      }}
                      className="w-full text-left px-3.5 py-2 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2 font-semibold"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{t('investments.addBalance')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openPriceUpdateModal(investment);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    <span>{t('investments.updatePrice')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openAddInvestmentModal(investment);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('common.edit')}</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Daily Interest / Deposit Special Badge */}
        {investment.type === 'daily_interest' && (
          <div className="flex flex-col gap-2.5 p-3.5 bg-teal-50/90 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50 rounded-xl text-xs -mb-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t('assetTypes.daily_interest')}</span>
              </span>
              <div className="flex items-center gap-2">
                {!isDailyLinked && (
                  <button
                    type="button"
                    onClick={() => openAddBalanceModal(investment)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-teal-100/70 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 font-bold text-[11px] rounded-lg border border-teal-200 dark:border-teal-800 transition-colors shadow-2xs"
                  >
                    <PlusCircle className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>{t('investments.addBalance')}</span>
                  </button>
                )}
                <div className="font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                  <span>{investment.interestRate ? `%${investment.interestRate}` : ''}</span>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    %{stopajRate} {t('investments.stopajAmount')}
                  </span>
                </div>
              </div>
            </div>

            {dailyNet > 0 && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-teal-100/60 dark:border-teal-800/40">
                <span className="text-teal-700 dark:text-teal-400 font-medium">{t('investments.dailyNetReturn')}:</span>
                <span className="font-bold text-teal-900 dark:text-teal-200">
                  ~+{formatMoney(dailyNet)} / {t('investments.dailyGain')}
                </span>
              </div>
            )}

            {isDailyLinked && (
              <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/40 flex flex-col gap-2">
                <div className="text-[11px] text-teal-900/90 dark:text-teal-200 bg-teal-100/70 dark:bg-teal-900/40 p-2.5 rounded-lg leading-relaxed border border-teal-200/50 dark:border-teal-800/50">
                  {t('investments.liquidDailyNotice')}
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10.5px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
                    <Moon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>{t('investments.midnightAccrualInfo')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isPaidToday) {
                        alert(t('investments.nightlyInterestAlreadyPaid', 'Bugünkü gecelik faiz zaten hesabınıza yatırılmış.'));
                        return;
                      }
                      processOvernightInterest(investment.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isPaidToday
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 border border-emerald-300 dark:border-emerald-700'
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
            )}
          </div>
        )}

        {investment.type === 'deposit' && investment.interestRate && (
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-xs -mb-1">
            <span className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t('assetTypes.deposit')}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAddBalanceModal(investment)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-100/70 dark:hover:bg-slate-700 text-indigo-800 dark:text-indigo-300 font-bold text-[11px] rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>{t('investments.addBalance')}</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                  %{investment.interestRate}
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  %{stopajRate} {t('investments.stopajAmount')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Matrix */}
        {isDailyLinked ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2.5 p-3 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs">
              <div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">{t('accounts.availableBalance')}</div>
                <div className="text-slate-900 dark:text-white font-bold mt-0.5 text-sm">
                  {formatMoney(liveBalance)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('investments.uninvestedFloor')}: <strong>{formatMoney(uninvested)}</strong>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">{t('investments.nightlyRunningPrincipal')}</div>
                <div className="text-teal-900 dark:text-teal-200 font-bold mt-0.5 text-sm">
                  {formatMoney(activePrincipal)}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  {t('investments.nightlyEstYield')}: ~+{formatMoney(dailyNet)}
                </div>
              </div>
            </div>

            {/* Price & Principal Summary for Liquid Interest */}
            <div className="grid grid-cols-2 gap-2.5 px-3 py-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">{t('investments.initialPrincipal')}:</span>
                <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatMoney(buyPrice)}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">{t('investments.currentPrice')}:</span>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{formatMoney(currentPrice)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{t('investments.costPrice')}</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">
                {formatMoney(buyPrice)}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal"> / {investment.unit || 'adet'}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t('investments.costTotal')}: <strong>{formatMoney(totalCost)}</strong>
                {additionsTotal > 0 && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    ({formatMoney(buyPrice)} ilk + {formatMoney(additionsTotal)} ek)
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-between">
                <span>{t('investments.currentPrice')}</span>
                <button
                  type="button"
                  onClick={() => openPriceUpdateModal(investment)}
                  className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                >
                  {t('investments.updatePrice')}
                </button>
              </div>
              <div className="text-slate-900 dark:text-white font-bold mt-0.5">
                {formatMoney(currentPrice)}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal"> / {investment.unit || 'adet'}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t('investments.currentTotal')}: <strong>{formatMoney(currentValue)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Additions Breakdown & History (if any) */}
        {isInterestAsset && additions.length > 0 && (
          <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-2.5 text-xs -mt-1 space-y-1.5">
            <button
              type="button"
              onClick={() => setShowAdditions(!showAdditions)}
              className="w-full flex items-center justify-between text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t('investments.balanceAdditions')}</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/70 dark:bg-emerald-900/40 px-1.5 py-0.2 rounded text-[10px]">
                  +{formatMoney(additionsTotal)} ({additions.length})
                </span>
              </span>
              {showAdditions ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showAdditions && (
              <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                {additions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/70 text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        +{formatMoney(a.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <span>{formatDate(a.date)}</span>
                        {a.note && <span>• {a.note}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t('investments.deleteAdditionConfirm'))) {
                          removeInvestmentBalance(investment.id, a.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profit / Loss Bottom Bar */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isDailyLinked ? t('investments.totalInterestPaidToAccount') : t('investments.netProfitLoss')}
            </div>
            <div
              className={`text-sm font-extrabold flex items-center gap-1 mt-0.5 ${
                isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{formatMoney(profit, true)}</span>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              isProfit
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
            }`}
          >
            {isDailyLinked
              ? `%${investment.interestRate || 0} ${t('investments.nightlyInterestActiveBadge')}`
              : formatPercent(profitPercent)}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteInvestment(investment.id)}
        title={t('investments.deleteConfirmTitle')}
        message={t('investments.deleteConfirmMessage', { name: investment.name })}
        confirmText={t('common.delete')}
      />
    </>
  );
}
