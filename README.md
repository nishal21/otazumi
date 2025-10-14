<div align="center">

# 🎌 Otazumi

### Your Ultimate Anime Streaming Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=netlify)](https://otazumi.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

### ❤️ Support the Developer

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=githubsponsors)](https://github.com/sponsors/nishal21)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/kingtanjiro)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/demon_king)

A modern, feature-rich anime streaming web application built with React, Vite, and Tailwind CSS. Watch thousands of anime series and movies with high-quality streaming, filler episode detection, subtitle downloads, and personalized profiles.

[🌟 Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Tech Stack](#️-tech-stack) • [📝 License](#-license)

![Otazumi Banner](public/preview.png)

</div>

---

## 🎯 Recent Updates (October 5, 2025)

### 🆕 What's New

**🔧 Technical Improvements**
- Converted AnimatedHeart component from styled-jsx to Tailwind CSS
- Removed styled-jsx dependency for better consistency
- Fixed React warnings about non-boolean jsx attributes
- Improved component performance and maintainability

**🆕 New Pages & Features**
- Added **Anime Video Downloader** page — search series, browse episodes, and open download links via a modal popup (modal appears below the navbar).
- Added **MAL / AniList view** button on anime pages — quick link to view the title on MyAnimeList and AniList for additional info and tracking.
- Launched **News** page — aggregated anime/manga news with categories and thumbnails.
- Improved **Quotes** page — expanded quote database, better generation UI, and easier sharing/download of quote images.

---

## ✨ Features

### 🎬 Core Streaming Features
- **Extensive Anime Library** - Browse thousands of anime series and movies
- **High-Quality Streaming** - Watch in HD/Full HD with multiple server options
- **Advanced Search** - Find anime quickly with powerful search functionality
- **Multiple Servers** - Automatic fallback if one server fails
- **Subtitle Support** - Multi-language subtitles with custom styling
- **Filler Episode Detection** - Clearly marked filler episodes with orange/amber color coding
- **Continue Watching** - Pick up right where you left off
- **Latest Updates** - Stay current with new episodes and releases
- **A-Z Listing** - Browse complete anime catalog alphabetically
- **Genre Categories** - Explore anime by genre, type, and status

### 💬 Anime Quotes Platform
- **Comprehensive Quote Database** - Access thousands of anime quotes from popular series
- **Multi-API Integration** - Powered by Jikan, Kitsu, AniList, and Fandom APIs for rich character data
- **Canvas-Based Image Generation** - Create beautiful quote images with character images and custom styling
- **Social Media Sharing** - Share quotes on 8+ platforms (Discord, Twitter, Reddit, Facebook, Pinterest, Instagram, Snapchat, WhatsApp)
- **Character Image Caching** - Fast loading with intelligent image caching system
- **Search & Filter** - Find quotes by anime, character, or keywords
- **Pagination Support** - Browse through extensive quote collections
- **Download Functionality** - Save quote images to your device
- **Responsive Design** - Beautiful interface that works on all devices

### 📰 Anime News Aggregator
- **Real-Time News Feed** - Stay updated with latest anime and manga news
- **RSS Feed Integration** - Aggregates news from Anime-Planet and other sources
- **Smart Categorization** - Automatically categorizes news as Anime, Manga, or Other
- **Image Extraction** - Displays news articles with thumbnails when available
- **Filter Options** - Filter news by category (All, Anime, Manga)
- **Responsive Card Layout** - Clean, modern news cards with publication dates
- **External Links** - Direct links to full articles on source websites
- **CORS Proxy Support** - Reliable news fetching with proxy integration

### 📥 Subtitle Download System
- **Search & Select** - Find anime and choose specific episodes
- **8 Languages Available** - English, Arabic, Spanish, French, German, Italian, Portuguese, Russian
- **Bulk Download** - Download multiple episodes at once with progress tracking
- **Episode Search** - Filter by episode number or title (great for long series!)
- **VTT Format** - Compatible with VLC, MPV, and most video players
- **Smart Language Matching** - Automatically finds preferred language or falls back
- **Independent Feature** - Download without streaming - perfect for offline prep

### 👤 User Profiles & Authentication
- **75 Anime Avatars** - Choose from iconic anime character-inspired profile pictures with character-specific traits
- **Anime Series Filter** - Browse avatars by 23 anime series (Naruto, One Piece, Dragon Ball, etc.)
- **Character Traits** - Each avatar has unique traits (e.g., NarutoOrangeNinjaFoxWhiskers, GokuOrangeSaiyanKamehameha)
- **Cloud Sync** - Sync data across devices when logged in (NeonDB)
- **Local Storage** - Works fully offline without account
- **Favorites Management** - Save and organize your anime collection
- **Watchlist** - Plan what to watch next
- **Watch History** - Track episodes you've watched
- **Profile Customization** - Change username and avatar anytime
- **Data Export/Import** - Download and upload your complete anime data (JSON)
- **Account Deletion Options** - Choose to delete server data, local data, or both

###  Email System
- **Password Reset** - Secure token-based password recovery (1 hour expiry)
- **Email Verification** - Verify email addresses (24 hour token expiry)
- **Welcome Emails** - Automatic welcome message for new users
- **Account Notifications** - Alerts for password/email changes
- **Beautiful Templates** - Responsive HTML emails with gradient design
- **Multiple Providers** - Support for Backend SMTP, Brevo, Resend, SendGrid
- **Development Mode** - Console logging for testing
- **Daily Signup Limit** - 300 registrations/day to maintain email reliability

### 🎨 User Experience
- **Dark Theme** - Beautiful gradient design easy on the eyes with consistent black background
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Filler Episode Indicators** - Orange/amber color coding, badges, and info tooltips
- **Social Media Preview** - Rich link previews with images on Discord, Twitter, Facebook, WhatsApp
- **PWA Support** - Install as native app on any device with custom install prompt
- **Offline Capability** - Service worker caches for faster loading
- **Prebuilt Fallback Cache** - Works even on first visit with slow/no internet
- **Fast Performance** - Optimized with Vite and lazy loading
- **Smooth Animations** - Polished transitions with framer-motion
- **No Intrusive Ads** - Clean, distraction-free experience

### 📊 Statistics & Tracking
- **Watch History Tracking** - Automatically records every episode you watch
- **Detailed Statistics Dashboard** - View comprehensive watching stats at `/statistics`
- **Time-based Filtering** - Filter stats by All Time, This Month, or This Week
- **Watch Time Calculation** - See total hours and episodes watched
- **Completion Rate** - Track how many episodes you finish
- **Unique Anime Counter** - Count distinct anime you've watched
- **Daily Averages** - Average episodes per day statistics
- **Most Active Day** - Find your most active watching day
- **Recent Activity** - View last 5 episodes watched with dates
- **Personalized Insights** - Get achievements and milestones
- **Progress Tracking** - Records progress every 30 seconds during playback
- **Completion Detection** - Marks episodes as completed at 90% watch time
- **Works Without Login** - Statistics available for all users via localStorage

### ❤️ Support Developer
- **Multiple Donation Options** - GitHub Sponsors, Buy Me a Coffee, Ko-fi
- **Dedicated Support Page** - Beautiful page explaining how to support at `/support`
- **Integrated Links** - Support buttons in footer, sidebar, and PWA install prompt
- **Non-Intrusive** - Visible but doesn't interrupt user experience
- **Highlighted Design** - Pink/purple gradients for easy discovery

### 🎨 Enhanced User Interface
- **Bigger Splash Screen** - Improved loading animation visibility on mobile devices
- **Optimized Loader Size** - 220px character GIF and 5em text on desktop
- **Responsive Scaling** - Adaptive sizes for tablet (180px/4em) and mobile (160px/3.5em)
- **Fixed Navigation Overlap** - Statistics page now has proper top padding
- **Consistent Dark Theme** - Beautiful black background throughout the app

### 🎥 Anime Video Downloader

- **Search & Download** - Search for anime series and open available download links for individual episodes.
- **Download Modal** - Links open via a modal popup that appears below the fixed navbar to avoid overlapping the header.
- **Third-party Links** - Download sources are provided by external services. Availability and safety depend on those providers; use caution when downloading.
- **Episode Search & Pagination** - Quickly find episodes using the episode search box and navigate large series with pagination.

### ��� Privacy & Security
- **Encrypted Passwords** - bcrypt hashing with 10 salt rounds
- **JWT Authentication** - Secure token-based auth
- **Secure Database** - NeonDB with SSL/TLS encryption
- **No Data Tracking** - We don't track or sell your data
- **GDPR Compliant** - Export and delete your data anytime
- **Session Management** - Automatic logout and security
- **Rate Limiting** - Protected against abuse

## �📋 Important Information

### 🚨 Registration Limits

To maintain reliable email delivery and ensure the best experience for all users:

- **Daily Registration Limit**: 300 new accounts per day
- **Why?**: We use Gmail's SMTP service which has a 500 emails/day limit. By limiting registrations to 300/day, we ensure reliable email delivery for:
  - Welcome emails
  - Email verification
  - Password reset emails
  - Account notifications

- **No Limits for Watching**: You can watch anime **without creating an account** - it's 100% free!
- **Account Benefits**: 
  - Cloud sync across devices
  - Personalized watchlist
  - Download subtitles
  - Track your favorites

If you see "Daily signup limit reached", please try again tomorrow. The limit resets every day at midnight.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/otazumi.git
cd otazumi

# Install dependencies
npm install
# or
yarn install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Deployment

**Netlify** (Recommended):
1. Push your code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically on push

**Vercel**:
```bash
npm install -g vercel
vercel
```

**Other Platforms**: Build with `npm run build` and deploy the `dist` folder.

## 📱 Progressive Web App (PWA)

### Mobile Installation
1. Open Otazumi in your mobile browser (Chrome, Safari, etc.)
2. Look for the "Add to Home Screen" or "Install App" option in your browser menu
3. Follow the prompts to install the app

### Desktop Installation
1. Open Otazumi in Chrome/Edge
2. Click the install icon in the address bar or use the app menu
3. The app will be installed as a native desktop application

### PWA Features
- **📴 Offline Support**: Basic caching for faster loading
- **🖥️ Native Experience**: Fullscreen without browser UI
- **🎯 App Icon**: Custom icon on home screen/launcher
- **⚡ Fast Loading**: Service worker caches resources
- **📲 Add to Home Screen**: Install on any device

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3.1** | UI library with hooks |
| **Vite 5.4.2** | Lightning-fast build tool |
| **Tailwind CSS 3.4.10** | Utility-first styling |
| **React Router DOM 6.26.1** | Client-side routing |
| **Axios 1.7.7** | HTTP client for APIs |

### Video Player
| Technology | Purpose |
|------------|---------|
| **Artplayer 5.1.7** | Video player core |
| **HLS.js 1.5.15** | HLS streaming support |
| **Artplayer Plugin HLS Quality** | Quality selection |

### UI Components & Icons
| Technology | Purpose |
|------------|---------|
| **FontAwesome 6.6.0** | Icon library |
| **Lucide React 0.447.0** | Additional icons |
| **Swiper 11.1.12** | Touch-enabled carousels |
| **Framer Motion** | Smooth animations |

### Database & Authentication
| Technology | Purpose |
|------------|---------|
| **Drizzle ORM 0.35.3** | Type-safe database ORM |
| **NeonDB** | Serverless Postgres |
| **bcryptjs 2.4.3** | Password hashing |
| **jsonwebtoken 9.0.2** | JWT authentication |

### PWA & Performance
| Technology | Purpose |
|------------|---------|
| **Vite PWA Plugin** | Service worker generation |
| **Workbox 7.1.0** | PWA runtime caching |
| **Vercel Analytics** | Performance monitoring |

### Development Tools

| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |

## 📖 Documentation

All documentation is included in this README. For specific topics:

- **Email System**: See [Email Configuration](#️-configuration) section below
- **User Profiles**: 75 anime avatars with character-specific traits, cloud sync with NeonDB, local storage support
- **Avatar System**: Browse by 23 anime series, each character has unique trait-based seeds
- **Registration Limits**: 300 signups/day to maintain email reliability (Gmail 500/day quota)
- **CORS Proxy**: Required for streaming - see [Required External Services](#required-external-services)
- **Support Developer**: Visit `/support` page or check footer/sidebar links
- **FAQ**: Check the FAQ section on the live website

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=https://your-anime-api.vercel.app/api
VITE_PROXY_URL=https://your-cors-proxy.workers.dev/?url=
VITE_M3U8_PROXY_URL=https://your-m3u8-proxy.vercel.app/m3u8-proxy?url=

# Database (NeonDB)
VITE_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Authentication
VITE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
VITE_EMAIL_PROVIDER=backend
VITE_EMAIL_SERVER_URL=https://your-email-server.vercel.app
VITE_APP_URL=https://your-app.netlify.app
VITE_FROM_EMAIL=noreply@otazumi.anime
VITE_FROM_NAME=Otazumi Anime

# Optional
VITE_WORKER_URL=https://worker1.workers.dev,https://worker2.workers.dev
VITE_BASE_IFRAME_URL=https://megaplay.buzz/stream/s-2
VITE_BASE_IFRAME_URL_2=https://vidwish.live/stream/s-2
```

### Required External Services

1. **Anime API**: Deploy [anime-api](https://github.com/itzzzme/anime-api) on Vercel
2. **CORS Proxy**: Setup Cloudflare Worker using [this gist](https://gist.github.com/itzzzme/180813be2c7b45eedc8ce8344c8dea3b)
3. **M3U8 Proxy** (Optional): Deploy [m3u8proxy](https://github.com/itzzzme/m3u8proxy)
4. **Email Server**: Deploy the email server from `/email-server` directory
5. **NeonDB Account**: Sign up at [neon.tech](https://neon.tech) for free Postgres database

## 📂 Project Structure

```
otazumi/
├── public/              # Static assets
│   ├── logo.png        # App logo
│   ├── manifest.json   # PWA manifest
│   └── robots.txt      # SEO robots file
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── banner/     # Banner component
│   │   ├── footer/     # Footer component
│   │   ├── navbar/     # Navigation bar
│   │   ├── player/     # Video player
│   │   ├── sidebar/    # Sidebar navigation
│   │   └── ui/         # Reusable UI components
│   ├── config/         # Configuration files
│   ├── context/        # React context providers
│   ├── db/             # Database schema and client
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── a2z/        # A-Z anime listing
│   │   ├── anime-news/ # Anime news aggregator
│   │   ├── anime-quotes/ # Anime quotes platform
│   │   ├── animeInfo/  # Anime details page
│   │   ├── category/   # Category browsing
│   │   ├── contact/    # Contact page
│   │   ├── dmca/       # DMCA takedown page
│   │   ├── faq/        # FAQ page
│   │   ├── Home/       # Homepage
│   │   ├── privacy/    # Privacy policy
│   │   ├── profile/    # User profile
│   │   ├── resetPassword/ # Password reset
│   │   ├── search/     # Search page
│   │   ├── statistics/ # Watch statistics
│   │   ├── subtitle-download/ # Subtitle download feature
│   │   ├── support/    # Support developer page
│   │   ├── terms/      # Terms of service
│   │   └── watch/      # Watch page
│   ├── services/       # API and service layers
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── userDataService.js
│   │   └── downloadService.js
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── email-server/       # Email SMTP server
├── .env.example        # Environment template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
└── README.md          # This file
```

## 🔨 Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:5173)
npm run host         # Start with host flag (accessible on network)

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint to check code quality
```

## 🌟 Key Features Walkthrough

### 1. Watch Anime
- Browse homepage for latest, trending, and popular anime
- Use search bar to find specific titles
- Click any anime to view details, episodes, and watch
- **Identify filler episodes** by orange/amber color and "FILLER" badge
- Click info icon (ℹ️) next to "Episodes" to learn about fillers
- Multiple server options with automatic fallback
- Resume watching from where you left off

### 2. Download Subtitles
- Navigate to "Download Subtitles" in sidebar
- Search for anime by title
- Select episodes individually or use "Select All"
- Use episode search to filter by number/title
- Choose language from dropdown (8 options)
- Click "Download Selected" to get VTT files

### 3. View Statistics
- Navigate to "Statistics" in sidebar menu
- View comprehensive watch history analytics
- Filter by All Time, This Month, or This Week
- See total hours watched and episodes completed
- Track unique anime watched and completion rate
- Check daily averages and most active day
- View recent activity with episode details
- Get personalized insights and achievements
- **Works without login** - uses localStorage for guest users

### 4. Create Profile
- Click "Sign In" → "Sign Up"
- Choose from 75 anime avatars (23 series including Naruto, One Piece, Dragon Ball)
- Filter avatars by anime series using horizontal tabs
- Each character has unique trait-based appearance
- Enter email, username, password
- Verify email (check inbox)
- Start syncing data across devices

### 5. Manage Data
- Add anime to Favorites (heart icon)
- Add to Watchlist (bookmark icon)
- View watch history in profile
- Export data as JSON backup
- Import data to restore

### 6. Explore Anime Quotes
- Navigate to "Anime Quotes" in the sidebar menu
- Browse thousands of quotes from popular anime series
- Search quotes by anime title, character name, or keywords
- Generate beautiful quote images with character artwork
- Share quotes on social media platforms (Discord, Twitter, Reddit, Facebook, etc.)
- Download quote images to your device
- Filter and paginate through extensive quote collections

### 7. Stay Updated with Anime News
- Visit "Anime News" in the sidebar menu
- Read the latest anime and manga news from multiple sources
- Filter news by category: All News, Anime, or Manga
- View news articles with thumbnails and publication dates
- Click "Read more" to visit the full article on the source website
- Stay informed about industry updates, releases, and announcements

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation if needed
- Keep PRs focused on single features

## 🐛 Known Issues & Limitations

- **Daily Signup Limit**: 300 accounts/day due to Gmail email quota
- **CORS**: Some streaming servers may require proxy setup
- **PWA**: iOS has limited PWA support compared to Android
- **Browser Support**: Best experience on Chrome/Edge/Firefox (latest versions)

## 🔐 Security

- Passwords encrypted with bcrypt (10 salt rounds)
- JWT tokens for authentication
- Environment variables for secrets
- HTTPS required in production
- Rate limiting on API endpoints
- SQL injection prevention via ORM
- XSS protection enabled

**Found a security issue?** Please email nishalamv@gmail.com instead of opening an issue.

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anime API**: [itzzzme/anime-api](https://github.com/itzzzme/anime-api)
- **M3U8 Proxy**: [itzzzme/m3u8proxy](https://github.com/itzzzme/m3u8proxy)
- **Artplayer**: Amazing video player library
- **AnimePaheDownloader**: Reference implementation used while building the Anime Video Downloader - [IamHomen/AnimePaheDownloader](https://github.com/IamHomen/AnimePaheDownloader) (thank you!)
- **NeonDB**: Serverless Postgres hosting
- **Netlify**: Deployment and hosting
- All anime fans who inspired this project! 🎌

## 📞 Support & Contact

- **Live Demo**: [otazumi.netlify.app](https://otazumi.netlify.app)
- **Issues**: [GitHub Issues](https://github.com/nishal21/otazumi/issues)
- **Email**: nishalamv@gmail.com
- **Documentation**: Check this README for detailed guides
- **Support Developer**: Visit [/support](https://otazumi.netlify.app/support) page

### ❤️ Ways to Support

If you enjoy Otazumi, consider supporting the developer:

- ⭐ **Star on GitHub**: [github.com/nishal21/otazumi](https://github.com/nishal21/otazumi)
- 💖 **GitHub Sponsors**: [github.com/sponsors/nishal21](https://github.com/sponsors/nishal21)
- ☕ **Buy Me a Coffee**: [buymeacoffee.com/kingtanjiro](https://buymeacoffee.com/kingtanjiro)
- 🎁 **Ko-fi**: [ko-fi.com/demon_king](https://ko-fi.com/demon_king)
- 📢 **Share with friends** and spread the word
- 🐛 **Report bugs** to help improve the app
- 💡 **Suggest features** for future development

## 🚀 Roadmap

### ✅ Recently Added (October 2025)
- [x] **Statistics Dashboard** - Comprehensive watch history analytics
- [x] **Auto Watch History Recording** - Tracks every episode automatically
- [x] **Progress Tracking** - Updates every 30 seconds during playback
- [x] **Completion Detection** - Marks episodes completed at 90% watch time
- [x] **Enhanced Splash Screen** - Bigger loader for better mobile visibility
- [x] **Fixed Navigation Overlap** - Statistics page heading no longer hidden
- [x] **Works for All Users** - Statistics available without login
- [x] 75 Anime character avatars with trait-based seeds
- [x] Avatar filter by anime series (23 series)
- [x] Support developer page and integration
- [x] Framer Motion animations
- [x] Enhanced PWA install prompt with support links

### 🔜 Coming Soon
- [ ] Mobile apps (iOS/Android)
- [ ] Discord integration
- [ ] Watch parties (sync viewing)
- [x] User reviews and ratings
- [ ] Anime recommendations algorithm
- [ ] Genre-based statistics breakdown
- [ ] Chromecast support
- [x] Download episodes
---

<div align="center">

Made with ❤️ by Nishal K

### 💖 Support This Project

If you find Otazumi useful, please consider supporting:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-EA4AAA?style=for-the-badge&logo=githubsponsors)](https://github.com/sponsors/nishal21)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/kingtanjiro)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/demon_king)

⭐ **Star us on GitHub** if you find this project useful! ⭐

[Report Bug](https://github.com/nishal21/otazumi/issues) • [Request Feature](https://github.com/nishal21/otazumi/issues) • [Documentation](https://github.com/nishal21/otazumi/wiki)

</div>
