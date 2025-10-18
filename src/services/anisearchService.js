/**
 * Anisearch Image Service
 * Fetches anime screenshots and character images from anisearch.com
 */

const ANISEARCH_BASE_URL = 'https://www.anisearch.com';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL || '/cors-proxy?url=';

// Utility function for making requests with proxy fallback
const fetchWithProxy = async (url, options = {}) => {
  // First try direct fetch
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...options.headers
      }
    });

    // If we get a 530 error (site frozen), don't try proxy as it will also fail
    if (response.status === 530) {
      throw new Error('Site is blocking requests (530)');
    }

    if (response.ok) return response;
    // Don't throw for other errors, try proxy instead
  } catch (error) {
    console.log(`Direct fetch failed for ${url}:`, error.message);
  }

  // Fallback to proxy
  try {
    const proxyUrl = `${PROXY_BASE}${encodeURIComponent(url)}`;
    console.log('Trying proxy:', proxyUrl);
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...options.headers
      }
    });

    // If proxy also returns 530, the site is definitely blocking
    if (response.status === 530) {
      throw new Error('Site is blocking requests via proxy (530)');
    }

    if (response.ok) return response;
    throw new Error(`Proxy fetch failed: ${response.status}`);
  } catch (error) {
    console.error(`Proxy fetch failed for ${url}:`, error.message);
    throw error;
  }
};

// Sleep utility for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for storing fetched images
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Global flag to track if anisearch is blocking requests
let anisearchBlocked = false;
const BLOCK_CHECK_DURATION = 60 * 60 * 1000; // 1 hour
let lastBlockCheck = 0;

/**
 * Search for anime by name and get screenshots
 * @param {string} animeName - Name of the anime to search for
 * @returns {Promise<Array>} Array of screenshot URLs
 */
export const getAnimeScreenshots = async (animeName) => {
  const cacheKey = `anime_screenshots_${animeName.toLowerCase()}`;

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
    const searchUrl = `${ANISEARCH_BASE_URL}/anime/index?text=${encodeURIComponent(animeName)}&smode=1`;
    const searchResponse = await fetchWithProxy(searchUrl);

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
    }

    const searchHtml = await searchResponse.text();

    // Parse the search results to find the anime URL
    const animeLinkMatch = searchHtml.match(/href="([^"]*anime\/[^"]*)"/);
    if (!animeLinkMatch) {
      throw new Error('Anime not found');
    }

    const animeLink = animeLinkMatch[1];
    const animeUrl = animeLink.startsWith('http') ? animeLink : `${ANISEARCH_BASE_URL}${animeLink}`;

    // Wait a bit to avoid rate limiting
    await sleep(500);

    // Fetch the anime page
    const animeResponse = await fetchWithProxy(animeUrl);
    if (!animeResponse.ok) {
      throw new Error(`Anime page fetch failed: ${animeResponse.status}`);
    }

    const animeHtml = await animeResponse.text();

    // Extract screenshot URLs from the page
    const screenshotUrls = [];
    const screenshotRegex = /href="([^"]*screenshots[^"]*)"/g;
    let match;

    while ((match = screenshotRegex.exec(animeHtml)) !== null) {
      const screenshotUrl = `${ANISEARCH_BASE_URL}${match[1]}`;
      screenshotUrls.push(screenshotUrl);
    }

    // If no screenshots found on main page, try the screenshots page directly
    if (screenshotUrls.length === 0) {
      const screenshotsUrl = `${animeUrl}/screenshots`;
      const screenshotsResponse = await fetchWithProxy(screenshotsUrl);

      if (screenshotsResponse.ok) {
        const screenshotsHtml = await screenshotsResponse.text();

        // Extract image URLs from screenshots page
        const imageRegex = /src="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/gi;
        while ((match = imageRegex.exec(screenshotsHtml)) !== null) {
          const imageUrl = match[1];
          if (imageUrl.includes('anisearch')) {
            screenshotUrls.push(imageUrl.startsWith('http') ? imageUrl : `${ANISEARCH_BASE_URL}${imageUrl}`);
          }
        }
      }
    }

    // Cache the results
    imageCache.set(cacheKey, {
      data: screenshotUrls,
      timestamp: Date.now()
    });

    return screenshotUrls;

  } catch (error) {
    console.error('Error fetching anime screenshots:', error);
    return [];
  }
};

