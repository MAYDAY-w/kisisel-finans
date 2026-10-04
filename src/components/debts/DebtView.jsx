import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { formatDate } from '../../utils/formatters.js';
import { Handshake, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle, Trash2, DollarSign } from 'lucide-react';

export function DebtView() {
  const {
    debts,
    recordDebtPayment,
    deleteDebt,
    openDebtModal,
    formatMoney,
  } = useFinance();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'lent' | 'borrowed'
  const [activePaymentDebt, setActivePaymentDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Totals
  let totalLent = 0;
  let totalBorrowed = 0;
  debts.forEach((d) => {
    const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
    if (d.type === 'lent') totalLent += remaining;
    if (d.type === 'borrowed') totalBorrowed += remaining;
  });

  const filteredDebts = debts.filter((d) => {
    if (filterType === 'all') return true;
    return d.type === filterType;
  });

  const handleMakePayment = (e) => {
    e.preventDefault();
    if (!activePaymentDebt) return;
    const parsed = parseFloat(paymentAmount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert('Lütfen geçerli bir ödeme tutarı giriniz.');
      return;
    }
    recordDebtPayment(activePaymentDebt.id, parsed);
    setActivePaymentDebt(null);
    setPaymentAmount('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Handshake className="w-6 h-6 text-emerald-600" />
            <span>Borç & Alacak Takibi</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kişisel borçlarınızı ve alacaklarınızı unutmadan takip edin
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => openDebtModal()}
          icon={Plus}
          className="text-xs font-bold"
        >
          Borç / Alacak Ekle
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800">Toplam Alacaklarım</span>
            <div className="text-xl font-black text-emerald-700 mt-1">
              +{formatMoney(totalLent)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800">Toplam Borçlarım</span>
            <div className="text-xl font-black text-rose-700 mt-1">
              -{formatMoney(totalBorrowed)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Net Durum</span>
            <div className={`text-xl font-black mt-1 ${totalLent >= totalBorrowed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(totalLent - totalBorrowed, true)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Handshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'lent', label: 'Alacaklarım' },
          { id: 'borrowed', label: 'Borçlarım' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Debt Cards List */}
      {filteredDebts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((d) => {
            const isLent = d.type === 'lent';
            const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
            const isCompleted = remaining === 0;
            const percentPaid = d.amount > 0 ? Math.min(100, ((d.paidAmount || 0) / d.amount) * 100) : 0;

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isLent ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isLent ? 'Alacak' : 'Borç'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{d.personName}</h4>
                    </div>
                    {d.note && <p className="text-xs text-slate-500 mt-1 italic">"{d.note}"</p>}
                  </div>

                  <button
                    onClick={() => deleteDebt(d.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[11px]">Toplam Tutar:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{formatMoney(d.amount)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px]">Kalan:</span>
                    <div className={`font-extrabold text-sm mt-0.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isCompleted ? '✓ Tamamlandı' : formatMoney(remaining)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentPaid}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : isLent ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>

                {/* Footer & Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400">
                    {d.dueDate ? `Vade: ${formatDate(d.dueDate)}` : 'Vadesiz'}
                  </span>

                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActivePaymentDebt(d);
                        setPaymentAmount(String(remaining));
                      }}
                      className="text-[11px] py-1 px-2.5 h-auto"
                    >
                      {isLent ? 'Tahsilat Ekle' : 'Ödeme Yap'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <Handshake className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Borç / Alacak Kaydı Yok</h3>
          <p className="text-xs text-slate-500 mb-5">
            Arkadaşlarınıza verdiğiniz veya aldığınız borçları ekleyerek unutmanın önüne geçin.
          </p>
          <Button size="sm" icon={Plus} onClick={() => openDebtModal()}>
            İlk Kaydı Ekle
          </Button>
        </div>
      )}

      {/* Payment Modal */}
      {activePaymentDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-slide-up">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {activePaymentDebt.type === 'lent' ? 'Tahsilat Ekle' : 'Borç Ödemesi Yap'}
            </h3>
            <p className="text-xs text-slate-500">
              <strong>{activePaymentDebt.personName}</strong> için ödeme tutarını girin.
            </p>

            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Ödenen Tutar (TL)
                </label>
                <input
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full text-xl font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setActivePaymentDebt(null)}>
                  Vazgeç
                </Button>
                <Button type="submit" variant="primary" className="font-bold">
                  Onayla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
