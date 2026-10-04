import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ArrowRightLeft } from 'lucide-react';

export function TransferModal() {
  const { isTransferModalOpen, closeTransferModal, accounts, transferFunds, formatMoney } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert('Lütfen geçerli bir transfer tutarı giriniz.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('Kaynak ve hedef hesap aynı olamaz.');
      return;
    }

    transferFunds(fromAccountId, toAccountId, parsed, description.trim() || 'Hesaplar Arası Virman');
    closeTransferModal();
    setAmount('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isTransferModalOpen}
      onClose={closeTransferModal}
      title="Hesaplar Arası Para Transferi (Virman)"
      subtitle="Banka, kart ve nakit cüzdanlarınız arasında para aktarın"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Çıkış Yapılacak Hesap (Kaynak)
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatMoney(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Icon */}
        <div className="flex justify-center -my-1 text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-emerald-600 rotate-90" />
          </div>
        </div>

        {/* To Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Giriş Yapılacak Hesap (Hedef)
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatMoney(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Transfer Tutarı (TL)
          </label>
          <input
            type="number"
            step="any"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full text-2xl font-bold px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Açıklama (İsteğe Bağlı)
          </label>
          <input
            type="text"
            placeholder="Örn: ATM'den nakit çekme, Kredi kartı borcu ödeme"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeTransferModal}>
            Vazgeç
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            Transferi Tamamla
          </Button>
        </div>
      </form>
    </Modal>
  );
}
