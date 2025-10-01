import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faSearch, 
  faSpinner,
  faCheckSquare,
  faSquare,
  faLanguage,
  faClosedCaptioning,
  faFileDownload,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { DownloadService } from '../../services/downloadService';
import './SubtitleDownload.css';

const SubtitleDownload = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // Default language
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState(''); // Search filter for episodes
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Search anime
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage('');
    setSelectedAnime(null);
    setEpisodes([]);

    try {
      const api_url = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${api_url}/search?keyword=${encodeURIComponent(searchQuery.trim())}&page=1`
      );
      
      // API returns: { success: true, results: { data: [...], totalPage: 1 } }
      if (response.data && response.data.results && response.data.results.data && Array.isArray(response.data.results.data)) {
        setSearchResults(response.data.results.data);
        if (response.data.results.data.length === 0) {
          setMessage('No anime found. Try a different search term.');
          setMessageType('warning');
        }
      } else {
        throw new Error('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage(`Failed to search anime: ${error.response?.data?.message || error.message}`);
      setMessageType('error');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Select anime and load episodes
  const handleSelectAnime = async (anime) => {
    setSelectedAnime(anime);
    setLoading(true);
    setMessage('Loading episodes...');
    setMessageType('info');
    setSelectedEpisodes([]);
    setEpisodeSearchQuery(''); // Clear episode search when changing anime

    try {
      const api_url = import.meta.env.VITE_API_URL;
      const animeId = anime.id;
      const response = await axios.get(
        `${api_url}/episodes/${animeId}`
      );
      
      console.log('Episodes API Response:', response.data);
      
      // API returns: { success: true, results: { totalEpisodes: N, episodes: [...] } }
      if (response.data && response.data.results && response.data.results.episodes) {
        const episodesList = Array.isArray(response.data.results.episodes) 
          ? response.data.results.episodes 
          : [];
        
        setEpisodes(episodesList);
        setMessage(`${episodesList.length} episodes loaded`);
        setMessageType('success');
      } else {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Failed to fetch episodes - unexpected response format');
      }
    } catch (error) {
      console.error('Episodes fetch error:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMessage(`Failed to load episodes: ${error.response?.data?.message || error.message}`);
      setMessageType('error');
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle episode selection
  const toggleEpisode = (episodeId) => {
    setSelectedEpisodes(prev => {
      if (prev.includes(episodeId)) {
        return prev.filter(id => id !== episodeId);
      } else {
        return [...prev, episodeId];
      }
    });
  };

  // Select all episodes (filtered)
  const selectAllEpisodes = () => {
    // Get filtered episodes based on search query
    const filteredEpisodes = episodes.filter((episode) => {
      if (!episodeSearchQuery.trim()) return true;
      const query = episodeSearchQuery.toLowerCase();
      const episodeNumber = (episode.episode_no || episode.number || '').toString().toLowerCase();
      const episodeTitle = (episode.title || '').toLowerCase();
      return episodeNumber.includes(query) || episodeTitle.includes(query);
    });
    
    const filteredIds = filteredEpisodes.map(ep => ep.id);
    const allFilteredSelected = filteredIds.every(id => selectedEpisodes.includes(id));
    
    if (allFilteredSelected) {
      // Deselect all filtered episodes
      setSelectedEpisodes(selectedEpisodes.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered episodes
      const newSelected = [...new Set([...selectedEpisodes, ...filteredIds])];
      setSelectedEpisodes(newSelected);
    }
  };

  // Download subtitles for selected episodes
  const handleDownloadSubtitles = async () => {
    if (selectedEpisodes.length === 0) {
      setMessage('Please select at least one episode');
      setMessageType('warning');
      return;
    }

    setDownloading(true);
    setMessage(`Downloading subtitles for ${selectedEpisodes.length} episode(s)...`);
    setMessageType('info');

    let successCount = 0;
    let failCount = 0;

    for (const episodeId of selectedEpisodes) {
      try {
        const episode = episodes.find(ep => ep.id === episodeId);
        if (!episode) continue;

        console.log('Episode object:', episode);

        // Fetch episode stream with subtitles
        // The episode.id format: "anime-id?ep=episodeId"
        // We need to split it to get the anime ID and episode ID
        const api_url = import.meta.env.VITE_API_URL;
        const streamUrl = `${api_url}/stream?id=${episodeId}&server=hd-1&type=sub`;
        console.log(`Fetching stream for episode ${episode.episode_no || episode.number || 'unknown'}:`, streamUrl);
        
        const response = await axios.get(streamUrl);
        const episodeNumber = episode.episode_no || episode.number || episode.id;
        console.log(`Stream response for episode ${episodeNumber}:`, response.data);

        // API returns: { success: true, results: { streamingLink: { tracks: [...] } } }
        if (response.data && response.data.results && response.data.results.streamingLink && response.data.results.streamingLink.tracks && Array.isArray(response.data.results.streamingLink.tracks)) {
          const allTracks = response.data.results.streamingLink.tracks;
          console.log(`Tracks found for episode ${episodeNumber}:`, allTracks);
          
          // Find subtitle/caption tracks
          const subtitleTracks = allTracks.filter(
            track => track.kind === 'captions' || track.kind === 'subtitles'
          );
          
          console.log(`Subtitle tracks for episode ${episodeNumber}:`, subtitleTracks);

          if (subtitleTracks.length > 0) {
            // Find the track matching the selected language
            const selectedTrack = subtitleTracks.find(track => 
              track.label && track.label.toLowerCase().includes(selectedLanguage.toLowerCase())
            ) || subtitleTracks[0]; // Fallback to first track if language not found
            
            console.log(`Selected track for ${selectedLanguage}:`, selectedTrack);
            
            try {
              await DownloadService.downloadSubtitle(
                selectedTrack.file,
                null,
                selectedAnime.title,
                episodeNumber
              );
              successCount++;
            } catch (dlError) {
              console.error('Download error for episode:', episodeNumber, dlError);
              failCount++;
            }
          } else {
            failCount++;
            console.warn('No subtitles found for episode:', episodeNumber, response.data);
          }
        } else {
          console.error(`Invalid stream response structure for episode ${episodeNumber}:`, response.data);
          failCount++;
        }

        // Add small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error downloading subtitle:', error);
        failCount++;
      }
    }

    setDownloading(false);
    
    if (successCount > 0 && failCount === 0) {
      setMessage(`✓ Successfully downloaded ${successCount} subtitle(s)!`);
      setMessageType('success');
    } else if (successCount > 0) {
      setMessage(`Downloaded ${successCount} subtitle(s). ${failCount} failed or unavailable.`);
      setMessageType('warning');
    } else {
      setMessage('No subtitles available for the selected episodes.');
      setMessageType('error');
    }

    // Clear selection after download
    setSelectedEpisodes([]);
  };

  return (
    <div className="subtitle-download-page">
      <div className="subtitle-download-container">
        {/* Header */}
        <div className="subtitle-header">
          <div className="subtitle-header-content">
            <div className="subtitle-icon">
              <FontAwesomeIcon icon={faClosedCaptioning} />
            </div>
            <div>
              <h1 className="subtitle-title">Subtitle Download Center</h1>
              <p className="subtitle-description">
                Search for anime, select episodes, and download subtitles in bulk
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="subtitle-search-section">
          <form onSubmit={handleSearch} className="subtitle-search-form">
            <div className="subtitle-search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="subtitle-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime by name..."
                className="subtitle-search-input"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="subtitle-search-button"
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`subtitle-message subtitle-message-${messageType}`}>
              <FontAwesomeIcon 
                icon={messageType === 'error' ? faExclamationCircle : faFileDownload} 
              />
              {message}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedAnime && (
          <div className="subtitle-results-section">
            <h2 className="subtitle-section-title">Search Results</h2>
            <div className="subtitle-anime-grid">
              {searchResults.map((anime) => (
                <div 
                  key={anime.id} 
                  className="subtitle-anime-card"
                  onClick={() => handleSelectAnime(anime)}
                >
                  <img 
                    src={anime.poster} 
                    alt={anime.title}
                    className="subtitle-anime-poster"
                  />
                  <div className="subtitle-anime-info">
                    <h3 className="subtitle-anime-name">{anime.title}</h3>
                    <p className="subtitle-anime-meta">
                      {anime.type || 'TV'} • {anime.tvInfo?.sub || '?'} Episodes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Anime and Episodes */}
        {selectedAnime && episodes.length > 0 && (
          <div className="subtitle-selected-section">
            <div className="subtitle-selected-header">
              <div className="subtitle-selected-anime">
                <img 
                  src={selectedAnime.poster} 
                  alt={selectedAnime.title}
                  className="subtitle-selected-poster"
                />
                <div>
                  <h2 className="subtitle-selected-name">{selectedAnime.title}</h2>
                  <p className="subtitle-selected-meta">
                    {episodes.length} Episodes Available
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedAnime(null);
                  setEpisodes([]);
                  setSelectedEpisodes([]);
                }}
                className="subtitle-back-button"
              >
                Back to Search
              </button>
            </div>

            {/* Episode Selection Controls */}
            <div className="subtitle-controls">
              <button 
                onClick={selectAllEpisodes}
                className="subtitle-select-all"
              >
                <FontAwesomeIcon 
                  icon={selectedEpisodes.length === episodes.length ? faCheckSquare : faSquare} 
                />
                {selectedEpisodes.length === episodes.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <div className="subtitle-language-selector">
                <FontAwesomeIcon icon={faLanguage} />
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="subtitle-language-select"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Russian">Russian</option>
                </select>
              </div>
              
              <div className="subtitle-selection-count">
                {selectedEpisodes.length} of {episodes.filter((episode) => {
                  if (!episodeSearchQuery.trim()) return true;
                  const query = episodeSearchQuery.toLowerCase();
                  const episodeNumber = (episode.episode_no || episode.number || '').toString().toLowerCase();
                  const episodeTitle = (episode.title || '').toLowerCase();
                  return episodeNumber.includes(query) || episodeTitle.includes(query);
                }).length} selected {episodeSearchQuery.trim() && `(${episodes.length} total)`}
              </div>
              <button 
                onClick={handleDownloadSubtitles}
                className="subtitle-download-button"
                disabled={downloading || selectedEpisodes.length === 0}
              >
                {downloading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Download Selected ({selectedEpisodes.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Episode Search Filter */}
            <div className="subtitle-episode-search">
              <FontAwesomeIcon icon={faSearch} className="subtitle-episode-search-icon" />
              <input
                type="text"
                value={episodeSearchQuery}
                onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                placeholder="Search episodes by number or title..."
                className="subtitle-episode-search-input"
              />
              {episodeSearchQuery && (
                <button 
                  onClick={() => setEpisodeSearchQuery('')}
                  className="subtitle-episode-search-clear"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Episodes Grid */}
            <div className="subtitle-episodes-grid">
              {episodes
                .filter((episode) => {
                  if (!episodeSearchQuery.trim()) return true;
                  const query = episodeSearchQuery.toLowerCase();
                  const episodeNumber = (episode.episode_no || episode.number || '').toString().toLowerCase();
                  const episodeTitle = (episode.title || '').toLowerCase();
                  return episodeNumber.includes(query) || episodeTitle.includes(query);
                })
                .map((episode) => (
                <div 
                  key={episode.id}
                  className={`subtitle-episode-card ${
                    selectedEpisodes.includes(episode.id) ? 'selected' : ''
                  }`}
                  onClick={() => toggleEpisode(episode.id)}
                >
                  <div className="subtitle-episode-checkbox">
                    <FontAwesomeIcon 
                      icon={selectedEpisodes.includes(episode.id) ? faCheckSquare : faSquare} 
                    />
                  </div>
                  <div className="subtitle-episode-info">
                    <h3 className="subtitle-episode-number">Episode {episode.episode_no || episode.number || episode.id}</h3>
                    {episode.title && (
                      <p className="subtitle-episode-title">{episode.title}</p>
                    )}
                  </div>
                  <FontAwesomeIcon icon={faLanguage} className="subtitle-language-icon" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !selectedAnime && !loading && (
          <div className="subtitle-empty-state">
            <FontAwesomeIcon icon={faClosedCaptioning} className="subtitle-empty-icon" />
            <h2>Search for Anime</h2>
            <p>Enter an anime name in the search box above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleDownload;
