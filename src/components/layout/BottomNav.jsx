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
  Sun,
  Moon,
  ArrowRightLeft
} from 'lucide-react';

export function BottomNav() {
  const {
    activeTab,
    setActiveTab,
    openAiAdvisor,
    openInstallApp,
    openTransferModal,
    t,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    colorTheme,
    currentThemeObj,
  } = useFinance();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if current tab is in the "more" drawer
  const isMenuTabActive = ['transactions', 'investments', 'debts', 'recurring', 'settings'].includes(activeTab);

  const mainTabs = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'daily',
      label: t('nav.daily'),
      icon: Calendar,
    },
    {
      id: 'accounts',
      label: t('nav.accounts'),
      icon: Wallet,
    },
    {
      id: 'budget',
      label: t('nav.budget'),
      icon: Target,
    },
  ];

  const menuItems = [
    {
      id: 'transactions',
      label: t('nav.transactions'),
      desc: t('transactions.subtitle', 'Gelir, gider ve transfer hareketleri'),
      icon: ArrowLeftRight,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
      action: () => {
        setActiveTab('transactions');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'investments',
      label: t('nav.investments'),
      desc: t('investments.subtitle', 'Altın, döviz, hisse ve fon takibi'),
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
      action: () => {
        setActiveTab('investments');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'debts',
      label: t('nav.debts'),
      desc: t('debts.subtitle', 'Kişilere verilen veya alınan borçlar'),
      icon: Handshake,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
      action: () => {
        setActiveTab('debts');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'recurring',
      label: t('nav.recurring'),
      desc: t('recurring.subtitle', 'Kira, fatura ve periyodik ödemeler'),
      icon: Repeat,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
      action: () => {
        setActiveTab('recurring');
        setIsMenuOpen(false);
      },
    },
    {
      id: 'aiAdvisor',
      label: t('nav.aiCoach'),
      desc: t('dashboard.aiCoachDesc', 'Sağlık puanı ve tavsiyeler'),
      icon: Bot,
      color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50',
      action: () => {
        setIsMenuOpen(false);
        openAiAdvisor();
      },
    },
    {
      id: 'transfer',
      label: t('transfer.title', 'Virman / Hesap Transferi'),
      desc: t('transfer.subtitle', 'Hesaplar arasında para aktarımı'),
      icon: ArrowRightLeft,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50',
      action: () => {
        setIsMenuOpen(false);
        openTransferModal();
      },
    },
    {
      id: 'installApp',
      label: t('nav.installApp'),
      desc: t('common.appName', 'Ana ekrana ekleyip uygulama yapın'),
      icon: Smartphone,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
      action: () => {
        setIsMenuOpen(false);
        openInstallApp();
      },
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      desc: t('settings.subtitle', 'Tema, dil, para birimi ve yedekleme'),
      icon: Settings,
      color: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
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
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-t-3xl shadow-2xl p-5 max-h-[82vh] overflow-y-auto z-10 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('nav.more')} &amp; {t('common.actions')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.tagline')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Drawer Quick Controls: Dark Mode Toggle & Language */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Dark Mode Quick Toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>{isDarkMode ? (language === 'en' ? 'Dark' : 'Karanlık') : (language === 'en' ? 'Light' : 'Aydınlık')}</span>
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: 'var(--color-primary-hex, #10b981)' }}
                />
              </button>

              {/* Language Switcher */}
              <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setLanguage('tr')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    language === 'tr'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇹🇷 TR
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
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
                        ? 'bg-primary-50 dark:bg-primary-950/40 border border-primary-300 dark:border-primary-700 shadow-sm'
                        : 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] transition-colors duration-200">
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
                  isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-primary-600 dark:bg-primary-500 rounded-b-full shadow-sm" />
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
              isMenuOpen || isMenuTabActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {(isMenuOpen || isMenuTabActive) && (
              <span className="absolute top-0 w-8 h-1 bg-primary-600 dark:bg-primary-500 rounded-b-full shadow-sm" />
            )}
            <Menu
              className={`w-5 h-5 transition-transform ${isMenuOpen || isMenuTabActive ? 'scale-110' : 'scale-100'}`}
              strokeWidth={isMenuOpen || isMenuTabActive ? 2.3 : 1.8}
            />
            <span className="text-[10px] sm:text-[11px] leading-none tracking-tight">{t('nav.more')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
