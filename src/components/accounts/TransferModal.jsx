import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ArrowRightLeft } from 'lucide-react';

export function TransferModal() {
  const { isTransferModalOpen, closeTransferModal, accounts, transferFunds, getCreditCardDetails, formatMoney, t, language } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const toAcc = accounts.find((a) => a.id === toAccountId);

  const getAccountOptionLabel = (acc) => {
    if (acc.type === 'credit_card') {
      const details = getCreditCardDetails ? getCreditCardDetails(acc) : null;
      const bNum = Number(acc.balance) || 0;
      const prefix = details?.isMainCard
        ? '[👑 Ana Kart] '
        : details?.isSubCard
        ? `[🔗 Ek Kart] `
        : '';

      if (bNum > 0) {
        return `${prefix}${acc.name} (${language === 'en' ? 'Excess: +' : 'Artı Bakiye: +'}${formatMoney(bNum)} | ${language === 'en' ? 'Avail: ' : 'Kalan: '}${formatMoney(details ? details.availableLimit : bNum)})`;
      } else if (bNum < 0) {
        const debt = Math.abs(bNum);
        return `${prefix}${acc.name} (${language === 'en' ? 'Debt: ' : 'Borç: '}${formatMoney(debt)} | ${language === 'en' ? 'Avail: ' : 'Kalan: '}${formatMoney(details ? details.availableLimit : 0)})`;
      } else {
        return `${prefix}${acc.name} (${language === 'en' ? 'No Debt' : 'Borç Yok'} | ${language === 'en' ? 'Avail: ' : 'Kalan: '}${formatMoney(details ? details.availableLimit : 0)})`;
      }
    }
    return `${acc.name} (${formatMoney(acc.balance)})`;
  };

  const handleSwapAccounts = () => {
    setFromAccountId(toAccountId);
    setToAccountId(fromAccountId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert(t('transfer.validAmountError') || 'Geçerli bir transfer tutarı giriniz.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert(t('transfer.sameAccountError') || 'Kaynak ve hedef hesap aynı olamaz.');
      return;
    }

    transferFunds(fromAccountId, toAccountId, parsed, description.trim() || t('transactions.transfer'));
    closeTransferModal();
    setAmount('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isTransferModalOpen}
      onClose={closeTransferModal}
      title={t('transfer.title')}
      subtitle={t('transfer.subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('transfer.fromAccount')}
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {getAccountOptionLabel(acc)}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Accounts Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwapAccounts}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-95 border border-slate-200/90 dark:border-slate-700 hover:border-emerald-300 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-all shadow-xs group cursor-pointer"
            title={t('transfer.swapAccounts')}
          >
            <ArrowRightLeft className="w-4 h-4 rotate-90 group-hover:scale-110 group-active:rotate-[270deg] transition-all duration-300" />
          </button>
        </div>

        {/* To Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('transfer.toAccount')}
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {getAccountOptionLabel(acc)}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('transfer.amount')}
          </label>
          <input
            type="number"
            step="any"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full text-2xl font-bold px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />

          {toAcc?.type === 'credit_card' && (
            <div className="mt-2 p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 text-xs space-y-1">
              {Number(toAcc.balance) < 0 ? (
                <div className="flex items-center justify-between text-purple-900 dark:text-purple-200">
                  <span>{t('accounts.currentDebt')}: <strong>{formatMoney(Math.abs(toAcc.balance))}</strong></span>
                  <button
                    type="button"
                    onClick={() => setAmount(String(Math.abs(toAcc.balance)))}
                    className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 underline"
                  >
                    {language === 'en' ? 'Pay exact debt' : 'Borcu Kapat'}
                  </button>
                </div>
              ) : (
                <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {language === 'en'
                    ? `Current excess balance: +${formatMoney(toAcc.balance || 0)}. Any transfer will further increase available limit.`
                    : `Mevcut artı bakiye: +${formatMoney(toAcc.balance || 0)}. Yapılan transfer kullanılabilir kart limitini geçici olarak artıracaktır.`}
                </div>
              )}
              {Number(toAcc.balance) < 0 && Number(amount) > Math.abs(toAcc.balance) && (
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-purple-200/50 dark:border-purple-800/50">
                  {language === 'en'
                    ? `✨ Debt will be settled (0 ₺), and +${formatMoney(Number(amount) - Math.abs(toAcc.balance))} excess will boost your available limit!`
                    : `✨ Kart borcu tamamen kapatılacak ve fazla gönderilen +${formatMoney(Number(amount) - Math.abs(toAcc.balance))} kullanılabilir limiti geçici olarak artıracaktır!`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {t('transfer.description')}
          </label>
          <input
            type="text"
            placeholder="..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeTransferModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {t('transfer.completeTransfer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
