import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './FAQ.css';

const FAQ_DATA = {
  'Getting Started': [
    {
      question: "What is Otazumi?",
      answer: "Otazumi is a free anime streaming platform where you can watch thousands of anime series and movies. We offer high-quality streaming with no intrusive ads and a user-friendly interface."
    },
    {
      question: "Do I need to create an account?",
      answer: "No, you can browse and watch anime without an account. However, creating an account allows you to save your favorites, maintain a watchlist, track your watch history, and sync your preferences across devices."
    },
    {
      question: "Is Otazumi really free?",
      answer: "Yes! Otazumi is completely free to use. You can watch unlimited anime without any subscription fees or hidden charges."
    },
    {
      question: "How do I search for anime?",
      answer: "Use the search bar at the top of any page. You can search by anime title, genre, or keywords. We also have an A-Z listing and category pages to help you discover new anime."
    }
  ],
  'Account & Profile': [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign In' button in the navigation bar, then select 'Sign Up'. Choose from 75 anime avatars from 23 different anime series (Naruto, One Piece, Dragon Ball, etc.), enter your email, choose a username, and create a password. You'll receive a verification email to activate your account."
    },
    {
      question: "I didn't receive my verification email. What should I do?",
      answer: "First, check your spam/junk folder. If you still can't find it, you can request a new verification email from your profile settings. Make sure you entered the correct email address during registration."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot password?' on the login screen. Enter your email address, and we'll send you a password reset link. The link expires in 1 hour for security reasons."
    },
    {
      question: "Can I change my username or avatar?",
      answer: "Yes! Go to your profile settings by clicking your avatar in the navigation bar. You can change your username and select a different avatar from 75 anime-themed options from 23 different anime series anytime. Each avatar has unique character-specific traits and themes."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to your profile settings and scroll down to the 'Danger Zone' section. Click 'Delete Account' and follow the confirmation steps. This action is permanent and cannot be undone."
    },
    {
      question: "What data do you store about me?",
      answer: "We only store your email, username, encrypted password, avatar preference, favorites,and watchlist in our secure cloud database (NeonDB). Your favorites, watchlist, and watch history are stored locally on your device for privacy."
    },
    {
      question: "Why is there a daily signup limit?",
      answer: "We have a limit of 300 new registrations per day to maintain reliable email delivery for all users. This ensures that verification and welcome emails are sent promptly without hitting email provider limits (Gmail has a 500 email/day limit). If you see a 'daily limit reached' message, please try again the next day. This limit helps us provide a better experience for everyone!"
    },
    {
      question: "What happens if I try to register when the limit is reached?",
      answer: "You'll see a friendly message letting you know the daily signup limit has been reached. Simply come back tomorrow to create your account! The limit resets at midnight. You can still browse and watch anime without an account in the meantime."
    }
  ],
  'Streaming & Video Quality': [
    {
      question: "What video quality do you offer?",
      answer: "We offer multiple quality options including 360p, 480p, 720p (HD), and 1080p (Full HD). The available quality depends on the source and your internet connection."
    },
    {
      question: "What are filler episodes and how can I identify them?",
      answer: "Filler episodes are episodes not based on the original manga storyline. They're created by the anime studio to give the manga time to progress or to explore side stories. On Otazumi, filler episodes are clearly marked with an orange/amber color in the episode list. You'll see a 'FILLER' badge in list view, and the episode numbers will have an orange gradient background in grid view. Click the info icon (ℹ️) next to 'Episodes' for more details. This helps you decide whether to watch or skip them!"
    },
    {
      question: "Why is the video buffering or loading slowly?",
      answer: "Buffering can occur due to slow internet connection, server load, or your device performance. Try: lowering the video quality, clearing your browser cache, switching to a different server, or checking your internet speed."
    },
    {
      question: "Can I download episodes to watch offline?",
      answer: "Currently, we don't offer offline downloads. All content must be streamed online. We recommend a stable internet connection for the best experience."
    },
    {
      question: "Do you have subtitles and dubbed versions?",
      answer: "Yes! Most anime are available with English subtitles. Dubbed versions are available when they exist. You can toggle between sub and dub options in the video player."
    },
    {
      question: "The video player isn't working. What should I do?",
      answer: "Try these steps: 1) Refresh the page, 2) Clear your browser cache, 3) Try a different server option, 4) Update your browser, 5) Disable ad blockers temporarily, 6) Try a different browser."
    },
    {
      question: "What is the Anime Video Downloader and is it safe?",
      answer: "The Anime Video Downloader page lets you search for anime series and open available download links for specific episodes. Download links are provided by third-party services and will open in a new tab or external provider. We do our best to list reliable sources, but the availability and safety of download links depend on those external providers."
    },
  ],
  'Statistics & Watch History': [
    {
      question: "What is the Statistics Dashboard?",
      answer: "The Statistics Dashboard is your personal anime watching analytics hub! It automatically tracks every episode you watch and provides detailed insights including total hours watched, completion rate, unique anime count, daily averages, and more. You can access it from the sidebar menu under 'Statistics'."
    },
    {
      question: "Do I need an account to use the Statistics feature?",
      answer: "No! The Statistics Dashboard works for everyone - both logged-in users and guests. Your watch history is stored locally on your device (localStorage) for privacy, and logged-in users also get cloud sync to NeonDB for cross-device access."
    },
    {
      question: "How does watch history tracking work?",
      answer: "Your watch history is automatically recorded when you start playing an episode. The system updates your progress every 30 seconds during playback. When you finish watching (90% or more), the episode is marked as completed. All this happens seamlessly in the background!"
    },
    {
      question: "What statistics can I see on the dashboard?",
      answer: "You can view: Total hours watched, Total episodes watched, Number of unique anime, Completion rate percentage, Average episodes per day, Most active watching day, Days with activity, Recent activity (last 5 episodes), and Personalized insights with achievements based on your watching habits."
    },
    {
      question: "Can I filter statistics by time period?",
      answer: "Yes! You can filter your statistics by three time ranges: All Time (complete history), This Month (last 30 days), and This Week (last 7 days). This helps you track your recent watching patterns or see your all-time stats."
    },
    {
      question: "Why isn't an episode showing in my statistics?",
      answer: "Make sure you actually started playing the video (not just opened the page). The episode is recorded when the video player starts. If using an ad blocker or privacy extension, it might block localStorage. Try disabling it temporarily and refreshing the page."
    },
    {
      question: "What does 'Completion Rate' mean?",
      answer: "Completion Rate shows the percentage of episodes you've fully watched (90% or more) compared to episodes you started. For example, if you watched 10 episodes and completed 8 of them, your completion rate would be 80%."
    },
    {
      question: "Can I export my watch history?",
      answer: "Yes! Go to your profile settings and use the 'Export Data' feature. This downloads a JSON file containing all your watch history, favorites, and watchlist. You can also import this data later to restore your history."
    }
  ],
  'Features & Functionality': [
    {
      question: "How do I add anime to my watchlist?",
      answer: "Click the '+ Watchlist' button on any anime page. You can view your full watchlist from your profile menu. Note: You need to be logged in to use this feature."
    },
    {
      question: "How do I share anime with others?",
      answer: "Click the share button (📤 icon) on any anime page. The button will show 'Copied!' in green text for 2 seconds to confirm that the anime link has been copied to your clipboard. You can then paste the link anywhere to share the anime with friends on social media, messaging apps, or chat."
    },
    {
      question: "How does 'Continue Watching' work?",
      answer: "We automatically save your progress when you watch an episode. Your 'Continue Watching' list shows all anime where you haven't finished watching, allowing you to pick up right where you left off."
    },
    {
      question: "Can I sync my data across devices?",
      answer: "Your account information (username, email, avatar), favorites and watchlist syncs automatically across devices. Watch history is stored locally on each device, but logged-in users also get cloud backup to NeonDB."
    },
    {
      question: "How do I request an anime that's not available?",
      answer: "Go to our Contact page and submit an anime request. Include the anime title, year, and any other relevant information. We review all requests and add popular titles when possible."
    },
    {
      question: "Do you have a mobile app?",
      answer: "Currently, we don't have a dedicated mobile app, but our website is fully responsive and works great on mobile browsers. You can add Otazumi to your home screen for an app-like experience."
    },
    {
      question: "What is the comment section?",
      answer: "We have integrated a comment section powered by The Anime Community, a third-party service. This allows users to discuss anime episodes and series. Comments are available on both anime info pages and individual episode watch pages."
    },
    {
      question: "Are the comments moderated?",
      answer: "The comment section is provided by a third-party service (The Anime Community) and operates as a global chat system. While they have community guidelines, moderation is handled by the service provider, not by Otazumi directly."
    },
    {
      question: "Why do I see comments about other websites in the comment section?",
      answer: "The comment section is a global chat system used by multiple anime streaming sites worldwide. Since it's shared across different platforms, you may see discussions or complaints about other websites that also use this comment service. This is normal for a global community chat system."
    },
    {
      question: "Who provides the comment service?",
      answer: "The comment section is powered by The Anime Community, an independent third-party service. They provide comment functionality for anime websites globally. Otazumi integrates with their service to enable community discussions."
    },
    {
      question: "Are comments visible globally across all sites?",
      answer: "Yes, the comment section is a global chat system. Comments posted here are visible to users across all anime streaming websites that use The Anime Community service. This creates a worldwide anime community discussion platform."
    },
    {
      question: "Can I report inappropriate comments?",
      answer: "For comment moderation and reporting, please use the built-in reporting features within the comment section interface provided by The Anime Community. They handle community moderation and content policies for their global chat system."
    }
  ],
  'Subtitle Downloads': [
    {
      question: "Can I download subtitles for offline use?",
      answer: "Yes! We have a dedicated Subtitle Download page where you can search for anime, select episodes, and download subtitles in multiple languages. This feature is perfect for offline viewing, translation work, or creating custom subtitle edits."
    },
    {
      question: "How do I download subtitles?",
      answer: "Go to the Subtitle Download page from the navigation menu. Search for your anime, click on it to load episodes, select the episodes you want (or use 'Select All'), choose your preferred language from the dropdown, and click 'Download Selected'. The subtitles will be downloaded to your device in .vtt format."
    },
    {
      question: "What languages are available for subtitle downloads?",
      answer: "We support subtitle downloads in 8 languages: English, Arabic, Spanish, French, German, Italian, Portuguese, and Russian. The available languages depend on what's available for each specific anime episode."
    },
    {
      question: "Can I download subtitles for multiple episodes at once?",
      answer: "Yes! You can select multiple episodes or use the 'Select All' button to download all episodes at once. The system will download them one by one with a progress indicator showing your download status."
    },
    {
      question: "How do I find specific episodes in long anime series?",
      answer: "Use the episode search feature! After selecting an anime, you'll see a search box above the episodes list. You can search by episode number (e.g., '47', '123') or by episode title. This is especially helpful for long-running series like One Piece or Naruto."
    },
    {
      question: "What format are the downloaded subtitles?",
      answer: "Subtitles are downloaded in .vtt (WebVTT) format, which is compatible with most video players including VLC, MPV, and web-based players. The filename includes the anime title and episode number for easy organization."
    },
    {
      question: "What if my preferred language isn't available?",
      answer: "If your selected language isn't available for a specific episode, the system will automatically download the first available subtitle track (usually English). We're constantly working to add more language options."
    },
    {
      question: "Can I download subtitles without watching the anime?",
      answer: "Yes! The subtitle download feature is completely independent from watching. You can download subtitles anytime without streaming the video, making it perfect for offline preparation or archiving."
    }
  ],
  'Anime Quotes': [
    {
      question: "How do I access anime quotes?",
      answer: "Navigate to 'Anime Quotes' in the sidebar menu. You can browse thousands of quotes from popular anime series, search by anime or character, generate beautiful quote images, and share them on social media platforms."
    },
    {
      question: "How do I generate and share quote images?",
      answer: "Go to 'Anime Quotes' in the sidebar, browse or search for quotes, click on any quote to generate an image, then use the share buttons to post on Discord, Twitter, Reddit, Facebook, Pinterest, Instagram, Snapchat, or WhatsApp. You can also download the image to your device."
    },
    {
      question: "What anime series have quotes available?",
      answer: "We have quotes from thousands of popular anime series including Naruto, One Piece, Dragon Ball, Attack on Titan, My Hero Academia, Demon Slayer, Death Note, and many more. The collection grows as we integrate with multiple anime databases."
    },
    {
      question: "How does the quote image generation work?",
      answer: "Our system uses HTML5 Canvas to create beautiful quote images that include the quote text with custom typography, character images from the anime, anime title and character name, custom styling and backgrounds, and high-quality output suitable for sharing."
    },
    {
      question: "Can I download quote images?",
      answer: "Yes! Each generated quote image can be downloaded to your device in high quality. Simply click the download button after generating the quote image."
    },
    {
      question: "Are quote images optimized for social media?",
      answer: "Yes, all generated quote images are optimized for social media sharing with appropriate dimensions and quality for platforms like Instagram, Twitter, Facebook, and more."
    }
  ],
  'Anime News': [
    {
      question: "How do I stay updated with anime news?",
      answer: "Visit 'Anime News' in the sidebar menu. You'll find the latest news about anime and manga from various sources, with options to filter by category (All News, Anime, or Manga)."
    },
    {
      question: "Can I filter anime news by type?",
      answer: "Yes! On the Anime News page, you can use the filter buttons to view: All News (everything including industry updates), Anime (news specifically about anime series and movies), or Manga (news about manga, manhwa, and manhua)."
    },
    {
      question: "How often is the news updated?",
      answer: "News is fetched in real-time from RSS feeds of major anime news sources. The page shows the most recent articles with publication dates, so you'll always see the latest updates when you refresh the page."
    },
    {
      question: "Where does the news come from?",
      answer: "We aggregate news from reputable anime news sources including Anime-Planet and other major anime news websites through RSS feeds. Each article links back to the original source for the full story."
    },
    {
      question: "Can I read full news articles?",
      answer: "Yes! Each news item includes a 'Read more →' link that takes you directly to the full article on the original news source website."
    }
  ],
  'Anime Games': [
    {
      question: "What games are available on Otazumi?",
      answer: "We offer 5 exciting anime-themed games: Anime Quiz Challenge (character and scene recognition), Character Memory Game (match anime character cards), Anime Trivia Master (questions about anime history and characters), Speed Quiz Challenge (fast-paced timed questions), and Anime Gallery Quiz (identify anime from screenshots)."
    },
    {
      question: "How do I access the games?",
      answer: "Navigate to 'Games' in the sidebar menu or visit /games. You'll see all available games with descriptions, difficulty levels, and play buttons."
    },
    {
      question: "Do I need an account to play games?",
      answer: "No! All games work without an account. Your scores and progress are saved locally in your browser using localStorage."
    },
    {
      question: "How do the report downloads work?",
      answer: "All games feature report download functionality. Complete a game to see your results, click the 'Download Report' button, and a beautiful result image with watermark will be generated including your score, stats, and game details for sharing."
    },
    {
      question: "Can I share my game results?",
      answer: "Yes! Each game has a 'Share Result' button that uses your device's native sharing capabilities. You can share results on social media platforms, messaging apps, email, or any app that supports image sharing."
    },
    {
      question: "What does 'shuffled questions' mean?",
      answer: "All games feature randomized content for fair gameplay: questions appear in random order, multiple choice options are shuffled, gallery images are randomized, and memory cards are arranged randomly. This ensures no two playthroughs are exactly the same."
    },
    {
      question: "How do game statistics work?",
      answer: "Your game performance is automatically tracked including games played, total score, individual game stats (best scores, average scores, completion times), and saved locally in your browser for offline access."
    },
    {
      question: "Are the games mobile-friendly?",
      answer: "Yes! All games are fully responsive and optimized for mobile devices with touch-friendly controls, responsive layouts that work on all screen sizes, and support for both portrait and landscape orientations."
    },
    {
      question: "How does the Character Memory Game work?",
      answer: "Cards are laid out face-down in a grid. Click cards to flip them and reveal character images, find matching pairs by remembering positions, with a timer tracking completion speed and move counter for scoring."
    },
    {
      question: "What's the difference between the quiz games?",
      answer: "Anime Quiz Challenge focuses on character recognition and scene identification, Anime Trivia Master covers anime history and plot details, Speed Quiz Challenge is fast-paced with countdown timers, and Anime Gallery Quiz uses visual scene recognition."
    },
    {
      question: "Can I play games offline?",
      answer: "Yes! Once the games page loads, you can play offline. Game stats are saved locally and will sync when you're back online."
    },
    {
      question: "How do I reset my game statistics?",
      answer: "Game statistics are stored in browser localStorage. To reset: open developer tools (F12), go to Application/Storage > Local Storage, find and delete entries starting with 'animeGamesStats', then refresh the page."
    },
    {
      question: "Are there plans for more games?",
      answer: "Yes! We're working on new anime games including multiplayer challenges, seasonal themed games, special event games, and new game modes with different difficulty levels."
    }
  ],
  'Technical & Troubleshooting': [
    {
      question: "Which browsers are supported?",
      answer: "Otazumi works best on modern browsers: Chrome, Firefox, Safari, Edge, and Opera. We recommend keeping your browser updated to the latest version for optimal performance."
    },
    {
      question: "Is Otazumi safe?",
      answer: "Yes, Otazumi is completely safe to use. We use industry-standard security measures including encrypted passwords (bcrypt), secure cloud storage, and no data tracking or selling."
    },
    {
      question: "Why am I getting a 'Video not found' error?",
      answer: "This can happen if: 1) The episode was recently removed, 2) The server is temporarily down, 3) There's a regional restriction. Try switching servers or report the issue via our Contact page."
    },
    {
      question: "The site is loading slowly. How can I fix this?",
      answer: "Try: clearing your browser cache and cookies, disabling browser extensions temporarily, checking your internet speed, using a wired connection instead of WiFi, or trying during off-peak hours."
    },
    {
      question: "Can I use Otazumi with a VPN?",
      answer: "Yes, you can use a VPN with Otazumi. However, some servers might be slower when accessed through certain VPN locations."
    }
  ],
  'Legal & Copyright': [
    {
      question: "Is watching anime on Otazumi legal?",
      answer: "We strive to comply with copyright laws. If you're a copyright holder and believe content infringes your rights, please review our DMCA policy and submit a takedown request."
    },
    {
      question: "What is your DMCA policy?",
      answer: "We respect copyright holders' rights. If you believe content on our site infringes your copyright, please visit our DMCA page to submit a proper takedown notice with all required information."
    },
    {
      question: "Do you own the anime content?",
      answer: "No, we do not own the anime content. We aggregate streaming links from various sources. All content belongs to their respective copyright holders."
    },
    {
      question: "How do you handle user privacy?",
      answer: "We take privacy seriously. We don't track your viewing habits, sell your data, or share your information with third parties. See our Terms of Service for full details."
    }
  ]
};

