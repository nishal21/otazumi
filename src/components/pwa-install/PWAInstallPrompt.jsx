import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWAInstallPrompt: Component mounted');
    
    // Check if app is already installed (PWA mode or standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    console.log('PWAInstallPrompt: Is installed?', isStandalone);
    
    if (isStandalone) {
      setIsInstalled(true);
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

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWAInstallPrompt: beforeinstallprompt event fired!');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show our custom prompt if it's time
      if (shouldShow && !isInstalled) {
        console.log('PWAInstallPrompt: Will show prompt in 3 seconds...');
        setTimeout(() => {
          console.log('PWAInstallPrompt: Showing prompt now!');
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds on homepage
      }
    };
    
    // For testing: Show prompt after 3 seconds even if beforeinstallprompt doesn't fire
    // This helps on iOS and other browsers that don't support the API
    if (shouldShow && !isInstalled) {
      console.log('PWAInstallPrompt: Setting fallback timer (will show in 5 seconds)');
      const fallbackTimer = setTimeout(() => {
        console.log('PWAInstallPrompt: Fallback - showing prompt now');
        setShowPrompt(true);
      }, 5000);
      
      // Clear fallback if beforeinstallprompt fires
      return () => clearTimeout(fallbackTimer);
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback message for browsers that don't support beforeinstallprompt
      alert('To install this app:\n\n' +
        'iOS Safari: Tap Share → Add to Home Screen\n' +
        'Android Chrome: Tap Menu (⋮) → Install App\n' +
        'Desktop Chrome: Look for the install icon in the address bar');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
    
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative mx-4 max-w-md w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-blue-500/30 overflow-hidden animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Smartphone className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            Install OTAZUMI App
          </h2>

          {/* PWA Badge */}
          <div className="inline-block px-3 py-1 mb-4 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
            Progressive Web App (PWA)
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Install OTAZUMI as an app for a better experience with:
          </p>

          {/* Features List */}
          <div className="mb-6 space-y-3 text-left">
            <div className="flex items-start gap-3 text-gray-300">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span className="text-sm">Faster loading and offline access</span>
            </div>
            <div className="flex items-start gap-3 text-gray-300">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span className="text-sm">Full-screen experience without browser UI</span>
            </div>
            <div className="flex items-start gap-3 text-gray-300">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span className="text-sm">Quick access from your home screen</span>
            </div>
            <div className="flex items-start gap-3 text-gray-300">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-xs">✓</span>
              </div>
              <span className="text-sm">No need to download from app stores</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          </div>

          {/* Small note */}
          <p className="mt-4 text-xs text-gray-400">
            This prompt will appear again in 7 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
