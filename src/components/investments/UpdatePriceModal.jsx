import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RefreshCw, TrendingUp } from 'lucide-react';

export function UpdatePriceModal() {
  const {
    priceUpdateTarget,
    closePriceUpdateModal,
    updateInvestmentPrice,
    formatMoney,
    settings,
    t,
  } = useFinance();

  const [newPrice, setNewPrice] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (priceUpdateTarget) {
      setNewPrice(
        priceUpdateTarget.currentPrice !== undefined
          ? String(priceUpdateTarget.currentPrice)
          : String(priceUpdateTarget.purchasePrice || '')
      );
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [priceUpdateTarget]);

  if (!priceUpdateTarget) return null;

  const currentVal = Number(newPrice) || 0;
  const qty = Number(priceUpdateTarget.quantity) || 0;
  const totalVal = qty * currentVal;
  const totalCost = qty * (Number(priceUpdateTarget.purchasePrice) || 0);
  const profit = totalVal - totalCost;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(newPrice.toString().replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      alert(t('transfer.validAmountError') || 'Lütfen geçerli bir fiyat girin.');
      return;
    }
    updateInvestmentPrice(priceUpdateTarget.id, parsed);
    closePriceUpdateModal();
  };

  const currSymbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : '₺';

  return (
    <Modal
      isOpen={Boolean(priceUpdateTarget)}
      onClose={closePriceUpdateModal}
      title={t('priceUpdateModal.title')}
      subtitle={t('priceUpdateModal.subtitle', { name: priceUpdateTarget.name })}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info card */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>{t('priceUpdateModal.quantity')}</span>
            <span className="font-bold">{qty} {priceUpdateTarget.unit || 'adet'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{t('priceUpdateModal.costPerUnit')}</span>
            <span>{formatMoney(priceUpdateTarget.purchasePrice)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{t('priceUpdateModal.totalCost')}</span>
            <span>{formatMoney(totalCost)}</span>
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            {t('priceUpdateModal.currentUnitPrice', { currency: currSymbol })}
          </label>
          <input
            ref={inputRef}
            type="number"
            step="any"
            inputMode="decimal"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
            className="w-full text-2xl font-bold px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Live Calculation Preview */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-700">
            <span>{t('priceUpdateModal.newTotalValue')}</span>
            <span className="font-extrabold text-slate-900">{formatMoney(totalVal)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>{t('priceUpdateModal.estProfitLoss')}</span>
            <span className={`font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatMoney(profit, true)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closePriceUpdateModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" icon={RefreshCw} className="font-bold">
            {t('priceUpdateModal.savePriceBtn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
