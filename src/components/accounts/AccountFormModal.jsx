import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_CONFIG } from '../../types/index.js';

export function AccountFormModal() {
  const { isAccountModalOpen, closeAccountModal, editingAccount, addAccount, updateAccount } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (isAccountModalOpen) {
      if (editingAccount) {
        setName(editingAccount.name || '');
        setType(editingAccount.type || 'bank');
        setBalance(editingAccount.balance !== undefined ? String(editingAccount.balance) : '');
        setLimit(editingAccount.limit !== undefined ? String(editingAccount.limit) : '');
      } else {
        setName('');
        setType('bank');
        setBalance('0');
        setLimit('');
      }
    }
  }, [isAccountModalOpen, editingAccount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      type,
      balance: parseFloat(balance.replace(',', '.')) || 0,
      limit: limit ? parseFloat(limit.replace(',', '.')) : undefined,
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
      title={editingAccount ? 'Hesabı Düzenle' : 'Yeni Hesap / Cüzdan Ekle'}
      subtitle="Banka hesabı, nakit cüzdan veya kredi kartınızı tanımlayın"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Hesap Türü
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ACCOUNT_TYPE_CONFIG).map((cfg) => (
              <button
                type="button"
                key={cfg.id}
                onClick={() => setType(cfg.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === cfg.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Hesap / Kart Adı
          </label>
          <input
            type="text"
            placeholder="Örn: Garanti Vadesiz, Nakit Cüzdan, Maximum Kart"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {type === 'credit_card' ? 'Mevcut Borç Tutarı (TL)' : 'Başlangıç Bakiyesi (TL)'}
          </label>
          <input
            type="number"
            step="any"
            placeholder="0,00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Card Limit (if credit card) */}
        {type === 'credit_card' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kart Toplam Limiti (TL)
            </label>
            <input
              type="number"
              step="any"
              placeholder="Örn: 50000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeAccountModal}>
            Vazgeç
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingAccount ? 'Güncelle' : 'Hesabı Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
