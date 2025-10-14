import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { animeAvatars, animeSeries, getAvatarsByAnime } from '../../config/avatars';
import Avatar from '../ui/Avatar/Avatar';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

const AvatarSelector = ({ currentAvatarId, onSelect, onClose }) => {
  const [selectedId, setSelectedId] = useState(currentAvatarId || 1);
  const [selectedAnime, setSelectedAnime] = useState('All');
  
  // Prevent body scroll when modal is open
  useBodyScrollLock(true);

  // Filter avatars based on selected anime
  const filteredAvatars = useMemo(() => {
    if (selectedAnime === 'All') {
      return animeAvatars;
    }
    return getAvatarsByAnime(selectedAnime);
  }, [selectedAnime]);

  const handleSelect = () => {
    const selectedAvatar = animeAvatars.find(a => a.id === selectedId);
    onSelect(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000002] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#18181B] rounded-xl sm:rounded-2xl w-full max-w-4xl mx-auto border border-gray-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white">Choose Your Avatar</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Select from {filteredAvatars.length} anime characters</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Anime Series Filter */}
        <div className="px-3 sm:px-6 pt-4 shrink-0 border-b border-gray-700/30">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <button
              onClick={() => setSelectedAnime('All')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-all ${
                selectedAnime === 'All'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              All ({animeAvatars.length})
            </button>
            {animeSeries.map((series) => (
              <button
                key={series.name}
                onClick={() => setSelectedAnime(series.name)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedAnime === series.name
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{series.emoji}</span>
                <span>{series.name}</span>
                <span className="opacity-60">({series.characterCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
            {filteredAvatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedId(avatar.id)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 group ${selectedId === avatar.id
                    ? 'ring-4 ring-blue-500 scale-105'
                    : 'hover:scale-105 hover:ring-2 hover:ring-gray-500'
                }`}
                title={`${avatar.name} - ${avatar.anime}`}
              >
                {/* Avatar with online/offline support */}
                <Avatar 
                  avatar={avatar}
                  size="w-full h-full"
                  className="rounded-xl"
                />

                {/* Selected Indicator */}
                {selectedId === avatar.id && (
                  <div className="absolute top-1 right-1 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-lg">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                  </div>
                )}

                {/* Name Label - Always visible on hover or selected */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent py-2 px-1 transition-opacity ${
                  selectedId === avatar.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <p className="text-white text-[10px] font-bold text-center truncate leading-tight">
                    {avatar.name.split(' ')[0]}
                  </p>
                  <p className="text-gray-300 text-[8px] text-center truncate">
                    {avatar.anime}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-gray-700/50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar 
              avatar={animeAvatars.find(a => a.id === selectedId)}
              size="w-12 h-12 sm:w-16 sm:h-16"
              className="rounded-lg sm:rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-medium text-sm sm:text-base truncate">{animeAvatars.find(a => a.id === selectedId)?.name}</p>
              <p className="text-gray-400 text-xs sm:text-sm truncate">{animeAvatars.find(a => a.id === selectedId)?.anime}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;