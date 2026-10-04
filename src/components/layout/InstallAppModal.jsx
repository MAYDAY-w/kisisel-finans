import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Smartphone, Download, Share, PlusSquare, Check, Sparkles } from 'lucide-react';

export function InstallAppModal() {
  const { isInstallAppOpen, closeInstallApp } = useFinance();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        closeInstallApp();
      }
    }
  };

  return (
    <Modal
      isOpen={isInstallAppOpen}
      onClose={closeInstallApp}
      title="📲 Uygulamayı Telefona Yükle"
      subtitle="Telefonunuzda App Store veya Play Store gibi bağımsız bir uygulama olarak kullanın"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {isStandalone ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Uygulama Zaten Yüklü!</h4>
            <p className="text-xs text-slate-600">
              Şu anda uygulamayı ana ekranınızdan bağımsız bir mobil uygulama olarak kullanıyorsunuz.
            </p>
          </div>
        ) : (
          <>
            {/* Value Proposition */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Neden Telefona Yüklemelisin?</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Adres çubuğu olmadan tam ekran mobil deneyim</li>
                <li>İnternet bağlantısı olmasa bile %100 çevrimdışı çalışma</li>
                <li>Alışveriş fişlerini kamerayla anında çekebilme</li>
              </ul>
            </div>

            {/* iOS Safari Guide */}
            {isIOS ? (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  iPhone (iOS) Kurulum Adımları:
                </h4>
                <div className="space-y-2 pl-1">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <span>Safari tarayıcısının altındaki <strong className="inline-flex items-center gap-1 text-slate-900"><Share className="w-3.5 h-3.5 text-blue-600" /> Paylaş</strong> butonuna dokunun.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <span>Menüyü aşağı kaydırıp <strong className="inline-flex items-center gap-1 text-slate-900"><PlusSquare className="w-3.5 h-3.5" /> Ana Ekrana Ekle</strong> seçeneğini seçin.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <span>Sağ üstteki <strong>"Ekle"</strong> butonuna basın. Uygulama telefonunuzun ana ekranına eklenecektir!</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Android & Desktop Guide */
              <div className="space-y-3">
                {deferredPrompt ? (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Download}
                    onClick={handleInstallClick}
                    className="w-full font-bold shadow-md shadow-emerald-600/20"
                  >
                    Hemen Telefona Yükle
                  </Button>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-700">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Android / Bilgisayar Kurulumu:
                    </h4>
                    <p className="leading-relaxed">
                      Chrome tarayıcınızın sağ üstündeki <strong>üç nokta (⋮)</strong> menüsüne dokunun ve <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Button variant="secondary" onClick={closeInstallApp} className="w-full">
          Kapat
        </Button>
      </div>
    </Modal>
  );
}
