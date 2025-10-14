import { Download } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

const PWAInstallButton = () => {
  const { isInstalled, promptInstall } = usePWA();

  const handleInstall = async () => {
    await promptInstall();
  };

  console.log('PWAInstallButton: Render - isInstalled:', isInstalled);

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
