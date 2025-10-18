import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    season: searchParams.get('season') || '',
    year: searchParams.get('year') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    genre: searchParams.get('genre') || ''
  })

  const seasons = [
    { value: '', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))
  years.unshift({ value: '', label: 'All Years' })

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'finished', label: 'Finished' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'upcoming', label: 'Upcoming' }
  ]

  const types = [
    { value: '', label: 'All Types' },
    { value: 'tv', label: 'TV Series' },
    { value: 'movie', label: 'Movie' },
    { value: 'ova', label: 'OVA' },
    { value: 'ona', label: 'ONA' },
    { value: 'special', label: 'Special' }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // Build search params
    const params = new URLSearchParams()

    if (filters.keyword.trim()) {
      params.set('keyword', filters.keyword.trim())
    }
    if (filters.season) {
      params.set('season', filters.season)
    }
    if (filters.year) {
      params.set('year', filters.year)
    }
    if (filters.status) {
      params.set('status', filters.status)
    }
    if (filters.type) {
      params.set('type', filters.type)
    }
    if (filters.genre) {
      params.set('genre', filters.genre)
    }

    // Reset to page 1 when searching
    params.set('page', '1')

    // Navigate to search results
    navigate(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      keyword: '',
      season: '',
      year: '',
      status: '',
      type: '',
      genre: ''
    })
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Advanced Search</h2>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Keyword
          </label>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            placeholder="Enter anime title, character, or studio..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Season and Year Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Premiered Season
            </label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {seasons.map(season => (
                <option key={season.value} value={season.value} className="bg-gray-800">
                  {season.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Premiered Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year.value} value={year.value} className="bg-gray-800">
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status and Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value} className="bg-gray-800">
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value} className="bg-gray-800">
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 font-medium"
          >
            Search Anime
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdvancedSearch