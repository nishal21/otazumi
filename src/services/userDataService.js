import { db } from '../db/index.js';
import { watchHistory, favorites, watchlist } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { LocalStorageService } from './localStorageService.js';

export class UserDataService {
  // Dual Storage: Save to both NeonDB and localStorage
  // If user is logged in: save to NeonDB + localStorage
  // If user is not logged in: save to localStorage only

  // Watch History Methods
  static async addToWatchHistory(userId, animeData) {
    // Always save to localStorage first
    LocalStorageService.addToWatchHistory(
      { 
        id: animeData.animeId, 
        title: animeData.title,
        japanese_title: animeData.japanese_title,
        poster: animeData.poster,
        adultContent: animeData.adultContent
      },
      { 
        episodeId: animeData.episodeId, 
        episodeNumber: animeData.episodeNumber 
      },
      animeData.progress
    );

    // If user is logged in, also save to NeonDB
    if (!userId) {
      return { success: true, source: 'localStorage' };
    }

    try {
      const { animeId, episodeId, episodeNumber, progress = 0, completed = false } = animeData;
      
      // Check if already exists in NeonDB
      const existing = await db.select()
        .from(watchHistory)
        .where(and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.animeId, animeId),
          eq(watchHistory.episodeId, episodeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing entry
        const [updated] = await db.update(watchHistory)
          .set({ progress, completed, watchedAt: new Date() })
          .where(eq(watchHistory.id, existing[0].id))
          .returning();
        return { success: true, data: updated, source: 'both' };
      } else {
        // Create new entry
        const [newEntry] = await db.insert(watchHistory)
          .values({
            userId,
            animeId,
            episodeId,
            episodeNumber,
            progress,
            completed
          })
          .returning();
        return { success: true, data: newEntry, source: 'both' };
      }
    } catch (error) {
      console.error('NeonDB sync failed, using localStorage only:', error);
      return { success: true, source: 'localStorage', error: error.message };
    }
  }

  static async getWatchHistory(userId, limit = 20) {
    // If no userId, return from localStorage only
    if (!userId) {
      const localHistory = LocalStorageService.getWatchHistory();
      return localHistory.slice(0, limit);
    }

    try {
      // Try to get from NeonDB first
      const history = await db.select()
        .from(watchHistory)
        .where(eq(watchHistory.userId, userId))
        .orderBy(desc(watchHistory.watchedAt))
        .limit(limit);
      return history;
    } catch (error) {
      console.error('NeonDB fetch failed, using localStorage:', error);
      const localHistory = LocalStorageService.getWatchHistory();
      return localHistory.slice(0, limit);
    }
  }

