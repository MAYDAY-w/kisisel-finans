import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEBT_TYPES } from '../../types/index.js';
import { getTodayDateString } from '../../utils/formatters.js';

export function DebtFormModal() {
  const { isDebtModalOpen, closeDebtModal, editingDebt, addDebt, updateDebt } = useFinance();

  const [type, setType] = useState(DEBT_TYPES.LENT);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isDebtModalOpen) {
      if (editingDebt) {
        setType(editingDebt.type || DEBT_TYPES.LENT);
        setPersonName(editingDebt.personName || '');
        setAmount(editingDebt.amount ? String(editingDebt.amount) : '');
        setPaidAmount(editingDebt.paidAmount !== undefined ? String(editingDebt.paidAmount) : '0');
        setDueDate(editingDebt.dueDate || '');
        setNote(editingDebt.note || '');
      } else {
        setType(DEBT_TYPES.LENT);
        setPersonName('');
        setAmount('');
        setPaidAmount('0');
        setDueDate('');
        setNote('');
      }
    }
  }, [isDebtModalOpen, editingDebt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!personName.trim()) {
      alert('Lütfen kişi veya kurum adını giriniz.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const payload = {
      type,
      personName: personName.trim(),
      amount: parsedAmount,
      paidAmount: parseFloat(paidAmount.replace(',', '.')) || 0,
      dueDate: dueDate || undefined,
      note: note.trim(),
    };

    if (editingDebt) {
      // update
      addDebt({ ...editingDebt, ...payload });
    } else {
      addDebt(payload);
    }

    closeDebtModal();
  };

  return (
    <Modal
      isOpen={isDebtModalOpen}
      onClose={closeDebtModal}
      title={editingDebt ? 'Kaydı Düzenle' : 'Yeni Borç / Alacak Kaydı'}
      subtitle="Kime borcunuz olduğunu veya kimden alacağınız olduğunu takip edin"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            İşlem Türü
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(DEBT_TYPES.LENT)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === DEBT_TYPES.LENT
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Alacağım Var (Verdim)
            </button>
            <button
              type="button"
              onClick={() => setType(DEBT_TYPES.BORROWED)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === DEBT_TYPES.BORROWED
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Borcum Var (Aldım)
            </button>
          </div>
        </div>

        {/* Person Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Kişi / Kurum Adı
          </label>
          <input
            type="text"
            placeholder="Örn: Ahmet Yılmaz, Ev Sahibi, Arkadaşım"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Toplam Tutar (TL)
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

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Vade / Geri Ödeme Tarihi (İsteğe Bağlı)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Not
          </label>
          <input
            type="text"
            placeholder="Örn: Elden nakit verildi, 2 taksit"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeDebtModal}>
            Vazgeç
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
