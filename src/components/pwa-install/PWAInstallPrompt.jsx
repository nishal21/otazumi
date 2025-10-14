import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { usePWA } from '../../context/PWAContext';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePWA();

  // Prevent body scroll when modal is open
  useBodyScrollLock(showPrompt);

  useEffect(() => {
    console.log('PWAInstallPrompt: Component mounted');
    
    if (isInstalled) {
      console.log('PWAInstallPrompt: App already installed, hiding prompt');
      return;
    }

    // Check if we should show the prompt (once a week)
    const lastPromptTime = localStorage.getItem('pwaPromptLastShown');
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();

    // Check if user already dismissed recently
    const shouldShow = !lastPromptTime || (now - parseInt(lastPromptTime)) > oneWeek;
    console.log('PWAInstallPrompt: Should show prompt?', shouldShow, 'Last shown:', lastPromptTime);

    // Show prompt after delay if conditions are met
    if (shouldShow && canInstall) {
      console.log('PWAInstallPrompt: Will show prompt in 5 seconds...');
      const timer = setTimeout(() => {
        console.log('PWAInstallPrompt: Showing prompt now!');
        setShowPrompt(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstalled, canInstall]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    
    if (installed) {
      setShowPrompt(false);
    }
    
    // Record that we showed the prompt
    localStorage.setItem('pwaPromptLastShown', Date.now().toString());
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Record that we showed the prompt
    localStorage.setItem('pwaPromptLastShown', Date.now().toString());
  };

  // Don't show if already installed or prompt is hidden
  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-[10000000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full sm:w-auto sm:mx-4 sm:max-w-md bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-blue-500/30 overflow-hidden animate-slideUp max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 px-8">
            Install OTAZUMI App
          </h2>

          {/* PWA Badge */}
          <div className="inline-block px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-semibold rounded-full border border-blue-500/30">
            Progressive Web App (PWA)
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed px-2">
            Install OTAZUMI as an app for a better experience with:
          </p>

          {/* Features List */}
          <div className="mb-5 sm:mb-6 space-y-2 sm:space-y-3 text-left px-2">
            <div className="flex items-start gap-2 sm:gap-3 text-gray-300">
              <div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-[10px] sm:text-xs">✓</span>
              </div>
              <span className="text-xs sm:text-sm">Faster loading and offline access</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 text-gray-300">
              <div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-[10px] sm:text-xs">✓</span>
              </div>
              <span className="text-xs sm:text-sm">Full-screen experience without browser UI</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 text-gray-300">
              <div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-[10px] sm:text-xs">✓</span>
              </div>
              <span className="text-xs sm:text-sm">Quick access from your home screen</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 text-gray-300">
              <div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-[10px] sm:text-xs">✓</span>
              </div>
              <span className="text-xs sm:text-sm">No need to download from app stores</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg font-medium transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Install App
            </button>
          </div>

          {/* Small note */}
          <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400">
            This prompt will appear again in 7 days
          </p>

          {/* Support Developer Section */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
              ❤️ Enjoying OTAZUMI? Support the developer!
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <a
                href="https://github.com/sponsors/nishal21"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://buymeacoffee.com/kingtanjiro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-600/50 hover:bg-yellow-600 text-yellow-100 hover:text-white rounded-md transition-colors"
              >
                Coffee
              </a>
              <a
                href="https://ko-fi.com/demon_king"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600/50 hover:bg-red-600 text-red-100 hover:text-white rounded-md transition-colors"
              >
                Ko-fi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
