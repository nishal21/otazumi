import { useState, useEffect } from 'react'
import { UserDataService } from '../services/userDataService'
import { useAuth } from '../context/AuthContext'

const useWatchProgress = (animeId, episodeId) => {
  const { user } = useAuth()
  const [watchProgress, setWatchProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load watch progress from database (for logged-in users) or localStorage
  useEffect(() => {
    const loadWatchProgress = async () => {
      if (!animeId) return

      setIsLoading(true)
      try {
        if (user?.id) {
          // Load from database for logged-in users
          const history = await UserDataService.getWatchHistory(user.id)
          const animeHistory = history.find(item => item.animeId === animeId)

          if (animeHistory && episodeId) {
            const episodeProgress = animeHistory.episodes?.find(ep => ep.episodeId === episodeId)
            if (episodeProgress) {
              setWatchProgress({
                currentTime: episodeProgress.progress || 0,
                duration: episodeProgress.duration || 0,
                completed: episodeProgress.completed || false,
                lastWatched: episodeProgress.lastWatched,
                source: 'database'
              })
            }
          } else if (animeHistory) {
            // Get the last watched episode for this anime
            const lastEpisode = animeHistory.episodes?.sort((a, b) =>
              new Date(b.lastWatched) - new Date(a.lastWatched)
            )[0]

            if (lastEpisode) {
              setWatchProgress({
                episodeId: lastEpisode.episodeId,
                episodeNumber: lastEpisode.episodeNumber,
                currentTime: lastEpisode.progress || 0,
                duration: lastEpisode.duration || 0,
                completed: lastEpisode.completed || false,
                lastWatched: lastEpisode.lastWatched,
                source: 'database'
              })
            }
          }
        } else {
          // Load from localStorage for anonymous users
          const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]')
          const animeEntry = continueWatching.find(item =>
            item.data_id === animeId || item.id === animeId
          )

          if (animeEntry) {
            if (episodeId) {
              // Specific episode progress
              if (animeEntry.episodeId === episodeId) {
                setWatchProgress({
                  currentTime: animeEntry.leftAt || 0,
                  duration: 0, // Not stored in localStorage
                  completed: false,
                  lastWatched: new Date().toISOString(),
                  source: 'localStorage'
                })
              }
            } else {
              // Last watched episode for this anime
              setWatchProgress({
                episodeId: animeEntry.episodeId,
                episodeNumber: animeEntry.episodeNum,
                currentTime: animeEntry.leftAt || 0,
                duration: 0,
                completed: false,
                lastWatched: new Date().toISOString(),
                source: 'localStorage'
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading watch progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchProgress()
  }, [animeId, episodeId, user?.id])

  // Save watch progress
  const saveProgress = async (progressData) => {
    try {
      if (user?.id) {
        // Save to database for logged-in users
        await UserDataService.addToWatchHistory(user.id, {
          animeId,
          episodeId: progressData.episodeId,
          episodeNumber: progressData.episodeNumber,
          progress: progressData.currentTime,
          duration: progressData.duration,
          completed: progressData.completed,
          lastWatched: new Date().toISOString()
        })
      } else {
        // Save to localStorage for anonymous users
        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]')
        const completedEpisodes = JSON.parse(localStorage.getItem('completedEpisodes') || '{}')
        
        const newEntry = {
          id: animeId,
          data_id: animeId,
          episodeId: progressData.episodeId,
          episodeNum: progressData.episodeNumber,
          leftAt: progressData.currentTime,
          poster: progressData.poster,
          title: progressData.title,
          japanese_title: progressData.japaneseTitle,
          adultContent: progressData.adultContent
        }

        const existingIndex = continueWatching.findIndex(item =>
          item.data_id === animeId || item.id === animeId
        )

        if (existingIndex !== -1) {
          continueWatching[existingIndex] = newEntry
        } else {
          continueWatching.push(newEntry)
        }

        // Track completed episodes
        if (progressData.completed) {
          if (!completedEpisodes[animeId]) {
            completedEpisodes[animeId] = []
          }
          if (!completedEpisodes[animeId].includes(progressData.episodeId)) {
            completedEpisodes[animeId].push(progressData.episodeId)
          }
        }

        localStorage.setItem('continueWatching', JSON.stringify(continueWatching))
        localStorage.setItem('completedEpisodes', JSON.stringify(completedEpisodes))
      }

      // Update local state
      setWatchProgress(prev => ({
        ...prev,
        ...progressData,
        lastWatched: new Date().toISOString()
      }))

    } catch (error) {
      console.error('Error saving watch progress:', error)
    }
  }

  // Toggle episode watched status
  const toggleEpisodeWatched = async (episodeIdParam, episodeNumber, episodeData = {}) => {
    try {
      if (user?.id) {
        // For logged-in users, toggle in database
        // This would need database implementation
        console.log('Toggle episode watched for logged-in user:', episodeIdParam)
        return
      } else {
        // For anonymous users, toggle in localStorage
        const completedEpisodes = JSON.parse(localStorage.getItem('completedEpisodes') || '{}')
        const animeCompletedEpisodes = completedEpisodes[animeId] || []

        const isCurrentlyWatched = animeCompletedEpisodes.includes(episodeIdParam)

        if (isCurrentlyWatched) {
          // Mark as unwatched - remove from completed list
          completedEpisodes[animeId] = animeCompletedEpisodes.filter(id => id !== episodeIdParam)
        } else {
          // Mark as watched - add to completed list
          if (!completedEpisodes[animeId]) {
            completedEpisodes[animeId] = []
          }
          completedEpisodes[animeId].push(episodeIdParam)
        }

        localStorage.setItem('completedEpisodes', JSON.stringify(completedEpisodes))

        // Update continue watching entry if this was the last watched episode
        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]')
        const animeEntryIndex = continueWatching.findIndex(item =>
          item.data_id === animeId || item.id === animeId
        )

        if (animeEntryIndex !== -1) {
          const animeEntry = continueWatching[animeEntryIndex]
          if (animeEntry.episodeId === episodeIdParam && !isCurrentlyWatched) {
            // If marking as watched and this was the current episode, update progress
            animeEntry.leftAt = 0 // Mark as completed
            continueWatching[animeEntryIndex] = animeEntry
            localStorage.setItem('continueWatching', JSON.stringify(continueWatching))
          }
        }

        return !isCurrentlyWatched // Return new watched status
      }
    } catch (error) {
      console.error('Error toggling episode watched status:', error)
      return null
    }
  }

  // Get resume information for an anime
  const getResumeInfo = (animeIdParam) => {
    try {
      if (user?.id) {
        // For logged-in users, check database
        // This would need database implementation
        return null
      } else {
        // For anonymous users, check localStorage
        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]')
        const animeEntry = continueWatching.find(item =>
          item.data_id === animeIdParam || item.id === animeIdParam
        )

        if (animeEntry && animeEntry.leftAt > 0) {
          const progressPercentage = animeEntry.leftAt > 0 ? Math.min((animeEntry.leftAt / 100) * 100, 100) : 0
          return {
            canResume: true,
            progressPercentage: progressPercentage,
            episodeId: animeEntry.episodeId,
            episodeNumber: animeEntry.episodeNum,
            currentTime: animeEntry.leftAt
          }
        }

        return null
      }
    } catch (error) {
      console.error('Error getting resume info:', error)
      return null
    }
  }

  // Get episode progress information
  const getEpisodeProgress = (animeIdParam, episodeNumber) => {
    try {
      if (user?.id) {
        // For logged-in users, check database
        // This would need database implementation
        return null
      } else {
        // For anonymous users, check localStorage
        const completedEpisodes = JSON.parse(localStorage.getItem('completedEpisodes') || '{}')
        const animeCompletedEpisodes = completedEpisodes[animeIdParam] || []

        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]')
        const animeEntry = continueWatching.find(item =>
          item.data_id === animeIdParam || item.id === animeIdParam
        )

        // Check if this specific episode is completed
        const episodeId = `${animeIdParam}-episode-${episodeNumber}`
        const isCompleted = animeCompletedEpisodes.includes(episodeId)

        // Check if this is the current watching episode
        const isCurrentEpisode = animeEntry && animeEntry.episodeNum === episodeNumber

        return {
          isCompleted,
          isCurrentEpisode,
          progress: isCurrentEpisode ? animeEntry.leftAt || 0 : 0,
          episodeId: episodeId
        }
      }
    } catch (error) {
      console.error('Error getting episode progress:', error)
      return null
    }
  }

  return {
    watchProgress,
    isLoading,
    saveProgress,
    getResumeInfo,
    getEpisodeProgress,
    toggleEpisodeWatched
  }
}

export default useWatchProgress