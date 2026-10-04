import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountCard } from './AccountCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Plus, ArrowRightLeft, Landmark, Wallet, CreditCard, Sparkles } from 'lucide-react';

export function AccountList() {
  const {
    accounts,
    totalAccountBalance,
    formatMoney,
    openAccountModal,
    openTransferModal,
  } = useFinance();

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Hesaplar & Cüzdanlar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Banka hesaplarınızı, kredi kartlarınızı ve nakit cüzdanınızı tek yerden yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={openTransferModal}
            icon={ArrowRightLeft}
            className="text-xs font-semibold"
          >
            Virman / Transfer
          </Button>
          <Button
            size="sm"
            onClick={() => openAccountModal()}
            icon={Plus}
            className="text-xs font-bold"
          >
            Yeni Hesap
          </Button>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Toplam Hesap & Cüzdan Varlığı
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              {formatMoney(totalAccountBalance)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {accounts.length} aktif hesap / kart tanımlı
            </div>
          </div>

          <Button
            variant="success"
            size="md"
            icon={ArrowRightLeft}
            onClick={openTransferModal}
            className="font-bold text-xs"
          >
            Hesaplar Arası Transfer
          </Button>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
          <Landmark className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Hesap Bulunamadı</h3>
          <p className="text-xs text-slate-500 mb-5">
            Banka veya nakit cüzdan tanımlayarak hesap bakiyelerinizi takip edebilirsiniz.
          </p>
          <Button size="sm" icon={Plus} onClick={() => openAccountModal()}>
            İlk Hesabı Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
