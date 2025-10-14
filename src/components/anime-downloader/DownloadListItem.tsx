import { Button, Link, Spinner, Chip } from "@heroui/react";
import { Download, Zap, ExternalLink } from 'lucide-react';
import useAxios from '../../hooks/useAxios';
import { KWIK } from '../../config/config';
import { DirectLink } from 'fetch/requests';

interface DownloadListItemProps {
  name: string,
  link: string
}

const DownloadListItem = ({ name, link }: DownloadListItemProps) => {
  const { isLoading, request } = useAxios()

  const onDirectDlRequest = async (kwik: string) => {
    const response = await request<DirectLink>({
      server: KWIK,
      endpoint: '/',
      method: 'POST',
      data: {
        "service": "kwik",
        "action": "fetch",
        "content": { kwik }
      }
    })
    if (response) {
      window.open(response.content.url, '_blank', 'noopener,noreferrer');
    }
  }

  // Extract quality info from name (e.g., "720p", "1080p")
  const qualityMatch = name.match(/(\d+p)/i);
  const quality = qualityMatch ? qualityMatch[1] : null;

  return (
    <div className='flex flex-col sm:flex-row sm:items-center rounded-lg w-full justify-between bg-gradient-to-r from-gray-700/50 to-gray-600/50 p-3 sm:pl-4 sm:pr-2 sm:py-3 shadow-sm border border-gray-600/50 mb-2 sm:mb-3 hover:from-gray-600/50 hover:to-gray-500/50 transition-all duration-200 hover:border-gray-500/70 gap-2 sm:gap-0'>
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="flex flex-col flex-1 min-w-0">
          <span className='text-xs sm:text-sm text-gray-200 font-medium truncate max-w-full sm:max-w-[200px]'>{name}</span>
          {quality && (
            <Chip
              size="sm"
              variant="flat"
              className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 mt-1 w-fit"
            >
              {quality}
            </Chip>
          )}
        </div>
      </div>
      <div className='flex justify-center gap-2 w-full sm:w-auto'>
        <Button
          href={link}
          target='_blank'
          as={Link}
          color="success"
          className='text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border border-green-500/30 shadow-lg'
          size="sm"
        >
          <Download className="w-3 h-3 mr-1" />
          <span className="hidden xs:inline">KwiK</span>
          <span className="xs:hidden">DL</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
        <Button
          isIconOnly
          onPress={() => onDirectDlRequest(link)}
          color="warning"
          className='text-white w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 border border-orange-500/30 shadow-lg'
          size="sm"
          title="Direct Download"
        >
          {isLoading ? <Spinner color='default' size='sm' /> : <Zap className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  )
}

export default DownloadListItem