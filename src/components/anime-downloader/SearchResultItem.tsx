import { Card, CardHeader, CardBody, Image, Divider, Chip, Spinner } from '@heroui/react'
import { Prox } from '../../utils/ImgProxy'
import useAxios from '../../hooks/useAxios'
import { ANIME } from '../../config/config'
import { EpisodeResult, FetchedEpisodes } from 'fetch/requests'

interface SearchResultItemProps {
  title: string,
  episodes: number,
  poster: string,
  status: string,
  type: string,
  year: number,
  session: string,
  score: number | null,
  fetched_eps: FetchedEpisodes,
  onSeriesUpdate: (
    episodes: EpisodeResult['episodes'],
    breadcrumbs: string,
    session: string,
    pagination: number
  ) => void
}

const SearchResultItem = ({
  session, title, episodes, poster, status, type, year, score, fetched_eps, onSeriesUpdate
}: SearchResultItemProps) => {
  const { isLoading, request } = useAxios()

  const FetchEpisodes = async (page: number) => {
    if (fetched_eps[session] === undefined) {
      const response = await request<EpisodeResult>({
        server: ANIME,
        endpoint: `/?method=series&session=${session}&page=${page}`,
        method: 'GET'
      })
      if (response) {
        onSeriesUpdate(response.episodes, title, session, response.total_pages)
        fetched_eps[session] = {
          total_page: response.total_pages,
          [page] : response.episodes
        }
      }
      return
    }
    onSeriesUpdate(fetched_eps[session][page], title, session, fetched_eps[session]['total_page'])
  }

  return (
    <div className="card">
      <Card
        isPressable
        disableRipple
        onPress={() => {
          /* clear previously selected serieses
          const keys = Object.keys(fetched_eps);
          if (keys.length === 1 && keys[0] !== session) {
            keys.forEach(key => delete fetched_eps[key]);
          }
          */
          FetchEpisodes(1)
        }}
        className="card2 w-full cursor-pointer border border-gray-700 bg-gray-800/50 transition-all duration-200"
        radius="lg"
      >
      <CardHeader className="pb-0 pt-2 px-4 flex-col text-left items-start h-32 overflow-hidden">
        <div className='flex flex-col gap-y-2 my-2'>
          <span className="text-gray-300 text-sm">{episodes} Episodes</span>
          <p className="text-tiny uppercase font-bold text-gray-400">{status}</p>
        </div>
        <Divider className="bg-gray-600" />
        <h4 className="font-bold text-large text-white line-clamp-2 leading-tight">{title}</h4>
      </CardHeader>
      <CardBody className="relative overflow-hidden items-center py-4 gap-y-2 flex flex-col justify-center">
        <div className="relative w-full">
          <Image
            isBlurred
            alt="anime poster"
            className="object-cover rounded-xl h-full w-full"
            src={Prox(poster)}
            width={240}
            onError={(e) => {
              e.target.src = poster; // Fallback to original URL if proxy fails
            }}
          />
        </div>
        <div className='flex gap-x-2 mt-4 flex-wrap justify-center'>
          <Chip
            variant='shadow'
            radius='sm'
            color='primary'
            className="bg-blue-600 text-white"
          >
            {type}
          </Chip>
          <Chip
            variant='shadow'
            radius='sm'
            color='secondary'
            className="bg-purple-600 text-white"
          >
            {year}
          </Chip>
          {score && (
            <Chip
              className='text-white bg-green-600'
              variant='shadow'
              radius='sm'
            >
              ★ {score}
            </Chip>
          )}
        </div>
        {
          isLoading && (
            <Spinner
              className='absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              size='lg'
              color="primary"
            />
          )
        }
      </CardBody>
    </Card>
    </div>
  )
}

export default SearchResultItem