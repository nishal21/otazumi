import axios from "axios";

const CACHE_KEY = "homeInfoCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function getHomeInfo() {
  const api_url = import.meta.env.VITE_API_URL;

  console.log('🔍 getHomeInfo - API URL:', api_url);

  const currentTime = Date.now();
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
    console.log('✅ Using cached data');
    return cachedData.data;
  }
  
  console.log('📡 Fetching fresh data from API...');
  const response = await axios.get(`${api_url}`, {
    timeout: 15000, // 15 second timeout
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

  localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

  return dataToCache.data;
}
