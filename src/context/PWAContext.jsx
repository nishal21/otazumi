import { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWAContext: Initializing');
    
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    console.log('PWAContext: Is installed?', isStandalone);
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWAContext: beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Check if app was installed
    const handleAppInstalled = () => {
      console.log('PWAContext: App installed');
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

  const promptInstall = async () => {
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
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWAContext: User ${outcome} the install prompt`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWAContext: Error during install:', error);
      return false;
    }
  };

  const value = {
    deferredPrompt,
    isInstalled,
    promptInstall,
    canInstall: !!deferredPrompt && !isInstalled
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};
