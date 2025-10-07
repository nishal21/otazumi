import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faDownload, faCopy, faHeart, faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import quotesData from '../../../quotes-dataset.json';

const AnimeQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [animeData, setAnimeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [animeImageCache, setAnimeImageCache] = useState(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem('animeImageCache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [characterImageCache, setCharacterImageCache] = useState(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem('characterImageCache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [shareButtonsExpanded, setShareButtonsExpanded] = useState({});
  const quotesPerPage = 12;

  // Save anime image cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('animeImageCache', JSON.stringify(animeImageCache));
    } catch (error) {
      console.warn('Failed to save anime image cache to localStorage:', error);
    }
  }, [animeImageCache]);

  // Save character image cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('characterImageCache', JSON.stringify(characterImageCache));
    } catch (error) {
      console.warn('Failed to save character image cache to localStorage:', error);
    }
  }, [characterImageCache]);

  // Utility: sleep and fetch with exponential backoff to reduce 429s
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  // Simple per-host concurrency limiter + backoff + cors-proxy fallback
  const perHostActive = {};
  const GLOBAL_MAX_PER_HOST = 2; // default concurrent per host

  // Proxy base can be configured via Vite env: VITE_PROXY_URL (preferred) or VITE_CORS_PROXY
  const PROXY_BASE = (typeof import.meta !== 'undefined' && import.meta.env)
    ? (import.meta.env.VITE_PROXY_URL || import.meta.env.VITE_CORS_PROXY || '/cors-proxy?url=')
    : '/cors-proxy?url=';

  // Host-specific tuning: lower concurrency or higher backoff for aggressive APIs
  const hostConfigs = {
    'api.jikan.moe': { maxPerHost: 1, backoffMultiplier: 2.0 },
    'graphql.anilist.co': { maxPerHost: 1, backoffMultiplier: 2.0 },
    'anime.fandom.com': { maxPerHost: 1, backoffMultiplier: 1.8 },
  };

  const getHostFromInput = (input) => {
    try {
      const url = typeof input === 'string' ? input : input.url;
      return new URL(url).host;
    } catch (e) {
      return 'unknown';
    }
  };

  const enqueueForHost = async (host) => {
    const cfg = hostConfigs[host] || {};
    const max = cfg.maxPerHost || GLOBAL_MAX_PER_HOST;
    perHostActive[host] = perHostActive[host] || 0;
    while (perHostActive[host] >= max) {
      // wait with small jitter
      await sleep(180 + Math.floor(Math.random() * 220));
    }
    perHostActive[host] += 1;
  };

  const dequeueForHost = (host) => {
    perHostActive[host] = Math.max(0, (perHostActive[host] || 1) - 1);
  };

  const fetchWithBackoff = async (input, init = {}, maxAttempts = 7, baseDelay = 350) => {
    const host = getHostFromInput(input);
    const cfg = hostConfigs[host] || {};
    const hostMultiplier = cfg.backoffMultiplier || 1.0;

    let attempt = 0;
    let lastErr = null;
    let usedProxy = false;

    while (attempt < maxAttempts) {
      await enqueueForHost(host);
      try {
        const res = await fetch(input, init);
        dequeueForHost(host);

        if (res.ok) return res;

        // Retry on 429 or 5xx
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          lastErr = new Error(`HTTP ${res.status}`);
        } else {
          // Non-retriable status (404 etc.) - return and let caller handle
          return res;
        }
      } catch (err) {
        dequeueForHost(host);
        lastErr = err;

        // If this looks like a CORS/network error, try proxy once
        const isTypeError = err instanceof TypeError || /NetworkError|Failed to fetch/i.test(String(err));
        if (isTypeError && !usedProxy) {
          usedProxy = true;
          try {
            const origUrl = typeof input === 'string' ? input : input.url;
            const proxyUrl = `${PROXY_BASE}${encodeURIComponent(origUrl)}`;
            const proxyInit = { ...init, method: init.method || 'GET' };
            // small delay before proxy retry
            await sleep(400 + Math.floor(Math.random() * 400));
            await enqueueForHost('local-proxy');
            const proxyRes = await fetch(proxyUrl, proxyInit);
            dequeueForHost('local-proxy');
            if (proxyRes.ok) return proxyRes;
            lastErr = new Error(`Proxy HTTP ${proxyRes.status}`);
          } catch (proxyErr) {
            lastErr = proxyErr;
          }
        }
      }

      attempt += 1;
      // Larger backoff for 429 specifically and multiply by host multiplier
      const jitter = Math.floor(Math.random() * 1000);
      const delay = Math.floor((baseDelay * Math.pow(2, attempt - 1) * hostMultiplier) + jitter + (attempt * 150));
      await sleep(delay);
    }
    throw lastErr || new Error('fetchWithBackoff: failed');
  };

  // Fetch and cache anime cover image
  const fetchAnimeImage = async (animeName) => {
    // Check cache first
    if (animeImageCache[animeName]) {
      return animeImageCache[animeName];
    }

    try {
      // Try Jikan API first
  const jikanResponse = await fetchWithBackoff(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
      const jikanData = await jikanResponse.json();

      if (jikanData.data && jikanData.data[0] && jikanData.data[0].images && jikanData.data[0].images.jpg && jikanData.data[0].images.jpg.large_image_url) {
        const imageUrl = jikanData.data[0].images.jpg.large_image_url;
        setAnimeImageCache(prev => ({ ...prev, [animeName]: imageUrl }));
        return imageUrl;
      }

      // Try Kitsu API
  const kitsuResponse = await fetchWithBackoff(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}&page[limit]=1`);
      const kitsuData = await kitsuResponse.json();

      if (kitsuData.data && kitsuData.data[0] && kitsuData.data[0].attributes && kitsuData.data[0].attributes.posterImage && kitsuData.data[0].attributes.posterImage.large) {
        const imageUrl = kitsuData.data[0].attributes.posterImage.large;
        setAnimeImageCache(prev => ({ ...prev, [animeName]: imageUrl }));
        return imageUrl;
      }

      // Try AniList API
      const anilistQuery = `
        query ($search: String) {
          Media(search: $search, type: ANIME) {
            coverImage {
              large
            }
          }
        }
      `;

  const anilistResponse = await fetchWithBackoff('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: anilistQuery,
          variables: { search: animeName }
        })
      });

      const anilistData = await anilistResponse.json();

      if (anilistData.data && anilistData.data.Media && anilistData.data.Media.coverImage && anilistData.data.Media.coverImage.large) {
        const imageUrl = anilistData.data.Media.coverImage.large;
        setAnimeImageCache(prev => ({ ...prev, [animeName]: imageUrl }));
        return imageUrl;
      }

      // Try Fandom API
  const fandomResponse = await fetchWithBackoff(`https://anime.fandom.com/api/v1/Search/List?query=${encodeURIComponent(animeName)}&limit=1`);
      const fandomData = await fandomResponse.json();

      if (fandomData.items && fandomData.items[0] && fandomData.items[0].thumbnail) {
        const imageUrl = fandomData.items[0].thumbnail;
        setAnimeImageCache(prev => ({ ...prev, [animeName]: imageUrl }));
        return imageUrl;
      }

    } catch (error) {
      console.warn(`Failed to fetch image for anime ${animeName}:`, error);
    }

    return null;
  };

  // Fetch and cache character image
  const fetchCharacterImage = async (characterName, animeName) => {
    const cacheKey = `${characterName}_${animeName}`;
    // Check cache first
    if (characterImageCache[cacheKey]) {
      return characterImageCache[cacheKey];
    }

    try {
      // Try Jikan API first
  const jikanResponse = await fetchWithBackoff(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(characterName)}&limit=1`);
      const jikanData = await jikanResponse.json();

      if (jikanData.data && jikanData.data[0] && jikanData.data[0].images && jikanData.data[0].images.jpg && jikanData.data[0].images.jpg.image_url) {
        const imageUrl = jikanData.data[0].images.jpg.image_url;
        setCharacterImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
        return imageUrl;
      }

      // Try Kitsu API
  const kitsuResponse = await fetchWithBackoff(`https://kitsu.io/api/edge/characters?filter[name]=${encodeURIComponent(characterName)}&page[limit]=1`);
      const kitsuData = await kitsuResponse.json();

      if (kitsuData.data && kitsuData.data[0] && kitsuData.data[0].attributes && kitsuData.data[0].attributes.image && kitsuData.data[0].attributes.image.original) {
        const imageUrl = kitsuData.data[0].attributes.image.original;
        setCharacterImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
        return imageUrl;
      }

      // Try AniList API
      const anilistQuery = `
        query ($search: String) {
          Character(search: $search) {
            image {
              large
            }
          }
        }
      `;

  const anilistResponse = await fetchWithBackoff('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: anilistQuery,
          variables: { search: characterName }
        })
      });

      const anilistData = await anilistResponse.json();

      if (anilistData.data && anilistData.data.Character && anilistData.data.Character.image && anilistData.data.Character.image.large) {
        const imageUrl = anilistData.data.Character.image.large;
        setCharacterImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
        return imageUrl;
      }

      // Try Fandom API
  const fandomResponse = await fetchWithBackoff(`https://anime.fandom.com/api/v1/Search/List?query=${encodeURIComponent(characterName + ' ' + animeName)}&limit=1`);
      const fandomData = await fandomResponse.json();

      if (fandomData.items && fandomData.items[0] && fandomData.items[0].thumbnail) {
        const imageUrl = fandomData.items[0].thumbnail;
        setCharacterImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
        return imageUrl;
      }

    } catch (error) {
      console.warn(`Failed to fetch image for character ${characterName}:`, error);
    }

    return null;
  };

  // Fetch anime data from Jikan API for images
  const fetchAnimeData = async (animeName) => {
    try {
      // Clean anime name for API search
      const cleanName = animeName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const response = await fetchWithBackoff(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanName)}&limit=1`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const anime = data.data[0];
        return {
          coverImage: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
          characterImage: anime.images.jpg.small_image_url || anime.images.jpg.image_url,
          title: anime.title,
          description: anime.synopsis,
          status: anime.status,
          totalEpisodes: anime.episodes,
          rating: anime.score
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch data for ${animeName}:`, error);
    }
    return null;
  };  // Add delay between API calls to avoid rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const loadQuotes = async () => {
      setLoading(true);
      const uniqueAnimes = [...new Set(quotesData.map(quote => quote.anime))];
      const animeDataMap = {};

      // First, collect all unique anime-character combinations that need caching
      const allImageRequests = [];
      const uniqueAnimeCharacterPairs = new Set();

      quotesData.forEach(quote => {
        uniqueAnimeCharacterPairs.add(`${quote.anime}|${quote.character}`);
      });

      // Pre-populate caches for the first 20 anime titles to avoid rate limits
      for (let i = 0; i < Math.min(uniqueAnimes.length, 20); i++) {
        const animeName = uniqueAnimes[i];
        const data = await fetchAnimeData(animeName);
        if (data) {
          animeDataMap[animeName] = data;
          // Save successfully fetched images to cache
          if (data.coverImage && !animeImageCache[animeName]) {
            setAnimeImageCache(prev => ({ ...prev, [animeName]: data.coverImage }));
          }
        }
        // Add delay between requests to avoid rate limiting
        if (i < uniqueAnimes.length - 1) {
          await delay(200); // 200ms delay between requests
        }
      }

      // Now pre-fetch and cache remaining anime images that weren't loaded initially
      const remainingAnimes = uniqueAnimes.slice(20); // Skip the first 20 already processed
      if (remainingAnimes.length > 0) {
        const ANIME_CHUNK = 4;
        for (let i = 0; i < remainingAnimes.length; i += ANIME_CHUNK) {
          const chunk = remainingAnimes.slice(i, i + ANIME_CHUNK);
          await Promise.all(chunk.map(async (animeName) => {
            if (!animeImageCache[animeName]) {
              try {
                const imageUrl = await fetchAnimeImage(animeName);
                if (imageUrl) {
                  setAnimeImageCache(prev => ({ ...prev, [animeName]: imageUrl }));
                }
              } catch (err) {
                console.warn(`Prefetch anime failed for ${animeName}:`, err);
              }
            }
          }));
          // Pause between chunks with jitter
          await delay(500 + Math.floor(Math.random() * 600));
        }
      }

      setAnimeData(animeDataMap);

      // Enhance quotes with anime data and pre-populate character image caches
      const enhancedQuotes = quotesData.map((quote, index) => {
        const animeInfo = animeDataMap[quote.anime];
        const cacheKey = `${quote.character}_${quote.anime}`;

        // Pre-populate character image cache if we have anime data
        if (animeInfo?.characterImage && !characterImageCache[cacheKey]) {
          setCharacterImageCache(prev => ({ ...prev, [cacheKey]: animeInfo.characterImage }));
        }

        return {
          ...quote,
          id: index,
          coverImage: animeInfo?.coverImage || `https://source.unsplash.com/400x600/?${encodeURIComponent(quote.anime + ' anime')}`,
          characterImage: animeInfo?.characterImage || `https://source.unsplash.com/200x300/?${encodeURIComponent(quote.character + ' anime character')}`,
          likes: Math.floor(Math.random() * 1000) + 100,
          animeData: animeInfo
        };
      });

      setQuotes(enhancedQuotes);
      setFilteredQuotes(enhancedQuotes);
      setLoading(false);
    };

    loadQuotes();
  }, []);

  // Second useEffect to fetch remaining character images after quotes are loaded
  useEffect(() => {
    if (quotes.length > 0 && !loading) {
      const fetchRemainingImages = async () => {
        const uniquePairs = [];

        // Collect all unique anime-character pairs
        quotes.forEach(quote => {
          uniquePairs.push({ anime: quote.anime, character: quote.character });
        });

        // De-duplicate pairs
        const seen = new Set();
        const pairsToFetch = [];
        for (const p of uniquePairs) {
          const key = `${p.anime}|${p.character}`;
          if (!seen.has(key)) {
            seen.add(key);
            const cacheKey = `${p.character}_${p.anime}`;
            if (!characterImageCache[cacheKey]) {
              pairsToFetch.push(p);
            }
          }
        }

        if (pairsToFetch.length === 0) return;

        console.log(`Will fetch ${pairsToFetch.length} character images in small batches...`);

        // Process in small concurrent batches to avoid bursts (chunk size configurable)
        const CHUNK_SIZE = 3;
        for (let i = 0; i < pairsToFetch.length; i += CHUNK_SIZE) {
          const chunk = pairsToFetch.slice(i, i + CHUNK_SIZE);
          await Promise.all(chunk.map(async (p) => {
            try {
              const imageUrl = await fetchCharacterImage(p.character, p.anime);
              if (imageUrl) {
                const cacheKey = `${p.character}_${p.anime}`;
                setCharacterImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
              }
            } catch (err) {
              // swallow per-item errors and continue; backoff inside fetchCharacterImage will handle retries
              console.warn(`Character fetch failed for ${p.character} from ${p.anime}:`, err);
            }
          }));

          // Wait between batches with jitter to reduce rate-limit chances
          await delay(600 + Math.floor(Math.random() * 600));
        }

        console.log('Character image caching complete');
      };

      // Small delay to ensure component is fully mounted
      setTimeout(fetchRemainingImages, 1200);
    }
  }, [quotes, loading]);

  useEffect(() => {
    let filtered = quotes;

    if (selectedAnime !== 'All') {
      filtered = filtered.filter(quote => quote.anime === selectedAnime);
    }

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.anime.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotes(filtered);
    setCurrentPage(1);
  }, [selectedAnime, searchTerm, quotes]);

  const uniqueAnimes = ['All', ...new Set(quotes.map(quote => quote.anime))];

  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = filteredQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
  const toggleFavorite = (quoteId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(quoteId)) {
        newFavorites.delete(quoteId);
      } else {
        newFavorites.add(quoteId);
      }
      return newFavorites;
    });
  };

  const shareQuote = (quote, platform) => {
    const text = `"${quote.quote}" - ${quote.character} from ${quote.anime}`;
    const url = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n\nShared from Otazumi Anime Quotes`);
        alert('Quote copied to clipboard!');
        break;
    }
  };

  const downloadQuote = async (quote) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Helper function to draw rounded rectangle
      const roundRect = (x, y, width, height, radius) => {
        if (ctx.roundRect) {
          ctx.roundRect(x, y, width, height, radius);
        } else {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        }
      };

      // Draw card background
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 24;
      roundRect(30, 30, 740, 540, 32);
      ctx.fillStyle = 'rgba(30,30,30,0.92)';
      ctx.fill();
      ctx.restore();

      let coverImageAvailable = false;

      // Function to convert image URL to base64 (handles CORS)
      const imageToBase64 = async (url) => {
        try {
          const response = await fetchWithBackoff(url, {}, 4, 200);
          // If fetchWithBackoff returned a Response-like object but with non-ok, attempt to continue
          if (!response || !response.ok) {
            return null;
          }
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to convert image to base64:', error);
          return null;
        }
      };

      // Try to load and draw cover image
      try {
        let coverImageUrl = animeImageCache[quote.anime];

        // If not cached, try to fetch it
        if (!coverImageUrl) {
          coverImageUrl = await fetchAnimeImage(quote.anime);
        }

        if (coverImageUrl) {
          const base64Data = await imageToBase64(coverImageUrl);
          if (base64Data) {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => {
                // Draw cover image with rounded corners
                ctx.save();
                roundRect(60, 80, 180, 260, 18);
                ctx.clip();
                ctx.drawImage(img, 60, 80, 180, 260);
                ctx.restore();
                coverImageAvailable = true;
                resolve();
              };
              img.onerror = () => resolve(); // Continue without image
              img.src = base64Data;
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load cover image:', error);
      }

      // Try to load and draw character image (only if cover image is available)
      if (coverImageAvailable) {
        try {
          const cacheKey = `${quote.character}_${quote.anime}`;
          let charImageUrl = characterImageCache[cacheKey];

          // If not cached, try to fetch it
          if (!charImageUrl) {
            charImageUrl = await fetchCharacterImage(quote.character, quote.anime);
          }

          if (charImageUrl) {
            const base64Data = await imageToBase64(charImageUrl);
            if (base64Data) {
              const charImg = new Image();
              await new Promise((resolve, reject) => {
                charImg.onload = () => {
                  // Draw character image as circle, overlapping cover
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(180, 320, 54, 0, Math.PI * 2);
                  ctx.closePath();
                  ctx.shadowColor = 'rgba(0,0,0,0.25)';
                  ctx.shadowBlur = 12;
                  ctx.clip();
                  ctx.drawImage(charImg, 126, 266, 108, 108);
                  ctx.restore();
                  resolve();
                };
                charImg.onerror = () => resolve(); // Continue without character image
                charImg.src = base64Data;
              });
            }
          }
        } catch (error) {
          console.warn('Failed to load character image:', error);
        }
      }

      // Draw quote text
      ctx.save();
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'top';

      let quoteX, quoteWidth;
      if (coverImageAvailable) {
        quoteX = 270;
        quoteWidth = 470;
        ctx.textAlign = 'left';
      } else {
        quoteX = canvas.width / 2;
        quoteWidth = 600;
        ctx.textAlign = 'center';
      }

      const quoteY = 100;
      const lineHeight = 36;
      const words = quote.quote.split(' ');
      let line = '';
      let y = quoteY;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > quoteWidth && i > 0) {
          ctx.fillText(line, quoteX, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, quoteX, y);
      ctx.restore();

      // Draw character name and anime title
      ctx.save();
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = coverImageAvailable ? 'left' : 'center';
      const bottomX = coverImageAvailable ? 270 : canvas.width / 2;
      ctx.fillText(quote.character, bottomX, 500);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#00d4ff';
      ctx.fillText(`From: ${quote.anime}`, bottomX, 530);
      ctx.restore();

      // Draw watermark
      ctx.save();
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.textAlign = 'right';
      ctx.fillText('Otazumi Anime Quotes', 760, 550);
      ctx.restore();

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image. Please try again.');
          return;
        }

        try {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `quote-${quote.id}.png`;

          // For mobile devices, try different approaches
          if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Mobile: try to open in new tab first, then download
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // Try programmatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Also try to trigger download after a short delay
            setTimeout(() => {
              try {
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `quote-${quote.id}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              } catch (e) {
                console.warn('Mobile download fallback failed:', e);
              }
            }, 100);
          } else {
            // Desktop: standard download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(url), 1000);

          // Show success message
          alert('Quote image downloaded successfully!');

        } catch (error) {
          console.error('Download failed:', error);
          alert('Download failed. Please try again or use a different browser.');
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error generating quote image:', error);
      alert('Failed to generate quote image. Please try again.');
    }
  };

  const shareQuoteAsImage = async (quote) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Helper function to draw rounded rectangle
      const roundRect = (x, y, width, height, radius) => {
        if (ctx.roundRect) {
          ctx.roundRect(x, y, width, height, radius);
        } else {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        }
      };

      // Draw card background
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 24;
      roundRect(30, 30, 740, 540, 32);
      ctx.fillStyle = 'rgba(30,30,30,0.92)';
      ctx.fill();
      ctx.restore();

      // Function to convert image URL to base64 (handles CORS)
      const imageToBase64 = async (url) => {
        try {
          const response = await fetchWithBackoff(url, {}, 4, 200);
          if (!response || !response.ok) return null;
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to convert image to base64:', error);
          return null;
        }
      };

      // Try to load and draw cover image
      let coverImageAvailable = false;
      try {
        let coverImageUrl = animeImageCache[quote.anime];

        // If not cached, try to fetch it
        if (!coverImageUrl) {
          coverImageUrl = await fetchAnimeImage(quote.anime);
        }

        if (coverImageUrl) {
          const base64Data = await imageToBase64(coverImageUrl);
          if (base64Data) {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => {
                // Draw cover image with rounded corners
                ctx.save();
                roundRect(60, 80, 180, 260, 18);
                ctx.clip();
                ctx.drawImage(img, 60, 80, 180, 260);
                ctx.restore();
                coverImageAvailable = true;
                resolve();
              };
              img.onerror = () => resolve(); // Continue without image
              img.src = base64Data;
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load cover image for sharing:', error);
      }

      // Try to load and draw character image
      if (coverImageAvailable) {
        try {
          const cacheKey = `${quote.character}_${quote.anime}`;
          let charImageUrl = characterImageCache[cacheKey];

          // If not cached, try to fetch it
          if (!charImageUrl) {
            charImageUrl = await fetchCharacterImage(quote.character, quote.anime);
          }

          if (charImageUrl) {
            const base64Data = await imageToBase64(charImageUrl);
            if (base64Data) {
              const charImg = new Image();
              await new Promise((resolve, reject) => {
                charImg.onload = () => {
                  // Draw character image as circle, overlapping cover
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(180, 320, 54, 0, Math.PI * 2);
                  ctx.closePath();
                  ctx.shadowColor = 'rgba(0,0,0,0.25)';
                  ctx.shadowBlur = 12;
                  ctx.clip();
                  ctx.drawImage(charImg, 126, 266, 108, 108);
                  ctx.restore();
                  resolve();
                };
                charImg.onerror = () => resolve(); // Continue without character image
                charImg.src = base64Data;
              });
            }
          }
        } catch (error) {
          console.warn('Failed to load character image for sharing:', error);
        }
      }

      // Draw quote text
      ctx.save();
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'top';

      let quoteX, quoteWidth;
      if (coverImageAvailable) {
        quoteX = 270;
        quoteWidth = 470;
        ctx.textAlign = 'left';
      } else {
        quoteX = canvas.width / 2;
        quoteWidth = 600;
        ctx.textAlign = 'center';
      }

      const quoteY = 100;
      const lineHeight = 36;
      const words = quote.quote.split(' ');
      let line = '';
      let y = quoteY;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > quoteWidth && i > 0) {
          ctx.fillText(line, quoteX, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, quoteX, y);
      ctx.restore();

      // Draw character name and anime title
      ctx.save();
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = coverImageAvailable ? 'left' : 'center';
      const bottomX = coverImageAvailable ? 270 : canvas.width / 2;
      ctx.fillText(quote.character, bottomX, 500);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#00d4ff';
      ctx.fillText(`From: ${quote.anime}`, bottomX, 530);
      ctx.restore();

      // Draw watermark
      ctx.save();
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.textAlign = 'right';
      ctx.fillText('Otazumi Anime Quotes', 760, 550);
      ctx.restore();

      // Convert to blob and share
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate image for sharing. Please try again.');
          return;
        }

        const file = new File([blob], `quote-${quote.id}.png`, { type: 'image/png' });

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `"${quote.quote}" - ${quote.character}`,
              text: `Check out this amazing quote from ${quote.anime}!`,
              files: [file]
            });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.warn('Share failed:', error);
              // Fallback to download
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `quote-${quote.id}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
          }
        } else {
          // Fallback: copy image URL to clipboard or download
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Quote image copied to clipboard! You can now paste it anywhere.');
          } catch (clipboardError) {
            console.warn('Clipboard API failed:', clipboardError);
            // Final fallback: download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `quote-${quote.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            alert('Quote image downloaded! (Sharing not supported in this browser)');
          }
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error generating quote image for sharing:', error);
      alert('Failed to generate quote image for sharing. Please try again.');
    }
  };

  const toggleShareButtons = (quoteId) => {
    setShareButtonsExpanded(prev => ({
      ...prev,
      [quoteId]: !prev[quoteId]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-8">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* From Uiverse.io by Galahhad */
          .search-label {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            position: relative;
            border: 1px solid transparent;
            border-radius: 12px;
            overflow: hidden;
            background: #3D3D3D;
            padding: 9px;
            cursor: text;
            width: 100%;
          }

          .search-label:hover {
            border-color: gray;
          }

          .search-label:focus-within {
            background: #464646;
            border-color: gray;
          }

          .search-label .input {
            outline: none;
            width: 100%;
            border: none;
            background: none;
            color: rgb(162, 162, 162);
            font-size: 16px;
          }

          .search-label .input:focus + .slash-icon,
          .search-label .input:valid + .slash-icon {
            display: none;
          }

          .search-label .input:valid ~ .search-icon {
            display: block;
          }

          .search-label .input:valid {
            width: calc(100% - 22px);
            transform: translateX(20px);
          }

          .search-label svg,
          .slash-icon {
            position: absolute;
            color: #7e7e7e;
          }

          .search-icon {
            display: none;
            width: 12px;
            height: auto;
          }

          .slash-icon {
            right: 7px;
            border: 1px solid #393838;
            background: linear-gradient(-225deg, #343434, #6d6d6d);
            border-radius: 3px;
            text-align: center;
            box-shadow: inset 0 -2px 0 0 #3f3f3f, inset 0 0 1px 1px rgb(94, 93, 93), 0 1px 2px 1px rgba(28, 28, 29, 0.4);
            cursor: pointer;
            font-size: 12px;
            width: 15px;
          }

          .slash-icon:active {
            box-shadow: inset 0 1px 0 0 #3f3f3f, inset 0 0 1px 1px rgb(94, 93, 93), 0 1px 2px 0 rgba(28, 28, 29, 0.4);
            text-shadow: 0 1px 0 #7e7e7e;
            color: transparent;
          }

          /* From Uiverse.io by vinodjangid07 */
          .loader {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loaderMiniContainer {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: min(130px, 90vw);
            height: fit-content;
            min-width: 100px;
          }
          .barContainer {
            width: 100%;
            height: fit-content;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 10px;
            background-position: left;
          }
          .bar {
            width: 100%;
            height: 8px;
            background: linear-gradient(
              to right,
              rgb(161, 94, 255),
              rgb(217, 190, 255),
              rgb(161, 94, 255)
            );
            background-size: 200% 100%;
            border-radius: 10px;
            animation: bar ease-in-out 3s infinite alternate-reverse;
          }
          @keyframes bar {
            0% {
              background-position: left;
            }
            100% {
              background-position: right;
            }
          }
          .bar2 {
            width: 50%;
          }
          .svgIcon {
            position: absolute;
            left: max(-25px, -10vw);
            margin-top: 18px;
            z-index: 2;
            width: min(70%, 60px);
            animation: search ease-in-out 3s infinite alternate-reverse;
          }
          @keyframes search {
            0% {
              transform: translateX(0%) rotate(70deg);
            }

            100% {
              transform: translateX(min(100px, 20vw)) rotate(10deg);
            }
          }
          .svgIcon circle,
          line {
            stroke: rgb(162, 55, 255);
          }
          .svgIcon circle {
            fill: rgba(98, 65, 142, 0.238);
          }

          /* Share button styles */
          .buttons {
            position: relative;
            display: grid;
            place-items: center;
            height: fit-content;
            width: fit-content;
            transition: 0.3s;
            border-radius: 50%;
          }

          .buttons.expanded {
            padding: 40px;
          }

          .main-button {
            position: relative;
            display: grid;
            place-items: center;
            padding: 8px;
            border: none;
            background: #3D3D3D;
            border-radius: 50%;
            transition: 0.2s;
            z-index: 100;
          }

          .button {
            position: absolute;
            display: grid;
            place-items: center;
            padding: 8px;
            border: none;
            background: #3D3D3D;
            transition: 0.3s;
            border-radius: 50%;
          }

          .discord-button:hover {
            background: #5865F2;
          }

          .buttons.expanded .discord-button {
            translate: 50px 0px;
          }

          .twitter-button:hover {
            background: #1CA1F1;
          }

          .buttons.expanded .twitter-button {
            translate: 35px -35px;
          }

          .reddit-button:hover {
            background: #FF4500;
          }

          .buttons.expanded .reddit-button {
            translate: 0px -50px;
          }

          .messenger-button:hover {
            background: #0093FF;
          }

          .buttons.expanded .messenger-button {
            translate: -35px -35px;
          }

          .pinterest-button:hover {
            background: #F0002A;
          }

          .buttons.expanded .pinterest-button {
            translate: -50px 0px;
          }

          .instagram-button:hover {
            background: #F914AF;
          }

          .buttons.expanded .instagram-button {
            translate: -35px 35px;
          }

          .snapchat-button:hover {
            background: #FFFC00;
          }

          .buttons.expanded .snapchat-button {
            translate: 0px 50px;
          }

          .whatsapp-button:hover {
            background: #25D366;
          }

          .buttons.expanded .whatsapp-button {
            translate: 35px 35px;
          }
        `
      }} />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Anime Quotes
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover inspiring quotes from your favorite anime characters. Share wisdom, motivation, and memorable lines.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="loader">
              <div className="loaderMiniContainer">
                <div className="barContainer">
                  <span className="bar"></span>
                  <span className="bar bar2"></span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 101 114"
                  className="svgIcon"
                >
                  <circle
                    strokeWidth="7"
                    stroke="black"
                    transform="rotate(36.0692 46.1726 46.1727)"
                    r="29.5497"
                    cy="46.1727"
                    cx="46.1726"
                  ></circle>
                  <line
                    strokeWidth="7"
                    stroke="black"
                    y2="111.784"
                    x2="97.7088"
                    y1="67.7837"
                    x1="61.7089"
                  ></line>
                </svg>
              </div>
            </div>
            <span className="mt-4 text-gray-400">Loading anime data...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center w-full max-w-4xl mx-auto px-4">
              <div className="relative w-full md:w-80">
                <label className="search-label w-full">
                  <input
                    type="text"
                    name="text"
                    className="input"
                    placeholder="Search quotes, characters, or anime..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    required=""
                  />
                  <kbd className="slash-icon">/</kbd>
                  <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 56.966 56.966" style={{enableBackground: 'new 0 0 512 512'}} xmlSpace="preserve">
                    <g>
                      <path d="M55.146 51.887 41.588 37.786A22.926 22.926 0 0 0 46.984 23c0-12.682-10.318-23-23-23s-23 10.318-23 23 10.318 23 23 23c4.761 0 9.298-1.436 13.177-4.162l13.661 14.208c.571.593 1.339.92 2.162.92.779 0 1.518-.297 2.079-.837a3.004 3.004 0 0 0 .083-4.242zM23.984 6c9.374 0 17 7.626 17 17s-7.626 17-17 17-17-7.626-17-17 7.626-17 17-17z" fill="currentColor" data-original="#000000" className=""></path>
                    </g>
                  </svg>
                </label>
              </div>

              <select
                value={selectedAnime}
                onChange={(e) => setSelectedAnime(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-[#3D3D3D] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors hover:border-gray-500"
              >
                {uniqueAnimes.map(anime => (
                  <option key={anime} value={anime} className="bg-[#1a1a1a]">{anime}</option>
                ))}
              </select>
            </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 border border-gray-800"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={quote.coverImage}
                  alt={quote.anime}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    // Cache the successfully loaded image
                    if (!animeImageCache[quote.anime]) {
                      setAnimeImageCache(prev => ({ ...prev, [quote.anime]: quote.coverImage }));
                    }
                  }}
                  onError={async (e) => {
                    // Try to get cached image or fetch new one
                    const cachedImage = await fetchAnimeImage(quote.anime);
                    if (cachedImage) {
                      e.target.src = cachedImage;
                    } else {
                      // Multiple fallback options for mobile compatibility
                      const fallbacks = [
                        `https://source.unsplash.com/400x600/?${encodeURIComponent(quote.anime + ' anime')}`,
                        `https://picsum.photos/400/600?random=${quote.id}`,
                        `https://via.placeholder.com/400x600/1a1a1a/ffffff?text=${encodeURIComponent(quote.anime)}`
                      ];

                      // Try fallbacks one by one
                      for (const fallback of fallbacks) {
                        try {
                          const testImg = new Image();
                          testImg.onload = () => {
                            e.target.src = fallback;
                            // Cache successful fallback
                            setAnimeImageCache(prev => ({ ...prev, [quote.anime]: fallback }));
                          };
                          testImg.src = fallback;
                          break; // Use first working fallback
                        } catch (error) {
                          continue; // Try next fallback
                        }
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg mb-1">{quote.anime}</h3>
                  <p className="text-gray-300 text-sm">{quote.character}</p>
                  {quote.animeData && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-gray-300 text-sm">{quote.animeData.rating || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Image and Content */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={quote.characterImage}
                    alt={quote.character}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 mr-4"
                    onLoad={() => {
                      // Cache the successfully loaded image
                      const cacheKey = `${quote.character}_${quote.anime}`;
                      if (!characterImageCache[cacheKey]) {
                        setCharacterImageCache(prev => ({ ...prev, [cacheKey]: quote.characterImage }));
                      }
                    }}
                    onError={async (e) => {
                      // Try to get cached image or fetch new one
                      const cachedImage = await fetchCharacterImage(quote.character, quote.anime);
                      if (cachedImage) {
                        e.target.src = cachedImage;
                      } else {
                        // Final fallback to picsum
                        e.target.src = `https://picsum.photos/200/300?random=${quote.id + 100}`;
                      }
                    }}
                  />
                  <div>
                    <h4 className="font-semibold text-white">{quote.character}</h4>
                    <p className="text-gray-400 text-sm">{quote.anime}</p>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-300 italic mb-4 leading-relaxed">
                  "{quote.quote}"
                </blockquote>

                {/* Anime Info */}
                {quote.animeData && (
                  <div className="text-sm text-gray-400 mb-4">
                    {quote.animeData.totalEpisodes && <p>Episodes: {quote.animeData.totalEpisodes}</p>}
                    {quote.animeData.status && <p>Status: {quote.animeData.status}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <div className="flex gap-2">
                    <div className={`buttons ${shareButtonsExpanded[quote.id] ? 'expanded' : ''}`}>
                      <button 
                        className="main-button" 
                        title="Share"
                        onClick={() => toggleShareButtons(quote.id)}
                      >
                        <FontAwesomeIcon icon={faShare} className="w-5 h-5" />
                      </button>
                      <button
                        className="discord-button button"
                        onClick={() => {
                          const text = `"${quote.quote}" - ${quote.character} from ${quote.anime}`;
                          navigator.clipboard.writeText(text).then(() => {
                            window.open('https://discord.com/channels/@me', '_blank');
                            alert('Quote copied to clipboard! Paste it in Discord.');
                          }).catch(() => {
                            window.open(`https://discord.com/channels/@me?message=${encodeURIComponent(text)}`, '_blank');
                          });
                        }}
                        title="Share on Discord"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                          <path d="M18.654 6.368a15.87 15.87 0 0 0-3.908-1.213.06.06 0 0 0-.062.03c-.17.3-.357.693-.487 1a14.628 14.628 0 0 0-4.39 0 9.911 9.911 0 0 0-.494-1 .061.061 0 0 0-.063-.03c-1.35.233-2.664.64-3.908 1.213a.05.05 0 0 0-.025.022c-2.49 3.719-3.172 7.346-2.837 10.928a.068.068 0 0 0 .025.045 15.936 15.936 0 0 0 4.794 2.424.06.06 0 0 0 .067-.023c.37-.504.699-1.036.982-1.595a.06.06 0 0 0-.034-.084 10.65 10.65 0 0 1-1.497-.714.06.06 0 0 1-.024-.08.06.06 0 0 1 .018-.022c.1-.075.201-.155.297-.234a.06.06 0 0 1 .061-.008c3.143 1.435 6.545 1.435 9.65 0a.062.062 0 0 1 .033-.005.061.061 0 0 1 .03.013c.096.08.197.159.298.234a.06.06 0 0 1 .016.081.062.062 0 0 1-.021.021c-.479.28-.98.518-1.499.713a.06.06 0 0 0-.032.085c.288.558.618 1.09.98 1.595a.06.06 0 0 0 .067.023 15.885 15.885 0 0 0 4.802-2.424.06.06 0 0 0 .025-.045c.4-4.14-.671-7.738-2.84-10.927a.04.04 0 0 0-.024-.023Zm-9.837 8.769c-.947 0-1.726-.87-1.726-1.935 0-1.066.765-1.935 1.726-1.935.968 0 1.74.876 1.726 1.935 0 1.066-.765 1.935-1.726 1.935Zm6.38 0c-.946 0-1.726-.87-1.726-1.935 0-1.066.764-1.935 1.725-1.935.969 0 1.741.876 1.726 1.935 0 1.066-.757 1.935-1.726 1.935Z"></path>
                        </svg>
                      </button>
                      <button
                        className="twitter-button button"
                        onClick={() => shareQuote(quote, 'twitter')}
                        title="Share on Twitter"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                          <path d="M8.432 19.8c7.245 0 11.209-6.005 11.209-11.202 0-.168 0-.338-.007-.506A8.023 8.023 0 0 0 21.6 6.049a7.99 7.99 0 0 1-2.266.622 3.961 3.961 0 0 0 1.736-2.18 7.84 7.84 0 0 1-2.505.951 3.943 3.943 0 0 0-6.715 3.593A11.19 11.19 0 0 1 3.73 4.92a3.947 3.947 0 0 0 1.222 5.259 3.989 3.989 0 0 1-1.784-.49v.054a3.946 3.946 0 0 0 3.159 3.862 3.964 3.964 0 0 1-1.775.069 3.939 3.939 0 0 0 3.68 2.733 7.907 7.907 0 0 1-4.896 1.688 7.585 7.585 0 0 1-.936-.054A11.213 11.213 0 0 0 8.432 19.8Z"></path>
                        </svg>
                      </button>
                      <button
                        className="reddit-button button"
                        onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(`"${quote.quote}" - ${quote.character} from ${quote.anime}`)}`, '_blank')}
                        title="Share on Reddit"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.708 12a1.039 1.039 0 0 0-1.037 1.037c0 .574.465 1.05 1.037 1.04a1.04 1.04 0 0 0 0-2.077Zm2.304 4.559c.394 0 1.754-.048 2.47-.764a.29.29 0 0 0 0-.383.266.266 0 0 0-.382 0c-.442.454-1.408.61-2.088.61-.681 0-1.635-.156-2.089-.61a.266.266 0 0 0-.382 0 .266.266 0 0 0 0 .383c.705.704 2.065.763 2.471.763Zm1.24-3.509a1.04 1.04 0 0 0 1.039 1.037c.572 0 1.037-.476 1.037-1.037a1.039 1.039 0 0 0-2.075 0Z"></path>
                          <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-4.785-1.456c-.394 0-.753.155-1.015.406-1.001-.716-2.375-1.181-3.901-1.241l.667-3.127 2.173.466a1.038 1.038 0 1 0 1.037-1.087 1.037 1.037 0 0 0-.93.585l-2.422-.512a.254.254 0 0 0-.264.106.232.232 0 0 0-.035.096l-.74 3.485c-1.55.048-2.947.513-3.963 1.24a1.466 1.466 0 0 0-1.927-.082 1.454 1.454 0 0 0 .318 2.457 2.542 2.542 0 0 0-.037.441c0 2.244 2.614 4.07 5.836 4.07 3.222 0 5.835-1.813 5.835-4.07a2.73 2.73 0 0 0-.036-.44c.502-.227.86-.74.86-1.337 0-.813-.656-1.456-1.456-1.456Z"></path>
                        </svg>
                      </button>
                      <button
                        className="messenger-button button"
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`"${quote.quote}" - ${quote.character} from ${quote.anime}`)}`, '_blank')}
                        title="Share on Facebook"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 11.7C2 6.126 6.366 2 12 2s10 4.126 10 9.7c0 5.574-4.366 9.7-10 9.7-1.012 0-1.982-.134-2.895-.384a.799.799 0 0 0-.534.038l-1.985.877a.8.8 0 0 1-1.122-.707l-.055-1.779a.799.799 0 0 0-.269-.57C3.195 17.135 2 14.615 2 11.7Zm6.932-1.824-2.937 4.66c-.281.448.268.952.689.633l3.156-2.395a.6.6 0 0 1 .723-.003l2.336 1.753a1.501 1.501 0 0 0 2.169-.4l2.937-4.66c.283-.448-.267-.952-.689-.633l-3.156 2.395a.6.6 0 0 1-.723.003l-2.336-1.754a1.5 1.5 0 0 0-2.169.4v.001Z"></path>
                        </svg>
                      </button>
                      <button
                        className="pinterest-button button"
                        onClick={() => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(`"${quote.quote}" - ${quote.character} from ${quote.anime}`)}`, '_blank')}
                        title="Share on Pinterest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                          <path d="M12.48 2.4a9.6 9.6 0 0 0-3.498 18.543c-.084-.76-.16-1.927.033-2.757.175-.75 1.125-4.772 1.125-4.772s-.287-.575-.287-1.424c0-1.336.774-2.332 1.738-2.332.818 0 1.214.614 1.214 1.352 0 .824-.524 2.055-.795 3.196-.226.955.48 1.735 1.422 1.735 1.706 0 3.018-1.8 3.018-4.397 0-2.298-1.653-3.904-4.01-3.904-2.732 0-4.335 2.048-4.335 4.165 0 .825.318 1.71.714 2.191a.288.288 0 0 1 .067.276c-.073.302-.235.955-.266 1.088-.042.176-.14.213-.322.129-1.2-.558-1.949-2.311-1.949-3.72 0-3.028 2.201-5.808 6.344-5.808 3.33 0 5.918 2.372 5.918 5.544 0 3.308-2.087 5.971-4.981 5.971-.974 0-1.888-.505-2.201-1.103l-.598 2.283c-.217.834-.803 1.879-1.194 2.516A9.6 9.6 0 1 0 12.48 2.4Z"></path>
                        </svg>
                      </button>
                      <button
                        className="instagram-button button"
                        onClick={() => {
                          const text = `"${quote.quote}" - ${quote.character} from ${quote.anime}`;
                          navigator.clipboard.writeText(text).then(() => {
                            window.open('https://www.instagram.com/', '_blank');
                            alert('Quote copied to clipboard! You can paste it in Instagram.');
                          }).catch(() => {
                            window.open('https://www.instagram.com/', '_blank');
                          });
                        }}
                        title="Share on Instagram"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2c-2.714 0-3.055.013-4.121.06-1.066.05-1.793.217-2.429.465a4.896 4.896 0 0 0-1.771 1.154A4.909 4.909 0 0 0 2.525 5.45c-.248.635-.416 1.362-.465 2.425C2.013 8.944 2 9.284 2 12.001c0 2.715.013 3.055.06 4.121.05 1.066.217 1.792.465 2.428a4.91 4.91 0 0 0 1.154 1.771 4.88 4.88 0 0 0 1.77 1.154c.637.247 1.362.416 2.427.465 1.068.047 1.408.06 4.124.06 2.716 0 3.055-.012 4.122-.06 1.064-.05 1.793-.218 2.43-.465a4.893 4.893 0 0 0 1.77-1.154 4.91 4.91 0 0 0 1.153-1.771c.246-.636.415-1.363.465-2.428.047-1.066.06-1.406.06-4.122s-.012-3.056-.06-4.124c-.05-1.064-.219-1.791-.465-2.426a4.907 4.907 0 0 0-1.154-1.771 4.888 4.888 0 0 0-1.771-1.154c-.637-.248-1.365-.416-2.429-.465-1.067-.047-1.406-.06-4.123-.06H12Zm-.896 1.803H12c2.67 0 2.987.008 4.04.057.975.044 1.505.208 1.858.344.466.181.8.399 1.15.748.35.35.566.683.747 1.15.138.352.3.882.344 1.857.049 1.053.059 1.37.059 4.039 0 2.668-.01 2.986-.059 4.04-.044.974-.207 1.503-.344 1.856a3.09 3.09 0 0 1-.748 1.149 3.09 3.09 0 0 1-1.15.747c-.35.137-.88.3-1.857.345-1.053.047-1.37.059-4.04.059s-2.987-.011-4.041-.059c-.975-.045-1.504-.208-1.856-.345a3.097 3.097 0 0 1-1.15-.747 3.1 3.1 0 0 1-.75-1.15c-.136-.352-.3-.882-.344-1.857-.047-1.054-.057-1.37-.057-4.041 0-2.67.01-2.985.057-4.039.045-.975.208-1.505.345-1.857.181-.466.399-.8.749-1.15a3.09 3.09 0 0 1 1.15-.748c.352-.137.881-.3 1.856-.345.923-.042 1.28-.055 3.144-.056v.003Zm6.235 1.66a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 6.865a5.136 5.136 0 1 0-.16 10.272A5.136 5.136 0 0 0 12 6.865Zm0 1.801a3.334 3.334 0 1 1 0 6.668 3.334 3.334 0 0 1 0-6.668Z"></path>
                        </svg>
                      </button>
                      <button
                        className="snapchat-button button"
                        onClick={() => {
                          const text = `"${quote.quote}" - ${quote.character} from ${quote.anime}`;
                          navigator.clipboard.writeText(text).then(() => {
                            window.open('https://www.snapchat.com/', '_blank');
                            alert('Quote copied to clipboard! You can paste it in Snapchat.');
                          }).catch(() => {
                            window.open('https://www.snapchat.com/', '_blank');
                          });
                        }}
                        title="Share on Snapchat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                          <path d="M21.929 16.407c-.139-.378-.404-.58-.705-.748a1.765 1.765 0 0 0-.154-.08l-.273-.139c-.94-.499-1.674-1.127-2.183-1.872a4.234 4.234 0 0 1-.375-.664c-.043-.125-.04-.195-.01-.259a.424.424 0 0 1 .121-.125l.44-.289a14.1 14.1 0 0 0 .464-.306c.386-.27.656-.558.825-.878a1.745 1.745 0 0 0 .086-1.45c-.256-.672-.891-1.09-1.661-1.09-.206 0-.41.027-.609.082.008-.46-.002-.947-.043-1.424-.146-1.68-.734-2.56-1.347-3.263a5.367 5.367 0 0 0-1.368-1.1C14.204 2.27 13.15 2 11.998 2c-1.15 0-2.2.27-3.131.801-.515.29-.978.663-1.371 1.104-.613.703-1.2 1.584-1.347 3.263-.041.477-.05.965-.045 1.422a2.288 2.288 0 0 0-.608-.081c-.77 0-1.405.418-1.66 1.091a1.747 1.747 0 0 0 .083 1.451c.17.32.44.608.825.877.103.072.263.174.464.307l.424.276c.054.036.1.083.136.138.033.066.034.137-.015.271a4.204 4.204 0 0 1-.369.65c-.497.729-1.21 1.346-2.12 1.84-.481.255-.982.425-1.193 1-.16.435-.055.929.35 1.344.148.156.32.287.51.387a5.54 5.54 0 0 0 1.25.5c.09.023.176.061.253.113.148.13.128.325.324.61.099.147.225.275.37.375.413.286.876.303 1.369.322.444.018.947.038 1.521.225.238.08.486.233.773.41.687.423 1.63 1.003 3.207 1.003s2.525-.583 3.22-1.008c.284-.175.53-.325.761-.401.575-.19 1.079-.21 1.523-.226.491-.019.955-.038 1.369-.323.172-.12.315-.277.42-.46.142-.24.137-.409.27-.525a.783.783 0 0 1 .238-.108 5.552 5.552 0 0 0 1.268-.506c.2-.108.382-.25.536-.42l.005-.006c.38-.406.475-.886.32-1.309Zm-1.401.753c-.855.473-1.424.421-1.866.706-.375.242-.153.763-.425.95-.337.233-1.327-.015-2.607.408-1.056.349-1.73 1.352-3.629 1.352-1.898 0-2.556-1.001-3.63-1.355-1.277-.422-2.27-.175-2.604-.406-.273-.188-.052-.71-.427-.951-.442-.285-1.011-.234-1.865-.704-.545-.3-.236-.488-.055-.575 3.098-1.499 3.592-3.813 3.613-3.985.027-.207.056-.371-.173-.582-.221-.206-1.202-.813-1.475-1.003-.45-.315-.65-.629-.502-1.015.102-.268.351-.369.612-.369.083 0 .166.01.247.028.495.107.975.356 1.252.422a.477.477 0 0 0 .103.014c.147 0 .2-.075.19-.244-.033-.541-.11-1.596-.024-2.582.117-1.355.555-2.028 1.074-2.622.25-.286 1.42-1.525 3.662-1.525 2.24 0 3.415 1.234 3.664 1.52.52.593.957 1.265 1.073 2.622.085.985.012 2.04-.023 2.581-.013.178.042.244.19.244a.442.442 0 0 0 .102-.013c.278-.067.759-.316 1.253-.422a1.14 1.14 0 0 1 .246-.029c.262 0 .511.102.612.369.147.386-.05.7-.5 1.015-.273.19-1.255.797-1.476 1.002-.23.212-.2.375-.174.583.023.175.517 2.489 3.613 3.986.184.091.492.278-.051.58Z"></path>
                        </svg>
                      </button>
                      <button
                        className="whatsapp-button button"
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`"${quote.quote}" - ${quote.character} from ${quote.anime}`)}`, '_blank')}
                        title="Share on WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
                          <path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.377a9.916 9.916 0 0 0 4.737 1.206h.005c5.46 0 9.908-4.448 9.913-9.913A9.872 9.872 0 0 0 19 4.908h.001ZM11.992 20.15A8.216 8.216 0 0 1 7.797 19l-.3-.18-3.117.818.833-3.041-.196-.314a8.2 8.2 0 0 1-1.258-4.381c0-4.533 3.696-8.23 8.239-8.23a8.2 8.2 0 0 1 5.825 2.413 8.196 8.196 0 0 1 2.41 5.825c-.006 4.55-3.702 8.24-8.24 8.24Zm4.52-6.167c-.247-.124-1.463-.723-1.692-.808-.228-.08-.394-.123-.556.124-.166.246-.641.808-.784.969-.143.166-.29.185-.537.062-.247-.125-1.045-.385-1.99-1.23-.738-.657-1.232-1.47-1.38-1.716-.142-.247-.013-.38.11-.504.11-.11.247-.29.37-.432.126-.143.167-.248.248-.413.082-.167.043-.31-.018-.433-.063-.124-.557-1.345-.765-1.838-.2-.486-.404-.419-.557-.425-.142-.009-.309-.009-.475-.009a.911.911 0 0 0-.661.31c-.228.247-.864.845-.864 2.067 0 1.22.888 2.395 1.013 2.56.122.167 1.742 2.666 4.229 3.74.587.257 1.05.408 1.41.523.595.19 1.13.162 1.558.1.475-.072 1.464-.6 1.673-1.178.205-.58.205-1.075.142-1.18-.061-.104-.227-.165-.475-.29Z"></path>
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => shareQuote(quote, 'copy')}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy quote text"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                    <button
                      onClick={() => downloadQuote(quote)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      title="Download as image"
                    >
                      <FontAwesomeIcon icon={faDownload} size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
              title="First Page"
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
            >
              Next
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
              title="Last Page"
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="text-center text-gray-400">
          <p>Showing {currentQuotes.length} of {filteredQuotes.length} quotes from {Object.keys(animeData).length} anime titles</p>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeQuotes;