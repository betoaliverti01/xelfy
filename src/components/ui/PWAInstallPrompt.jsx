import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('pwa_ios_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    // Capture beforeinstallprompt for Android and Chromium browsers
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
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
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa_ios_dismissed', 'true');
    } else {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-gray-900 border border-teal-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl bg-opacity-95 text-white flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2d91a8] to-[#52cfc1] flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Smartphone className="w-5 h-5 text-gray-950 font-bold" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Instalar xelfy no Celular</h4>
              <p className="text-xs text-gray-400">Acesse suas vendas e finanças offline como um app nativo</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="text-xs text-gray-300 bg-gray-800/80 rounded-xl p-3 border border-gray-700/50">
            Para instalar no seu iPhone: toque no ícone de <span className="font-semibold text-[#52cfc1]">Compartilhar</span> no Safari e selecione <span className="font-semibold text-white">"Adicionar à Tela de Início"</span> 📲
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-[#2d91a8] to-[#52cfc1] hover:brightness-110 text-gray-950 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4" />
              Instalar Aplicativo
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Depois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
