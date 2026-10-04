import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sparkles, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function RecurringFormModal() {
  const {
    isRecurringModalOpen,
    closeRecurringModal,
    editingRecurring,
    addRecurring,
    updateRecurring,
    categories,
    accounts,
    formatMoney,
  } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [categoryId, setCategoryId] = useState('bills');
  const [accountId, setAccountId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [autoProcess, setAutoProcess] = useState(true);

  useEffect(() => {
    if (isRecurringModalOpen) {
      if (editingRecurring) {
        setTitle(editingRecurring.title || '');
        setAmount(editingRecurring.amount !== undefined ? String(editingRecurring.amount) : '');
        setType(editingRecurring.type || 'expense');
        setCategoryId(editingRecurring.categoryId || 'bills');
        setAccountId(editingRecurring.accountId || accounts[0]?.id || '');
        setDayOfMonth(editingRecurring.dayOfMonth || 1);
        setAutoProcess(editingRecurring.autoProcess !== false);
      } else {
        setTitle('');
        setAmount('');
        setType('expense');
        setCategoryId('bills');
        setAccountId(accounts[0]?.id || '');
        setDayOfMonth(1);
        setAutoProcess(true);
      }
    }
  }, [isRecurringModalOpen, editingRecurring, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir başlık ve tutar giriniz.');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parsedAmount,
      type,
      categoryId,
      accountId: accountId || accounts[0]?.id || '',
      dayOfMonth: parseInt(dayOfMonth) || 1,
      frequency: 'monthly',
      autoProcess,
      isActive: true,
    };

    if (editingRecurring) {
      updateRecurring(editingRecurring.id, payload);
    } else {
      addRecurring(payload);
    }

    closeRecurringModal();
  };

  const quickDays = [1, 5, 10, 15, 20, 25];

  return (
    <Modal
      isOpen={isRecurringModalOpen}
      onClose={closeRecurringModal}
      title={editingRecurring ? 'Aboneliği Düzenle' : 'Yeni Düzenli Ödeme / Abonelik'}
      subtitle="Kira, fatura, Netflix gibi periyodik ödemelerinizi otomatikleştirin"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Gider / Gelir */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Düzenli Gider / Abonelik</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Düzenli Gelir</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Ödeme Başlığı
          </label>
          <input
            type="text"
            placeholder={type === 'expense' ? 'Örn: Netflix & Spotify, Ev Kirası, Fiber İnternet' : 'Örn: Düzenli Kira Geliri, Burs, Danışmanlık'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Aylık Tutar (TL)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full text-2xl font-black px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              ₺
            </span>
          </div>
        </div>

        {/* Day of Month Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ödeme Günü (Her Ayın)
            </label>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Her ayın {dayOfMonth}. günü
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {quickDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDayOfMonth(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    dayOfMonth === d
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category & Account */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              İlişkili Hesap
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 truncate"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto Process Toggle */}
        <div
          onClick={() => setAutoProcess((prev) => !prev)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            autoProcess
              ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                autoProcess ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Günü Geldiğinde Otomatik İşle</span>
                {autoProcess && (
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {type === 'expense'
                  ? 'Günü geldiğinde otomatik gider oluşturur ve hesaptan düşer.'
                  : 'Günü geldiğinde otomatik gelir oluşturur ve hesaba ekler.'}
              </p>
            </div>
          </div>

          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              autoProcess ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoProcess ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeRecurringModal}>
            Vazgeç
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {editingRecurring ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
