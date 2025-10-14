# Changelog

All notable changes to Otazumi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## ❤️ Support the Developer

If you enjoy using Otazumi, please consider supporting the development:

- 💖 **GitHub Sponsors**: [github.com/sponsors/nishal21](https://github.com/sponsors/nishal21)
- ☕ **Buy Me a Coffee**: [buymeacoffee.com/kingtanjiro](https://buymeacoffee.com/kingtanjiro)
- 🎁 **Ko-fi**: [ko-fi.com/demon_king](https://ko-fi.com/demon_king)

---

## [Unreleased]

### Added - October 2, 2025

#### 🎨 Avatar System Enhancements
- **75 Anime Character Avatars**: Expanded from 20 to 75 unique anime character-inspired avatars
- **23 Anime Series**: Characters from Naruto, One Piece, Dragon Ball Z, My Hero Academia, Jujutsu Kaisen, Demon Slayer, Attack on Titan, Death Note, Bleach, Fullmetal Alchemist, One Punch Man, Sword Art Online, Tokyo Ghoul, Darling in the Franxx, Hunter x Hunter, Chainsaw Man, Spy x Family, Mob Psycho 100, Steins;Gate, Code Geass, Haikyuu!!, Violet Evergarden, and Re:Zero
- **Character Trait-Based Seeds**: Each avatar has unique identifier reflecting their personality
  - Examples: `NarutoOrangeNinjaFoxWhiskers`, `GokuOrangeSaiyanKamehameha`, `LuffyStrawHatRubberPirate`
- **Anime Series Filter**: Horizontal scrollable tabs to filter avatars by anime series
- **Character Count Display**: Shows number of available characters per series
- **Gender Classification**: 43 male, 32 female characters properly categorized
- **9 Anime Categories**: Shonen, Seinen, Shoujo, Psychological, Fantasy, Sci-Fi, Slice of Life, Sports, Mecha

#### ❤️ Support Developer Features
- **Dedicated Support Page** (`/support`): Beautiful page with all donation options
  - Three donation cards: GitHub Sponsors, Buy Me a Coffee, Ko-fi
  - "Why Support?" section explaining benefits (Development, Server Costs, New Features, Community)
  - Thank you message section
  - Alternative support options (Star, Share, Report bugs, Suggest features)
- **Footer Integration**: Added "❤️ Support Developer" link (highlighted in pink)
  - Separate support links section with all three platforms
  - Links appear above copyright notice
- **PWA Install Prompt**: Added support section at bottom of install modal
  - Compact buttons for GitHub, Coffee, and Ko-fi
  - Non-intrusive placement after install benefits
- **Sidebar Menu**: "❤️ Support Developer" as 3rd menu item
  - Pink gradient background for visibility
  - Special heart icon (faHandHoldingHeart)
  - Highlighted with pink/purple gradient and border
- **App Router**: Added `/support` route in App.jsx

#### 📦 Dependencies
- **framer-motion**: Added for smooth animations on support page
- **lucide-react 0.447.0**: Updated for additional icons (Heart, Coffee, DollarSign, Github)

### Changed

#### 🎨 UI/UX Improvements
- **Support Page Background**: Changed from gradient to solid black (#0a0a0a) for consistency
- **Avatar URLs**: Switched from random seeds to character-specific trait-based seeds
- **Avatar Style**: All characters now use consistent `adventurer` style from DiceBear API v9
- **Avatar Selector**: Enhanced with horizontal scrollable anime series tabs
- **Navigation**: Support links integrated throughout the app for better discovery

#### 🔧 Technical Improvements
- **Avatar Configuration**: Reorganized `src/config/avatars.js` with proper structure
  - Added `animeSeries` array with metadata (23 series)
  - Each avatar includes: id, name, anime, category, gender, theme, gradient, imageUrl, bgColor, characterEmoji
- **Helper Functions**: Added utility functions in avatars.js
  - `getAvatarsByAnime()` - Filter by anime series
  - `getAvatarsByGender()` - Filter by gender
  - `getAvatarsByCategory()` - Filter by category
  - `getAllAnimeSeries()` - Get unique series list
  - `getAnimeByCategory()` - Grouped by category
  - `getGenderStats()` - Count statistics
  - `getAnimeSeriesInfo()` - Return series metadata

### Fixed

#### 🐛 Bug Fixes
- **Avatar Loading**: Fixed DiceBear API image loading issues
  - Removed invalid hair parameters that caused fallback to emojis
  - Simplified URLs to use only seed parameter
- **Broken Emojis**: Fixed corrupted emoji characters
  - Naruto: 🍥 (ramen)
  - Lelouch: 👑 (crown)
  - Eren: 🗡️ (sword)
  - Subaru: 🔄 (loop)
- **PWA Modal Z-Index**: Fixed PWA install prompt being blocked by navbar
  - Changed from z-[9999] to z-[10000000]
  - Now appears above navbar (z-[1000000])
- **Avatar Gender Appearance**: Resolved issues with character gender visual representation
  - All characters now use consistent adventurer style
  - Character-specific seeds ensure unique appearances

### Documentation

#### 📖 README Updates
- Added "Support Developer" section to features
- Updated avatar count from 20 to 75
- Added anime series filter documentation
- Added character trait-based seeds explanation
- Included support page information
- Updated technology stack with framer-motion
- Added support links to Support & Contact section
- Created "Ways to Support" section with all donation links
- Added "Recently Added" section to Roadmap

#### 📋 New Documentation
- **SUPPORT_INTEGRATION.md**: Complete documentation of support system integration
  - Overview of all support links
  - Changes made to each file
  - Design highlights
  - User journey
  - Mobile optimization
  - Testing checklist
  - Future enhancements

## [Previous Version]

### Features from Earlier Releases
- Core streaming functionality
- 20 anime avatars
- Subtitle download system (8 languages)
- User authentication and profiles
- Cloud sync with NeonDB
- Email system (welcome, verification, password reset)
- PWA support
- Filler episode detection
- Watch history and favorites
- Data export/import
- Daily registration limits (300/day)

---

## Support Links

- **GitHub Repository**: https://github.com/nishal21/otazumi
- **GitHub Sponsors**: https://github.com/sponsors/nishal21
- **Buy Me a Coffee**: https://buymeacoffee.com/kingtanjiro
- **Ko-fi**: https://ko-fi.com/demon_king

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for ways to contribute to Otazumi.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
