import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons';
import { LocalStorageService } from '../../services/localStorageService';
import { useAuth } from '../../context/AuthContext';
import AnimatedHeart from '../ui/AnimatedHeart/AnimatedHeart';

const AnimeActions = ({ animeData }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);

  const watchlistOptions = [
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  useEffect(() => {
    checkStatus();
  }, [animeData.id]);

  const checkStatus = () => {
    setIsFavorite(LocalStorageService.isFavorite(animeData.id));
    setWatchlistStatus(LocalStorageService.getWatchlistStatus(animeData.id));
  };

  const handleToggleFavorite = () => {
    try {
      if (isFavorite) {
        LocalStorageService.removeFromFavorites(animeData.id);
        setIsFavorite(false);
      } else {
        LocalStorageService.addToFavorites(animeData);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleWatchlistChange = (status) => {
    try {
      if (watchlistStatus === status) {
        // Remove from watchlist if same status is clicked
        LocalStorageService.removeFromWatchlist(animeData.id);
        setWatchlistStatus(null);
      } else {
        LocalStorageService.addToWatchlist(animeData, status);
        setWatchlistStatus(status);
      }
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Favorite Button */}
      <div className="flex items-center gap-2">
        <AnimatedHeart
          isFavorite={isFavorite}
          onToggle={handleToggleFavorite}
        />
        <span className="hidden sm:inline text-gray-300 font-medium">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      </div>

      {/* Watchlist Button */}
      <div className="relative">
        <button
          onClick={() => setShowWatchlistMenu(!showWatchlistMenu)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            watchlistStatus
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
          }`}
          title={watchlistStatus ? 'Change watchlist status' : 'Add to watchlist'}
        >
          <FontAwesomeIcon icon={watchlistStatus ? faBookmark : faBookmarkOutline} className="text-lg" />
          <span className="hidden sm:inline">
            {watchlistStatus ? watchlistOptions.find(o => o.value === watchlistStatus)?.label : 'Watchlist'}
          </span>
        </button>

        {/* Watchlist Dropdown */}
        {showWatchlistMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowWatchlistMenu(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-[#18181B] border border-gray-700/50 rounded-lg shadow-2xl min-w-[200px] z-50 overflow-hidden">
              {watchlistOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleWatchlistChange(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    watchlistStatus === option.value
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {watchlistStatus === option.value && (
                    <FontAwesomeIcon icon={faCheck} className="text-sm" />
                  )}
                </button>
              ))}
              {watchlistStatus && (
                <button
                  onClick={() => {
                    LocalStorageService.removeFromWatchlist(animeData.id);
                    setWatchlistStatus(null);
                    setShowWatchlistMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 border-t border-gray-700/50 font-medium"
                >
                  Remove from Watchlist
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeActions;