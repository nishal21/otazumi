import { useState, useRef } from 'react'
import { EpisodeResult, FetchedEpisodes, FetchedEpisodesDlinks, SearchItem } from 'fetch/requests'
import { BreadcrumbItem, Breadcrumbs, Pagination, Spinner } from '@heroui/react'
import SearchBar from '../../components/anime-downloader/SearchBar'
import SearchResultItem from '../../components/anime-downloader/SearchResultItem'
import Episode from '../../components/anime-downloader/Episode'
import useAxios from '../../hooks/useAxios'
import { ANIME } from '../../config/config'

const AnimeVideoDownload = () => {
  const fetched_eps = useRef<FetchedEpisodes>({})
  const fetched_eps_dlinks = useRef<FetchedEpisodesDlinks>({})
  const [SearchResult, setSearchResult] = useState<SearchItem[]>([])
  const [Episodes, setEpisodes] = useState<EpisodeResult['episodes']>([])
  const [SelectedSeriesID, setSelectedSeriesID] = useState<string>('')
  const [isHomeActive, setHomeActive] = useState(true)

  const [curPagination, setPagination] = useState(0)
  const [SelctedAnime, setSelectedAnime] = useState('')
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState('')
  const [allEpisodes, setAllEpisodes] = useState<EpisodeResult['episodes']>([])
  const [isSearchingAll, setIsSearchingAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const setBreadcrumbs = (title: string) => {
    setSelectedAnime(title);
    setHomeActive(false)
  }

  const { isLoading, request } = useAxios()

  const onSeriesUpdate = (
    episodes: EpisodeResult['episodes'],
    breadcrumbs: string,
    session: string,
    pagination: number
  ) => {
    setEpisodes(episodes)
    setBreadcrumbs(breadcrumbs)
    setSelectedSeriesID(session)
    setPagination(pagination)
    setAllEpisodes([]) // Clear all episodes cache when switching series
    setEpisodeSearchQuery('') // Clear search query when switching series
    setCurrentPage(1) // Reset to first page when switching series
  }

  const onPaginationChange = async (page: number) => {
    setCurrentPage(page) // Update current page state
    if (fetched_eps.current[SelectedSeriesID][page] === undefined) {
      const response = await request<EpisodeResult>({
        server: ANIME,
        endpoint: `/?method=series&session=${SelectedSeriesID}&page=${page}`,
        method: 'GET'
      })
      if (response) {
        setEpisodes(response.episodes)
        fetched_eps.current[SelectedSeriesID] = { ...fetched_eps.current[SelectedSeriesID], [page]: response.episodes }
      }
      return;
    }
    setEpisodes(fetched_eps.current[SelectedSeriesID][page])
  }

  const loadAllEpisodes = async () => {
    if (allEpisodes.length > 0 || !SelectedSeriesID || curPagination === 0) return

    setIsSearchingAll(true)
    const allEps: EpisodeResult['episodes'] = []

    try {
      // Load all pages
      for (let page = 1; page <= curPagination; page++) {
        if (fetched_eps.current[SelectedSeriesID]?.[page]) {
          // Use cached episodes
          allEps.push(...fetched_eps.current[SelectedSeriesID][page])
        } else {
          // Fetch new page
          const response = await request<EpisodeResult>({
            server: ANIME,
            endpoint: `/?method=series&session=${SelectedSeriesID}&page=${page}`,
            method: 'GET'
          })
          if (response) {
            allEps.push(...response.episodes)
            fetched_eps.current[SelectedSeriesID] = { 
              ...fetched_eps.current[SelectedSeriesID], 
              [page]: response.episodes,
              total_page: curPagination
            }
          }
        }
      }
      setAllEpisodes(allEps)
    } catch (error) {
      console.error('Error loading all episodes:', error)
    } finally {
      setIsSearchingAll(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px] min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full flex flex-col gap-y-8 mt-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-3xl text-white max-[478px]:text-2xl mb-2">
            Anime Video Downloader
          </h1>
          <p className="text-gray-300 text-lg max-[478px]:text-base max-[300px]:text-sm">
            Search and download anime episodes with high quality
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <SearchBar setSearchResult={setSearchResult} setHomeActive={setHomeActive} />
        </div>

        {/* Breadcrumbs */}
        <div className='flex justify-center'>
          <Breadcrumbs variant='bordered' className="bg-gray-800/50 rounded-lg px-4 py-2">
            <BreadcrumbItem
              onPress={() => setHomeActive(true)}
              className="text-gray-300 hover:text-white cursor-pointer"
            >
              Home
            </BreadcrumbItem>
            {isHomeActive ? null : (
              <BreadcrumbItem className="text-white">
                {SelctedAnime}
              </BreadcrumbItem>
            )}
          </Breadcrumbs>
        </div>

        {/* Content */}
        {isHomeActive ? (
          <div className="flex flex-col gap-y-4">
            <h2 className="font-bold text-2xl text-white max-[478px]:text-xl">
              Search Results
            </h2>
            {SearchResult.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-4 justify-center'>
                {SearchResult.map(({ title, poster, episodes, status, id, type, year, score, session }) => (
                  <SearchResultItem
                    key={id}
                    title={title}
                    poster={poster}
                    episodes={episodes}
                    status={status}
                    type={type}
                    year={year}
                    score={score}
                    session={session}
                    onSeriesUpdate={onSeriesUpdate}
                    fetched_eps={fetched_eps.current}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className='text-gray-400 text-lg max-[478px]:text-base'>
                  Search for anime to get started
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-y-6">
            {/* Pagination */}
            <div className='flex justify-center'>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* First Page Button - Hidden on very small screens */}
                <button
                  onClick={() => onPaginationChange(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 rounded-lg w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center"
                  aria-label="First page"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>

                <Pagination
                  showControls
                  showShadow
                  page={currentPage}
                  onChange={onPaginationChange}
                  total={curPagination}
                  size="sm"
                  className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 sm:p-2 shadow-2xl"
                  classNames={{
                    wrapper: "gap-0.5 sm:gap-1",
                    item: "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 font-medium rounded-md sm:rounded-lg min-w-[32px] h-[32px] sm:min-w-[36px] sm:h-[36px] shadow-lg hover:shadow-xl text-xs sm:text-sm",
                    cursor: "bg-blue-600 text-white border-2 border-blue-400/60 shadow-xl hover:shadow-2xl font-bold rounded-md sm:rounded-lg min-w-[32px] h-[32px] sm:min-w-[36px] sm:h-[36px] transform hover:scale-110 transition-all duration-300 ring-2 ring-blue-400/30",
                    prev: [
                      "relative rounded-md sm:rounded-lg w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] shadow-lg transition-all duration-200",
                      currentPage === 1 
                        ? "bg-gray-800/60 text-gray-300 border border-gray-600/30 opacity-50 cursor-not-allowed [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4 [&>svg]:rotate-0" 
                        : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 hover:shadow-xl [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4 [&>svg]:rotate-0"
                    ].join(" "),
                    next: [
                      "relative rounded-md sm:rounded-lg w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] shadow-lg transition-all duration-200", 
                      currentPage === curPagination 
                        ? "bg-gray-800/60 text-gray-300 border border-gray-600/30 opacity-50 cursor-not-allowed [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4 [&>svg]:rotate-180" 
                        : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 hover:shadow-xl [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4 [&>svg]:rotate-180"
                    ].join(" "),
                    ellipsis: "text-gray-500 text-xs sm:text-sm px-1"
                  }}
                  siblings={0}
                  boundaries={1}
                />

                {/* Last Page Button - Hidden on very small screens */}
                <button
                  onClick={() => onPaginationChange(curPagination)}
                  disabled={currentPage === curPagination}
                  className="hidden sm:flex bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 rounded-lg w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center"
                  aria-label="Last page"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Episodes Grid */}
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="font-bold text-2xl text-white max-[478px]:text-xl">
                  Episodes
                </h2>
                <div className="episode-search-container">
                  <input
                    type="text"
                    name="text"
                    className="episode-search-input"
                    required
                    placeholder="Search episode..."
                    value={episodeSearchQuery}
                    onChange={(e) => {
                      const value = e.target.value
                      setEpisodeSearchQuery(value)
                      if (value && allEpisodes.length === 0) {
                        loadAllEpisodes()
                      }
                    }}
                  />
                  <div className="episode-search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                      <title>Search</title>
                      <path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"></path>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M338.29 338.29L448 448"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-center'>
                {isLoading || (episodeSearchQuery && isSearchingAll) ? (
                  <div className='col-span-full flex h-96 justify-center items-center'>
                    <Spinner size='lg' className="text-blue-500" />
                  </div>
                ) : Episodes.length > 0 ? (
                  (episodeSearchQuery ? allEpisodes : Episodes)
                    .filter(({ episode }) => 
                      episodeSearchQuery === '' || 
                      episode.toString().toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
                      episode.toString().includes(episodeSearchQuery)
                    )
                    .map(({ episode, session, snapshot }) => {
                      fetched_eps_dlinks.current[SelectedSeriesID] ??= {};
                      return (
                        <Episode
                          linkCache={fetched_eps_dlinks.current}
                          seriesname={SelctedAnime}
                          key={session}
                          series={SelectedSeriesID}
                          episode={episode}
                          session={session}
                          snapshot={snapshot}
                        />
                      );
                    })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className='text-gray-400 text-lg max-[478px]:text-base'>
                      No episodes found
                    </p>
                  </div>
                )}
              </div>
              {episodeSearchQuery && allEpisodes.length > 0 && allEpisodes.filter(({ episode }) => 
                episode.toString().toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
                episode.toString().includes(episodeSearchQuery)
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className='text-gray-400 text-lg max-[478px]:text-base'>
                    No episodes match your search
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimeVideoDownload