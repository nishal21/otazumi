import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LocalStorageService } from '../../services/localStorageService';
import { UserDataService } from '../../services/userDataService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faBookmark, 
  faHistory,
  faPlay,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);


  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    if (isAuthenticated && user?.id) {
      // Fetch from server for logged-in users
      const [favoritesData, watchlistData, continueData] = await Promise.all([
        UserDataService.getFavorites(user.id),
        UserDataService.getWatchlist(user.id),
        UserDataService.getContinueWatching(user.id)
      ]);
      setFavorites(favoritesData || []);
      setWatchlist(watchlistData || []);
      setContinueWatching(continueData || []);
    } else {
      // Fallback to localStorage for guests
      setFavorites(LocalStorageService.getFavorites());
      setWatchlist(LocalStorageService.getWatchlist());
      setContinueWatching(LocalStorageService.getContinueWatching());
    }
  };


  const handleRemoveFavorite = async (animeId) => {
    if (isAuthenticated && user?.id) {
      await UserDataService.removeFromFavorites(user.id, animeId);
    } else {
      LocalStorageService.removeFromFavorites(animeId);
    }
    loadUserData();
  };

  const handleRemoveFromWatchlist = async (animeId) => {
    if (isAuthenticated && user?.id) {
      await UserDataService.removeFromWatchlist(user.id, animeId);
    } else {
      LocalStorageService.removeFromWatchlist(animeId);
    }
    loadUserData();
  };

  const handleRemoveFromContinue = async (episodeId) => {
    // Only localStorage for continue watching (server sync not implemented)
    LocalStorageService.removeFromContinueWatching(episodeId);
    loadUserData();
  };

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: faHeart, data: favorites },
    { id: 'watchlist', label: 'Watchlist', icon: faBookmark, data: watchlist },
    { id: 'continue', label: 'Continue Watching', icon: faHistory, data: continueWatching },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isAuthenticated ? `${user?.username}'s Collection` : 'My Collection'}
          </h1>
          <p className="text-gray-400">
            Manage your favorites, watchlist, and continue watching
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === 'favorites' && (
            <div>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {favorites.map((anime) => (
                    <div key={anime.id} className="group relative">
                      <Link to={`/${anime.id}`}>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white font-medium text-sm line-clamp-2">
                                {language === 'EN' ? anime.title : anime.japanese_title || anime.title}
                              </p>
                            </div>
                          </div>
                          {anime.adultContent && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              18+
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(anime.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from favorites"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FontAwesomeIcon icon={faHeart} className="text-6xl text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No favorites yet</h3>
                  <p className="text-gray-500">Start adding anime to your favorites!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div>
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {watchlist.map((anime) => (
                    <div key={anime.id} className="group relative">
                      <Link to={`/${anime.id}`}>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white font-medium text-sm line-clamp-2 mb-1">
                                {language === 'EN' ? anime.title : anime.japanese_title || anime.title}
                              </p>
                              <p className="text-gray-300 text-xs capitalize">
                                {anime.status?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          {anime.adultContent && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              18+
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWatchlist(anime.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from watchlist"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FontAwesomeIcon icon={faBookmark} className="text-6xl text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No items in watchlist</h3>
                  <p className="text-gray-500">Add anime to track what you want to watch!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'continue' && (
            <div>
              {continueWatching.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {continueWatching.map((item) => (
                    <div key={item.episodeId} className="group relative">
                      <Link to={`/watch/${item.id}?ep=${item.episodeId}`}>
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                          <img
                            src={item.poster}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FontAwesomeIcon icon={faPlay} className="text-white text-4xl" />
                          </div>
                          {item.adultContent && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              18+
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                            <p className="text-white text-sm font-medium line-clamp-1 mb-1">
                              {language === 'EN' ? item.title : item.japanese_title || item.title}
                            </p>
                            <p className="text-gray-300 text-xs">Episode {item.episodeNum}</p>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemoveFromContinue(item.episodeId)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove from continue watching"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FontAwesomeIcon icon={faHistory} className="text-6xl text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No recent watching</h3>
                  <p className="text-gray-500">Start watching anime to see them here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;