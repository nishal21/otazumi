/**
 * Jikan API Service
 * Fetches anime character images from MyAnimeList via Jikan API
 */

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Cache for storing fetched images
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache for individual character details
const characterDetailsCache = new Map();
const CHARACTER_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for character details

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // Increased to 500ms between requests

/**
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 */
// Sleep utility for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Global flag to track if anisearch is blocking requests
let anisearchBlocked = false;
const BLOCK_CHECK_DURATION = 60 * 60 * 1000; // 1 hour
let lastBlockCheck = 0;

/**
 * Get detailed character information with caching
 * @param {number} characterId - MAL character ID
 * @returns {Promise<Object>} Character details
 */
const getCharacterDetails = async (characterId) => {
  const cacheKey = `character_${characterId}`;

  // Check cache first
  if (characterDetailsCache.has(cacheKey)) {
    const cached = characterDetailsCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CHARACTER_CACHE_DURATION) {
      return cached.data;
    }
    characterDetailsCache.delete(cacheKey);
  }

  try {
    const response = await makeJikanRequest(`/characters/${characterId}`);

    // Cache the result
    characterDetailsCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch character details for ID ${characterId}:`, error);
    throw error;
  }
};

/**
 * Make a rate-limited request to Jikan API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} API response data
 */
const makeJikanRequest = async (endpoint) => {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const url = `${JIKAN_BASE_URL}${endpoint}`;
  console.log('Making Jikan request:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Otazumi-CharacterMemory/1.0',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited - wait longer and retry
      console.log('Rate limited, waiting 2 seconds...');
      await sleep(2000);
      return makeJikanRequest(endpoint);
    }
    throw new Error(`Jikan API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get top characters from Jikan API
 * @param {number} limit - Number of characters to fetch
 * @returns {Promise<Array>} Array of character data
 */
const getTopCharacters = async (limit = 50) => {
  const cacheKey = `top_characters_${limit}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  try {
    const characters = [];
    let page = 1;
    const perPage = Math.min(limit, 25); // Jikan returns max 25 per page

    while (characters.length < limit) {
      const response = await makeJikanRequest(`/top/characters?page=${page}&limit=${perPage}`);

      if (!response.data || response.data.length === 0) {
        break;
      }

      characters.push(...response.data);
      page++;

      // Safety check to prevent infinite loops
      if (page > 10) break;

      // Small delay between pages
      if (characters.length < limit) {
        await sleep(200);
      }
    }

    // Cache the results
    imageCache.set(cacheKey, {
      data: characters.slice(0, limit),
      timestamp: Date.now()
    });

    return characters.slice(0, limit);

  } catch (error) {
    console.error('Error fetching top characters:', error);
    return [];
  }
};

/**
 * Get random characters with images
 * @param {number} count - Number of characters to fetch
 * @returns {Promise<Array>} Array of character objects with image data
 */
export const getRandomCharacterImages = async (count = 10) => {
  const cacheKey = `random_characters_${count}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  try {
    // Get top characters first to get popular character IDs
    const topCharacters = await getTopCharacters(count * 1.5); // Get 1.5x needed to account for failures

    if (topCharacters.length === 0) {
      throw new Error('No characters received from Jikan API');
    }

    // Shuffle and select random characters (limit to prevent too many API calls)
    const shuffled = topCharacters.sort(() => Math.random() - 0.5);
    const maxCharacters = Math.min(count, 8); // Limit to 8 characters max to avoid rate limits
    const selectedCharacters = shuffled.slice(0, maxCharacters);

    // Fetch detailed information for each character to get anime data
    const results = [];
    for (const character of selectedCharacters) {
      try {
        // Fetch detailed character information
        const characterDetails = await getCharacterDetails(character.mal_id);

        // Get the best available image
        const imageUrl = characterDetails.images?.jpg?.image_url ||
                        characterDetails.images?.webp?.image_url ||
                        character.images?.jpg?.image_url ||
                        character.images?.webp?.image_url;

        if (!imageUrl) {
          console.warn('Character has no image:', characterDetails.name);
          continue;
        }

        // Get anime information
        let animeName = 'Unknown Anime';
        if (characterDetails.anime && characterDetails.anime.length > 0) {
          // Sort by popularity/favorites and pick the most popular anime
          const sortedAnime = characterDetails.anime.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
          animeName = sortedAnime[0].title || sortedAnime[0].name || 'Unknown Anime';
        }

        results.push({
          url: imageUrl,
          character: characterDetails.name || character.name || 'Unknown Character',
          anime: animeName,
          type: 'character',
          mal_id: character.mal_id,
          favorites: characterDetails.favorites || character.favorites || 0
        });

        // Add a small delay between character detail requests to avoid rate limits
        if (results.length < selectedCharacters.length) {
          await sleep(300);
        }

      } catch (detailError) {
        console.log(`Could not fetch details for character ${character.mal_id}:`, detailError.message);
        // Fallback to basic info if detailed fetch fails
        const imageUrl = character.images?.jpg?.image_url || character.images?.webp?.image_url;
        if (imageUrl) {
          results.push({
            url: imageUrl,
            character: character.name || 'Unknown Character',
            anime: 'Unknown Anime',
            type: 'character',
            mal_id: character.mal_id,
            favorites: character.favorites || 0
          });
        }
      }
    }

    // If we don't have enough characters, fill with fallbacks
    if (results.length < count) {
      console.log(`Only got ${results.length} characters from Jikan, filling with fallbacks`);
      const fallbackResults = getFallbackCharacterImages(count - results.length);
      results.push(...fallbackResults);
    }

    // Cache the results
    imageCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    console.log(`Successfully fetched ${results.length} character images from Jikan API`);
    return results;

  } catch (error) {
    console.error('Error fetching random character images:', error);
    // Complete fallback
    return getFallbackCharacterImages(count);
  }
};

/**
 * Get character images by specific anime
 * @param {string} animeName - Name of the anime
 * @param {number} limit - Number of characters to fetch
 * @returns {Promise<Array>} Array of character objects
 */
export const getAnimeCharacterImages = async (animeName, limit = 10) => {
  const cacheKey = `anime_characters_${animeName.toLowerCase()}_${limit}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  try {
    // First, search for the anime
    const searchResponse = await makeJikanRequest(`/anime?q=${encodeURIComponent(animeName)}&limit=5`);

    if (!searchResponse.data || searchResponse.data.length === 0) {
      console.log('Anime not found:', animeName);
      return [];
    }

    const anime = searchResponse.data[0];
    console.log('Found anime:', anime.title);

    // Get characters for this anime
    const charactersResponse = await makeJikanRequest(`/anime/${anime.mal_id}/characters`);

    if (!charactersResponse.data || charactersResponse.data.length === 0) {
      console.log('No characters found for anime:', anime.title);
      return [];
    }

    // Convert to our format
    const results = charactersResponse.data
      .filter(char => char.character?.images?.jpg?.image_url) // Only characters with images
      .slice(0, limit)
      .map(char => ({
        url: char.character.images.jpg.image_url,
        character: char.character.name,
        anime: anime.title,
        type: 'character',
        mal_id: char.character.mal_id,
        role: char.role
      }));

    // Cache the results
    imageCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    console.log(`Fetched ${results.length} characters for ${anime.title}`);
    return results;

  } catch (error) {
    console.error('Error fetching anime characters:', error);
    return [];
  }
};

/**
 * Get fallback character images when Jikan API is unavailable
 * @param {number} count - Number of images to generate
 * @returns {Array} Array of fallback character image objects
 */
const getFallbackCharacterImages = (count) => {
  const characters = [
    { name: 'Eren Yeager', anime: 'Attack on Titan' },
    { name: 'Light Yagami', anime: 'Death Note' },
    { name: 'Naruto Uzumaki', anime: 'Naruto' },
    { name: 'Monkey D. Luffy', anime: 'One Piece' },
    { name: 'Izuku Midoriya', anime: 'My Hero Academia' },
    { name: 'Tanjiro Kamado', anime: 'Demon Slayer' },
    { name: 'Ken Kaneki', anime: 'Tokyo Ghoul' },
    { name: 'Edward Elric', anime: 'Fullmetal Alchemist' },
    { name: 'Goku', anime: 'Dragon Ball' },
    { name: 'Kirito', anime: 'Sword Art Online' },
    { name: 'Natsu Dragneel', anime: 'Fairy Tail' },
    { name: 'Ichigo Kurosaki', anime: 'Bleach' },
    { name: 'Gon Freecss', anime: 'Hunter x Hunter' },
    { name: 'Saitama', anime: 'One Punch Man' },
    { name: 'Rintarou Okabe', anime: 'Steins;Gate' }
  ];

  const results = [];
  const usedCharacters = new Set();

  for (let i = 0; i < count; i++) {
    let character;
    let attempts = 0;
    do {
      character = characters[Math.floor(Math.random() * characters.length)];
      attempts++;
    } while (usedCharacters.has(`${character.name}_${character.anime}`) && attempts < characters.length);

    if (attempts >= characters.length) break; // No more unique characters

    usedCharacters.add(`${character.name}_${character.anime}`);

    // Use Lorem Picsum with anime-themed seeds for better variety
    const imageId = Math.floor(Math.random() * 10000) + Date.now() + i;
    const animeSeed = character.anime.toLowerCase().replace(/\s+/g, '');
    const characterSeed = character.name.toLowerCase().replace(/\s+/g, '');
    results.push({
      url: `https://picsum.photos/seed/${animeSeed}_${characterSeed}_${imageId}/300/400`,
      character: character.name,
      anime: character.anime,
      type: 'character'
    });
  }

  console.log(`Generated ${results.length} fallback character images`);
  return results;
};

