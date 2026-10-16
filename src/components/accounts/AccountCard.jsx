import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ACCOUNT_TYPE_CONFIG } from '../../types/index.js';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Wallet,
  Landmark,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Moon,
  Layers,
  ChevronDown,
  ChevronUp,
  Link2,
} from 'lucide-react';

export function AccountCard({ account }) {
  const {
    formatMoney,
    openAccountModal,
    openTransferModal,
    openAccountDetail,
    deleteAccount,
    getCreditCardDetails,
    consolidateSubCardDebts,
    investments,
    t,
    getAccountTypeName,
    language,
  } = useFinance();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConsolidateConfirm, setShowConsolidateConfirm] = useState(false);
  const [showSubCards, setShowSubCards] = useState(false);

  const config = ACCOUNT_TYPE_CONFIG[account.type] || ACCOUNT_TYPE_CONFIG.cash;

  const linkedDailyInvestment = (investments || []).find(
    (inv) => inv.accountId === account.id && inv.type === 'daily_interest'
  );
  const dailyInvRate = Number(linkedDailyInvestment?.interestRate) || 0;
  const dailyInvUninvested = Number(linkedDailyInvestment?.uninvestedAmount) || 0;
  const dailyInvStopaj =
    linkedDailyInvestment?.stopajRate !== undefined ? Number(linkedDailyInvestment.stopajRate) : 10;
  const balanceNum = Number(account.balance) || 0;
  const dailyInvActivePrincipal = Math.max(0, balanceNum - dailyInvUninvested);
  const dailyGross = dailyInvRate > 0 ? (dailyInvActivePrincipal * (dailyInvRate / 100)) / 365 : 0;
  const dailyEstNet = dailyGross - (dailyGross * (dailyInvStopaj / 100));

  const getIcon = () => {
    switch (account.type) {
      case 'bank': return <Landmark className="w-5 h-5 text-blue-600" />;
      case 'credit_card': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'investment': return <TrendingUp className="w-5 h-5 text-amber-600" />;
      default: return <Wallet className="w-5 h-5 text-emerald-600" />;
    }
  };

  const isCredit = account.type === 'credit_card';
  const ccDetails = isCredit ? getCreditCardDetails(account) : null;

  const cardLimit = Number(account.limit) || 0;
  const currentDebt = isCredit ? (balanceNum < 0 ? Math.abs(balanceNum) : 0) : 0;
  const excessBalance = isCredit ? (balanceNum > 0 ? balanceNum : 0) : 0;
  const remainingLimit = ccDetails ? ccDetails.availableLimit : 0;
  const limitUsedPercent = ccDetails
    ? (ccDetails.isMainCard ? ccDetails.groupLimitUsedPercent : ccDetails.limitUsedPercent)
    : 0;

  return (
    <>
      <div
        onClick={() => openAccountDetail(account)}
        className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 shadow-sm hover:border-primary-400 dark:hover:border-primary-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
          ccDetails?.isSubCard
            ? 'border-indigo-150 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/20 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900'
            : ccDetails?.isMainCard
            ? 'border-amber-200/80 dark:border-amber-900/40 shadow-xs'
            : 'border-slate-100 dark:border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${config.bgColor} group-hover:scale-105 transition-transform`}>
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {account.name}
                </h4>
                {/* Main Card Badge */}
                {ccDetails?.isMainCard && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-full">
                    👑 {t('accounts.mainCardBadge')} • {ccDetails.subCards.length} {t('accounts.subCardBadge')}
                  </span>
                )}
                {/* Sub Card Badge */}
                {ccDetails?.isSubCard && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-2 py-0.5 rounded-full">
                    <Link2 className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[120px]">{ccDetails.parentCard?.name || 'Ana Kart'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {getAccountTypeName(account.type, config.label)}
                </span>
                {ccDetails?.isSubCard && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    • {account.limitType === 'custom' ? `${t('accounts.limitModeCustom').split('(')[0]}` : t('accounts.limitModeShared').split('(')[0]}
                  </span>
                )}
                {linkedDailyInvestment && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 px-2 py-0.5 rounded-full">
                    <Moon className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                    <span>%{dailyInvRate} {t('investments.nightlyInterestActiveBadge')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-30 text-xs font-medium animate-slide-up">
                  {/* Main card debt consolidate option */}
                  {ccDetails?.isMainCard && ccDetails.subCardsDebt > 0 && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowConsolidateConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-bold"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('accounts.consolidateDebtsBtn')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openTransferModal();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    <span>{t('transfer.title', 'Para Transferi')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      openAccountModal(account);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
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
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          {isCredit ? (
            <div className="space-y-3">
              {/* Debt / Excess and Remaining Limit Columns */}
              <div className="grid grid-cols-2 gap-2">
                {/* Left Card: Debt or Excess */}
                {ccDetails?.isMainCard ? (
                  <div className="bg-purple-50/70 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                        {t('accounts.consolidatedDebt')}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                        {ccDetails.subCards.length + 1} Kart
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-purple-900 dark:text-purple-200 tracking-tight mt-0.5">
                      {formatMoney(ccDetails.groupDebt)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between mt-1 pt-1 border-t border-purple-100/60 dark:border-purple-900/40">
                      <span>Ana: {formatMoney(ccDetails.ownDebt)}</span>
                      <span>Ek: {formatMoney(ccDetails.subCardsDebt)}</span>
                    </div>
                  </div>
                ) : excessBalance > 0 ? (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        {t('accounts.excessBalance')}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                        {t('accounts.noDebt')}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-0.5">
                      +{formatMoney(excessBalance)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50/70 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                      {t('accounts.currentDebt', 'Güncel Borç')}
                    </span>
                    <div className="text-base sm:text-lg font-black text-purple-900 dark:text-purple-200 tracking-tight mt-0.5">
                      {formatMoney(currentDebt)}
                    </div>
                    {ccDetails?.isSubCard && (
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                        {account.limitType === 'custom' ? `Özel Limit: ${formatMoney(account.subLimit || 0)}` : 'Ortak Havuz Borcu'}
                      </div>
                    )}
                  </div>
                )}

                {/* Right Card: Remaining Limit */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block truncate">
                      {ccDetails?.isSubCard ? t('accounts.subCardRemainingLimit') : t('accounts.remainingLimit')}
                    </span>
                    {excessBalance > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 animate-pulse" title={t('accounts.temporaryLimitBoost')}>
                        +{formatMoney(excessBalance)}
                      </span>
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 tracking-tight mt-0.5">
                    {formatMoney(remainingLimit)}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                    {ccDetails?.isMainCard
                      ? `Havuz Limiti: ${formatMoney(ccDetails.poolLimit)}`
                      : ccDetails?.isSubCard && ccDetails.subLimitCap
                      ? `Alt Limit: ${formatMoney(ccDetails.subLimitCap)}`
                      : cardLimit > 0
                      ? `${t('accounts.totalLimit')}: ${formatMoney(cardLimit)}`
                      : (language === 'en' ? 'Pool limit' : 'Ortak limit')}
                  </div>
                </div>
              </div>

              {/* Limit Details & Progress Bar */}
              {(ccDetails?.isMainCard ? ccDetails.poolLimit > 0 : cardLimit > 0 || ccDetails?.subLimitCap) && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {ccDetails?.isMainCard ? 'Grup Havuz Limiti' : t('accounts.totalLimit')}:{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {formatMoney(ccDetails?.isMainCard ? ccDetails.poolLimit : (ccDetails?.subLimitCap || cardLimit))}
                      </strong>
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {excessBalance > 0
                        ? (language === 'en' ? `+${formatMoney(excessBalance)} Extra Limit` : `+${formatMoney(excessBalance)} Ekstra Limit`)
                        : (language === 'en' ? `${limitUsedPercent}% Used` : `%${limitUsedPercent} Dolu`)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        excessBalance > 0
                          ? 'bg-emerald-500'
                          : limitUsedPercent > 90
                          ? 'bg-rose-500'
                          : limitUsedPercent > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: excessBalance > 0 ? '100%' : `${limitUsedPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Main Card: Expandable Sub-Cards Preview */}
              {ccDetails?.isMainCard && ccDetails.subCards.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSubCards(!showSubCards);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-bold transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>
                        {showSubCards
                          ? t('accounts.hideLinkedCards')
                          : t('accounts.showLinkedCards', { count: ccDetails.subCards.length })}
                      </span>
                    </span>
                    {showSubCards ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showSubCards && (
                    <div
                      className="mt-2 space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/70 animate-slide-up"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ccDetails.subCards.map((sc) => {
                        const scDebt = sc.balance < 0 ? Math.abs(sc.balance) : 0;
                        return (
                          <div
                            key={sc.id}
                            onClick={() => openAccountDetail(sc)}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                🔗 {sc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {sc.limitType === 'custom' ? `Alt Limit: ${formatMoney(sc.subLimit || 0)}` : 'Ortak Limit'}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-purple-700 dark:text-purple-300 block">
                                {formatMoney(scDebt)}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                {t('accounts.debtLabel')}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Consolidation Action */}
                      {ccDetails.subCardsDebt > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowConsolidateConfirm(true)}
                          className="w-full py-1.5 px-2 mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{t('accounts.consolidateDebtsBtn')} ({formatMoney(ccDetails.subCardsDebt)})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  {t('accounts.availableBalance', 'Kullanılabilir Bakiye')}
                </span>
                <div
                  className={`text-xl font-extrabold tracking-tight mt-0.5 ${
                    account.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatMoney(account.balance)}
                </div>
              </div>

              {linkedDailyInvestment ? (
                <div className="text-right text-xs">
                  <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold flex items-center justify-end gap-1">
                    <Moon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>{t('investments.dailyNetReturn')}</span>
                  </div>
                  <div className="font-extrabold text-teal-800 dark:text-teal-300 mt-0.5">
                    ~+{formatMoney(dailyEstNet)}
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                    00:00 nemalanan: {formatMoney(dailyInvActivePrincipal)}
                  </div>
                </div>
              ) : account.limit ? (
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <span>{t('budget.limit')}: </span>
                  <strong className="text-slate-700 dark:text-slate-300">{formatMoney(account.limit)}</strong>
                </div>
              ) : null}
            </div>
          )}

          {/* Card Footer: View transactions CTA */}
          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t('accounts.viewTransactions')}
            </span>
            <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>{t('accounts.cardTransactions')}</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteAccount(account.id)}
        title={t('common.delete')}
        message={language === 'en' ? `Are you sure you want to delete "${account.name}"?` : `"${account.name}" hesabını silmek istediğinize emin misiniz?`}
        confirmText={language === 'en' ? 'Yes, Delete' : 'Evet, Sil'}
      />

      <ConfirmDialog
        isOpen={showConsolidateConfirm}
        onClose={() => setShowConsolidateConfirm(false)}
        onConfirm={() => {
          consolidateSubCardDebts(account.id);
          setShowConsolidateConfirm(false);
        }}
        title={t('accounts.consolidateDebtsBtn')}
        message={t('accounts.consolidateDebtsConfirm', {
          amount: formatMoney(ccDetails?.subCardsDebt || 0),
        })}
        confirmText={t('common.confirm', 'Onayla')}
      />
    </>
  );
}
