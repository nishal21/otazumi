import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBullhorn, faPlus, faBug, faWrench, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import './UpdateHistoryPopup.css';

const UPDATE_HISTORY = [
  {
    version: "1.2.3",
    date: "October 20, 2025",
    changes: [
      {
        type: "added",
        icon: faPlus,
        title: "Anime Comparison Tool",
        description: "New dedicated page for comparing two anime side-by-side with MAL API integration, winner indicators, and personalized recommendations"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Seasonal Anime Calendar",
        description: "Complete seasonal calendar with year/season navigation (2020-2026), MAL data integration, and homepage preview section"
      },
      {
        type: "added",
        icon: faPlus,
        title: "AniList & MAL Support Blocks",
        description: "Added support sections for AniList (Patreon/PayPal) and MyAnimeList (Membership) on the enhanced support developer page"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Smart Episode Comparison",
        description: "Enhanced comparison logic to intelligently handle ongoing vs completed series with appropriate recommendations"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Mobile UI Enhancements",
        description: "Fixed search bar width issues and VS divider positioning on small screens for better mobile experience"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Japanese Title Search Tip",
        description: "Added helpful disclaimer encouraging users to search with Japanese titles for better MAL API results"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Ongoing Series Display",
        description: "Enhanced display format for ongoing anime showing 'Ongoing (X+ eps)' instead of unavailable data"
      }
    ]
  },
  {
    version: "1.2.2",
    date: "October 19, 2025",
    changes: [
      {
        type: "added",
        icon: faPlus,
        title: "Enhanced Email Security",
        description: "Implemented Gmail-only email validation to ensure legitimate user accounts and prevent spam registrations"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Disposable Email Blocking",
        description: "Added comprehensive blocking of 1000+ disposable/temporary email services for improved account security"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Cost-Effective Validation",
        description: "Replaced expensive third-party email verification services with free, instant validation system"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Real-time Email Validation",
        description: "Enhanced frontend validation with immediate feedback for email format and domain restrictions"
      }
    ]
  },
  {
    version: "1.2.1",
    date: "October 18, 2025",
    changes: [
      {
        type: "improved",
        icon: faWrench,
        title: "Download Page Enhancements",
        description: "Enhanced download modal positioning, better mobile responsiveness, and improved user experience for episode downloads"
      },
      {
        type: "fixed",
        icon: faBug,
        title: "Modal Positioning Fix",
        description: "Fixed download modal appearing behind navbar by adjusting z-index and positioning"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Genre Navigation Enhancement",
        description: "Added expandable genre section in sidebar with scrollable genre list for easy access to all anime categories"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Mobile Navigation Safety",
        description: "Enhanced sidebar with mobile safe area support to ensure genre button accessibility on devices with bottom navigation bars"
      }
    ]
  },
  {
    version: "1.2.0",
    date: "October 13, 2025",
    changes: [
      {
        type: "added",
        icon: faPlus,
        title: "Anime Games Platform",
        description: "Added 5 exciting anime-themed games: Quiz Challenge, Memory Game, Trivia Master, Speed Quiz, and Gallery Quiz with report downloads and statistics tracking"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Report Download Feature",
        description: "All games now support downloading beautiful result images with watermarks for sharing on social media"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Game Randomization",
        description: "Implemented shuffled questions and options across all games for fair and varied gameplay"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Mobile Responsiveness",
        description: "Enhanced mobile experience for all games with touch-friendly controls and responsive layouts"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Game Statistics",
        description: "Added comprehensive statistics tracking for games played, scores, and performance metrics"
      }
    ]
  },
  {
    version: "1.1.5",
    date: "October 5, 2025",
    changes: [
      {
        type: "added",
        icon: faPlus,
        title: "Enhanced Statistics Dashboard",
        description: "Complete watch history analytics with time-based filtering, completion rates, and personalized insights"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Watch Progress Tracking",
        description: "Automatic progress updates every 30 seconds with 90% completion detection"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Anime Video Downloader",
        description: "Search and download anime episodes with episode search and pagination support"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "Bigger Splash Screen",
        description: "Improved loading animation visibility on mobile devices with responsive scaling"
      },
      {
        type: "fixed",
        icon: faBug,
        title: "Navigation Overlap Fix",
        description: "Fixed statistics page heading overlap with proper top padding"
      }
    ]
  },
  {
    version: "1.0.8",
    date: "September 15, 2025",
    changes: [
      {
        type: "added",
        icon: faPlus,
        title: "75 Anime Avatars",
        description: "Choose from anime character avatars from 23 different series with unique traits"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Support Developer Page",
        description: "Beautiful support page with multiple donation options and integrated links"
      },
      {
        type: "improved",
        icon: faWrench,
        title: "PWA Install Prompt",
        description: "Enhanced install prompt with support links and better mobile experience"
      },
      {
        type: "added",
        icon: faPlus,
        title: "Framer Motion Animations",
        description: "Smooth transitions and polished animations throughout the application"
      }
    ]
  }
];

const UpdateHistoryPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVersion] = useState(UPDATE_HISTORY[0].version);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      // Wait for page to load
      const handlePageLoad = () => {
        setIsPageLoaded(true);
      };

      window.addEventListener('load', handlePageLoad);

      return () => {
        window.removeEventListener('load', handlePageLoad);
      };
    }
  }, []);

  useEffect(() => {
    // Only show popup after page is fully loaded
    if (isPageLoaded) {
      // Check if user has seen the current update
      const lastSeenVersion = localStorage.getItem('lastSeenUpdateVersion');

      if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
        // Show popup if it's a new version or first time
        setIsVisible(true);
      }
    }
  }, [isPageLoaded, currentVersion]);

  const handleClose = () => {
    // Save current version to localStorage
    localStorage.setItem('lastSeenUpdateVersion', currentVersion);
    setIsVisible(false);
  };

  const getChangeTypeColor = (type) => {
    switch (type) {
      case 'added': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'improved': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'fixed': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'removed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="update-popup-overlay">
      <div className="update-popup-container">
        {/* Header */}
        <div className="update-popup-header">
          <div className="update-popup-title">
            <FontAwesomeIcon icon={faBullhorn} className="update-icon" />
            <h2>What's New in Otazumi</h2>
          </div>
          <button
            onClick={handleClose}
            className="update-popup-close"
            aria-label="Close update popup"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="update-popup-content">
          {UPDATE_HISTORY.map((update, updateIndex) => (
            <div key={update.version} className="update-version">
              <div className="update-version-header">
                <div className="update-version-info">
                  <h3>Version {update.version}</h3>
                  <span className="update-date">{update.date}</span>
                </div>
                {updateIndex === 0 && (
                  <div className="update-latest-badge">
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                    Latest
                  </div>
                )}
              </div>

              <div className="update-changes">
                {update.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="update-change-item">
                    <div className={`update-change-type ${getChangeTypeColor(change.type)}`}>
                      <FontAwesomeIcon icon={change.icon} className="change-icon" />
                      <span className="change-type-text">
                        {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                      </span>
                    </div>
                    <div className="update-change-content">
                      <h4 className="change-title">{change.title}</h4>
                      <p className="change-description">{change.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="update-popup-footer">
          <button
            onClick={handleClose}
            className="update-popup-dismiss"
          >
            Got it, thanks!
          </button>

          {/* Support Section */}
          <div className="update-popup-support">
            <p>❤️ Enjoying OTAZUMI? Support the developer!</p>
            <div className="update-popup-support-links">
              <a
                href="https://github.com/sponsors/nishal21"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://buymeacoffee.com/kingtanjiro"
                target="_blank"
                rel="noopener noreferrer"
              >
                Coffee
              </a>
              <a
                href="https://ko-fi.com/demon_king"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ko-fi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateHistoryPopup;