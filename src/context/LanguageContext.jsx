import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('finans_language') || 'tr';
  });

  const setLanguage = useCallback((newLang) => {
    const lang = newLang === 'en' ? 'en' : 'tr';
    setLanguageState(lang);
    localStorage.setItem('finans_language', lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translation function
   * @param {string} path e.g. 'dashboard.totalBalance'
   * @param {object|string} paramsOrFallback
   * @param {object} [params]
   */
  const t = useCallback((path, paramsOrFallback, maybeParams) => {
    const langDict = translations[language] || translations.tr;
    const fallbackDict = translations.tr;

    let params = {};
    let customFallback = '';

    if (typeof paramsOrFallback === 'string') {
      customFallback = paramsOrFallback;
      if (typeof maybeParams === 'object') {
        params = maybeParams;
      }
    } else if (typeof paramsOrFallback === 'object') {
      params = paramsOrFallback;
    }

    // Resolve dotted path (e.g. 'dashboard.netWorth')
    const resolve = (dict, p) => {
      const parts = p.split('.');
      let curr = dict;
      for (const part of parts) {
        if (curr && typeof curr === 'object' && part in curr) {
          curr = curr[part];
        } else {
          return undefined;
        }
      }
      return typeof curr === 'string' ? curr : undefined;
    };

    let text = resolve(langDict, path) || resolve(fallbackDict, path) || customFallback || path;

    // Interpolate {key} placeholders
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((key) => {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
      });
    }

    return text;
  }, [language]);

  const getCategoryName = useCallback((catId, fallbackName) => {
    if (!catId) return fallbackName || '';
    const key = `categories.${catId}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    if (fallbackName && fallbackName !== catId) return fallbackName;
    return fallbackName || catId;
  }, [t]);

  const getAccountTypeName = useCallback((typeId, fallbackLabel) => {
    if (!typeId) return fallbackLabel || '';
    const key = `accountTypes.${typeId}`;
    const translated = t(key);
    return translated !== key ? translated : (fallbackLabel || typeId);
  }, [t]);

  const getTransactionTypeName = useCallback((typeId, fallbackLabel) => {
    if (!typeId) return fallbackLabel || '';
    const key = `transactions.${typeId}`;
    const translated = t(key);
    return translated !== key ? translated : (fallbackLabel || typeId);
  }, [t]);

  const getAssetTypeName = useCallback((typeId, fallbackLabel) => {
    if (!typeId) return fallbackLabel || '';
    const key = `assetTypes.${typeId}`;
    const translated = t(key);
    return translated !== key ? translated : (fallbackLabel || typeId);
  }, [t]);

  const value = {
    language,
    setLanguage,
    t,
    getCategoryName,
    getAccountTypeName,
    getTransactionTypeName,
    getAssetTypeName,
    isEn: language === 'en',
    isTr: language === 'tr',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside LanguageProvider
    return {
      language: 'tr',
      setLanguage: () => {},
      t: (key) => key,
      getCategoryName: (_, fb) => fb,
      getAccountTypeName: (_, fb) => fb,
      getTransactionTypeName: (_, fb) => fb,
      getAssetTypeName: (_, fb) => fb,
      isEn: false,
      isTr: true,
    };
  }
  return context;
}
