import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHeart, 
  faBookmark, 
  faHistory, 
  faCog, 
  faSignOutAlt,
  faXmark,
  faEdit,
  faSave,
  faTimes,
  faCamera,
  faCheckCircle,
  faExclamationCircle,
  faEnvelope,
  faTrash,
  faExclamationTriangle,
  faDownload,
  faUpload,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { LocalStorageService } from '../../services/localStorageService';
import { UserDataService } from '../../services/userDataService';
import { useLanguage } from '../../context/LanguageContext';
import { AuthService } from '../../services/authService';
import { DownloadService } from '../../services/downloadService';
import AvatarSelector from './AvatarSelector';
import { getAvatarById, defaultAvatar } from '../../config/avatars';
import Avatar from '../ui/Avatar/Avatar';

// Email Verification Status Component
const EmailVerificationStatus = ({ user }) => {
  const { updateUser, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Auto-refresh verification status on mount
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!user?.isVerified) {
        await refreshUser();
      }
    };
    checkInitialStatus();
  }, []);

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      setMessage('');
      // Use refreshUser from AuthContext to fetch latest user data
      const freshUser = await refreshUser();
      if (freshUser?.isVerified) {
        setMessageType('success');
        setMessage('✓ Email verified!');
      } else {
        setMessageType('error');
        setMessage('Email is still not verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      setMessageType('error');
      setMessage('Failed to refresh verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      setMessage('');
      await AuthService.resendVerificationEmail(user.email);
      setMessageType('success');
      setMessage('✓ Verification email sent! Please check your inbox. After verifying, click "Refresh Status".');
      
      // Clear message after 8 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 8000);
    } catch (error) {
      console.error('Error resending verification:', error);
      
      // If email is already verified, refresh the user data
      if (error.message && error.message.includes('already verified')) {
        setMessageType('success');
        setMessage('✓ Your email is already verified! Refreshing...');
        setTimeout(async () => {
          await refreshUser();
        }, 1000);
      } else {
        setMessageType('error');
        setMessage(error.message || 'Failed to send verification email');
      }
    } finally {
      setResending(false);
    }
  };

  if (user?.isVerified) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-lg sm:text-xl shrink-0" />
          <div>
            <p className="text-green-400 font-medium text-sm sm:text-base">Email Verified</p>
            <p className="text-green-300/70 text-xs sm:text-sm">Your email address has been verified</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-400 text-lg sm:text-xl mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-yellow-400 font-medium mb-1 text-sm sm:text-base">Email Not Verified</p>
          <p className="text-yellow-300/70 text-xs sm:text-sm mb-3">
            Please verify your email address to access all features. If you've already verified, click "Refresh Status" below.
          </p>
          
          {message && (
            <div className={`mb-3 p-2 rounded text-xs sm:text-sm ${
              messageType === 'success' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              onClick={handleResendVerification}
              disabled={resending || checking}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
            >
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className={resending ? 'animate-pulse' : ''} 
              />
              <span className="whitespace-nowrap">{resending ? 'Sending...' : 'Resend Email'}</span>
            </button>
            
            <button
              onClick={handleCheckVerification}
              disabled={resending || checking}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
            >
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className={checking ? 'animate-spin' : ''} 
              />
              <span className="whitespace-nowrap">{checking ? 'Checking...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout, updatePreferences, updateUser } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletionScope, setDeletionScope] = useState('both'); // 'server', 'local', 'both'
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    username: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      if (user) {
        setEditForm({
          username: user.username || ''
        });
      }
    }
  }, [isOpen, user]);

  // Separate effect to update avatar when user's avatar changes
  useEffect(() => {
    if (user) {
      const avatarId = user.avatarId || user.preferences?.avatarId || 1;
      const avatar = getAvatarById(avatarId);
      setSelectedAvatar(avatar);
    }
  }, [user?.avatarId, user?.preferences?.avatarId]);

  const loadUserData = async () => {
    const userId = user?.id || null;
    
    try {
      // Load favorites (from localStorage or NeonDB)
      const favoritesData = await UserDataService.getFavorites(userId);
      setFavorites(favoritesData);

      // Load watchlist (from localStorage or NeonDB)
      const watchlistData = await UserDataService.getWatchlist(userId);
      setWatchlist(watchlistData);

      // Load watch history - using continue watching data
      // Continue watching is the actual watch history in this app
      const continueWatchingData = LocalStorageService.getContinueWatching();
      setHistory(continueWatchingData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage only
      setFavorites(LocalStorageService.getFavorites());
      setWatchlist(LocalStorageService.getWatchlist());
      setHistory(LocalStorageService.getContinueWatching());
    }
  };

  const handleRemoveFavorite = async (animeId) => {
    console.log('Removing favorite:', animeId);
    setRemovingItem(`fav-${animeId}`);
    try {
      const userId = user?.id || null;
      const result = await UserDataService.removeFromFavorites(userId, animeId);
      console.log('Remove result:', result);
      
      // Update state immediately for instant feedback
      setFavorites(prev => prev.filter(fav => fav.id !== animeId));
      
      // Also reload all data to ensure consistency
      await loadUserData();
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Still try to reload data
      await loadUserData();
    } finally {
      setRemovingItem(null);
    }
  };

  const handleRemoveFromWatchlist = async (animeId) => {
    console.log('Removing from watchlist:', animeId);
    setRemovingItem(`watch-${animeId}`);
    try {
      const userId = user?.id || null;
      const result = await UserDataService.removeFromWatchlist(userId, animeId);
      console.log('Remove result:', result);
      
      // Update state immediately for instant feedback
      setWatchlist(prev => prev.filter(item => item.id !== animeId));
      
      // Also reload all data to ensure consistency
      await loadUserData();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Still try to reload data
      await loadUserData();
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    // Update user preferences with new avatar
    if (user) {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          avatarId: avatar.id
        },
        avatarId: avatar.id
      };
      updateUser(updatedUser);
    } else {
      // For non-authenticated users, save to localStorage
      LocalStorageService.updatePreferences({ avatarId: avatar.id });
    }
  };

  const handleSaveProfile = async () => {
    setSaveError('');
    setSaveSuccess(false);
    
    try {
      // Validate inputs
      if (!editForm.username.trim()) {
        setSaveError('Username cannot be empty');
        return;
      }

      // Check if username contains only valid characters (letters, numbers, underscore, hyphen)
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(editForm.username)) {
        setSaveError('Username must be 3-20 characters and contain only letters, numbers, underscore, or hyphen');
        return;
      }

      // Check if anything changed
      if (editForm.username === user.username) {
        setIsEditing(false);
        return;
      }

      setIsSaving(true);

      // In a real implementation, this would call the backend API
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      /* When backend is ready, use this code:
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          username: editForm.username
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      */

      // For now, update locally
      const updatedUser = {
        ...user,
        username: editForm.username,
        updatedAt: new Date().toISOString()
      };

      // Update user in context and localStorage
      updateUser(updatedUser);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Verify the confirmation text
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" to confirm account deletion');
      return;
    }

    // Check password is provided for server deletion
    if ((deletionScope === 'server' || deletionScope === 'both') && (!deletePassword || deletePassword.trim() === '')) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      let resultMessage = '';

      // Delete based on scope
      if (deletionScope === 'server' || deletionScope === 'both') {
        // Delete account from NeonDB (includes all user data: favorites, watchlist, history)
        const result = await AuthService.deleteAccount(user.id, deletePassword);
        resultMessage = result.message || 'Server account deleted successfully.';
      }

      if (deletionScope === 'local' || deletionScope === 'both') {
        // Clear all local data
        localStorage.clear();
        if (deletionScope === 'local') {
          resultMessage = 'Local data cleared successfully. Server account remains active.';
        } else {
          resultMessage = 'Account and all data deleted successfully.';
        }
      }
      
      // Only logout and close if deleting server account
      if (deletionScope === 'server' || deletionScope === 'both') {
        logout();
        onClose();
      } else {
        // Just close modal if only clearing local data
        setShowDeleteConfirm(false);
        setDeleteConfirmText('');
        setDeletePassword('');
        // Reload user data to reflect cleared local storage
        loadUserData();
      }
      
      // Show success message
      alert(resultMessage);
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setDownloadMessage('Preparing download...');
      
      // Gather all user data
      const userData = {
        uid: user?.id || 'guest',
        email: user?.email || null,
        displayName: user?.username || 'Guest',
        watchlist: watchlist,
        favorites: favorites,
        history: history,
        preferences: user?.preferences || {},
        continueWatching: history,
        avatarId: selectedAvatar.id
      };

      // Download the data
      await DownloadService.downloadUserData(userData);
      
      setDownloadMessage('✓ Data downloaded successfully!');
      setTimeout(() => setDownloadMessage(''), 3000);
    } catch (error) {
      console.error('Error downloading data:', error);
      setDownloadMessage('❌ Failed to download data');
      setTimeout(() => setDownloadMessage(''), 3000);
    }
  };

  const handleUploadData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage('Reading file...');

      // Parse and validate the uploaded file
      const result = await DownloadService.uploadUserData(file);
      
      if (!result.success) {
        throw new Error('Invalid backup file');
      }

      setUploadMessage('Restoring data...');

      // Restore the data
      const userId = user?.id || null;
      
      // Restore watchlist
      if (result.data.watchlist?.length > 0) {
        for (const anime of result.data.watchlist) {
          await UserDataService.addToWatchlist(userId, anime);
        }
      }

      // Restore favorites
      if (result.data.favorites?.length > 0) {
        for (const anime of result.data.favorites) {
          await UserDataService.addToFavorites(userId, anime);
        }
      }

      // Restore continue watching/history
      if (result.data.continueWatching?.length > 0) {
        for (const item of result.data.continueWatching) {
          LocalStorageService.addToContinueWatching(item);
        }
      }

      // Restore preferences
      if (result.data.preferences) {
        if (result.data.preferences.avatarId) {
          const avatar = getAvatarById(result.data.preferences.avatarId);
          if (avatar) {
            handleAvatarSelect(avatar);
          }
        }
        updatePreferences(result.data.preferences);
      }

      setUploadMessage(`✓ Data restored successfully! (from ${new Date(result.importDate).toLocaleDateString()})`);
      
      // Reload user data to reflect changes
      await loadUserData();
      
      setTimeout(() => setUploadMessage(''), 5000);
    } catch (error) {
      console.error('Error uploading data:', error);
      setUploadMessage(`❌ ${error.message || 'Failed to upload data'}`);
      setTimeout(() => setUploadMessage(''), 5000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: faUser },
    { id: 'favorites', label: 'Favorites', icon: faHeart },
    { id: 'watchlist', label: 'Watchlist', icon: faBookmark },
    { id: 'history', label: 'History', icon: faHistory },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000001] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#18181B] rounded-xl sm:rounded-2xl w-full max-w-4xl mx-auto border border-gray-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate pr-2">
            {isAuthenticated ? `${user?.username}'s Profile` : 'My Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex gap-1 p-2 bg-[#0F0F10] border-b border-gray-700/50 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
              <span className="text-xs">Sign Out</span>
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-56 lg:w-64 bg-[#0F0F10] p-4 border-r border-gray-700/50 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="w-5" />
                  {tab.label}
                </button>
              ))}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-4"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Profile Information</h3>
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <FontAwesomeIcon icon={isEditing ? faTimes : faEdit} />
                      <span className="hidden xs:inline">{isEditing ? 'Cancel' : 'Edit'}</span>
                    </button>
                  )}
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-3 sm:space-y-4 bg-[#27272A] rounded-lg p-4 sm:p-6">
                  <div className="relative">
                    <Avatar 
                      avatar={selectedAvatar}
                      size="w-24 h-24 sm:w-32 sm:h-32"
                      className="ring-4 ring-gray-700/50"
                    />
                    <button
                      onClick={() => setIsAvatarSelectorOpen(true)}
                      className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                      title="Change Avatar"
                    >
                      <FontAwesomeIcon icon={faCamera} className="text-xs sm:text-sm" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg sm:text-xl">{isAuthenticated ? user?.username : 'Guest User'}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{selectedAvatar.name}</p>
                    <p className="text-gray-500 text-xs">{selectedAvatar.anime}</p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-3 sm:space-y-4">
                    {isEditing ? (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Error Message */}
                        {saveError && (
                          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                            {saveError}
                          </div>
                        )}
                        
                        {/* Success Message */}
                        {saveSuccess && (
                          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                            ✓ Profile updated successfully!
                          </div>
                        )}

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Username</label>
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, username: e.target.value }));
                              setSaveError('');
                            }}
                            disabled={isSaving}
                            className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Enter your username"
                            maxLength={20}
                          />
                          <p className="text-gray-400 text-xs mt-1">3-20 characters, letters, numbers, underscore, or hyphen only</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm sm:text-base"
                          >
                            <FontAwesomeIcon icon={faSave} className={isSaving ? 'animate-pulse' : ''} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setSaveError('');
                              setSaveSuccess(false);
                              setEditForm({
                                username: user?.username || ''
                              });
                            }}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm sm:text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-[#27272A] rounded-lg p-3 sm:p-4">
                          <p className="text-gray-300 text-xs sm:text-sm">Username</p>
                          <p className="text-white font-medium text-sm sm:text-base break-words">{user?.username}</p>
                        </div>
                        <div className="bg-[#27272A] rounded-lg p-3 sm:p-4">
                          <p className="text-gray-300 text-xs sm:text-sm">Email</p>
                          <p className="text-white font-medium text-sm sm:text-base break-all">{user?.email}</p>
                          <p className="text-gray-500 text-xs mt-1">Email cannot be changed for security reasons</p>
                        </div>
                        <div className="bg-[#27272A] rounded-lg p-3 sm:p-4">
                          <p className="text-gray-300 text-xs sm:text-sm">Member Since</p>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {new Date(user?.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Email Verification Status */}
                        <EmailVerificationStatus user={user} />

                        {/* Data Management Section */}
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                          <h4 className="text-blue-400 font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                            <FontAwesomeIcon icon={faDatabase} />
                            Data Management
                          </h4>
                          <p className="text-gray-400 text-xs sm:text-sm mb-4">
                            Backup your data or restore from a previous backup. This includes your watchlist, favorites, history, and preferences.
                          </p>
                          
                          {/* Messages */}
                          {downloadMessage && (
                            <div className={`mb-3 p-2 rounded text-xs sm:text-sm ${
                              downloadMessage.startsWith('✓') 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                                : downloadMessage.startsWith('❌')
                                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                            }`}>
                              {downloadMessage}
                            </div>
                          )}
                          
                          {uploadMessage && (
                            <div className={`mb-3 p-2 rounded text-xs sm:text-sm ${
                              uploadMessage.startsWith('✓') 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                                : uploadMessage.startsWith('❌')
                                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                            }`}>
                              {uploadMessage}
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                              onClick={handleDownloadData}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                              Download Backup
                            </button>
                            
                            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm cursor-pointer">
                              <FontAwesomeIcon icon={faUpload} className={uploading ? 'animate-pulse' : ''} />
                              <span>{uploading ? 'Uploading...' : 'Upload Backup'}</span>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                onChange={handleUploadData}
                                disabled={uploading}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          <p className="text-gray-500 text-xs mt-2">
                            💡 Tip: Download your data regularly to keep a backup
                          </p>
                        </div>

                        {/* Delete Account Section */}
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                          <h4 className="text-red-400 font-semibold mb-2 text-sm sm:text-base">Danger Zone</h4>
                          <p className="text-gray-400 text-xs sm:text-sm mb-3">
                            Once you delete your account, there is no going back. This action cannot be undone.
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FontAwesomeIcon icon={faUser} className="text-4xl sm:text-6xl text-gray-600 mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-base sm:text-lg">Sign in to save your data across devices</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Your data is currently saved locally</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">My Favorites</h3>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {favorites.map((anime) => {
                      const isRemoving = removingItem === `fav-${anime.id}`;
                      return (
                        <div key={anime.id} className={`bg-[#27272A] rounded-lg overflow-hidden group relative transition-opacity ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(anime.id);
                            }}
                            disabled={isRemoving}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-lg disabled:cursor-not-allowed"
                            title="Remove from favorites"
                          >
                            {isRemoving ? (
                              <div className="animate-spin">⟳</div>
                            ) : (
                              '✕'
                            )}
                          </button>
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3">
                            <p className="text-white font-medium text-sm truncate">
                              {language === 'EN' ? anime.title : anime.japanese_title || anime.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faHeart} className="text-6xl text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No favorites yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">My Watchlist</h3>
                {watchlist.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {watchlist.map((anime) => {
                      const isRemoving = removingItem === `watch-${anime.id}`;
                      return (
                        <div key={anime.id} className={`bg-[#27272A] rounded-lg overflow-hidden group relative transition-opacity ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist(anime.id);
                            }}
                            disabled={isRemoving}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-lg disabled:cursor-not-allowed"
                            title="Remove from watchlist"
                          >
                            {isRemoving ? (
                              <div className="animate-spin">⟳</div>
                            ) : (
                              '✕'
                            )}
                          </button>
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3">
                            <p className="text-white font-medium text-sm truncate">
                              {language === 'EN' ? anime.title : anime.japanese_title || anime.title}
                            </p>
                            <p className="text-gray-400 text-xs capitalize mt-1">
                              {(anime.status || '').replace(/_/g, ' ').replace(/-/g, ' ')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faBookmark} className="text-6xl text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No items in watchlist</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Watch History</h3>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div key={index} className="bg-[#27272A] rounded-lg p-4 flex items-center gap-4">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {language === 'EN' ? item.title : item.japanese_title || item.title}
                          </p>
                          <p className="text-gray-400 text-sm">Episode {item.episodeNum || item.episodeNumber}</p>
                          <p className="text-gray-500 text-xs">
                            {item.addedAt ? `Watched ${new Date(item.addedAt).toLocaleDateString()}` : 'Recently watched'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faHistory} className="text-6xl text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No watch history</p>
                    <p className="text-gray-500 text-sm mt-2">Start watching anime to see your history here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1000002] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181B] rounded-xl w-full max-w-lg mx-auto border border-red-500/50 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-sm" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Delete Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                  setDeletionScope('both');
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="text-gray-400 hover:text-white transition-colors p-1 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                <p className="text-blue-400 font-semibold mb-2 text-xs sm:text-sm">🗑️ What to delete?</p>
                <div className="space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="deletionScope"
                      value="both"
                      checked={deletionScope === 'both'}
                      onChange={(e) => setDeletionScope(e.target.value)}
                      className="mt-0.5 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs">Server & Local (Complete)</p>
                      <p className="text-gray-400 text-[10px] leading-tight">Delete everything & logout</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="deletionScope"
                      value="server"
                      checked={deletionScope === 'server'}
                      onChange={(e) => setDeletionScope(e.target.value)}
                      className="mt-0.5 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs">Server Only</p>
                      <p className="text-gray-400 text-[10px] leading-tight">Delete cloud account, keep local data</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="deletionScope"
                      value="local"
                      checked={deletionScope === 'local'}
                      onChange={(e) => setDeletionScope(e.target.value)}
                      className="mt-0.5 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs">Local Only</p>
                      <p className="text-gray-400 text-[10px] leading-tight">Clear browser data, keep server account</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2.5">
                <p className="text-red-400 font-semibold mb-1.5 text-xs">⚠️ Warning: Permanent!</p>
                <ul className="text-red-300 text-[10px] space-y-0.5 list-disc list-inside leading-tight">
                  {deletionScope === 'both' && (
                    <>
                      <li>Server account deleted</li>
                      <li>Local data cleared</li>
                      <li>Logged out immediately</li>
                    </>
                  )}
                  {deletionScope === 'server' && (
                    <>
                      <li>Server account deleted</li>
                      <li>Local data kept</li>
                      <li>Logged out</li>
                    </>
                  )}
                  {deletionScope === 'local' && (
                    <>
                      <li>Browser data cleared</li>
                      <li>Server account kept</li>
                      <li>Can re-sync later</li>
                    </>
                  )}
                  <li>Cannot be undone</li>
                </ul>
              </div>

              {deleteError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-2 py-1.5 rounded text-[10px]">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2.5">
                {(deletionScope === 'server' || deletionScope === 'both') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Password:
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError('');
                      }}
                      disabled={isDeleting}
                      className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Your account password"
                      autoComplete="current-password"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Type <span className="text-red-400 font-bold">DELETE</span>:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => {
                      setDeleteConfirmText(e.target.value);
                      setDeleteError('');
                    }}
                    disabled={isDeleting}
                    className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Type DELETE here"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 p-3 sm:p-4 border-t border-gray-700/50 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                  setDeletionScope('both');
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  isDeleting || 
                  deleteConfirmText !== 'DELETE' || 
                  ((deletionScope === 'server' || deletionScope === 'both') && !deletePassword)
                }
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-xs sm:text-sm"
              >
                <FontAwesomeIcon icon={faTrash} className={`text-[10px] ${isDeleting ? 'animate-pulse' : ''}`} />
                {isDeleting ? 'Processing...' : (
                  deletionScope === 'both' ? 'Delete All' :
                  deletionScope === 'server' ? 'Delete Server' :
                  'Clear Local'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selector Modal */}
      {isAvatarSelectorOpen && (
        <AvatarSelector
          currentAvatarId={selectedAvatar.id}
          onSelect={handleAvatarSelect}
          onClose={() => setIsAvatarSelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;