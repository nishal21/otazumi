import { Card, CardFooter, Image, Button, Spinner, useDisclosure, Chip } from "@heroui/react";
import { Download, Play, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Prox } from '../../utils/ImgProxy';
import useAxios from '../../hooks/useAxios';
import { ANIME } from '../../config/config';
import DownloadModel from './DownloadModel';
import { DownloadLinks, FetchedEpisodesDlinks } from 'fetch/requests';

interface EpisodeProps {
  session: string,
  episode: string,
  snapshot: string,
  series: string,
  seriesname: string,
  linkCache: FetchedEpisodesDlinks
}

const Episode = ({ episode, session, snapshot, series, seriesname, linkCache }: EpisodeProps) => {
  const { isLoading, request } = useAxios()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const [dlinks, setDlinks] = useState<DownloadLinks>([])

  const RequestLinks = async () => {
    if (linkCache[series][session] === undefined) {
      const response = await request<DownloadLinks>({
        server: ANIME,
        endpoint: `/?method=episode&session=${ series }&ep=${ session }`,
        method: 'GET'
      })
      if (response) {
        setDlinks(response)
        linkCache[series] = {...linkCache[series], [session]: response}
        onOpen()
      }
      return
    }
    setDlinks(linkCache[series][session]);
    onOpen();
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="w-full hover:border-blue-500 border border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10"
    >
      <div className="relative overflow-hidden h-48">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10">
            <Spinner size="lg" className="text-blue-500" />
          </div>
        )}
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <ImageOff className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No Preview</p>
            </div>
          </div>
        ) : (
          <Image
            alt={`Episode ${episode} thumbnail`}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 !opacity-100"
            src={Prox(snapshot)}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.src = snapshot; // Fallback to original URL if proxy fails
              setImageError(false);
              setImageLoading(false);
            }}
          />
        )}
        <div className="absolute top-2 right-2">
          <Chip
            size="sm"
            variant="shadow"
            className="bg-black/60 text-white border border-gray-600"
          >
            EP {episode}
          </Chip>
        </div>
      </div>

      <CardFooter className="justify-between before:bg-black/20 border-white/20 border-1 overflow-hidden py-3 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-sm text-white/90 line-clamp-1 font-medium truncate">{seriesname}</p>
          <p className="text-xs text-gray-300">Episode {episode}</p>
        </div>
        <Button
          onPress={RequestLinks}
          className="text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-24 h-9 shadow-lg border border-blue-500/30"
          variant="flat"
          color="default"
          radius="lg"
          size="sm"
          startContent={<Download className="w-3 h-3" />}
        >
          {isLoading ? <Spinner color='default' size='sm' /> : 'Download'}
        </Button>
      </CardFooter>
      <DownloadModel epName={`${seriesname} : EP ${episode}`} isOpen={isOpen} links={dlinks} onOpenChange={onOpenChange}/>
    </Card>
  );
}

export default Episode