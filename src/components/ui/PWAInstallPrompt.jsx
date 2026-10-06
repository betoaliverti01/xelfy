import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. If already installed in standalone mode, never show
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. If user already dismissed or installed, never show again
    const alreadyDismissed = localStorage.getItem('xelfy_pwa_dismissed');
    if (alreadyDismissed === 'true') {
      return;
    }

    // 3. Detect iOS Safari
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      setShowPrompt(true);
      return;
    }

    // 4. Capture beforeinstallprompt for Android & Chromium
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Permanently record that user took action
    localStorage.setItem('xelfy_pwa_dismissed', 'true');
    setShowPrompt(false);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (_) {}
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    // Permanently remember to never show again
    localStorage.setItem('xelfy_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-[#0A1B24]/95 border border-[#34A8A6]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#00485C] border border-[#34A8A6]/40 flex items-center justify-center p-1.5 shadow-md flex-shrink-0">
              <img src="/logo.png" alt="xelfy" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Instalar xelfy no Celular</h4>
              <p className="text-xs text-slate-300">Acesse suas finanças e pedidos como um app nativo</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            title="Fechar"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="text-xs text-slate-200 bg-[#00485C]/50 rounded-xl p-3 border border-[#34A8A6]/30">
            Para instalar no seu iPhone: toque no ícone de <span className="font-bold text-[#4BCBB4]">Compartilhar</span> no Safari e selecione <span className="font-bold text-white">"Adicionar à Tela de Início"</span> 📲
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-[#238799] via-[#34A8A6] to-[#4BCBB4] hover:brightness-110 text-gray-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4" />
              Instalar Aplicativo
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Não mostrar mais
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
