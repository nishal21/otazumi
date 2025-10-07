import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faBookmark,
  faPlus,
  faCheck,
  faEye,
  faEyeSlash,
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { LocalStorageService } from '@/src/services/localStorageService';
import { UserDataService } from '@/src/services/userDataService';
import { useAuth } from '@/src/context/AuthContext';
import ShareButton from '@/src/components/ShareButton/ShareButton';

const AnimeActions = ({ anime, variant = 'default', className = '' }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState('plan-to-watch');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const animeData = {
    id: anime.id,
    title: anime.title,
    poster: anime.poster,
    japanese_title: anime.japanese_title,
    type: anime.animeInfo?.Type,
    status: anime.animeInfo?.Status,
  };

  const statusOptions = [
    { value: 'watching', label: 'Watching', icon: faEye, color: 'text-blue-400' },
    { value: 'completed', label: 'Completed', icon: faCheckCircle, color: 'text-green-400' },
    { value: 'on-hold', label: 'On Hold', icon: faClock, color: 'text-yellow-400' },
    { value: 'dropped', label: 'Dropped', icon: faEyeSlash, color: 'text-red-400' },
    { value: 'plan-to-watch', label: 'Plan to Watch', icon: faPlus, color: 'text-purple-400' },
  ];

  useEffect(() => {
    checkFavoriteStatus();
    checkWatchlistStatus();
  }, [anime.id]);

  const checkFavoriteStatus = async () => {
    // Check localStorage first (faster)
    const favorites = LocalStorageService.getFavorites();
    setIsFavorite(favorites.some(fav => fav.id === anime.id));

    // If user is logged in, also check NeonDB for accuracy
    if (user) {
      try {
        const isDbFavorite = await UserDataService.isFavorite(user.id, anime.id);
        setIsFavorite(isDbFavorite);
      } catch (error) {
        console.error('Error checking favorite status from DB:', error);
      }
    }
  };

  const checkWatchlistStatus = async () => {
    // Check localStorage first (faster)
    const watchlist = LocalStorageService.getWatchlist();
    const item = watchlist.find(w => w.id === anime.id);
    setIsInWatchlist(!!item);
    if (item) {
      setWatchlistStatus(item.status || 'plan-to-watch');
    }

    // If user is logged in, also check NeonDB for accuracy
    if (user) {
      try {
        const dbStatus = await UserDataService.getWatchlistStatus(user.id, anime.id);
        if (dbStatus) {
          setIsInWatchlist(true);
          setWatchlistStatus(dbStatus.replace(/_/g, '-')); // Convert DB format to UI format
        }
      } catch (error) {
        console.error('Error checking watchlist status from DB:', error);
      }
    }
  };

  const toggleFavorite = async () => {
    const userId = user?.id || null;

    if (isFavorite) {
      // Remove from both localStorage and NeonDB (if logged in)
      await UserDataService.removeFromFavorites(userId, anime.id);
      setIsFavorite(false);
    } else {
      // Add to both localStorage and NeonDB (if logged in)
      await UserDataService.addToFavorites(userId, animeData);
      setIsFavorite(true);
    }
  };

  const toggleWatchlist = async (status = 'plan-to-watch') => {
    const userId = user?.id || null;

    if (isInWatchlist && watchlistStatus === status) {
      // Remove from both localStorage and NeonDB (if logged in)
      await UserDataService.removeFromWatchlist(userId, anime.id);
      setIsInWatchlist(false);
      setShowStatusMenu(false);
    } else {
      // Add/Update in both localStorage and NeonDB (if logged in)
      await UserDataService.addToWatchlist(userId, { ...animeData, status });
      setIsInWatchlist(true);
      setWatchlistStatus(status);
      setShowStatusMenu(false);
    }
  };

  const currentStatus = statusOptions.find(opt => opt.value === watchlistStatus) || statusOptions[4]; // Default to 'plan-to-watch'

  // Compact variant for mobile/small spaces
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Favorite Button - Simple heart without animation */}
        <button
          onClick={toggleFavorite}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
            isFavorite
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FontAwesomeIcon icon={faHeart} className="text-sm" />
        </button>

        {/* Watchlist Button with Status */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
              isInWatchlist
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Watchlist"
          >
            <FontAwesomeIcon icon={currentStatus?.icon || faPlus} className="text-sm" />
          </button>

          {/* Status Dropdown */}
          {showStatusMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#18181B] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleWatchlist(option.value)}
                    className={`w-full px-3 py-2 flex items-center gap-2 transition-colors ${
                      watchlistStatus === option.value && isInWatchlist
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={option.icon} 
                      className={`text-xs ${option.color}`} 
                    />
                    <span className="text-xs text-white">{option.label}</span>
                    {watchlistStatus === option.value && isInWatchlist && (
                      <FontAwesomeIcon icon={faCheck} className="ml-auto text-xs text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
          <ShareButton
            onShare={() => console.log('Anime shared!')}
            className="flex-shrink-0"
            text=""
            animeTitle={anime.title}
          />
        </div>
      </div>
    );
  }

  // Default variant with full buttons
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Favorite Button - Simple heart without animation */}
      <button
        onClick={toggleFavorite}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
          isFavorite
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-red-400'
        }`}
      >
        <FontAwesomeIcon icon={faHeart} className="text-sm" />
        <span className="text-sm">{isFavorite ? 'Favorited' : 'Favorite'}</span>
      </button>

      {/* Watchlist Button with Status */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            isInWatchlist
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FontAwesomeIcon icon={currentStatus?.icon || faPlus} className="text-sm" />
          <span className="text-sm">{currentStatus?.label || 'Plan to Watch'}</span>
        </button>

        {/* Status Dropdown */}
        {showStatusMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowStatusMenu(false)}
            />
            <div className="absolute left-0 top-full mt-2 w-52 bg-[#18181B] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-700">
                <p className="text-xs text-gray-400 font-medium">Set Status</p>
              </div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleWatchlist(option.value)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors ${
                    watchlistStatus === option.value && isInWatchlist
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={option.icon} 
                    className={`text-sm ${option.color}`} 
                  />
                  <span className="text-sm text-white">{option.label}</span>
                  {watchlistStatus === option.value && isInWatchlist && (
                    <FontAwesomeIcon icon={faCheck} className="ml-auto text-sm text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Share Button */}
      <div className="flex items-center justify-center px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200">
        <ShareButton
          onShare={() => console.log('Anime shared!')}
          className="flex-shrink-0"
          text="Share"
          animeTitle={anime.title}
        />
      </div>
    </div>
  );
};

export default AnimeActions;
