export class LocalStorageService {
  // Continue Watching
  static getContinueWatching() {
    try {
      return JSON.parse(localStorage.getItem('continueWatching') || '[]');
    } catch {
      return [];
    }
  }

  static addToContinueWatching(animeData) {
    try {
      const existingList = this.getContinueWatching();
      const { id, episodeId, episodeNum, title, japanese_title, poster, adultContent } = animeData;
      
      // Remove existing entry for this anime/episode
      const filteredList = existingList.filter(
        item => !(item.id === id && item.episodeId === episodeId)
      );
      
      // Add new entry at the beginning
      const newEntry = {
        id,
        episodeId,
        episodeNum,
        title,
        japanese_title,
        poster,
        adultContent,
        addedAt: new Date().toISOString()
      };
      
      filteredList.unshift(newEntry);
      
      // Keep only last 50 items
      const trimmedList = filteredList.slice(0, 50);
      
      localStorage.setItem('continueWatching', JSON.stringify(trimmedList));
      return newEntry;
    } catch (error) {
      console.error('Error adding to continue watching:', error);
      return null;
    }
  }

  static removeFromContinueWatching(episodeId) {
    try {
      const existingList = this.getContinueWatching();
      const updatedList = existingList.filter(item => item.episodeId !== episodeId);
      localStorage.setItem('continueWatching', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error removing from continue watching:', error);
      return false;
    }
  }

  // Favorites
  static getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  }

  static addToFavorites(animeData) {
    try {
      const existingList = this.getFavorites();
      const { id, title, japanese_title, poster, adultContent } = animeData;
      
      // Check if already exists
      if (existingList.some(item => item.id === id)) {
        throw new Error('Already in favorites');
      }
      
      const newEntry = {
        id,
        title,
        japanese_title,
        poster,
        adultContent,
        addedAt: new Date().toISOString()
      };
      
      existingList.unshift(newEntry);
      localStorage.setItem('favorites', JSON.stringify(existingList));
      return newEntry;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static removeFromFavorites(animeId) {
    try {
      const existingList = this.getFavorites();
      const updatedList = existingList.filter(item => item.id !== animeId);
      localStorage.setItem('favorites', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static isFavorite(animeId) {
    try {
      const favorites = this.getFavorites();
      return favorites.some(item => item.id === animeId);
    } catch {
      return false;
    }
  }

  // Watchlist
  static getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem('watchlist') || '[]');
    } catch {
      return [];
    }
  }

  static addToWatchlist(animeData, status = 'plan_to_watch') {
    try {
      const existingList = this.getWatchlist();
      const { id, title, japanese_title, poster, adultContent } = animeData;
      
      // Remove existing entry for this anime
      const filteredList = existingList.filter(item => item.id !== id);
      
      const newEntry = {
        id,
        title,
        japanese_title,
        poster,
        adultContent,
        status,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      filteredList.unshift(newEntry);
      localStorage.setItem('watchlist', JSON.stringify(filteredList));
      return newEntry;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return null;
    }
  }

  static removeFromWatchlist(animeId) {
    try {
      const existingList = this.getWatchlist();
      const updatedList = existingList.filter(item => item.id !== animeId);
      localStorage.setItem('watchlist', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  static getWatchlistStatus(animeId) {
    try {
      const watchlist = this.getWatchlist();
      const entry = watchlist.find(item => item.id === animeId);
      return entry ? entry.status : null;
    } catch {
      return null;
    }
  }

  static updateWatchlistStatus(animeId, status) {
    try {
      const existingList = this.getWatchlist();
      const updatedList = existingList.map(item => 
        item.id === animeId 
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      );
      localStorage.setItem('watchlist', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error updating watchlist status:', error);
      return false;
    }
  }

  // Watch History
  static getWatchHistory() {
    try {
      return JSON.parse(localStorage.getItem('watchHistory') || '[]');
    } catch {
      return [];
    }
  }

  static addToWatchHistory(animeData, episodeData, progress = 0) {
    try {
      const existingList = this.getWatchHistory();
      const { id, title, japanese_title, poster, adultContent } = animeData;
      const { episodeId, episodeNumber } = episodeData;
      
      // Remove existing entry for this anime/episode
      const filteredList = existingList.filter(
        item => !(item.animeId === id && item.episodeId === episodeId)
      );
      
      const newEntry = {
        animeId: id,
        episodeId,
        episodeNumber,
        title,
        japanese_title,
        poster,
        adultContent,
        progress,
        watchedAt: new Date().toISOString()
      };
      
      filteredList.unshift(newEntry);
      
      // Keep only last 100 items
      const trimmedList = filteredList.slice(0, 100);
      
      localStorage.setItem('watchHistory', JSON.stringify(trimmedList));
      return newEntry;
    } catch (error) {
      console.error('Error adding to watch history:', error);
      return null;
    }
  }

  // User Preferences
  static getPreferences() {
    try {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    } catch {
      return {};
    }
  }

  static updatePreferences(preferences) {
    try {
      const existing = this.getPreferences();
      const updated = { ...existing, ...preferences };
      localStorage.setItem('userPreferences', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return null;
    }
  }

  // Clear all user data
  static clearAllUserData() {
    try {
      const keysToRemove = [
        'continueWatching',
        'favorites',
        'watchlist',
        'watchHistory',
        'userPreferences'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }
}