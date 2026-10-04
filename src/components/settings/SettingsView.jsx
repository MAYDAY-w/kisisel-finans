import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryManager } from './CategoryManager';
import { DataBackup } from './DataBackup';
import { Card } from '../common/Card';
import { CURRENCIES } from '../../types';
import { DollarSign, Shield, Smartphone, Globe } from 'lucide-react';

export function SettingsView() {
  const { settings, updateCurrency } = useFinance();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Ayarlar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Para birimi, kategoriler ve yedekleme seçeneklerinizi yönetin
        </p>
      </div>

      {/* Currency Selection Card */}
      <Card padding="p-5" className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Para Birimi</h3>
        </div>
        <p className="text-xs text-slate-500">
          Uygulama genelinde görüntülenecek varsayılan para birimini belirleyin:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {Object.values(CURRENCIES).map((curr) => {
            const isSelected = settings.currency === curr.code;
            return (
              <button
                type="button"
                key={curr.code}
                onClick={() => updateCurrency(curr.code)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">{curr.symbol}</span>
                  <span className="text-xs font-bold text-slate-500">{curr.code}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">{curr.name}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Category Manager */}
      <CategoryManager />

      {/* Data Backup & Restore */}
      <DataBackup />

      {/* Privacy & Offline Guarantee Info */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <h4 className="font-bold text-slate-900">%100 Çevrimdışı ve Gizlilik Odaklı</h4>
          <p className="leading-relaxed">
            Finansal verileriniz yalnızca bu cihazın yerel belleğinde saklanır. Hiçbir sunucuya gönderilmez, üyelik veya hesap oluşturma gerektirmez.
          </p>
        </div>
      </div>
    </div>
  );
}
