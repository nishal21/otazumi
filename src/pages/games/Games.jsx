import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faGamepad,
  faTrophy,
  faStar,
  faPlay,
  faQuestionCircle,
  faImages,
  faMemory,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const Games = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalScore: 0,
    gamesPlayed: 0
  });

  const games = [
    {
      id: 'anime-quiz',
      title: 'Anime Quiz Challenge',
      description: 'Test your anime knowledge with character and scene recognition quizzes',
      icon: faBrain,
      difficulty: 'Medium',
      players: '1 Player',
      categories: ['Characters', 'Scenes', 'Trivia'],
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      route: '/games/anime-quiz'
    },
    {
      id: 'character-memory',
      title: 'Character Memory Game',
      description: 'Match anime character cards in this memory challenge',
      icon: faMemory,
      difficulty: 'Easy',
      players: '1 Player',
      categories: ['Memory', 'Characters'],
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      textColor: 'text-pink-400',
      route: '/games/character-memory'
    },
    {
      id: 'anime-trivia',
      title: 'Anime Trivia Master',
      description: 'Answer questions about anime history, characters, and plot details',
      icon: faQuestionCircle,
      difficulty: 'Medium',
      players: '1 Player',
      categories: ['Trivia', 'Knowledge'],
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-400',
      route: '/games/anime-trivia'
    },
    {
      id: 'speed-quiz',
      title: 'Speed Quiz Challenge',
      description: 'Race against time to answer as many questions as possible',
      icon: faClock,
      difficulty: 'Hard',
      players: '1 Player',
      categories: ['Speed', 'Trivia'],
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
      route: '/games/speed-quiz'
    },
    {
      id: 'anime-gallery',
      title: 'Anime Gallery Quiz',
      description: 'Identify anime series from iconic scene screenshots',
      icon: faImages,
      difficulty: 'Medium',
      players: '1 Player',
      categories: ['Scenes', 'Series'],
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      textColor: 'text-indigo-400',
      route: '/games/anime-gallery'
    }
  ];

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem('animeGamesStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'hard': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
        <div className="relative container mx-auto px-4 py-8 lg:py-16">
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
              <FontAwesomeIcon icon={faGamepad} className="text-2xl lg:text-4xl text-purple-400" />
              <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Anime Games
              </h1>
            </div>
            <p className="text-base lg:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Challenge yourself with exciting anime-themed games and quizzes. Test your knowledge, memory, and speed!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faGamepad} className="text-blue-400 text-lg lg:text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl lg:text-2xl font-bold text-blue-400 truncate">{stats.gamesPlayed}</p>
                  <p className="text-xs lg:text-sm text-gray-400">Games Played</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-lg lg:text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl lg:text-2xl font-bold text-yellow-400 truncate">{stats.totalScore.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-400">Total Score</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faStar} className="text-purple-400 text-lg lg:text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl lg:text-2xl font-bold text-purple-400 truncate">{games.length}</p>
                  <p className="text-xs lg:text-sm text-gray-400">Available Games</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 pb-16 lg:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.route}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 ${game.bgColor} rounded-xl flex items-center justify-center border ${game.borderColor} flex-shrink-0`}>
                    <FontAwesomeIcon icon={game.icon} className={`text-xl lg:text-2xl ${game.textColor}`} />
                  </div>
                  <div className="flex flex-col gap-1 ml-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)} whitespace-nowrap`}>
                      {game.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 whitespace-nowrap">
                      {game.players}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-3">
                    {game.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {game.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300 whitespace-nowrap"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Play Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FontAwesomeIcon icon={faPlay} className="text-xs" />
                    <span>Play Now</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                    <FontAwesomeIcon icon={faPlay} className="text-xs text-white group-hover:text-purple-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 lg:p-8 border border-purple-500/20">
            <div className="text-center">
              <FontAwesomeIcon icon={faStar} className="text-2xl lg:text-3xl text-purple-400 mb-3 lg:mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">More Games Coming Soon!</h3>
              <p className="text-gray-400 text-sm lg:text-base max-w-md mx-auto leading-relaxed">
                We're working on exciting new anime games including multiplayer challenges,
                seasonal events, and special themed content. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;