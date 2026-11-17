import { useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

/**
 * Hook to manage PWA modern capabilities:
 * - PWA App Shortcuts / Deep links (?tab=..., ?action=...)
 * - Web Share Target ingestion (?action=share-target)
 * - PWA File Handling API (launchQueue for .json / .csv files)
 * - Window Controls Overlay handling
 */
export function usePwaCapabilities() {
  const {
    setActiveTab,
    openAddTransactionModal,
    importFromJSON,
  } = useFinance();

  useEffect(() => {
    // 1. Process URL query parameters on PWA launch / navigation
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const actionParam = urlParams.get('action');

      // Tab routing
      const validTabs = [
        'dashboard',
        'daily',
        'accounts',
        'budget',
        'transactions',
        'investments',
        'debts',
        'recurring',
        'settings',
      ];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }

      // Action routing
      if (actionParam === 'new-transaction') {
        openAddTransactionModal();
      } else if (actionParam === 'budget') {
        setActiveTab('budget');
      } else if (actionParam === 'investments') {
        setActiveTab('investments');
      } else if (actionParam === 'accounts') {
        setActiveTab('accounts');
      } else if (actionParam === 'debts') {
        setActiveTab('debts');
      } else if (actionParam === 'recurring') {
        setActiveTab('recurring');
      } else if (actionParam === 'share-target') {
        // Web Share Target API incoming payload
        const sharedTitle = urlParams.get('title') || '';
        const sharedText = urlParams.get('text') || '';
        const sharedUrl = urlParams.get('url') || '';
        const note = [sharedTitle, sharedText, sharedUrl].filter(Boolean).join(' ');

        if (note) {
          openAddTransactionModal({
            note: note.slice(0, 200),
            description: sharedTitle || 'Paylaşılan Harcama',
          });
        } else {
          openAddTransactionModal();
        }
      } else if (actionParam === 'import-json' || actionParam === 'import-csv') {
        setActiveTab('settings');
      }

      // Clean up sensitive action query params without reloading
      if (actionParam && window.history.replaceState) {
        const cleanUrl = window.location.pathname + (tabParam ? `?tab=${tabParam}` : '');
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.warn('[PWA] Error parsing URL parameters:', e);
    }

    // 2. Chromium File Handling API (launchQueue)
    if ('launchQueue' in window && 'files' in window.LaunchParams.prototype) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files || !launchParams.files.length) return;

        try {
          const fileHandle = launchParams.files[0];
          const file = await fileHandle.getFile();

          if (file.name.endsWith('.json')) {
            const fileText = await file.text();
            const parsedData = JSON.parse(fileText);
            const success = importFromJSON(parsedData);
            if (success) {
              alert('Yedek dosyası başarıyla içeri aktarıldı!');
            }
          } else if (file.name.endsWith('.csv')) {
            setActiveTab('settings');
            alert(`"${file.name}" dosyası algılandı. Ayarlar > Veri Yedeği menüsünden içeri aktarabilirsiniz.`);
          }
        } catch (err) {
          console.error('[PWA File Handling] Error reading launched file:', err);
        }
      });
    }

    // 3. Window Controls Overlay API (Desktop PWA Title Bar)
    if (navigator.windowControlsOverlay) {
      const handleGeometryChange = () => {
        const isVisible = navigator.windowControlsOverlay.visible;
        document.documentElement.classList.toggle('wco-enabled', isVisible);
      };
      navigator.windowControlsOverlay.addEventListener('geometrychange', handleGeometryChange);
      handleGeometryChange();
      return () => {
        navigator.windowControlsOverlay.removeEventListener('geometrychange', handleGeometryChange);
      };
    }
  }, [setActiveTab, openAddTransactionModal, importFromJSON]);
}