/**
 * Search for character images by character name and anime
 * @param {string} characterName - Name of the character
 * @param {string} animeName - Name of the anime (optional)
 * @returns {Promise<Array>} Array of character image URLs
 */
export const getCharacterImages = async (characterName, animeName = '') => {
  const cacheKey = `character_images_${characterName.toLowerCase()}_${animeName.toLowerCase()}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  // If anisearch is blocked, return empty array immediately
  if (anisearchBlocked) {
    console.log('Anisearch is blocked, skipping character image fetch');
    return [];
  }

  try {
    // Search for the character
    const searchQuery = animeName ? `${characterName} ${animeName}` : characterName;
    const searchUrl = `${ANISEARCH_BASE_URL}/character/index?text=${encodeURIComponent(searchQuery)}&smode=1`;

    console.log('Searching for character:', searchQuery);
    console.log('Search URL:', searchUrl);

    const searchResponse = await fetchWithProxy(searchUrl);

    if (!searchResponse.ok) {
      if (searchResponse.status === 530) {
        anisearchBlocked = true;
        lastBlockCheck = Date.now();
        throw new Error('Character search failed: Site is blocking requests (530)');
      }
      throw new Error(`Character search failed: ${searchResponse.status}`);
    }

    const searchHtml = await searchResponse.text();

    // Parse the search results to find character URLs
    const characterUrls = [];
    const characterLinkRegex = /href="([^"]*character\/[^"]*)"/g;
    let match;

    while ((match = characterLinkRegex.exec(searchHtml)) !== null) {
      const link = match[1];
      // Ensure proper URL construction
      const fullUrl = link.startsWith('http') ? link : `${ANISEARCH_BASE_URL}${link}`;
      characterUrls.push(fullUrl);
    }

    if (characterUrls.length === 0) {
      console.log('No character URLs found, returning empty array');
      return [];
    }

    // Fetch the first character page
    const characterUrl = characterUrls[0];
    console.log('Fetching character page:', characterUrl);

    const characterResponse = await fetchWithProxy(characterUrl);

    if (!characterResponse.ok) {
      if (characterResponse.status === 530) {
        anisearchBlocked = true;
        lastBlockCheck = Date.now();
        throw new Error(`Character page fetch failed: Site is blocking requests (530)`);
      }
      throw new Error(`Character page fetch failed: ${characterResponse.status}`);
    }

    const characterHtml = await characterResponse.text();

    // Extract character image URLs
    const imageUrls = [];
    const imageRegex = /src="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/gi;

    while ((match = imageRegex.exec(characterHtml)) !== null) {
      const imageUrl = match[1];
      if (imageUrl.includes('anisearch') && !imageUrl.includes('logo') && !imageUrl.includes('banner')) {
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${ANISEARCH_BASE_URL}${imageUrl}`;
        imageUrls.push(fullUrl);
      }
    }

    console.log(`Found ${imageUrls.length} character images`);

    // Cache the results
    imageCache.set(cacheKey, {
      data: imageUrls,
      timestamp: Date.now()
    });

    return imageUrls;

  } catch (error) {
    console.error('Error fetching character images:', error);
    // If it's a 530 error, mark anisearch as blocked
    if (error.message.includes('530') || error.message.includes('blocking')) {
      anisearchBlocked = true;
      lastBlockCheck = Date.now();
    }
    // Return empty array instead of throwing to allow fallback
    return [];
  }
};

/**
 * Get random anime screenshots for games
 * @param {number} count - Number of screenshots to fetch
 * @returns {Promise<Array>} Array of screenshot objects with anime info
 */