/**
 * Get seasonal anime from Jikan API
 * @param {number} year - Year (e.g., 2025)
 * @param {string} season - Season (winter, spring, summer, fall)
 * @returns {Promise<Array>} Array of seasonal anime data
 */
export const getSeasonalAnime = async (year, season) => {
  const cacheKey = `seasonal_${year}_${season}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  try {
    const response = await makeJikanRequest(`/seasons/${year}/${season}`);

    if (!response.data || response.data.length === 0) {
      console.log(`No seasonal anime found for ${season} ${year}`);
      return [];
    }

    // Convert Jikan format to our app format
    const seasonalAnime = response.data.map(anime => ({
      id: `mal-${anime.mal_id}`,
      data_id: anime.mal_id.toString(),
      title: anime.title,
      japanese_title: anime.title_japanese || anime.title,
      poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      description: anime.synopsis || 'No description available.',
      tvInfo: {
        showType: anime.type || 'TV',
        duration: anime.duration || 'Unknown',
        quality: 'HD',
        episodeInfo: {
          sub: anime.episodes || 0,
          dub: 0 // Jikan doesn't provide dub info
        }
      },
      genres: anime.genres?.map(g => g.name) || [],
      status: anime.status || 'Unknown',
      rating: anime.score ? anime.score.toString() : null,
      releaseDate: anime.aired?.from ? new Date(anime.aired.from).toISOString().split('T')[0] : null,
      totalEpisodes: anime.episodes || 0,
      popularity: anime.popularity || 0,
      favorites: anime.favorites || 0,
      year: anime.year || year,
      season: season
    }));

    // Sort by popularity (most popular first)
    seasonalAnime.sort((a, b) => (a.popularity || 999999) - (b.popularity || 999999));

    // Cache the results
    imageCache.set(cacheKey, {
      data: seasonalAnime,
      timestamp: Date.now()
    });

    console.log(`Fetched ${seasonalAnime.length} anime for ${season} ${year} from Jikan API`);
    return seasonalAnime;

  } catch (error) {
    console.error(`Error fetching seasonal anime for ${season} ${year}:`, error);
    return [];
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    imageCacheSize: imageCache.size,
    characterDetailsCacheSize: characterDetailsCache.size,
    imageCacheKeys: Array.from(imageCache.keys()),
    characterDetailsCacheKeys: Array.from(characterDetailsCache.keys()),
    cacheDuration: CACHE_DURATION,
    characterCacheDuration: CHARACTER_CACHE_DURATION
  };
};