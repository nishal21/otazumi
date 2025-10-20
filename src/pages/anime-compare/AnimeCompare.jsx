import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExchangeAlt, faStar, faCalendar, faPlay, faUsers, faTrophy, faShare } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AnimeCompare.css';

const AnimeCompare = () => {
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [anime1, setAnime1] = useState(null);
  const [anime2, setAnime2] = useState(null);
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [showResults1, setShowResults1] = useState(false);
  const [showResults2, setShowResults2] = useState(false);
  const [searchTimeout1, setSearchTimeout1] = useState(null);
  const [searchTimeout2, setSearchTimeout2] = useState(null);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [searchCache, setSearchCache] = useState(new Map());
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchCache(prev => {
        const now = Date.now();
        const newCache = new Map();
        for (const [key, value] of prev) {
          // Keep entries for 5 minutes
          if (now - (value.timestamp || 0) < 5 * 60 * 1000) {
            newCache.set(key, value);
          }
        }
        return newCache;
      });
    }, 10 * 60 * 1000); // Clean every 10 minutes

    return () => clearInterval(interval);
  }, []);

  // Debounced search function with rate limiting
  const debouncedSearch = useCallback((query, setResults, setLoading, setShowResults) => {
    if (searchTimeout1) clearTimeout(searchTimeout1);
    if (searchTimeout2) clearTimeout(searchTimeout2);

    const timeout = setTimeout(() => {
      // Check if we're making requests too frequently (at least 2 seconds between searches)
      const now = Date.now();
      if (now - lastSearchTime < 2000) {
        console.log('Rate limiting: waiting before next search...');
        setTimeout(() => {
          searchAnime(query, setResults, setLoading);
          setShowResults(true);
          setLastSearchTime(Date.now());
        }, 2000 - (now - lastSearchTime));
        return;
      }

      searchAnime(query, setResults, setLoading);
      setShowResults(true);
      setLastSearchTime(now);
    }, 1000); // Increased delay to 1 second

    if (setResults === setSearchResults1) {
      setSearchTimeout1(timeout);
    } else {
      setSearchTimeout2(timeout);
    }
  }, [lastSearchTime]);

  const searchAnime = async (query, setResults, setLoading) => {
    if (!query.trim()) return;

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      const cachedResults = searchCache.get(cacheKey);
      // Check if cache is still valid (within 5 minutes)
      if (cachedResults.length > 0 && cachedResults[0].timestamp && Date.now() - cachedResults[0].timestamp < 5 * 60 * 1000) {
        setResults(cachedResults);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      // Try MAL API with retry logic
      const malResults = await searchMALWithRetry(query);
      if (malResults && malResults.length > 0) {
        // Cache the results with timestamp
        const resultsWithTimestamp = malResults.map(result => ({ ...result, timestamp: Date.now() }));
        setSearchCache(prev => new Map(prev).set(cacheKey, resultsWithTimestamp));
        setResults(malResults);
        setLoading(false);
        return;
      }

      // Fallback to our API
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/search?keyword=${encodeURIComponent(query)}&page=1`);
        if (response.data && response.data.results && response.data.results.data) {
          const results = response.data.results.data.slice(0, 5);
          const resultsWithTimestamp = results.map(result => ({ ...result, timestamp: Date.now() }));
          setSearchCache(prev => new Map(prev).set(cacheKey, resultsWithTimestamp));
          setResults(results);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API search failed');
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search anime. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const searchMALWithRetry = async (query, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await searchMAL(query);
      } catch (error) {
        if (error.message.includes('429') && i < retries - 1) {
          // Wait with exponential backoff: 2s, 5s, 10s
          const waitTime = (i === 0 ? 2 : i === 1 ? 5 : 10) * 1000;
          console.log(`Rate limited by MAL API, retrying in ${waitTime}ms... (attempt ${i + 1}/${retries})`);
          toast.error(`Rate limited. Retrying in ${waitTime/1000} seconds...`, { duration: waitTime });
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }
  };

  const searchMAL = async (query) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'User-Agent': 'Otazumi-AnimeCompare/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`MAL API error: 429`);
        }
        throw new Error(`MAL API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        return data.data.map(anime => ({
          id: `mal-${anime.mal_id}`,
          data_id: anime.mal_id.toString(),
          title: anime.title,
          japanese_title: anime.title_japanese || anime.title,
          poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          bannerImage: anime.images?.jpg?.large_image_url,
          description: anime.synopsis || 'No description available.',
          rating: anime.score ? (anime.score * 10).toFixed(0) : null, // Convert to percentage
          totalEpisodes: anime.episodes || 0,
          status: anime.status || 'Unknown',
          releaseDate: anime.aired?.from ? new Date(anime.aired.from).getFullYear().toString() : null,
          type: anime.type || 'TV',
          genres: anime.genres?.map(g => g.name) || [],
          studios: anime.studios?.map(s => s.name) || [],
          duration: anime.duration || null,
          malId: anime.mal_id,
          year: anime.year,
          season: anime.season
        }));
      }

      return [];
    } catch (error) {
      console.error('MAL search error:', error);
      throw error; // Re-throw to allow retry logic
    }
  };

  const selectAnime = async (anime, isFirst) => {
    // If we already have detailed data from MAL search, use it directly
    if (anime.malId) {
      if (isFirst) {
        setAnime1(anime);
        setSearchTerm1(anime.title);
        setShowResults1(false);
      } else {
        setAnime2(anime);
        setSearchTerm2(anime.title);
        setShowResults2(false);
      }
      return;
    }

    // Otherwise, fetch detailed info
    const detailedInfo = await getAnimeInfo(anime.id);

    let enhancedAnime = anime; // Default to search result

    if (detailedInfo) {
      if (detailedInfo.malId) {
        // MAL data
        enhancedAnime = detailedInfo;
      } else {
        // Our API data - merge
        enhancedAnime = {
          ...anime,
          ...detailedInfo,
          poster: anime.poster || detailedInfo.image
        };
      }
    }

    if (isFirst) {
      setAnime1(enhancedAnime);
      setSearchTerm1(anime.title);
      setShowResults1(false);
    } else {
      setAnime2(enhancedAnime);
      setSearchTerm2(anime.title);
      setShowResults2(false);
    }
  };  const clearAnime = (isFirst) => {
    if (isFirst) {
      setAnime1(null);
      setSearchTerm1('');
      setSearchResults1([]);
    } else {
      setAnime2(null);
      setSearchTerm2('');
      setSearchResults2([]);
    }
  };

  const getAnimeInfo = async (animeId) => {
    try {
      // Check if this is a MAL ID
      if (animeId.startsWith('mal-')) {
        const malId = animeId.replace('mal-', '');
        return await fetchMALInfo(malId);
      }

      // Extract numeric ID from anime ID (e.g., "naruto-677" -> "677")
      const numericId = animeId.split('-').pop();

      // First try to get detailed info from our API
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/info?id=${numericId}`);
        if (response.data && response.data.results) {
          return response.data.results;
        }
      } catch (apiError) {
        console.log('API info failed, trying MAL...');
      }

      // Fallback to MAL API using the numeric ID as MAL ID
      const malData = await fetchMALInfo(numericId);
      return malData;

    } catch (error) {
      console.error('Failed to get anime info from both sources:', error);
      return null;
    }
  };

  const fetchMALInfo = async (malId) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`, {
        headers: {
          'User-Agent': 'Otazumi-AnimeCompare/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Wait 3 seconds and retry once for rate limits
          console.log('Rate limited on MAL info fetch, waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          return await fetchMALInfo(malId);
        }
        throw new Error(`MAL API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.data) {
        const anime = data.data;

        // Transform MAL data to match our expected format
        return {
          id: `mal-${anime.mal_id}`,
          data_id: anime.mal_id.toString(),
          title: anime.title,
          japanese_title: anime.title_japanese || anime.title,
          description: anime.synopsis || 'No description available.',
          poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          bannerImage: anime.images?.jpg?.large_image_url,
          rating: anime.score ? (anime.score * 10).toFixed(0) : null, // Convert to percentage
          totalEpisodes: anime.episodes || 0,
          status: anime.status || 'Unknown',
          releaseDate: anime.aired?.from ? new Date(anime.aired.from).getFullYear().toString() : null,
          genres: anime.genres?.map(g => g.name) || [],
          studios: anime.studios?.map(s => s.name) || [],
          duration: anime.duration || null,
          malId: anime.mal_id,
          year: anime.year,
          season: anime.season,
          type: anime.type || 'TV',
          popularity: anime.popularity || 0,
          favorites: anime.favorites || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching from MAL:', error);
      return null;
    }
  };

  const renderAnimeCard = (anime, isFirst) => {
    if (!anime) {
      return (
        <div className="anime-card empty-card">
          <div className="empty-placeholder">
            <FontAwesomeIcon icon={faSearch} className="empty-icon" />
            <p>Search and select an anime to compare</p>
          </div>
        </div>
      );
    }

    return (
      <div className="anime-card">
        <div className="anime-header">
          <img src={anime.poster} alt={anime.title} className="anime-image" />
          <button
            onClick={() => clearAnime(isFirst)}
            className="clear-button"
            title="Clear selection"
          >
            ×
          </button>
        </div>

        <div className="anime-content">
          <h3 className="anime-title">{anime.title}</h3>

          <div className="anime-stats">
            <div className="stat-item">
              <FontAwesomeIcon icon={faStar} className="stat-icon" />
              <span className="stat-label">Rating:</span>
              <span className="stat-value">
                {anime.rating || anime.tvInfo?.rating || anime.averageScore || 'N/A'}
              </span>
            </div>

            <div className="stat-item">
              <FontAwesomeIcon icon={faCalendar} className="stat-icon" />
              <span className="stat-label">Year:</span>
              <span className="stat-value">
                {anime.releaseDate || anime.seasonYear || anime.startDate?.year || 'N/A'}
              </span>
            </div>

            <div className="stat-item">
              <FontAwesomeIcon icon={faPlay} className="stat-icon" />
              <span className="stat-label">Episodes:</span>
              <span className="stat-value">
                {anime.status === 'Currently Airing' || anime.status === 'Currently Airing' ?
                  `Ongoing (${anime.totalEpisodes || anime.episodes || anime.tvInfo?.eps || '?'}+ eps)` :
                  (anime.totalEpisodes || anime.episodes || anime.tvInfo?.eps || 'N/A')
                }
              </span>
            </div>

            <div className="stat-item">
              <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              <span className="stat-label">Status:</span>
              <span className="stat-value">
                {anime.status || anime.tvInfo?.showType || anime.type || 'N/A'}
              </span>
            </div>
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="anime-genres">
              <span className="genres-label">Genres:</span>
              <div className="genres-list">
                {anime.genres.slice(0, 3).map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
          )}

          {anime.description && (
            <div className="anime-description">
              <p>
                {anime.description
                  .replace(/<br\s*\/?>/gi, ' ')
                  .replace(/<[^>]+>/g, '')
                  .slice(0, 150)}...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!anime1 || !anime2) return null;

    const getWinner = (value1, value2, higherIsBetter = true) => {
      if (isNaN(value1) || isNaN(value2) || value1 === null || value2 === null || value1 === undefined || value2 === undefined) return null;
      if (higherIsBetter) {
        return value1 > value2 ? 'left' : value1 < value2 ? 'right' : 'tie';
      } else {
        return value1 < value2 ? 'left' : value1 > value2 ? 'right' : 'tie';
      }
    };

    const rating1 = parseFloat(anime1.rating || anime1.tvInfo?.rating || anime1.averageScore);
    const rating2 = parseFloat(anime2.rating || anime2.tvInfo?.rating || anime2.averageScore);
    const ratingWinner = getWinner(rating1, rating2);

    const episodes1 = parseInt(anime1.totalEpisodes || anime1.episodes || anime1.tvInfo?.eps);
    const episodes2 = parseInt(anime2.totalEpisodes || anime2.episodes || anime2.tvInfo?.eps);

    // Handle ongoing series
    const isOngoing1 = anime1.status === 'Currently Airing';
    const isOngoing2 = anime2.status === 'Currently Airing';

    let episodesWinner = null;
    if (isOngoing1 && !isOngoing2) {
      episodesWinner = 'left'; // Ongoing series wins for having more potential episodes
    } else if (!isOngoing1 && isOngoing2) {
      episodesWinner = 'right'; // Ongoing series wins for having more potential episodes
    } else if (!isOngoing1 && !isOngoing2) {
      // Both completed, compare actual episode counts
      episodesWinner = getWinner(episodes1, episodes2, true);
    }
    // If both are ongoing, no clear winner

    return (
      <div className="comparison-section">
        <h2 className="comparison-title">
          <FontAwesomeIcon icon={faExchangeAlt} className="comparison-icon" />
          Comparison Results
        </h2>

        <div className="comparison-grid">
          <div className="comparison-item">
            <h4>Higher Rating</h4>
            <div className={`winner-indicator ${ratingWinner === 'left' ? 'winner' : ratingWinner === 'tie' ? 'tie' : ''}`}>
              {ratingWinner === 'left' ? '🏆' : ratingWinner === 'tie' ? '🤝' : ''}
              {anime1.title}
            </div>
            <div className={`winner-indicator ${ratingWinner === 'right' ? 'winner' : ratingWinner === 'tie' ? 'tie' : ''}`}>
              {ratingWinner === 'right' ? '🏆' : ratingWinner === 'tie' ? '🤝' : ''}
              {anime2.title}
            </div>
            {ratingWinner === null && <p className="text-gray-400 text-sm mt-2">Rating data unavailable</p>}
          </div>

          <div className="comparison-item">
            <h4>More Episodes</h4>
            <div className={`winner-indicator ${episodesWinner === 'left' ? 'winner' : episodesWinner === 'tie' ? 'tie' : ''}`}>
              {episodesWinner === 'left' ? '🏆' : episodesWinner === 'tie' ? '🤝' : ''}
              {anime1.title}
              {isOngoing1 && <span className="status-badge ongoing">Ongoing</span>}
            </div>
            <div className={`winner-indicator ${episodesWinner === 'right' ? 'winner' : episodesWinner === 'tie' ? 'tie' : ''}`}>
              {episodesWinner === 'right' ? '🏆' : episodesWinner === 'tie' ? '🤝' : ''}
              {anime2.title}
              {isOngoing2 && <span className="status-badge ongoing">Ongoing</span>}
            </div>
            {episodesWinner === null && !isOngoing1 && !isOngoing2 && <p className="text-gray-400 text-sm mt-2">Episode data unavailable</p>}
            {episodesWinner === null && (isOngoing1 || isOngoing2) && <p className="text-gray-400 text-sm mt-2">Both series ongoing - can't compare episode counts</p>}
          </div>

          <div className="comparison-item">
            <h4>Genres Match</h4>
            <div className="genres-comparison">
              <div className="anime-genres-compare">
                <strong>{anime1.title}:</strong>
                {anime1.genres?.slice(0, 2).join(', ') || 'N/A'}
              </div>
              <div className="anime-genres-compare">
                <strong>{anime2.title}:</strong>
                {anime2.genres?.slice(0, 2).join(', ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="recommendation-section">
          <h3>🤔 Which should you watch?</h3>
          <div className="recommendation-cards">
            <div className="recommendation-card">
              <h4>If you prefer {ratingWinner === 'left' ? anime1.title : ratingWinner === 'right' ? anime2.title : 'either'} style:</h4>
              <p>Go with <strong>{ratingWinner === 'left' ? anime1.title : ratingWinner === 'right' ? anime2.title : 'either series'}</strong>{ratingWinner ? ' - it has the higher rating!' : ' - ratings are similar or unavailable.'}</p>
            </div>
            <div className="recommendation-card">
              <h4>If you want a {episodesWinner === 'left' && !isOngoing1 ? 'shorter' : episodesWinner === 'right' && !isOngoing2 ? 'longer' : isOngoing1 || isOngoing2 ? 'completed' : 'similar length'} series:</h4>
              <p>
                {isOngoing1 && isOngoing2 ?
                  'Both series are ongoing - choose based on your preference for their current episode counts.' :
                  isOngoing1 ?
                    <>Choose <strong>{anime2.title}</strong> - a completed series with {episodes2} episodes.</> :
                  isOngoing2 ?
                    <>Choose <strong>{anime1.title}</strong> - a completed series with {episodes1} episodes.</> :
                  <>Choose <strong>{episodesWinner === 'left' ? anime1.title : episodesWinner === 'right' ? anime2.title : 'either series'}</strong> for a {episodesWinner === 'left' ? 'more compact' : episodesWinner === 'right' ? 'epic' : 'similar'} experience.</>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="anime-compare-page">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faExchangeAlt} className="page-icon" />
          Anime Comparison Tool
        </h1>
        <p>Compare two anime side-by-side to decide which one to watch next!</p>
        <div className="search-disclaimer">
          <small>💡 <strong>Tip:</strong> For best results, try searching with the Japanese title of the anime (MAL data source)</small>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-box search-box-first">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search for first anime..."
                value={searchTerm1}
                onChange={(e) => {
                  setSearchTerm1(e.target.value);
                  if (e.target.value.length > 2) {
                    debouncedSearch(e.target.value, setSearchResults1, setLoading1, setShowResults1);
                  } else {
                    setShowResults1(false);
                  }
                }}
                className="search-input"
              />
              {loading1 && <div className="loading-spinner"></div>}
            </div>

            {showResults1 && searchResults1.length > 0 && (
              <div className="search-results">
                {searchResults1.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-item"
                    onClick={() => selectAnime(result, true)}
                  >
                    <img src={result.poster} alt={result.title} className="result-image" />
                    <div className="result-info">
                      <h4>{result.title}</h4>
                      <p>
                        {result.releaseDate || 'N/A'} • {result.type || 'N/A'} • {result.rating ? `${result.rating}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="vs-divider">
            <FontAwesomeIcon icon={faExchangeAlt} className="vs-icon" />
            <span>VS</span>
          </div>

          <div className="search-box search-box-second">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search for second anime..."
                value={searchTerm2}
                onChange={(e) => {
                  setSearchTerm2(e.target.value);
                  if (e.target.value.length > 2) {
                    debouncedSearch(e.target.value, setSearchResults2, setLoading2, setShowResults2);
                  } else {
                    setShowResults2(false);
                  }
                }}
                className="search-input"
              />
              {loading2 && <div className="loading-spinner"></div>}
            </div>

            {showResults2 && searchResults2.length > 0 && (
              <div className="search-results search-results-second">
                {searchResults2.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-item"
                    onClick={() => selectAnime(result, false)}
                  >
                    <img src={result.poster} alt={result.title} className="result-image" />
                    <div className="result-info">
                      <h4>{result.title}</h4>
                      <p>
                        {result.releaseDate || 'N/A'} • {result.type || 'N/A'} • {result.rating ? `${result.rating}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comparison-container">
        <div className="anime-cards-wrapper">
          {renderAnimeCard(anime1, true)}
          {renderAnimeCard(anime2, false)}
        </div>

        {anime1 && anime2 && renderComparison()}
      </div>
    </div>
  );
};

export default AnimeCompare;