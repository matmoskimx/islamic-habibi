import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ih_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('ih_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Docked Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 border border-emerald-700/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slideUp">
        <div className="flex items-start gap-3.5">
          {/* App Icon */}
          <div className="relative w-12 h-12 rounded-2xl bg-neutral-950 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
            <img src="/icon.svg" alt="Islamic Habibi App Icon" className="w-10 h-10 object-contain" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-neutral-900 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-neutral-950" />
            </div>
          </div>

          {/* Banner Copy */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                <span>Islamic Habibi App</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  PWA
                </span>
              </h4>
              <button
                onClick={handleDismiss}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-md transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300 leading-snug">
              Install to your home screen for standalone native app view, direct matrimonial search, and offline speed.
            </p>

            <div className="flex items-center gap-2 pt-1.5">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-transform hover:scale-105"
              >
                <Download className="w-3 h-3 text-neutral-950 stroke-[2.5]" />
                <span>Install Native App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 px-2 py-1"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide for iOS/Manual installation */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-cinzel text-base font-bold text-neutral-100">
              Add Islamic Habibi to Home Screen
            </h3>

            {isIOS ? (
              <p className="text-xs text-neutral-300 text-left bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <span>1. Tap Safari's <strong>Share</strong> button at bottom.</span><br />
                <span>2. Tap <strong>Add to Home Screen</strong>.</span><br />
                <span>3. Tap <strong>Add</strong> to use as a native app!</span>
              </p>
            ) : (
              <p className="text-xs text-neutral-300 text-left bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <span>1. Click the <strong>Install App</strong> icon (⊕) in the browser address bar.</span><br />
                <span>2. Or open the browser menu &rarr; <strong>Install Islamic Habibi</strong>.</span>
              </p>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
