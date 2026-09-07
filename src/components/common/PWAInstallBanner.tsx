import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X, Share2, Smartphone, ShieldCheck } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed as PWA or dismissed by the user in this session, don't show
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only display if install prompt is ready or on iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (success) {
      setIsDismissed(true);
    }
  };

  return (
    <>
      <div
        id="pwaInstallBanner"
        className="fixed bottom-16 md:bottom-6 right-3 md:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] bg-slate-900/95 text-white border border-blue-500/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-0.5 shrink-0 flex items-center justify-center shadow-md shadow-blue-500/30">
              <img
                src="/icon.svg"
                alt="TécnicaMZ Pro"
                className="w-full h-full rounded-[10px] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                <span>TécnicaMZ Pro</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  PWA
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Instale para ter acesso rápido offline às calculadoras e tabelas EDM.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            id="btnInstalarPwaBanner"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar App TécnicaMZ Pro</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Agora Não
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 text-sky-400">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Instalar no iPhone / iPad</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              No Safari do iOS, siga estes 2 passos simples para ter o app nativo na sua tela de início:
            </p>

            <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-slate-200">
                  Toque no botão <strong className="text-sky-400">Compartilhar</strong> (ícone do quadrado com seta para cima <Share2 className="w-3.5 h-3.5 inline text-sky-400" />) na barra inferior do Safari.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-slate-200">
                  Role o menu e toque em <strong className="text-sky-400">Adicionar à Tela de Início</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    await install();
  };

  return (
    <>
      <button
        id="headerBtnInstallPwa"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold transition active:scale-95 cursor-pointer"
        title="Instalar App TécnicaMZ Pro"
      >
        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-bounce" />
        <span className="text-[11px] hidden sm:inline">Instalar App</span>
      </button>

      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-sm text-white mb-2">Instalar no Safari (iOS)</h3>
            <p className="text-xs text-slate-300 mb-3">
              1. Toque em <strong>Compartilhar</strong> na barra de navegação.<br />
              2. Selecione <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </>
  );
};
