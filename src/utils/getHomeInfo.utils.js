import axios from "axios";
import fallbackHomeData from "../data/fallbackHomeData";

const CACHE_KEY = "homeInfoCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function getHomeInfo() {
  const api_url = import.meta.env.VITE_API_URL;


  const currentTime = Date.now();
  let cachedData = null;
  
  // Try to get cached data
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (cacheStr) {
      cachedData = JSON.parse(cacheStr);
      console.log('📦 Found cached data, age:', Math.round((currentTime - cachedData.timestamp) / 1000 / 60), 'minutes');
    }
  } catch (e) {
    console.warn('⚠️ Error reading cache:', e);
  }

  // Return fresh cache if available
  if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
    console.log('✅ Using fresh cached data');
    return cachedData.data;
  }
  
  // Try to fetch from API with retries
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Fetching fresh data from API... (Attempt ${attempt}/${MAX_RETRIES})`);
      const response = await axios.get(`${api_url}`, {
        timeout: 30000, // 30 second timeout for mobile networks
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      console.log('📦 API Response:', response.status, response.data ? 'Data received' : 'No data');
    
    if (
      !response.data.results ||
      Object.keys(response.data.results).length === 0
    ) {
      console.error('❌ No results in API response');
      // If we have stale cache, use it as fallback
      if (cachedData && cachedData.data) {
        console.log('🔄 Using stale cache as fallback');
        return cachedData.data;
      }
      return null;
    }
  const {
    spotlights,
    trending,
    topTen: topten,
    today: todaySchedule,
    topAiring: top_airing,
    mostPopular: most_popular,
    mostFavorite: most_favorite,
    latestCompleted: latest_completed,
    latestEpisode: latest_episode,
    topUpcoming: top_upcoming,
    recentlyAdded: recently_added,
    genres,
  } = response.data.results;

    const dataToCache = {
      data: {
        spotlights,
        trending,
        topten,
        todaySchedule,
        top_airing,
        most_popular,
        most_favorite,
        latest_completed,
        latest_episode,
        top_upcoming,
        recently_added,
        genres,
      },
      timestamp: currentTime,
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
      console.log('💾 Data cached successfully');
    } catch (e) {
      console.error('⚠️ Error saving to cache:', e);
    }

      return dataToCache.data;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ API Error (Attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
      // If this was the last attempt, fall through to error handling
      if (attempt === MAX_RETRIES) {
        break;
      }
      
      // Wait before retrying
      console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
      await wait(RETRY_DELAY);
    }
  }
  
  // All retries failed
  console.error('❌ All API attempts failed');
  
  // Fallback priority:
  // 1. Use stale cache if available
  if (cachedData && cachedData.data) {
    console.log('🔄 Using stale cache as fallback');
    return cachedData.data;
  }
  
  // 2. Use prebuilt fallback data (from your working desktop cache)
  console.log('📦 Using prebuilt fallback data (no cache available)');
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(fallbackHomeData));
    console.log('💾 Prebuilt data cached for next time');
  } catch (e) {
    console.warn('⚠️ Could not cache prebuilt data:', e);
  }
  return fallbackHomeData.data;
}
