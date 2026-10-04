import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Target,
  Menu,
  X,
  ArrowLeftRight,
  TrendingUp,
  Handshake,
  Repeat,
  Bot,
  Smartphone,
  Settings,
  ArrowRightLeft
} from 'lucide-react';

export function BottomNav() {
  const {
    activeTab,
    setActiveTab,
    openAiAdvisor,
    openInstallApp,
    openTransferModal
  } = useFinance();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if current tab is in the "more" drawer
  const isMenuTabActive = ['transactions', 'investments', 'debts', 'recurring', 'settings'].includes(activeTab);

  const mainTabs = [
    {
      id: 'dashboard',
      label: 'Özet',
      icon: LayoutDashboard,
    },
    {
      id: 'daily',
      label: 'Günlük',
      icon: Calendar,
    },
    {
      id: 'accounts',
      label: 'Hesaplar',
      icon: Wallet,
    },
    {
      id: 'budget',
      label: 'Bütçe',
      icon: Target,
    },
  ];

  const menuItems = [
    {
      id: 'transactions',
      label: 'Tüm İşlemler',
      desc: 'Gelir, gider ve transfer hareketleri',
      icon: ArrowLeftRight,
      color: 'text-blue-600 bg-blue-50',
      action: () => {
        setActiveTab('transactions');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'investments',
      label: 'Yatırımlar & Portföy',
      desc: 'Altın, döviz, hisse ve fon takibi',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
      action: () => {
        setActiveTab('investments');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'debts',
      label: 'Borç / Alacak Takibi',
      desc: 'Kişilere verilen veya alınan borçlar',
      icon: Handshake,
      color: 'text-amber-600 bg-amber-50',
      action: () => {
        setActiveTab('debts');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'recurring',
      label: 'Abonelikler & Planlı',
      desc: 'Kira, fatura ve periyodik ödemeler',
      icon: Repeat,
      color: 'text-indigo-600 bg-indigo-50',
      action: () => {
        setActiveTab('recurring');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'aiAdvisor',
      label: 'AI Finans Koçu',
      desc: 'Sağlık puanı ve yapay zeka tavsiyeleri',
      icon: Bot,
      color: 'text-emerald-600 bg-emerald-50',
      action: () => {
        setIsMenuOpen(false);
        openAiAdvisor();
      },
    },
    {
      id: 'transfer',
      label: 'Virman / Hesap Transferi',
      desc: 'Hesaplar arasında para aktarımı',
      icon: ArrowRightLeft,
      color: 'text-teal-600 bg-teal-50',
      action: () => {
        setIsMenuOpen(false);
        openTransferModal();
      },
    },
    {
      id: 'installApp',
      label: 'Telefona Yükle (PWA)',
      desc: 'Ana ekrana ekleyip uygulama yapın',
      icon: Smartphone,
      color: 'text-rose-600 bg-rose-50',
      action: () => {
        setIsMenuOpen(false);
        openInstallApp();
      },
    },
    {
      id: 'settings',
      label: 'Ayarlar & Yedek',
      desc: 'Para birimi, Excel/JSON yedekleme',
      icon: Settings,
      color: 'text-slate-600 bg-slate-100',
      action: () => {
        setActiveTab('settings');
        setIsMenuOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Slide-up Menu Drawer for Extra Mobile Features */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-2xl p-5 max-h-[82vh] overflow-y-auto z-10 border-t border-slate-100 animate-slide-up">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Tüm Menü & Özellikler</h3>
                <p className="text-xs text-slate-500">Gelişmiş muhasebe ve finans araçları</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-300 shadow-sm'
                        : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main 5-Item Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center gap-1 transition-all select-none relative ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full shadow-sm" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                <span className="text-[10px] sm:text-[11px] leading-none tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* 5th Button: Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center gap-1 transition-all select-none relative ${
              isMenuOpen || isMenuTabActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {(isMenuOpen || isMenuTabActive) && (
              <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full shadow-sm" />
            )}
            <Menu
              className={`w-5 h-5 transition-transform ${isMenuOpen || isMenuTabActive ? 'scale-110' : 'scale-100'}`}
              strokeWidth={isMenuOpen || isMenuTabActive ? 2.3 : 1.8}
            />
            <span className="text-[10px] sm:text-[11px] leading-none tracking-tight">Menü</span>
          </button>
        </div>
      </nav>
    </>
  );
}
