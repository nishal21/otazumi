import { useEffect } from 'react';

// Global counter to track how many modals are currently open
let modalCount = 0;
let savedScrollPosition = 0;

/**
 * Custom hook to prevent body scroll when modals are open
 * Handles multiple modals correctly by using a reference counter
 * @param {boolean} isOpen - Whether the modal is open
 */
export const useBodyScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Increment modal count
      modalCount++;
      
      // Only lock scroll on first modal
      if (modalCount === 1) {
        // Save current scroll position
        savedScrollPosition = window.scrollY;
        
        // Prevent scroll on body
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollPosition}px`;
        document.body.style.width = '100%';
        document.body.style.left = '0';
        document.body.style.right = '0';
      }
      
      return () => {
        // Decrement modal count
        modalCount--;
        
        // Only unlock scroll when all modals are closed
        if (modalCount === 0) {
          // Restore scroll
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          document.body.style.left = '';
          document.body.style.right = '';
          
          // Restore scroll position
          window.scrollTo(0, savedScrollPosition);
        }
      };
    }
  }, [isOpen]);
};
