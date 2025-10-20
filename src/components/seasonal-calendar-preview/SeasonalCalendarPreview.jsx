import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faLeaf, faSun, faSnowflake, faFire, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getSeasonalAnime } from '../../services/jikanService';

const SeasonalCalendarPreview = () => {
  const [currentSeason, setCurrentSeason] = useState('');
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return 'Winter';
    if (month >= 4 && month <= 6) return 'Spring';
    if (month >= 7 && month <= 9) return 'Summer';
    return 'Fall';
  };

  const getSeasonIcon = (season) => {
    switch (season) {
      case 'Winter': return faSnowflake;
      case 'Spring': return faLeaf;
      case 'Summer': return faSun;
      case 'Fall': return faFire;
      default: return faCalendar;
    }
  };

  const getSeasonColor = (season) => {
    switch (season) {
      case 'Winter': return 'text-blue-400';
      case 'Spring': return 'text-green-400';
      case 'Summer': return 'text-yellow-400';
      case 'Fall': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getSeasonDates = (season, year) => {
    const seasonMap = {
      'Winter': { start: `${year}-01-01`, end: `${year}-03-31` },
      'Spring': { start: `${year}-04-01`, end: `${year}-06-30` },
      'Summer': { start: `${year}-07-01`, end: `${year}-09-30` },
      'Fall': { start: `${year}-10-01`, end: `${year}-12-31` }
    };
    return seasonMap[season];
  };

  const fetchSeasonalAnime = async () => {
    setLoading(true);
    try {
      const season = getCurrentSeason();
      const year = new Date().getFullYear();
      const malSeason = season.toLowerCase();
      
      // Fetch seasonal anime from MAL via Jikan API
      const seasonalAnime = await getSeasonalAnime(year, malSeason);

      if (seasonalAnime && seasonalAnime.length > 0) {
        // Get only the most recent 6 anime
        const recentAnime = seasonalAnime
          .filter(anime => anime.status !== 'Not yet aired')
          .sort((a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            return dateB - dateA; // Most recent first
          })
          .slice(0, 6);

        setSeasonalAnime(recentAnime);
        setCurrentSeason(season);
      } else {
        // Fallback to current API if MAL fails
        console.log('MAL API returned no results for preview, using fallback');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
        
        if (response.data && response.data.results) {
          const fallbackAnime = [
            ...response.data.results.topAiring,
            ...response.data.results.latestEpisode
          ].filter((anime, index, self) => 
            self.findIndex(a => a.id === anime.id) === index
          ).filter(anime => {
            return anime.tvInfo?.showType === 'TV' && 
                   (anime.tvInfo?.sub < 25 || !anime.tvInfo?.eps);
          }).slice(0, 6);
          
          setSeasonalAnime(fallbackAnime);
          setCurrentSeason(season);
        }
      }
    } catch (error) {
      console.error('Failed to fetch seasonal anime for preview:', error);
      
      // Complete fallback
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
        if (response.data && response.data.results) {
          const fallbackAnime = [
            ...response.data.results.topAiring,
            ...response.data.results.latestEpisode
          ].filter((anime, index, self) => 
            self.findIndex(a => a.id === anime.id) === index
          ).filter(anime => {
            return anime.tvInfo?.showType === 'TV' && 
                   (anime.tvInfo?.sub < 25 || !anime.tvInfo?.eps);
          }).slice(0, 6);
          
          setSeasonalAnime(fallbackAnime);
          setCurrentSeason(getCurrentSeason());
        }
      } catch (fallbackError) {
        console.error('Preview fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonalAnime();
  }, []);

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading || seasonalAnime.length === 0) {
    return null; // Don't show anything if loading or no data
  }

  return (
    <div className="seasonal-calendar-preview mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={getSeasonIcon(currentSeason)}
            className={`text-2xl ${getSeasonColor(currentSeason)}`}
          />
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentSeason} {new Date().getFullYear()} Anime
            </h2>
            <p className="text-gray-400 text-sm">
              Latest releases this season
            </p>
          </div>
        </div>

        <Link
          to="/seasonal-calendar"
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {seasonalAnime.map((anime) => (
          <Link
            key={anime.id}
            to={`/search?keyword=${encodeURIComponent(anime.title)}`}
            className="anime-preview-card group"
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-800">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black/50">
                <h3 className="text-xs font-medium line-clamp-2 leading-tight">
                  {anime.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  {anime.tvInfo?.episodeInfo?.sub || 0} episodes
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SeasonalCalendarPreview;