const FAQ = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedItem(expandedItem === key ? null : key);
  };

  const filterFAQs = () => {
    if (!searchQuery && selectedCategory === 'all') {
      return FAQ_DATA;
    }

    const filtered = {};
    Object.entries(FAQ_DATA).forEach(([category, questions]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) {
        return;
      }

      const matchingQuestions = questions.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchingQuestions.length > 0) {
        filtered[category] = matchingQuestions;
      }
    });

    return filtered;
  };

  const filteredFAQs = filterFAQs();
  const categories = ['all', ...Object.keys(FAQ_DATA)];

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <FontAwesomeIcon icon={faQuestionCircle} className="faq-icon" />
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Otazumi</p>
        </div>

        {/* Search Bar */}
        <div className="faq-search">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="faq-categories">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="faq-content">
          {Object.keys(filteredFAQs).length === 0 ? (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p className="hint">Try different keywords or browse all categories</p>
            </div>
          ) : (
            Object.entries(filteredFAQs).map(([category, questions]) => (
              <div key={category} className="faq-category-section">
                <h2 className="category-title">{category}</h2>
                <div className="faq-list">
                  {questions.map((item, index) => {
                    const key = `${category}-${index}`;
                    const isExpanded = expandedItem === key;
                    
                    return (
                      <div key={index} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleItem(category, index)}
                        >
                          <span>{item.question}</span>
                          <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`faq-toggle ${isExpanded ? 'rotate' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="faq-answer">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>Can't find what you're looking for? We're here to help!</p>
          <a href="/contact" className="contact-btn">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