export const getRandomAnimeScreenshots = async (count = 10) => {
  const cacheKey = `random_screenshots_${count}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    imageCache.delete(cacheKey);
  }

  try {
    // Get popular anime list first
    const popularAnime = [
      'Attack on Titan',
      'Death Note',
      'Naruto',
      'One Piece',
      'My Hero Academia',
      'Demon Slayer',
      'Tokyo Ghoul',
      'Fullmetal Alchemist',
      'Dragon Ball',
      'Sword Art Online',
      'Fairy Tail',
      'Bleach',
      'Hunter x Hunter',
      'One Punch Man',
      'Steins;Gate'
    ];

    const results = [];
    const usedAnime = new Set();

    for (let i = 0; i < count && results.length < count; i++) {
      const animeName = popularAnime[Math.floor(Math.random() * popularAnime.length)];

      if (usedAnime.has(animeName)) continue;
      usedAnime.add(animeName);

      const screenshots = await getAnimeScreenshots(animeName);
      if (screenshots.length > 0) {
        // Pick a random screenshot
        const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)];
        results.push({
          url: randomScreenshot,
          anime: animeName,
          type: 'screenshot'
        });
      }

      // Small delay between requests
      if (i < count - 1) {
        await sleep(200);
      }
    }

    // Cache the results
    imageCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;

  } catch (error) {
    console.error('Error fetching random screenshots:', error);
    return [];
  }
};

/**
 * Get random character images for games
 * @param {number} count - Number of character images to fetch
 * @returns {Promise<Array>} Array of character image objects
 */
export const getRandomCharacterImages = async (count = 10) => {
  // Don't cache random images - they should be different each time

  // Check if we should reset the block flag
  if (Date.now() - lastBlockCheck > BLOCK_CHECK_DURATION) {
    anisearchBlocked = false;
    lastBlockCheck = Date.now();
  }

  // If anisearch is blocked, use fallback immediately
  if (anisearchBlocked) {
    console.log('Anisearch is blocked, using fallback images');
    return getFallbackCharacterImages(count);
  }

  try {
    // Popular anime characters with known good images
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

    // Try to get images from anisearch first
    for (let i = 0; i < Math.min(count * 2, characters.length) && results.length < count; i++) {
      const character = characters[Math.floor(Math.random() * characters.length)];
      const key = `${character.name}_${character.anime}`;

      if (usedCharacters.has(key)) continue;
      usedCharacters.add(key);

      try {
        console.log(`Trying to fetch images for ${character.name} from ${character.anime}`);

        const images = await getCharacterImages(character.name, character.anime);
        if (images.length > 0) {
          // Pick a random image
          const randomImage = images[Math.floor(Math.random() * images.length)];
          results.push({
            url: randomImage,
            character: character.name,
            anime: character.anime,
            type: 'character'
          });
          console.log(`Successfully got image for ${character.name}`);
          continue; // Successfully got an image, move to next
        }
      } catch (error) {
        if (error.message.includes('530') || error.message.includes('blocking')) {
          console.log('Anisearch is blocking requests, switching to fallback mode');
          anisearchBlocked = true;
          lastBlockCheck = Date.now();
          // Switch to fallback for remaining images
          const fallbackResults = getFallbackCharacterImages(count - results.length);
          results.push(...fallbackResults);
          break;
        } else {
          console.log(`Failed to get image for ${character.name}, trying next character:`, error.message);
        }
      }

      // Small delay between requests
      if (i < Math.min(count * 2, characters.length) - 1) {
        await sleep(200);
      }
    }

    // If we didn't get enough images from anisearch, fill with fallbacks
    if (results.length < count) {
      const fallbackResults = getFallbackCharacterImages(count - results.length);
      results.push(...fallbackResults);
    }

    console.log(`Returning ${results.length} character images`);

    return results;

  } catch (error) {
    console.error('Error fetching random character images:', error);
    // Complete fallback
    return getFallbackCharacterImages(count);
  }
};

/**
 * Get fallback character images when anisearch is unavailable
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

    // Use a more reliable image service - Lorem Picsum with anime-themed seeds
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
 * Clear the image cache
 */
export const clearImageCache = () => {
  imageCache.clear();
};

/**
 * Reset the anisearch block flag (try anisearch again on next request)
 */
export const resetAnisearchBlock = () => {
  anisearchBlocked = false;
  lastBlockCheck = 0;
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys()),
    anisearchBlocked,
    lastBlockCheck: new Date(lastBlockCheck).toISOString()
  };
};