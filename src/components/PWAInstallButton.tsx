import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // If already running inside standalone app mode, hide install button
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setShowSuccessModal(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Desktop / Other browser: explain how to install via browser address bar or menu
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        title="Install Islamic Habibi as an Application on your device"
      >
        <Download className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
        <span className="hidden xs:inline">Install</span> App
      </button>

      {/* iOS / General Device Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 text-neutral-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-amber-400 shadow-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-neutral-100">
                  Install Islamic Habibi App
                </h3>
                <p className="text-xs text-neutral-400">
                  Add to your phone or desktop home screen
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-4 text-xs text-neutral-300">
                <p className="leading-relaxed">
                  Install Islamic Habibi directly onto your iPhone or iPad home screen without going to the App Store:
                </p>
                <div className="space-y-2.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 text-emerald-400">
                      <Share className="w-4 h-4" />
                    </div>
                    <span>1. Tap the <strong>Share</strong> button in Safari's bottom toolbar.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 text-amber-400">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 text-teal-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>3. Tap <strong>Add</strong> in the top-right corner to launch as a native app!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-neutral-300">
                <p className="leading-relaxed">
                  To install Islamic Habibi on Chrome, Edge, or Android:
                </p>
                <div className="space-y-2.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-200 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Click the <strong>Install App icon (⊕)</strong> in your browser address bar.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-200 font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Or open browser menu (⋮) &rarr; select <strong>Install Islamic Habibi</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-200 font-bold flex items-center justify-center shrink-0">3</span>
                    <span>The app opens in standalone window mode on your desktop or phone home screen.</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-emerald-700/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-emerald-300">
              App Installed Successfully!
            </h3>
            <p className="text-xs text-neutral-300">
              Islamic Habibi is now installed on your device. You can launch it directly from your home screen or application launcher.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
