import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWAInstallButton: Component mounted');
    
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    console.log('PWAInstallButton: Is installed?', isStandalone);
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWAInstallButton: beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Check if app was installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for different browsers
      const userAgent = navigator.userAgent.toLowerCase();
      let message = 'To install this app:\n\n';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        message += '1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm';
      } else if (userAgent.includes('android')) {
        message += '1. Tap the menu button (⋮)\n2. Tap "Install App" or "Add to Home Screen"\n3. Tap "Install" to confirm';
      } else {
        message += 'Desktop Chrome/Edge: Look for the install icon (⊕) in the address bar\n\nOr use the browser menu → "Install OTAZUMI"';
      }
      
      alert(message);
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
  };

  console.log('PWAInstallButton: Render - isInstalled:', isInstalled, 'deferredPrompt:', !!deferredPrompt);

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <span className="text-lg">✓</span>
        <span>App Installed</span>
      </div>
    );
  }

  // Always show button (with fallback for browsers that don't support PWA)
  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm"
      title="Install OTAZUMI as an app"
    >
      <Download className="w-4 h-4" />
      <span>Install App</span>
    </button>
  );
};

export default PWAInstallButton;
