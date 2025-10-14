import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';

const ShareButton = ({ onShare, className = "", text = "Share", episodeId = null, animeTitle = "" }) => {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareTitle = episodeId
      ? `Watch Episode ${episodeId} of ${animeTitle}`
      : `Check out ${animeTitle} on Otazumi!`;
    const shareText = episodeId
      ? `Watch Episode ${episodeId} of ${animeTitle} on Otazumi`
      : `Found this amazing anime "${animeTitle}" on Otazumi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(currentUrl);
        setShowCopiedPopup(true);
        setTimeout(() => setShowCopiedPopup(false), 2000);
      }
    } else {
      // Fallback for browsers without Web Share API
      copyToClipboard(currentUrl);
      setShowCopiedPopup(true);
      setTimeout(() => setShowCopiedPopup(false), 2000);
    }

    if (onShare) onShare();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        className="flex items-center justify-center text-center bg-[linear-gradient(90deg,#212121_calc(22px-1px),transparent_1%)_center/22px_22px,linear-gradient(#212121_calc(22px-1px),transparent_1%)_center/22px_22px,#313131] border border-[#313131] px-2 py-1 rounded-[0.35em] shadow-[0_0_0.5em_0.25em_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_0.5em_0.3em_rgba(0,0,0,0.1)]"
        onClick={handleShare}
        title={text}
      >
        <FontAwesomeIcon
          icon={faShare}
          className="w-4 h-4 fill-white transition-opacity duration-300"
        />
      </button>

      {/* Copied Popup Card */}
      {showCopiedPopup && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg border border-green-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Copied!</span>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;