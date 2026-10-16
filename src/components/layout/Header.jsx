import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  Plus,
  Sparkles,
  Smartphone,
  Bot,
  Sun,
  Moon,
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
    t,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    colorTheme,
    currentThemeObj,
  } = useFinance();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard') },
    { id: 'daily', label: t('nav.daily') },
    { id: 'accounts', label: t('nav.accounts') },
    { id: 'budget', label: t('nav.budget') },
    { id: 'transactions', label: t('nav.transactions') },
    { id: 'investments', label: t('nav.investments') },
    { id: 'debts', label: t('nav.debts') },
    { id: 'recurring', label: t('nav.recurring') },
    { id: 'settings', label: t('nav.settings') },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & App Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none"
        >
          <div
            style={{ background: 'var(--primary-gradient)' }}
            className="w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-md shadow-primary-600/20 shrink-0"
          >
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {t('common.appName', 'Kişisel Finans')}
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {t('common.tagline', 'Akıllı Bütçe, Fiş ve Finans Yönetimi')}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl overflow-x-auto max-w-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 border border-slate-200/80 dark:border-slate-700 shadow-xs"
            title={isDarkMode ? (language === 'en' ? 'Switch to Light Mode' : 'Aydınlık Moda Geç') : (language === 'en' ? 'Switch to Dark Mode' : 'Karanlık Moda Geç')}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0"
              style={{ backgroundColor: 'var(--color-primary-hex, #10b981)' }}
              title={currentThemeObj?.nameTr || colorTheme}
            />
          </button>

          {/* Quick Language Switcher Button */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 border border-slate-200/80 dark:border-slate-700 shadow-xs"
            title={language === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
          >
            <span className="text-sm leading-none">{language === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
            <span className="text-[11px] font-black tracking-wider text-slate-800 dark:text-slate-200">
              {language === 'tr' ? 'TR' : 'EN'}
            </span>
          </button>

          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={openAiAdvisor}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/50 dark:hover:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-200/90 dark:border-primary-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title={t('nav.aiCoach')}
          >
            <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-pulse" />
            <span className="hidden sm:inline">{t('nav.aiCoach')}</span>
          </button>

          {/* Install to Phone / PWA Button */}
          <button
            type="button"
            onClick={openInstallApp}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
            title={t('nav.installApp')}
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">{t('nav.installApp')}</span>
          </button>

          {/* Quick Add Button */}
          <Button
            size="sm"
            onClick={() => openAddTransactionModal()}
            icon={Plus}
            className="rounded-xl font-bold text-xs"
          >
            <span className="hidden sm:inline">{t('dashboard.addTransaction', 'İşlem Ekle')}</span>
            <span className="sm:hidden">{t('common.add', 'Ekle')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
