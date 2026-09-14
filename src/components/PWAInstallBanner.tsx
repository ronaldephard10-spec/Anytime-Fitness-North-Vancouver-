import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as standalone app, hide banner
  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {isInstallable && (
        <div id="pwa-install-container" className="flex items-center">
          <button
            id="pwa-install-button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
            title="Install Anytime Fitness Inspection App on this device"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalling ? 'Installing...' : 'Install PWA App'}</span>
          </button>
        </div>
      )}

      {isIOS && (
        <div id="pwa-ios-container" className="flex items-center">
          <button
            id="pwa-ios-button"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 rounded-lg border border-purple-400/40 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 px-3 py-1.5 text-xs font-medium transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-300" />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-purple-500/30 p-6 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center font-bold text-white text-xs">
                      AF
                    </div>
                    <h3 className="text-base font-bold text-white">Install AF Inspection App</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <p>
                      Tap the <strong className="text-white">Share</strong> icon at the bottom of your Safari browser toolbar (square with upward arrow).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <p>
                      Scroll down the action sheet and tap <strong className="text-white">Add to Home Screen</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <p>
                      Tap <strong className="text-emerald-400">Add</strong> in top right. You can now launch Anytime Fitness Inspection checklist anytime offline!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-6 w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-bold text-white transition"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
