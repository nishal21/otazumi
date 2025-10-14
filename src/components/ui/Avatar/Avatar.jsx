import { useState } from 'react';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

/**
 * Avatar component that shows image when online, emoji when offline
 * @param {Object} avatar - Avatar object from avatars config
 * @param {string} size - Size class (e.g., 'w-10 h-10', 'w-32 h-32')
 * @param {string} className - Additional CSS classes
 * @param {boolean} showImage - Force show image (default: auto based on online status)
 */
const Avatar = ({ avatar, size = 'w-10 h-10', className = '', showImage = null }) => {
  const isOnline = useOnlineStatus();
  const [imageError, setImageError] = useState(false);

  // Determine if we should show image or emoji
  const shouldShowImage = showImage !== null ? showImage : (isOnline && !imageError);

  const handleImageError = () => {
    setImageError(true);
  };

  if (shouldShowImage) {
    return (
      <div className={`relative ${size} rounded-full overflow-hidden bg-gradient-to-br ${avatar.gradient} flex items-center justify-center shadow-lg ${className}`}>
        <img
          src={avatar.imageUrl}
          alt={avatar.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Determine emoji size based on container size
  const getEmojiSize = () => {
    if (size.includes('w-32') || size.includes('h-32')) return 'text-7xl'; // Large (Profile)
    if (size.includes('w-16') || size.includes('h-16')) return 'text-4xl'; // Medium (Selector footer)
    if (size.includes('w-8') || size.includes('h-8')) return 'text-xl';   // Small (Navbar)
    return 'text-4xl'; // Default
  };

  // Show emoji fallback when offline or image failed to load
  return (
    <div className={`relative ${size} rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center shadow-lg ${className}`}>
      <span className={`${getEmojiSize()} filter drop-shadow-lg`}>
        {avatar.characterEmoji}
      </span>
    </div>
  );
};

export default Avatar;
