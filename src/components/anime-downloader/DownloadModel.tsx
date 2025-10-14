import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Download, Zap, Info, X } from 'lucide-react';
import DownloadListItem from './DownloadListItem';

interface DownloadModelProps {
  links: {
    link: string,
    name: string
  }[],
  isOpen: boolean,
  onOpenChange: () => void,
  epName: string
}

const DownloadModel = ({ isOpen, onOpenChange, links, epName }: DownloadModelProps) => {
  return (
    <Modal
      backdrop='blur'
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      size="lg"
      className="bg-gray-900"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] m-2 sm:m-4 md:m-6 mt-[72px] sm:mt-[80px] md:mt-[96px]",
        body: "p-3 sm:p-4 md:p-6",
        header: "p-3 sm:p-4 md:p-6",
        footer: "p-3 sm:p-4 md:p-6",
        closeButton: "hidden"
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }
        }
      }}
    >
      <ModalContent className="bg-gray-800 border border-gray-700">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center border-b border-gray-700 pb-3 sm:pb-4 relative">
              <Button
                isIconOnly
                variant="light"
                onPress={onOpenChange}
                className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-gray-700/50 z-10 rounded-full w-8 h-8"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
              <h3 className="text-white font-bold text-lg sm:text-xl pr-10">{epName}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Choose your preferred download method</p>
            </ModalHeader>
            <ModalBody className='mb-3 sm:mb-4 max-h-80 sm:max-h-96 overflow-y-auto px-3 sm:px-6'>
              {/* Info Section - Mobile Optimized */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-gray-300">
                    <p className="font-medium text-blue-300 mb-1 sm:mb-2">Download Options:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Download className="w-2 h-2 sm:w-3 sm:h-3 text-green-400" />
                        <span><strong className="text-green-400">KwiK:</strong> Opens download page</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Zap className="w-2 h-2 sm:w-3 sm:h-3 text-orange-400" />
                        <span><strong className="text-orange-400">Direct:</strong> Instant download</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Links - Mobile Optimized */}
              {links.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-white font-medium text-base sm:text-lg mb-2 sm:mb-3">Available Downloads:</h4>
                  {links.map(({ link, name }) => (
                    <DownloadListItem key={link} name={name} link={link} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-gray-400 mb-2">
                    <Download className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                  </div>
                  <p className="text-gray-400 text-sm sm:text-lg">No download links available</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Try again later or check another episode</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-gray-700 pt-3 sm:pt-4">
              <div className="w-full text-center">
                <p className="text-xs text-gray-500">
                  Downloads are provided by third-party services. Quality may vary.
                </p>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default DownloadModel