  static async getContinueWatching(userId, limit = 10) {
    try {
      const continueList = await db.select()
        .from(watchHistory)
        .where(and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.completed, false)
        ))
        .orderBy(desc(watchHistory.watchedAt))
        .limit(limit);
      return continueList;
    } catch (error) {
      throw error;
    }
  }

  // Favorites Methods - Dual Storage
  static async addToFavorites(userId, animeData) {
    // Always save to localStorage first
    try {
      LocalStorageService.addToFavorites({
        id: animeData.animeId || animeData.id,
        title: animeData.title,
        japanese_title: animeData.japanese_title,
        poster: animeData.poster,
        adultContent: animeData.adultContent
      });
    } catch (localError) {
      console.error('localStorage save failed:', localError);
    }

    // If user is logged in, also save to NeonDB
    if (!userId) {
      return { success: true, source: 'localStorage' };
    }

    try {
      const { animeId, id, title, poster } = animeData;
      const finalAnimeId = animeId || id;
      
      // Check if already exists in NeonDB
      const existing = await db.select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, userId),
          eq(favorites.animeId, finalAnimeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        return { success: true, data: existing[0], source: 'both', message: 'Already in favorites' };
      }

      const [newFavorite] = await db.insert(favorites)
        .values({
          userId,
          animeId: finalAnimeId,
          title,
          poster
        })
        .returning();
      return { success: true, data: newFavorite, source: 'both' };
    } catch (error) {
      console.error('NeonDB sync failed, using localStorage only:', error);
      return { success: true, source: 'localStorage', error: error.message };
    }
  }

  static async removeFromFavorites(userId, animeId) {
    console.log('🗑️ Removing favorite - userId:', userId, 'animeId:', animeId);
    
    // Always remove from localStorage first
    LocalStorageService.removeFromFavorites(animeId);
    console.log('✅ Removed from localStorage');

    // If user is logged in, also remove from NeonDB
    if (!userId) {
      return { success: true, source: 'localStorage' };
    }

    try {
      // First, check what's in the database
      const allFavorites = await db.select()
        .from(favorites)
        .where(eq(favorites.userId, userId));
      
      console.log('📊 All favorites in DB:', allFavorites.map(f => ({ 
        dbId: f.id, 
        animeId: f.animeId, 
        title: f.title 
      })));
      
      // Try to delete - ensure we're comparing the same type
      const deleted = await db.delete(favorites)
        .where(and(
          eq(favorites.userId, userId),
          eq(favorites.animeId, String(animeId)) // Ensure string comparison
        ))
        .returning();
      
      if (deleted.length > 0) {
        console.log('✅ Deleted from NeonDB:', deleted);
        return { success: true, source: 'both', deletedCount: deleted.length };
      } else {
        console.log('⚠️ No matching record found in NeonDB');
        return { success: true, source: 'localStorage', message: 'Not found in database' };
      }
    } catch (error) {
      console.error('❌ NeonDB removal failed:', error);
      return { success: true, source: 'localStorage', error: error.message };
    }
  }

  static async getFavorites(userId, limit = 50) {
    // Always get from localStorage (most reliable and up-to-date)
    const localFavorites = LocalStorageService.getFavorites();
    
    // If no userId, return from localStorage only
    if (!userId) {
      return localFavorites.slice(0, limit);
    }

    // For logged-in users, try to get from NeonDB
    try {
      const favoritesList = await db.select()
        .from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.addedAt))
        .limit(limit);
      
      // Map database results to match localStorage format (ensure id field exists)
      const mappedFavorites = favoritesList.map(fav => ({
        ...fav,
        id: fav.animeId // Use animeId as id for consistency with localStorage
      }));
      
      // If NeonDB has data, return it, otherwise use localStorage
      return mappedFavorites.length > 0 ? mappedFavorites : localFavorites.slice(0, limit);
    } catch (error) {
      console.error('NeonDB fetch failed, using localStorage:', error);
      return localFavorites.slice(0, limit);
    }
  }

  static async isFavorite(userId, animeId) {
    // Always check localStorage first (faster)
    const isLocal = LocalStorageService.isFavorite(animeId);
    
    // If no userId, return localStorage result
    if (!userId) {
      return isLocal;
    }

    try {
      // Check NeonDB for logged-in users
      const existing = await db.select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, userId),
          eq(favorites.animeId, animeId)
        ))
        .limit(1);
      return existing.length > 0;
    } catch (error) {
      console.error('NeonDB check failed, using localStorage:', error);
      return isLocal;
    }
  }

  // Watchlist Methods - Dual Storage
  static async addToWatchlist(userId, animeData) {
    // Convert status format (plan-to-watch → plan_to_watch for DB)
    const normalizedStatus = (animeData.status || 'plan_to_watch').replace(/-/g, '_');

    // Always save to localStorage first
    LocalStorageService.addToWatchlist({
      id: animeData.animeId || animeData.id,
      title: animeData.title,
      japanese_title: animeData.japanese_title,
      poster: animeData.poster,
      adultContent: animeData.adultContent
    }, normalizedStatus);

    // If user is logged in, also save to NeonDB
    if (!userId) {
      return { success: true, source: 'localStorage' };
    }

    try {
      const { animeId, id, title, poster } = animeData;
      const finalAnimeId = animeId || id;
      
      // Check if already exists in NeonDB
      const existing = await db.select()
        .from(watchlist)
        .where(and(
          eq(watchlist.userId, userId),
          eq(watchlist.animeId, finalAnimeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing entry
        const [updated] = await db.update(watchlist)
          .set({ status: normalizedStatus, updatedAt: new Date() })
          .where(eq(watchlist.id, existing[0].id))
          .returning();
        return { success: true, data: updated, source: 'both' };
      } else {
        // Create new entry
        const [newEntry] = await db.insert(watchlist)
          .values({
            userId,
            animeId: finalAnimeId,
            title,
            poster,
            status: normalizedStatus
          })
          .returning();
        return { success: true, data: newEntry, source: 'both' };
      }
    } catch (error) {
      console.error('NeonDB sync failed, using localStorage only:', error);
      return { success: true, source: 'localStorage', error: error.message };
    }
  }

  static async removeFromWatchlist(userId, animeId) {
    console.log('🗑️ Removing watchlist - userId:', userId, 'animeId:', animeId);
    
    // Always remove from localStorage first
    LocalStorageService.removeFromWatchlist(animeId);
    console.log('✅ Removed from watchlist localStorage');

    // If user is logged in, also remove from NeonDB
    if (!userId) {
      return { success: true, source: 'localStorage' };
    }

    try {
      // First, check what's in the database
      const allWatchlist = await db.select()
        .from(watchlist)
        .where(eq(watchlist.userId, userId));
      
      console.log('📊 All watchlist in DB:', allWatchlist.map(w => ({ 
        dbId: w.id, 
        animeId: w.animeId, 
        title: w.title,
        status: w.status 
      })));
      
      // Try to delete - ensure we're comparing the same type
      const deleted = await db.delete(watchlist)
        .where(and(
          eq(watchlist.userId, userId),
          eq(watchlist.animeId, String(animeId)) // Ensure string comparison
        ))
        .returning();
      
      if (deleted.length > 0) {
        console.log('✅ Deleted from NeonDB watchlist:', deleted);
        return { success: true, source: 'both', deletedCount: deleted.length };
      } else {
        console.log('⚠️ No matching record found in NeonDB watchlist');
        return { success: true, source: 'localStorage', message: 'Not found in database' };
      }
    } catch (error) {
      console.error('❌ NeonDB watchlist removal failed:', error);
      return { success: true, source: 'localStorage', error: error.message };
    }
  }

  static async getWatchlist(userId, status = null) {
    // Always get from localStorage (most reliable and up-to-date)
    const localWatchlist = LocalStorageService.getWatchlist();
    
    // If no userId, return from localStorage only
    if (!userId) {
      if (status) {
        return localWatchlist.filter(item => item.status === status);
      }
      return localWatchlist;
    }

    // For logged-in users, try to get from NeonDB
    try {
      let query = db.select()
        .from(watchlist)
        .where(eq(watchlist.userId, userId));

      if (status) {
        query = query.where(eq(watchlist.status, status));
      }

      const list = await query.orderBy(desc(watchlist.addedAt));
      
      // Map database results to ensure id field exists
      const mappedList = list.map(item => ({
        ...item,
        id: item.animeId // Use animeId as id for consistency with localStorage
      }));
      
      // If NeonDB has data, return it, otherwise use localStorage
      return mappedList.length > 0 ? mappedList : (status ? localWatchlist.filter(item => item.status === status) : localWatchlist);
    } catch (error) {
      console.error('NeonDB fetch failed, using localStorage:', error);
      if (status) {
        return localWatchlist.filter(item => item.status === status);
      }
      return localWatchlist;
    }
  }

  static async getWatchlistStatus(userId, animeId) {
    // Always check localStorage first (faster)
    const localStatus = LocalStorageService.getWatchlistStatus(animeId);
    
    // If no userId, return localStorage result
    if (!userId) {
      return localStatus;
    }

    try {
      // Check NeonDB for logged-in users
      const [entry] = await db.select()
        .from(watchlist)
        .where(and(
          eq(watchlist.userId, userId),
          eq(watchlist.animeId, animeId)
        ))
        .limit(1);
      return entry ? entry.status : localStatus;
    } catch (error) {
      console.error('NeonDB check failed, using localStorage:', error);
      return localStatus;
    }
  }
}
