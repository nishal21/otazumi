import { useNavigate } from 'react-router-dom'
import { Play, RotateCcw } from 'lucide-react'

const ResumeButton = ({ animeId, resumeInfo, className = '' }) => {
  const navigate = useNavigate()

  if (!resumeInfo?.canResume) return null

  const handleResume = () => {
    const episodeParam = resumeInfo.episodeId ? `?ep=${resumeInfo.episodeId}` : ''
    navigate(`/watch/${animeId}${episodeParam}`)
  }

  return (
    <button
      onClick={handleResume}
      className={`group relative flex items-center gap-2 px-3 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
      title={`Resume Episode ${resumeInfo.episodeNumber || resumeInfo.episodeId} (${resumeInfo.progressPercentage}% watched)`}
    >
      <RotateCcw className="w-4 h-4" />
      <span className="text-sm font-medium">
        Resume Ep {resumeInfo.episodeNumber || resumeInfo.episodeId}
      </span>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-white/80 transition-all duration-300"
          style={{ width: `${resumeInfo.progressPercentage}%` }}
        />
      </div>
    </button>
  )
}

export default ResumeButton