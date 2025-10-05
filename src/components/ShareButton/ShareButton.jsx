import React, { useState } from 'react';

const ShareButton = ({ onShare, className = "", text = "Share", episodeId = null, animeTitle = "" }) => {
  const [showCopiedText, setShowCopiedText] = useState(false);

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
        setShowCopiedText(true);
        setTimeout(() => setShowCopiedText(false), 2000);
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(currentUrl);
        setShowCopiedText(true);
        setTimeout(() => setShowCopiedText(false), 2000);
      }
    } else {
      // Fallback for browsers without Web Share API
      copyToClipboard(currentUrl);
      setShowCopiedText(true);
      setTimeout(() => setShowCopiedText(false), 2000);
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
    <div className={className}>
      <div
        className="flex items-center justify-center text-center bg-[linear-gradient(90deg,#212121_calc(22px-1px),transparent_1%)_center/22px_22px,linear-gradient(#212121_calc(22px-1px),transparent_1%)_center/22px_22px,#313131] border border-[#313131] px-2 py-1 rounded-[0.35em] shadow-[0_0_0.5em_0.25em_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_0.5em_0.3em_rgba(0,0,0,0.1)]"
        onClick={handleShare}
      >
        <label
          className="flex items-center cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {showCopiedText ? (
            <span className="text-green-400 font-bold text-sm animate-pulse">
              Copied!
            </span>
          ) : (
            <svg
              className="w-4 h-4 fill-white transition-opacity duration-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 16.08C17.24 16.08 16.56 16.38 16.05 16.87L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.95 7.13C16.46 7.62 17.24 7.92 18 7.92C19.66 7.92 21 6.58 21 4.92C21 3.26 19.66 1.92 18 1.92C16.34 1.92 15 3.26 15 4.92C15 5.16 15.04 5.39 15.09 5.62L8.05 9.79C7.54 9.3 6.76 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.76 15 7.54 14.7 8.05 14.21L15.18 18.38C15.13 18.61 15.09 18.84 15.09 19.08C15.09 20.74 16.43 22.08 18.09 22.08C19.75 22.08 21.09 20.74 21.09 19.08C21.09 17.42 19.75 16.08 18 16.08Z"
              ></path>
            </svg>
          )}
        </label>
      </div>
    </div>
  );
};

export default ShareButton;