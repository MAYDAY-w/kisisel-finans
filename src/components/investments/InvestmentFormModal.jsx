import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ASSET_TYPES } from '../../types';
import { getTodayDateString } from '../../utils/formatters';

export function InvestmentFormModal() {
  const {
    isInvestmentModalOpen,
    closeAddInvestmentModal,
    editingInvestment,
    addInvestment,
    updateInvestment,
    settings,
  } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('gold');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('gram');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isInvestmentModalOpen) {
      if (editingInvestment) {
        setName(editingInvestment.name || '');
        setType(editingInvestment.type || 'gold');
        setQuantity(editingInvestment.quantity ? String(editingInvestment.quantity) : '');
        setUnit(editingInvestment.unit || 'gram');
        setPurchasePrice(editingInvestment.purchasePrice ? String(editingInvestment.purchasePrice) : '');
        setCurrentPrice(
          editingInvestment.currentPrice !== undefined
            ? String(editingInvestment.currentPrice)
            : String(editingInvestment.purchasePrice || '')
        );
        setPurchaseDate(editingInvestment.purchaseDate || getTodayDateString());
        setNote(editingInvestment.note || '');
      } else {
        setName('');
        setType('gold');
        setQuantity('');
        setUnit('gram');
        setPurchasePrice('');
        setCurrentPrice('');
        setPurchaseDate(getTodayDateString());
        setNote('');
      }
    }
  }, [isInvestmentModalOpen, editingInvestment]);

  // Sync unit when asset type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    const assetConfig = ASSET_TYPES.find((a) => a.id === newType);
    if (assetConfig) {
      setUnit(assetConfig.unit);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedQty = parseFloat(quantity.toString().replace(',', '.'));
    const parsedBuyPrice = parseFloat(purchasePrice.toString().replace(',', '.'));
    const parsedCurrPrice = currentPrice
      ? parseFloat(currentPrice.toString().replace(',', '.'))
      : parsedBuyPrice;

    if (!name.trim()) {
      alert('Lütfen varlık adını giriniz.');
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Lütfen geçerli bir miktar giriniz.');
      return;
    }
    if (isNaN(parsedBuyPrice) || parsedBuyPrice < 0) {
      alert('Lütfen geçerli bir alış fiyatı giriniz.');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      typeName: ASSET_TYPES.find((a) => a.id === type)?.label || 'Varlık',
      quantity: parsedQty,
      unit: unit.trim() || 'adet',
      purchasePrice: parsedBuyPrice,
      currentPrice: !isNaN(parsedCurrPrice) ? parsedCurrPrice : parsedBuyPrice,
      purchaseDate,
      note: note.trim(),
    };

    if (editingInvestment?.id) {
      updateInvestment(editingInvestment.id, payload);
    } else {
      addInvestment(payload);
    }

    closeAddInvestmentModal();
  };

  return (
    <Modal
      isOpen={isInvestmentModalOpen}
      onClose={closeAddInvestmentModal}
      title={editingInvestment ? 'Varlığı Düzenle' : 'Yeni Varlık Ekle'}
      subtitle="Altın, döviz, borsa veya kripto varlığınızı kaydedin"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Varlık Sınıfı
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ASSET_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  type === t.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Varlık Adı
          </label>
          <input
            type="text"
            placeholder="Örn: Gram Altın (24K), THYAO, BTC, USD..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Miktar
            </label>
            <input
              type="number"
              step="any"
              placeholder="Örn: 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Birim
            </label>
            <input
              type="text"
              placeholder="gram, lot, adet, pay"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Purchase Price & Current Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Alış Birim Fiyatı
            </label>
            <input
              type="number"
              step="any"
              placeholder="Örn: 4200"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Güncel Birim Fiyat
            </label>
            <input
              type="number"
              step="any"
              placeholder="Örn: 4500 (Boşsa alış fiyatı)"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Alış Tarihi
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Not (İsteğe Bağlı)
          </label>
          <input
            type="text"
            placeholder="Kasa, borsa hesabı vb."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeAddInvestmentModal}>
            Vazgeç
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingInvestment ? 'Güncelle' : 'Varlığı Ekle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
