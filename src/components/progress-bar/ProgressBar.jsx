const ProgressBar = ({ progress, className = '', height = 'h-1', color = 'bg-blue-500' }) => {
  if (!progress || progress <= 0) return null

  return (
    <div className={`w-full ${height} bg-gray-700/50 rounded-full overflow-hidden ${className}`}>
      <div
        className={`${height} ${color} transition-all duration-300 ease-out`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

export default ProgressBar