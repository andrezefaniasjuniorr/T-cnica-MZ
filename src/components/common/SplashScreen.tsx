import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
  previewMode?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2500,
  previewMode = false,
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (previewMode) return;
    if (!onFinish) return;

    const timer = setTimeout(() => {
      setFading(true);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 500);
      return () => clearTimeout(finishTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [onFinish, minDurationMs, previewMode]);

  return (
    <div
      id="splash-screen-container"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#0A1120',
        width: '100vw',
        height: '100dvh',
      }}
      onClick={() => {
        if (previewMode && onFinish) {
          setFading(true);
          setTimeout(onFinish, 400);
        }
      }}
    >
      <style>{`
        @keyframes splashPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .splash-icon-pulse {
          animation: splashPulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Brilho radial sutil atrás do ícone */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />

      {/* Ícone Redondo Oficial TécnicaMZ Pro com 220px, Sombra Neon e Animação Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="splash-icon-pulse"
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src="/icon-512.png?v=round6"
            alt="TécnicaMZ Pro"
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Texto TécnicaMZ Pro com Outfit/Inter, weight 600, letter-spacing 0.5px, bottom 80px */}
      <div
        className="absolute z-10 w-full text-center pointer-events-none"
        style={{
          bottom: '80px',
          left: 0,
          right: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 600,
            fontSize: '22px',
            letterSpacing: '0.5px',
            color: '#FFFFFF',
            display: 'inline-block',
            textShadow: '0 2px 10px rgba(0, 212, 255, 0.25)',
          }}
        >
          TécnicaMZ Pro
        </span>
      </div>

      {/* Indicador no Modo Preview */}
      {previewMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-medium backdrop-blur-md">
          Preview Splash Screen • Toque para fechar
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
