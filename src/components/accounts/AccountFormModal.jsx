import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_CONFIG } from '../../types/index.js';

export function AccountFormModal() {
  const { isAccountModalOpen, closeAccountModal, editingAccount, addAccount, updateAccount, accounts, t, getAccountTypeName } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');

  // Ek / Bağlı Kart State
  const [isSubCard, setIsSubCard] = useState(false);
  const [parentAccountId, setParentAccountId] = useState('');
  const [limitType, setLimitType] = useState('shared'); // 'shared' | 'custom'
  const [subLimit, setSubLimit] = useState('');

  // Bağlanabilecek Ana Kartlar
  const availableParentCards = (accounts || []).filter(
    (a) => a.type === 'credit_card' && !a.parentAccountId && (!editingAccount || a.id !== editingAccount.id)
  );

  // Bu kart halihazırda başka kartların ana kartı mı?
  const childCardsOfThis = editingAccount
    ? (accounts || []).filter((a) => a.parentAccountId === editingAccount.id)
    : [];
  const isParentOfOthers = childCardsOfThis.length > 0;

  useEffect(() => {
    if (isAccountModalOpen) {
      if (editingAccount) {
        setName(editingAccount.name || '');
        setType(editingAccount.type || 'bank');
        setBalance(
          editingAccount.balance !== undefined
            ? String(editingAccount.type === 'credit_card' ? Math.abs(editingAccount.balance) : editingAccount.balance)
            : ''
        );
        setLimit(editingAccount.limit !== undefined ? String(editingAccount.limit) : '');

        const isSub = Boolean(editingAccount.parentAccountId);
        setIsSubCard(isSub);
        setParentAccountId(editingAccount.parentAccountId || (availableParentCards[0]?.id || ''));
        setLimitType(editingAccount.limitType || 'shared');
        setSubLimit(editingAccount.subLimit !== undefined ? String(editingAccount.subLimit) : '');
      } else {
        setName('');
        setType('bank');
        setBalance('0');
        setLimit('');
        setIsSubCard(false);
        setParentAccountId(availableParentCards[0]?.id || '');
        setLimitType('shared');
        setSubLimit('');
      }
    }
  }, [isAccountModalOpen, editingAccount]);

  const isExistingCreditExcess = editingAccount && editingAccount.type === 'credit_card' && Number(editingAccount.balance) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let parsedBalance = parseFloat(balance.replace(',', '.')) || 0;
    if (type === 'credit_card') {
      if (isExistingCreditExcess) {
        parsedBalance = Math.abs(parsedBalance);
      } else if (parsedBalance > 0) {
        // Kredi kartı borcu sistemde negatif bakiye olarak tutulur
        parsedBalance = -parsedBalance;
      }
    }

    const isLinked = type === 'credit_card' && isSubCard && parentAccountId;

    const payload = {
      name: name.trim(),
      type,
      balance: parsedBalance,
      limit: (!isLinked || limitType !== 'shared') && limit ? parseFloat(limit.replace(',', '.')) : undefined,
      parentAccountId: isLinked ? parentAccountId : null,
      limitType: isLinked ? limitType : undefined,
      subLimit: isLinked && limitType === 'custom' && subLimit ? parseFloat(subLimit.replace(',', '.')) : undefined,
    };

    if (editingAccount) {
      updateAccount(editingAccount.id, payload);
    } else {
      addAccount(payload);
    }
    closeAccountModal();
  };

  return (
    <Modal
      isOpen={isAccountModalOpen}
      onClose={closeAccountModal}
      title={editingAccount ? t('accounts.editAccount') : t('accounts.newAccount')}
      subtitle={t('accounts.subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            {t('accounts.accountType')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ACCOUNT_TYPE_CONFIG).map((cfg) => (
              <button
                type="button"
                key={cfg.id}
                onClick={() => setType(cfg.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === cfg.id
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {getAccountTypeName(cfg.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('accounts.accountName')}
          </label>
          <input
            type="text"
            placeholder="Garanti BBVA, Nakit Cüzdan..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
          />
        </div>

        {/* Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {type === 'credit_card'
              ? (isExistingCreditExcess ? t('accounts.excessBalance') : t('accounts.currentDebt'))
              : t('accounts.balance')}
          </label>
          <input
            type="number"
            step="any"
            placeholder="0,00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
          />
        </div>

        {/* Credit Card Specific Options: Ek Kart & Limit */}
        {type === 'credit_card' && (
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* If this card already has sub-cards attached to it */}
            {isParentOfOthers ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  👑 {t('accounts.mainCardBadge')}
                </span>
                {t('accounts.hasLinkedCardsNotice', {
                  count: childCardsOfThis.length,
                  cards: childCardsOfThis.map((c) => c.name).join(', '),
                })}
              </div>
            ) : availableParentCards.length > 0 || isSubCard ? (
              /* Sub-card toggle */
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSubCard}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSubCard(checked);
                      if (checked && !parentAccountId && availableParentCards[0]) {
                        setParentAccountId(availableParentCards[0].id);
                      }
                    }}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      🔗 {t('accounts.isSubCard')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                      {t('accounts.isSubCardDesc')}
                    </span>
                  </div>
                </label>

                {/* Sub-card details */}
                {isSubCard && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-3">
                    {/* Parent card selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        {t('accounts.parentCard')}
                      </label>
                      <select
                        value={parentAccountId}
                        onChange={(e) => setParentAccountId(e.target.value)}
                        required={isSubCard}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>
                          {t('accounts.selectParentCard')}
                        </option>
                        {availableParentCards.map((pc) => (
                          <option key={pc.id} value={pc.id}>
                            👑 {pc.name} (Limit: {Number(pc.limit || 0).toLocaleString('tr-TR')} ₺)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Limit Mode Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        {t('accounts.limitMode')}
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => setLimitType('shared')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            limitType === 'shared'
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-200'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>{t('accounts.limitModeShared')}</span>
                            {limitType === 'shared' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('accounts.sharedPoolInfo')}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLimitType('custom')}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            limitType === 'custom'
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-200'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span>{t('accounts.limitModeCustom')}</span>
                            {limitType === 'custom' && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Ana kart limiti içinde bu ek karta özel maksimum harcama limiti belirleyin.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Custom Sub Limit Input */}
                    {limitType === 'custom' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                          {t('accounts.subLimit')}
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder={t('accounts.subLimitPlaceholder')}
                          value={subLimit}
                          onChange={(e) => setSubLimit(e.target.value)}
                          required={limitType === 'custom'}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* Normal Credit Limit (shown if not a sub-card) */}
            {!isSubCard && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('accounts.creditLimit')}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="50000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeAccountModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingAccount ? t('common.edit') : t('accounts.saveAccount')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
