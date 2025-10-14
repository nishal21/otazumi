import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faHeart, faSearch, faDownload, faInfoCircle, faMagnifyingGlass, faAngleRight } from '@fortawesome/free-solid-svg-icons';

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Show loading animation for 2.5 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Trigger fade-in animation
      setTimeout(() => setFadeIn(true), 50);
    }, 2500);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    const queryParam = encodeURIComponent(trimmedSearch);
    navigate(`/search?keyword=${queryParam}`);
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-character">
            <img 
              src="https://media.tenor.com/dX7AKEGu6mQAAAAi/tanjirou-demon-slayer.gif" 
              alt="Loading..." 
              className="running-character"
            />
          </div>
          <div className="loader">
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="text"><span>Loading</span></div>
            <div className="line"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`splash-container ${fadeIn ? 'fade-in' : ''}`}>
      <div className="splash-background"></div>
      <div className="splash-overlay"></div>
      <div className="content-wrapper">
        <div className="logo-container">
          <img src="/logo.png" alt={logoTitle} className="logo" />
        </div>

        <div className="hero-text">
          <h1 className="hero-title">Your Ultimate Anime Streaming Destination</h1>
          <p className="hero-description">
            Watch thousands of anime series and movies for free. High-quality streaming, 
            subtitle downloads in 8 languages, anime download in high quality, personalized profiles with 75 anime avatars, 
            and a seamless ad-free experience across all your devices.
          </p>
          
          <div className="splash-features">
            <div className="splash-feature">
              <FontAwesomeIcon icon={faPlay} />
              <span>HD Streaming</span>
            </div>
            <div className="splash-feature">
              <FontAwesomeIcon icon={faDownload} />
              <span>Subtitle Downloads</span>
            </div>
            <div className="splash-feature">
              <FontAwesomeIcon icon={faHeart} />
              <span>Save Favorites</span>
            </div>
            <div className="splash-feature">
              <FontAwesomeIcon icon={faSearch} />
              <span>Quick Search</span>
            </div>
          </div>
          
          <div className="splash-notice">
            <FontAwesomeIcon icon={faInfoCircle} className="splash-notice-icon" />
            <div className="splash-notice-text">
              <strong>100% Free to Watch!</strong> No account needed.
              <br />
              <small>Account creation limited to 300/day for reliable email service.</small>
            </div>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search anime..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearchSubmit}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        <Link to="/home" className="enter-button">
          Enter Homepage <FontAwesomeIcon icon={faAngleRight} className="angle-icon" />
        </Link>

        <footer className="splash-footer">
          <div className="footer-content">
            <div className="footer-links">
              <Link to="/terms" className="footer-link">Terms of Service</Link>
              <span className="footer-divider">•</span>
              <Link to="/dmca" className="footer-link">DMCA</Link>
              <span className="footer-divider">•</span>
              <Link to="/contact" className="footer-link">Contact</Link>
              <span className="footer-divider">•</span>
              <Link to="/faq" className="footer-link">FAQ</Link>
            </div>
            <div className="footer-copyright">
              <p>© {new Date().getFullYear()} Otazumi. All rights reserved.</p>
              <p className="footer-tagline">Your Ultimate Anime Streaming Experience</p>
              <p className="footer-artist-credit">Background Art by @miyanart</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default SplashScreen;


