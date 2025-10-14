import { useState, useEffect } from 'react';
import { BarChart, Clock, Heart, TrendingUp, Calendar, Award, Eye } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { UserDataService } from '@/src/services/userDataService';

const StatsDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week

  useEffect(() => {
    // Load stats for all users (authenticated and guest)
    loadStats();
  }, [isAuthenticated, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get user data from different sources
      const watchHistory = await UserDataService.getWatchHistory(user?.id);
      const favorites = await UserDataService.getFavorites(user?.id);
      const watchlist = await UserDataService.getWatchlist(user?.id);
      
      // Filter by time range
      const now = Date.now();
      const timeFilters = {
        week: now - 7 * 24 * 60 * 60 * 1000,
        month: now - 30 * 24 * 60 * 60 * 1000,
        all: 0,
      };

      const filteredHistory = watchHistory.filter(item => 
        new Date(item.watchedAt).getTime() > timeFilters[timeRange]
      );

      // Calculate total watch time (assuming 24 minutes per episode)
      const totalEpisodes = filteredHistory.length;
      const totalMinutes = totalEpisodes * 24;
      const totalHours = Math.floor(totalMinutes / 60);

      // Count unique anime
      const uniqueAnime = new Set(filteredHistory.map(item => item.animeId));
      const uniqueAnimeCount = uniqueAnime.size;

      // Calculate completion rate
      const completedEpisodes = filteredHistory.filter(item => item.completed).length;
      const completionRate = totalEpisodes > 0 ? (completedEpisodes / totalEpisodes * 100).toFixed(1) : 0;

      // Daily watching pattern
      const dailyStats = {};
      filteredHistory.forEach(item => {
        const date = new Date(item.watchedAt).toLocaleDateString();
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      });

      // Get most watched day
      const mostWatchedDay = Object.entries(dailyStats)
        .sort((a, b) => b[1] - a[1])[0];

      // Calculate average episodes per day
      const daysActive = Object.keys(dailyStats).length;
      const avgEpisodesPerDay = daysActive > 0 ? (totalEpisodes / daysActive).toFixed(1) : 0;

      setStats({
        totalHours,
        totalEpisodes,
        uniqueAnimeCount,
        favoritesCount: favorites.length,
        watchlistCount: watchlist.length,
        completionRate,
        avgEpisodesPerDay,
        mostWatchedDay: mostWatchedDay ? mostWatchedDay[0] : 'N/A',
        mostWatchedDayCount: mostWatchedDay ? mostWatchedDay[1] : 0,
        daysActive,
        recentActivity: filteredHistory.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed authentication check - statistics work for all users via localStorage

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-white/60 mt-4">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <BarChart className="w-8 h-8 text-pink-500" />
          Your Watching Statistics
        </h1>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          {['all', 'month', 'week'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Hours */}
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-pink-400" />
            <span className="text-3xl font-bold">{stats?.totalHours || 0}</span>
          </div>
          <p className="text-white/80 font-semibold">Hours Watched</p>
          <p className="text-xs text-white/60 mt-1">{stats?.totalEpisodes || 0} episodes</p>
        </div>

        {/* Unique Anime */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold">{stats?.uniqueAnimeCount || 0}</span>
          </div>
          <p className="text-white/80 font-semibold">Anime Watched</p>
          <p className="text-xs text-white/60 mt-1">Unique titles</p>
        </div>

        {/* Favorites */}
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-bold">{stats?.favoritesCount || 0}</span>
          </div>
          <p className="text-white/80 font-semibold">Favorites</p>
          <p className="text-xs text-white/60 mt-1">Loved anime</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold">{stats?.completionRate || 0}%</span>
          </div>
          <p className="text-white/80 font-semibold">Completion Rate</p>
          <p className="text-xs text-white/60 mt-1">Episodes finished</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Average per Day */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">Daily Average</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats?.avgEpisodesPerDay || 0}</p>
          <p className="text-sm text-white/60 mt-1">episodes per day</p>
        </div>

        {/* Most Active Day */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold">Most Active Day</h3>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats?.mostWatchedDay || 'N/A'}</p>
          <p className="text-sm text-white/60 mt-1">{stats?.mostWatchedDayCount || 0} episodes watched</p>
        </div>

        {/* Days Active */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-semibold">Days Active</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-400">{stats?.daysActive || 0}</p>
          <p className="text-sm text-white/60 mt-1">days with activity</p>
        </div>
      </div>

      {/* Watchlist Status */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Your Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">{stats?.watchlistCount || 0}</p>
            <p className="text-sm text-white/60">Plan to Watch</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats?.uniqueAnimeCount || 0}</p>
            <p className="text-sm text-white/60">Watching</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">-</p>
            <p className="text-sm text-white/60">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{stats?.favoritesCount || 0}</p>
            <p className="text-sm text-white/60">Favorites</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="font-semibold">{item.title || item.animeTitle || `Anime ${item.animeId}`}</p>
                  <p className="text-sm text-white/60">Episode {item.episodeNumber}</p>
                </div>
                <p className="text-xs text-white/40">
                  {new Date(item.watchedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-center py-4">No recent activity</p>
        )}
      </div>

      {/* Insights */}
      <div className="mt-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3">📊 Insights</h3>
        <ul className="space-y-2 text-white/80">
          {stats?.totalHours >= 100 && (
            <li>🎉 Wow! You've watched over 100 hours of anime. You're a true fan!</li>
          )}
          {stats?.completionRate >= 80 && (
            <li>⭐ Your {stats.completionRate}% completion rate shows great dedication!</li>
          )}
          {stats?.avgEpisodesPerDay >= 3 && (
            <li>🔥 You're watching an average of {stats.avgEpisodesPerDay} episodes per day!</li>
          )}
          {stats?.favoritesCount >= 10 && (
            <li>❤️ You have {stats.favoritesCount} favorites - you know what you love!</li>
          )}
          {(!stats?.totalEpisodes || stats.totalEpisodes === 0) && (
            <li>👋 Start watching anime to see your personalized statistics here!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StatsDashboard;
