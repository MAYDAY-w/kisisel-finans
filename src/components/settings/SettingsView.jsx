import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryManager } from './CategoryManager';
import { DataBackup } from './DataBackup';
import { Card } from '../common/Card';
import { CURRENCIES } from '../../types';
import {
  DollarSign,
  Shield,
  Smartphone,
  Globe,
  User,
  Languages,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export function SettingsView() {
  const {
    settings,
    updateCurrency,
    updateGeminiApiKey,
    language,
    setLanguage,
    t,
    themeMode,
    setThemeMode,
    colorTheme,
    setColorTheme,
    isDarkMode,
    COLOR_THEMES,
  } = useFinance();
  const { user, logoutUser } = useAuth();

  const themeModes = [
    {
      id: 'light',
      label: t('settings.modeLight', 'Aydınlık'),
      desc: t('settings.modeLightDesc', 'Klasik ferah görünüm'),
      icon: Sun,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      id: 'dark',
      label: t('settings.modeDark', 'Karanlık'),
      desc: t('settings.modeDarkDesc', 'Gözü yormayan koyu tema'),
      icon: Moon,
      iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      id: 'system',
      label: t('settings.modeSystem', 'Sistem'),
      desc: t('settings.modeSystemDesc', 'Cihaz ayarını takip eder'),
      icon: Monitor,
      iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('settings.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Theme & Appearance Card */}
      <Card padding="p-5" className="space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-sm shadow-primary-600/30 shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('settings.themeTitle', 'Tema ve Görünüm')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.themeSubtitle', 'Karanlık mod ve arayüz vurgu renginizi dilediğiniz gibi özelleştirin')}
            </p>
          </div>
        </div>

        {/* 1. Appearance Mode: Light / Dark / System */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('settings.modeTitle', 'Görünüm Modu')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeModes.map((m) => {
              const Icon = m.icon;
              const isSelected = themeMode === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setThemeMode(m.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{m.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Color Accent Themes */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('settings.colorThemeTitle', 'Renk Teması')}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('settings.colorThemeSubtitle', 'Uygulama vurgu rengi ve ana buton tonları')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {COLOR_THEMES.map((theme) => {
              const isSelected = colorTheme === theme.id;
              const themeName = language === 'en' ? theme.nameEn : theme.nameTr;
              const themeDesc = language === 'en' ? theme.descEn : theme.descTr;

              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/30 shadow-md scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    {/* Swatch & Emoji Bar */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
                          style={{ backgroundColor: theme.previewHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full opacity-80"
                          style={{ backgroundColor: theme.secondaryHex }}
                        />
                      </div>
                      <span className="text-base leading-none select-none">{theme.emoji}</span>
                    </div>

                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {themeName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {themeDesc}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-primary-200 dark:border-primary-900/60 flex items-center justify-between text-[10px] font-black text-primary-700 dark:text-primary-300">
                      <span>{language === 'en' ? 'Active' : 'Seçili'}</span>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Account Info Card */}
      <Card padding="p-5" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('settings.accountSync', 'Kullanıcı Hesabı (Bulut Eşitleme)')}
          </h3>
        </div>
        
        {user ? (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.displayName || (language === 'en' ? 'User' : 'Kullanıcı')}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
            </div>
            <button 
              onClick={() => logoutUser()}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
            >
              {language === 'en' ? 'Log Out' : 'Çıkış Yap'}
            </button>
          </div>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-200 dark:border-rose-900/50">
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-3">
              {language === 'en'
                ? 'You are currently in offline mode. Your data is stored only on this device. Sign in to sync across devices.'
                : 'Şu an çevrimdışı moddasınız. Verileriniz sadece bu cihazda saklanır. Farklı cihazlardan erişmek için giriş yapın.'}
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem('finans_skip_auth');
                window.location.reload();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              {language === 'en' ? 'Sign In / Register' : 'Giriş Yap / Kayıt Ol'}
            </button>
          </div>
        )}
      </Card>

      {/* Language Selection Card */}
      <Card padding="p-5" className="space-y-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('settings.language')}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.languageSubtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setLanguage('tr')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              language === 'tr'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇹🇷</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                language === 'tr' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {language === 'tr' ? (language === 'en' ? 'Active' : 'Seçili') : (language === 'en' ? 'Select' : 'Seç')}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">Türkçe</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en' ? 'Default language / Turkish interface' : 'Varsayılan dil / Türkçe arayüz'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              language === 'en'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇬🇧</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                language === 'en' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {language === 'en' ? (language === 'en' ? 'Active' : 'Seçili') : (language === 'en' ? 'Select' : 'Seç')}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">English</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en' ? 'Financial & banking standard English' : 'Standart finans ve bankacılık İngilizcesi'}
            </div>
          </button>
        </div>
      </Card>

      {/* Currency Selection Card */}
      <Card padding="p-5" className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('settings.currency')}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.currencySubtitle')}
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
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{curr.symbol}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{curr.code}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">{curr.name}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Gemini API Key Setting */}
      <Card padding="p-5" className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('settings.aiReceiptApiKey')}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('settings.geminiDesc')}
          <br/>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-1 inline-block">
            {language === 'en' ? 'Click here to get your free key.' : 'Buraya tıklayarak ücretsiz anahtarınızı alabilirsiniz.'}
          </a>
        </p>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {language === 'en' ? 'API Key' : 'API Anahtarınız'}
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={settings.geminiApiKey || ''}
            onChange={(e) => updateGeminiApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </Card>

      {/* Category Manager */}
      <CategoryManager />

      {/* Data Backup & Restore */}
      <DataBackup />

      {/* Privacy & Offline Guarantee Info */}
      <div className="bg-primary-50/60 dark:bg-primary-950/30 border border-primary-200/80 dark:border-primary-800 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <h4 className="font-bold text-slate-900 dark:text-white">{t('settings.offlineGuarantee')}</h4>
          <p className="leading-relaxed">
            {t('settings.offlineGuaranteeDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
