import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faLeaf, faSun, faSnowflake, faFire, faChevronLeft, faChevronRight, faClock, faPlay, faStar } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getSeasonalAnime } from '../../services/jikanService';
import './SeasonalCalendar.css';

const SeasonalCalendar = () => {
  const [currentSeason, setCurrentSeason] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('');

  const seasons = [
    { name: 'Winter', icon: faSnowflake, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/20' },
    { name: 'Spring', icon: faLeaf, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/20' },
    { name: 'Summer', icon: faSun, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/20' },
    { name: 'Fall', icon: faFire, color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/20' }
  ];

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return 'Winter';
    if (month >= 4 && month <= 6) return 'Spring';
    if (month >= 7 && month <= 9) return 'Summer';
    return 'Fall';
  };

  const fetchSeasonalAnime = async (season, year) => {
    setLoading(true);
    try {
      // Convert season name to lowercase for MAL API
      const malSeason = season.toLowerCase();
      
      // Fetch seasonal anime from MAL via Jikan API
      const malAnime = await getSeasonalAnime(year, malSeason);

      if (malAnime && malAnime.length > 0) {
        // For each MAL anime, try to get additional data from our API
        const enhancedAnime = await Promise.all(
          malAnime.map(async (anime) => {
            try {
              // Try to get detailed info from our API using the MAL ID
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/info/${anime.data_id}`);
              if (response.data && response.data.results) {
                const apiData = response.data.results;
                return {
                  ...anime,
                  // Use our API data for more accurate episode info
                  tvInfo: apiData.tvInfo || anime.tvInfo,
                  status: apiData.status || anime.status,
                  totalEpisodes: apiData.totalEpisodes || anime.totalEpisodes,
                  // Keep MAL data for other fields
                  poster: anime.poster,
                  description: anime.description,
                  genres: anime.genres,
                  rating: anime.rating,
                  releaseDate: anime.releaseDate,
                  popularity: anime.popularity,
                  favorites: anime.favorites
                };
              }
            } catch (error) {
              console.log(`Could not get additional data for ${anime.title}:`, error.message);
            }
            return anime; // Return MAL data if our API lookup fails
          })
        );

        setSeasonalAnime(enhancedAnime);
      } else {
        // Fallback to current API if MAL fails
        console.log('MAL API returned no results, using fallback');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
        
        if (response.data && response.data.results) {
          const fallbackAnime = [
            ...response.data.results.topAiring,
            ...response.data.results.latestEpisode
          ].filter((anime, index, self) => 
            self.findIndex(a => a.id === anime.id) === index
          ).slice(0, 24);
          
          setSeasonalAnime(fallbackAnime);
        } else {
          setSeasonalAnime([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch seasonal anime:', error);
      toast.error('Failed to load seasonal anime');
      
      // Complete fallback
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
        if (response.data && response.data.results) {
          const fallbackAnime = [
            ...response.data.results.topAiring,
            ...response.data.results.latestEpisode
          ].filter((anime, index, self) => 
            self.findIndex(a => a.id === anime.id) === index
          ).slice(0, 24);
          
          setSeasonalAnime(fallbackAnime);
        } else {
          setSeasonalAnime([]);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setSeasonalAnime([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    setSelectedSeason(season);
    fetchSeasonalAnime(season, currentYear);
  }, []);

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    fetchSeasonalAnime(season, currentYear);
  };

  const handleYearChange = (direction) => {
    const newYear = direction === 'next' ? currentYear + 1 : currentYear - 1;
    setCurrentYear(newYear);
    fetchSeasonalAnime(selectedSeason, newYear);
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

    const getAnimeStatus = (anime) => {
    // Check MAL status first
    const malStatus = anime.status;
    if (malStatus) {
      if (malStatus.toLowerCase().includes('currently airing') || malStatus.toLowerCase().includes('airing')) {
        return { text: 'Ongoing', color: 'text-black bg-green-500/50' };
      } else if (malStatus.toLowerCase().includes('finished') || malStatus.toLowerCase().includes('completed')) {
        return { text: 'Completed', color: 'text-black bg-blue-500/50' };
      } else if (malStatus.toLowerCase().includes('not yet aired') || malStatus.toLowerCase().includes('upcoming')) {
        return { text: 'Upcoming', color: 'text-black bg-yellow-500/50' };
      }
    }

    // Fallback to episode-based logic
    const episodes = anime.tvInfo?.episodeInfo?.sub || anime.tvInfo?.episodes || 0;
    const maxEpisodes = anime.totalEpisodes || anime.tvInfo?.eps;
    
    if (!maxEpisodes && episodes > 0) {
      return { text: 'Ongoing', color: 'text-green-400 bg-green-500/20' };
    } else if (maxEpisodes && episodes >= maxEpisodes && maxEpisodes > 0) {
      return { text: 'Completed', color: 'text-blue-400 bg-blue-500/20' };
    } else if (episodes === 0) {
      return { text: 'Upcoming', color: 'text-yellow-400 bg-yellow-500/20' };
    }
    return { text: 'Ongoing', color: 'text-green-400 bg-green-500/20' };
  };

  return (
    <div className="seasonal-calendar-page">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faCalendar} className="page-icon" />
          Seasonal Anime Calendar
        </h1>
        <p>Discover the latest and upcoming anime releases by season</p>
      </div>

      {/* Season Selector */}
      <div className="season-selector">
        <div className="year-navigator">
          <button
            onClick={() => handleYearChange('prev')}
            className="year-nav-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2 className="current-year">{currentYear}</h2>
          <button
            onClick={() => handleYearChange('next')}
            className="year-nav-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="season-buttons">
          {seasons.map((season) => (
            <button
              key={season.name}
              onClick={() => handleSeasonChange(season.name)}
              className={`season-btn ${selectedSeason === season.name ? 'active' : ''} ${season.bgColor} ${season.borderColor}`}
              disabled={loading}
            >
              <FontAwesomeIcon icon={season.icon} className={`season-icon ${season.color}`} />
              <span className="season-name">{season.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading {selectedSeason} {currentYear} anime...</p>
        </div>
      )}

      {/* Anime Grid */}
      {!loading && seasonalAnime.length > 0 && (
        <div className="anime-grid">
          {seasonalAnime.map((anime) => {
            const statusInfo = getAnimeStatus(anime);
            return (
              <Link
                key={anime.id}
                to={`/search?keyword=${encodeURIComponent(anime.title)}`}
                className="anime-card-link"
              >
                <div className="anime-card">
                  <div className="anime-image-container">
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="anime-image"
                      loading="lazy"
                    />
                    <div className={`status-badge ${statusInfo.color}`}>
                      {statusInfo.text}
                    </div>
                  </div>

                  <div className="anime-info">
                    <h3 className="anime-title">{anime.title}</h3>

                                        <div className="anime-meta">
                      {anime.tvInfo?.duration && (
                        <div className="meta-item">
                          <FontAwesomeIcon icon={faClock} className="meta-icon" />
                          <span>{anime.tvInfo.duration}</span>
                        </div>
                      )}

                      {anime.tvInfo?.rating && anime.tvInfo.rating !== 'null' && (
                        <div className="meta-item">
                          <FontAwesomeIcon icon={faStar} className="meta-icon" />
                          <span>{anime.tvInfo.rating}</span>
                        </div>
                      )}
                    </div>

                    {anime.description && (
                      <p className="anime-description">
                        {anime.description.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && seasonalAnime.length === 0 && (
        <div className="empty-state">
          <FontAwesomeIcon icon={faCalendar} className="empty-icon" />
          <h3>No anime found</h3>
          <p>No anime releases found for {selectedSeason} {currentYear}</p>
        </div>
      )}

      {/* Season Info */}
      <div className="season-info">
        <div className="info-card">
          <h3>About Seasonal Anime</h3>
          <div className="season-explanation">
            <div className="season-item">
              <FontAwesomeIcon icon={faSnowflake} className="season-icon-info text-blue-400" />
              <div>
                <strong>Winter (Jan-Mar):</strong> Holiday season releases, often feature-rich series
              </div>
            </div>
            <div className="season-item">
              <FontAwesomeIcon icon={faLeaf} className="season-icon-info text-green-400" />
              <div>
                <strong>Spring (Apr-Jun):</strong> New school year, fresh starts, and popular adaptations
              </div>
            </div>
            <div className="season-item">
              <FontAwesomeIcon icon={faSun} className="season-icon-info text-yellow-400" />
              <div>
                <strong>Summer (Jul-Sep):</strong> Break season, light-hearted and action-packed series
              </div>
            </div>
            <div className="season-item">
              <FontAwesomeIcon icon={faFire} className="season-icon-info text-orange-400" />
              <div>
                <strong>Fall (Oct-Dec):</strong> Back to school, award-season contenders, and year-end spectaculars
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalCalendar;