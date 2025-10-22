import { useEffect } from 'react';

const CommentSection = ({ malId, aniListId, episodeNumber, mediaType = 'anime' }) => {
  useEffect(() => {
    // Set the config for The Anime Community comment system
    const config = {
      mediaType: mediaType,
    };

    if (malId) {
      config.MAL_ID = String(malId);
    }
    if (aniListId) {
      config.AniList_ID = String(aniListId);
    }

    // Only include episodeChapterNumber if provided
    if (episodeNumber !== undefined) {
      config.episodeChapterNumber = String(episodeNumber);
    }

    window.theAnimeCommunityConfig = config;

    // Clear the comment section div
    const commentDiv = document.getElementById('anime-community-comment-section');
    if (commentDiv) {
      commentDiv.innerHTML = '';
    }

    // Check if script is already loaded
    const existingScript = document.getElementById('anime-community-script');
    if (existingScript) {
      // Remove the existing script
      existingScript.remove();
    }

    // Always load/create the script
    const script = document.createElement('script');
    script.src = 'https://theanimecommunity.com/embed.js';
    script.id = 'anime-community-script';
    script.defer = true;

    // Find the comment section div and append the script
    if (commentDiv) {
      commentDiv.appendChild(script);
    }

    // Add CSS to make embedded content responsive
    const style = document.createElement('style');
    style.textContent = `
      #anime-community-comment-section iframe,
      #anime-community-comment-section embed,
      #anime-community-comment-section object {
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        overflow-x: auto !important;
      }
      #anime-community-comment-section * {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #anime-community-comment-section {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
    `;
    if (commentDiv) {
      commentDiv.appendChild(style);
    }

    // Cleanup function - don't remove script on unmount
  }, [malId, aniListId, episodeNumber, mediaType]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Comments</h2>
      
      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-200 text-sm leading-relaxed">
          <strong>Disclaimer:</strong> This comment section is powered by a third-party service (The Anime Community). 
          It serves as a global chat visible to users worldwide across multiple anime streaming sites. 
          Please note that comments may include discussions or complaints about other websites that also use this service. 
          We are not responsible for content posted by other users or related to external sites.
        </p>
      </div>
      
      {/* Scrollable wrapper for embedded content */}
      <div className="w-full overflow-x-auto -webkit-overflow-scrolling-touch">
        <div
          id="anime-community-comment-section"
          className="bg-[#141414] rounded-lg p-2 sm:p-4 min-h-[400px] w-full max-w-full"
        ></div>
      </div>
    </div>
  );
};

export default CommentSection;