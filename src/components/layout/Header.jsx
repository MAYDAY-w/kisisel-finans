import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  Plus,
  Sparkles,
  Smartphone,
  Bot,
  Landmark,
  Target,
  ArrowLeftRight,
  TrendingUp,
  Handshake,
  Repeat,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '../common/Button';

export function Header() {
  const {
    financialSummary,
    formatMoney,
    openAddTransactionModal,
    openAiAdvisor,
    openInstallApp,
    activeTab,
    setActiveTab,
  } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Özet' },
    { id: 'daily', label: 'Günlük & Fişler' },
    { id: 'accounts', label: 'Hesaplar' },
    { id: 'budget', label: 'Bütçe' },
    { id: 'transactions', label: 'İşlemler' },
    { id: 'investments', label: 'Yatırımlar' },
    { id: 'debts', label: 'Borçlar' },
    { id: 'recurring', label: 'Abonelikler' },
    { id: 'settings', label: 'Ayarlar' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & App Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                Kişisel Muhasebe
              </h1>
              <span className="text-[10px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Akıllı Bütçe, Fiş ve Finans Yönetimi
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-1 rounded-2xl overflow-x-auto max-w-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={openAiAdvisor}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="AI Finans Danışmanı"
          >
            <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">AI Koç</span>
          </button>

          {/* Install to Phone / PWA Button */}
          <button
            type="button"
            onClick={openInstallApp}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
            title="Telefona Yükle"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Telefona Yükle</span>
          </button>

          {/* Quick Add Button */}
          <Button
            size="sm"
            onClick={() => openAddTransactionModal()}
            icon={Plus}
            className="rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/20"
          >
            <span className="hidden sm:inline">İşlem Ekle</span>
            <span className="sm:hidden">Ekle</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
