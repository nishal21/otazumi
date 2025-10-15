import { useState, useEffect } from 'react'
import { KWIK, ANIME } from '../../config/config'
import { db } from '../../db/index.js'

const Health = () => {
  const [healthStatus, setHealthStatus] = useState({
    api: { status: 'checking', details: {} },
    database: { status: 'checking', details: {} },
    serviceWorker: { status: 'checking', details: {} },
    overall: { status: 'checking', details: {} },
    viewers: { count: 0, status: 'checking', lastUpdated: null, source: null }
  })

  useEffect(() => {
    checkHealth()
    // Start real-time viewer tracking
    fetchViewerCount()
    const viewerInterval = setInterval(fetchViewerCount, 30000) // Update every 30 seconds

    return () => clearInterval(viewerInterval)
  }, [])

  const fetchViewerCount = async () => {
    try {
      // Try multiple sources for real-time viewer data

      // Option 1: Custom backend API (recommended)
      try {
        const response = await fetch('/api/viewers')
        if (response.ok) {
          const data = await response.json()
          setHealthStatus(prev => ({
            ...prev,
            viewers: {
              count: data.count || 0,
              status: 'healthy',
              lastUpdated: new Date().toISOString(),
              source: 'Backend API'
            }
          }))
          return
        }
      } catch (apiError) {
        console.log('Backend API not available:', apiError)
      }

      // Option 2: Google Analytics Real Time API (if configured)
      const GA_PROPERTY_ID = process.env.REACT_APP_GA_PROPERTY_ID
      const GA_API_KEY = process.env.REACT_APP_GA_API_KEY

      if (GA_PROPERTY_ID && GA_API_KEY) {
        try {
          const gaResponse = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runRealtimeReport?key=${GA_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }],
                limit: 10000
              })
            }
          )

          if (gaResponse.ok) {
            const gaData = await gaResponse.json()
            const totalViewers = gaData.rows?.reduce((sum, row) =>
              sum + parseInt(row.metricValues[0].value), 0) || 0

            setHealthStatus(prev => ({
              ...prev,
              viewers: {
                count: totalViewers,
                status: 'healthy',
                lastUpdated: new Date().toISOString(),
                source: 'Google Analytics'
              }
            }))
            return
          }
        } catch (gaError) {
          console.log('Google Analytics not available:', gaError)
        }
      }

      // Option 3: Simple Analytics (if available)
      // Simple Analytics doesn't have a public API, so we'll use a fallback
      console.log('Using Simple Analytics - no real-time API available')

      // Fallback: simulate real-time data or show static message
      setHealthStatus(prev => ({
        ...prev,
        viewers: {
          count: 0, // Simple Analytics doesn't provide real-time counts
          status: 'healthy',
          lastUpdated: new Date().toISOString(),
          source: 'Simple Analytics (No Real-time API)'
        }
      }))

    } catch (error) {
      console.error('Error fetching viewer count:', error)
      // Final fallback
      setHealthStatus(prev => ({
        ...prev,
        viewers: {
          count: 0,
          status: 'unhealthy',
          lastUpdated: new Date().toISOString(),
          source: 'Error - Using Fallback'
        }
      }))
    }
  }

  const checkHealth = async () => {
    const results = { ...healthStatus }

    // Check API endpoints
    try {
      const apiChecks = []

      // Check KWIK API
      const kwikResponse = await fetch(`${KWIK}/?method=ping`)
      apiChecks.push({
        name: 'KWIK API',
        status: kwikResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: 'N/A',
        url: KWIK
      })

      // Check ANIME API
      const animeResponse = await fetch(`${ANIME}/?method=ping`)
      apiChecks.push({
        name: 'ANIME API',
        status: animeResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: 'N/A',
        url: ANIME
      })

      results.api = {
        status: apiChecks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy',
        details: apiChecks
      }
    } catch (error) {
      results.api = {
        status: 'unhealthy',
        details: { error: error.message }
      }
    }

    // Check Database
    try {
      await db.execute('SELECT 1')
      results.database = {
        status: 'healthy',
        details: { message: 'Database connection successful' }
      }
    } catch (error) {
      results.database = {
        status: 'unhealthy',
        details: { error: error.message }
      }
    }

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          results.serviceWorker = {
            status: 'healthy',
            details: {
              state: registration.active?.state || 'unknown',
              scope: registration.scope
            }
          }
        } else {
          results.serviceWorker = {
            status: 'unhealthy',
            details: { message: 'No service worker registered' }
          }
        }
      } catch (error) {
        results.serviceWorker = {
          status: 'unhealthy',
          details: { error: error.message }
        }
      }
    } else {
      results.serviceWorker = {
        status: 'unhealthy',
        details: { message: 'Service Worker not supported' }
      }
    }

    // Overall health
    const allChecks = [results.api.status, results.database.status, results.serviceWorker.status]
    results.overall = {
      status: allChecks.every(status => status === 'healthy') ? 'healthy' : 'unhealthy',
      details: {
        timestamp: new Date().toISOString(),
        uptime: 'N/A', // Could be enhanced with actual uptime tracking
        version: '1.0.0' // Could be read from package.json
      }
    }

    setHealthStatus(results)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'unhealthy': return 'text-red-400'
      case 'checking': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
    switch (status) {
      case 'healthy':
        return `${baseClasses} bg-green-900/20 text-green-400 border border-green-600/30`
      case 'unhealthy':
        return `${baseClasses} bg-red-900/20 text-red-400 border border-red-600/30`
      case 'checking':
        return `${baseClasses} bg-yellow-900/20 text-yellow-400 border border-yellow-600/30`
      default:
        return `${baseClasses} bg-gray-900/20 text-gray-400 border border-gray-600/30`
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Health Dashboard</h1>
        <p className="text-gray-400">Real-time monitoring of all system components</p>
      </div>

      {/* Overall Status */}
      <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Overall System Status</h2>
          <span className={getStatusBadge(healthStatus.overall.status)}>
            {healthStatus.overall.status.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Last Check:</span>
            <span className="text-white ml-2">
              {healthStatus.overall.details.timestamp ?
                new Date(healthStatus.overall.details.timestamp).toLocaleString() :
                'Checking...'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Version:</span>
            <span className="text-white ml-2">{healthStatus.overall.details.version}</span>
          </div>
          <div>
            <span className="text-gray-400">Active Viewers:</span>
            <span className="text-white ml-2">
              {healthStatus.viewers.source?.includes('Simple Analytics') ? 'N/A' : healthStatus.viewers.count}
            </span>
            {healthStatus.viewers.lastUpdated && (
              <span className="text-gray-500 text-xs ml-2">
                (Updated: {new Date(healthStatus.viewers.lastUpdated).toLocaleTimeString()})
              </span>
            )}
            {healthStatus.viewers.source && (
              <span className="text-gray-500 text-xs ml-1">
                [{healthStatus.viewers.source}]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Status */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">API Endpoints</h3>
            <span className={getStatusBadge(healthStatus.api.status)}>
              {healthStatus.api.status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-3">
            {Array.isArray(healthStatus.api.details) ? healthStatus.api.details.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-600/20">
                <div>
                  <div className="text-white font-medium">{api.name}</div>
                  <div className="text-gray-400 text-xs">{api.url}</div>
                </div>
                <span className={getStatusBadge(api.status)}>
                  {api.status.toUpperCase()}
                </span>
              </div>
            )) : (
              <div className="text-red-400 text-sm">
                {healthStatus.api.details.error || 'API check failed'}
              </div>
            )}
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Database</h3>
            <span className={getStatusBadge(healthStatus.database.status)}>
              {healthStatus.database.status.toUpperCase()}
            </span>
          </div>
          <div className="p-3 bg-gray-800/30 rounded border border-gray-600/20">
            <div className="text-white font-medium">Neon Database</div>
            <div className="text-gray-400 text-sm mt-1">
              {healthStatus.database.details.message || healthStatus.database.details.error || 'Checking connection...'}
            </div>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Service Worker</h3>
            <span className={getStatusBadge(healthStatus.serviceWorker.status)}>
              {healthStatus.serviceWorker.status.toUpperCase()}
            </span>
          </div>
          <div className="p-3 bg-gray-800/30 rounded border border-gray-600/20">
            <div className="text-white font-medium">PWA Service Worker</div>
            <div className="text-gray-400 text-sm mt-1">
              State: {healthStatus.serviceWorker.details.state || 'Unknown'}
            </div>
            {healthStatus.serviceWorker.details.scope && (
              <div className="text-gray-400 text-xs mt-1">
                Scope: {healthStatus.serviceWorker.details.scope}
              </div>
            )}
            {healthStatus.serviceWorker.details.message && (
              <div className="text-red-400 text-xs mt-1">
                {healthStatus.serviceWorker.details.message}
              </div>
            )}
          </div>
        </div>

        {/* Viewer Statistics */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Viewers</h3>
            <span className={getStatusBadge(healthStatus.viewers.status)}>
              {healthStatus.viewers.status.toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {healthStatus.viewers.source?.includes('Simple Analytics') ? 'N/A' : healthStatus.viewers.count}
            </div>
            <div className="text-gray-400 text-sm">
              {healthStatus.viewers.source?.includes('Simple Analytics')
                ? 'Real-time count not available with Simple Analytics'
                : 'Real-time active viewers'
              }
            </div>
            {healthStatus.viewers.source && (
              <div className="text-gray-500 text-xs mt-1">
                Source: {healthStatus.viewers.source}
              </div>
            )}
            {healthStatus.viewers.lastUpdated && (
              <div className="text-gray-500 text-xs mt-1">
                Last updated: {new Date(healthStatus.viewers.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            checkHealth()
            fetchViewerCount()
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Refresh Health Check
        </button>
      </div>
    </div>
  )
}

export default Health