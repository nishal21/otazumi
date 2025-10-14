import { Dispatch, SetStateAction, useState } from 'react'
import useAxios from '../../hooks/useAxios'
import { ANIME } from '../../config/config'
import { SearchItem, SearchResult } from 'fetch/requests'

interface SearchBarProps {
  setSearchResult: Dispatch<SetStateAction<SearchItem[]>>,
  setHomeActive: Dispatch<SetStateAction<boolean>>
}

const SearchBar = ({ setSearchResult, setHomeActive }: SearchBarProps) => {
  const { isLoading, request } = useAxios()
  const [QueryString, setQueryString] = useState('')

  const FetchSearchResult = async (key: string) => {
    if (key !== 'Enter' || QueryString.length === 0) { return; }

    const response = await request<SearchResult>({
      server: ANIME,
      endpoint: `/?method=search&query=${QueryString}`,
      method: 'GET'
    })
    if (response) {
      setSearchResult(response.data)
      setHomeActive(true)
    }
  }

  return (
    <div className='flex w-full justify-center mb-8'>
      <div className="relative flex items-center max-w-md w-full">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 fill-gray-400 w-4 h-4 pointer-events-none z-10">
          <g>
            <path
              d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
            ></path>
          </g>
        </svg>

        <input
          id="query"
          className="w-full h-11 pl-10 pr-4 shadow-[0_0_0_1.5px_#2b2c37,0_0_25px_-17px_#000] border-0 rounded-xl bg-[#16171d] outline-none text-[#bdbecb] transition-all duration-250 ease-[cubic-bezier(0.19,1,0.22,1)] cursor-text placeholder:text-[#bdbecb] hover:shadow-[0_0_0_2.5px_#2f303d,0_0_25px_-15px_#000] focus:shadow-[0_0_0_2.5px_#2f303d] active:scale-95 disabled:opacity-50"
          type="search"
          placeholder="Search Anime..."
          name="searchbar"
          value={QueryString}
          onChange={(e) => setQueryString(e.target.value)}
          onKeyDown={(e) => FetchSearchResult(e.key)}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default SearchBar