import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

export const COLOR_THEMES = [
  {
    id: 'emerald',
    nameKey: 'themeEmerald',
    nameTr: 'Zümrüt Yeşili',
    nameEn: 'Emerald Green',
    descKey: 'themeEmeraldDesc',
    descTr: 'Klasik finans ve büyüme',
    descEn: 'Classic finance & growth',
    previewHex: '#10b981',
    secondaryHex: '#059669',
    emoji: '🌲',
    gradientClass: 'from-emerald-600 via-emerald-500 to-teal-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'blue',
    nameKey: 'themeBlue',
    nameTr: 'Okyanus Mavisi',
    nameEn: 'Ocean Blue',
    descKey: 'themeBlueDesc',
    descTr: 'Kurumsal ve güvenilir bankacılık',
    descEn: 'Corporate & trusted banking',
    previewHex: '#3b82f6',
    secondaryHex: '#2563eb',
    emoji: '🌊',
    gradientClass: 'from-blue-600 via-blue-500 to-cyan-500',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'purple',
    nameKey: 'themePurple',
    nameTr: 'Ametist Moru',
    nameEn: 'Royal Purple',
    descKey: 'themePurpleDesc',
    descTr: 'Modern ve asil zenginlik',
    descEn: 'Modern & royal wealth',
    previewHex: '#a855f7',
    secondaryHex: '#9333ea',
    emoji: '🔮',
    gradientClass: 'from-purple-600 via-purple-500 to-pink-500',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'amber',
    nameKey: 'themeAmber',
    nameTr: 'Kehribar Altını',
    nameEn: 'Sunset Amber',
    descKey: 'themeAmberDesc',
    descTr: 'Sıcak ve enerjik vurgu',
    descEn: 'Warm & energetic gold',
    previewHex: '#f59e0b',
    secondaryHex: '#d97706',
    emoji: '🌇',
    gradientClass: 'from-amber-600 via-amber-500 to-yellow-500',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'rose',
    nameKey: 'themeRose',
    nameTr: 'Yakut Pembesi',
    nameEn: 'Ruby Rose',
    descKey: 'themeRoseDesc',
    descTr: 'Cesur ve dinamik tasarım',
    descEn: 'Bold & dynamic design',
    previewHex: '#f43f5e',
    secondaryHex: '#e11d48',
    emoji: '🌹',
    gradientClass: 'from-rose-600 via-rose-500 to-pink-500',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'cyan',
    nameKey: 'themeCyan',
    nameTr: 'Siber Turkuaz',
    nameEn: 'Cyber Cyan',
    descKey: 'themeCyanDesc',
    descTr: 'Gelecekçi ve yüksek kontrast',
    descEn: 'Futuristic & high contrast',
    previewHex: '#06b6d4',
    secondaryHex: '#0891b2',
    emoji: '⚡',
    gradientClass: 'from-cyan-600 via-teal-500 to-blue-500',
    badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
];

const STORAGE_KEY_MODE = 'finans_theme_mode';
const STORAGE_KEY_COLOR = 'finans_color_theme';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE);
      return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const [colorTheme, setColorThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLOR);
      const valid = COLOR_THEMES.some((t) => t.id === saved);
      return valid ? saved : 'emerald';
    } catch {
      return 'emerald';
    }
  });

  // Track system preference
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective dark mode
  const isDarkMode = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemPrefersDark;
  }, [themeMode, systemPrefersDark]);

  // Synchronize DOM with dark mode and color theme
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Set data-theme attribute on root and body
    root.setAttribute('data-theme', colorTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', colorTheme);
    }

    // Update PWA meta theme-color
    const activeThemeObj = COLOR_THEMES.find((t) => t.id === colorTheme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (isDarkMode) {
        metaThemeColor.setAttribute('content', '#090d16');
      } else {
        metaThemeColor.setAttribute('content', activeThemeObj ? activeThemeObj.secondaryHex : '#059669');
      }
    }
  }, [isDarkMode, colorTheme]);

  const setThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (e) {
      console.error('Failed to save theme mode:', e);
    }
  }, []);

  const setColorTheme = useCallback((themeId) => {
    setColorThemeState(themeId);
    try {
      localStorage.setItem(STORAGE_KEY_COLOR, themeId);
    } catch (e) {
      console.error('Failed to save color theme:', e);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [isDarkMode, setThemeMode]);

  const currentThemeObj = useMemo(() => {
    return COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];
  }, [colorTheme]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      colorTheme,
      setColorTheme,
      isDarkMode,
      toggleDarkMode,
      currentThemeObj,
      COLOR_THEMES,
    }),
    [themeMode, setThemeMode, colorTheme, setColorTheme, isDarkMode, toggleDarkMode, currentThemeObj]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
