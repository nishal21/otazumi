import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEye, faEyeSlash, faUser, faEnvelope, faLock, faCamera } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import AvatarSelector from './AvatarSelector';
import ForgotPassword from './ForgotPassword';
import PrivacyNotice from './PrivacyNotice';
import { getRandomAvatar } from '../../config/avatars';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  // Prevent body scroll when modal is open, but only if child modals are not open
  // Child modals (ForgotPassword, AvatarSelector) handle their own scroll locking
  useBodyScrollLock(isOpen && !isForgotPasswordOpen && !isAvatarSelectorOpen);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const user = await AuthService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          avatar: selectedAvatar.id
        });

        // Update user with avatar preference
        const userWithAvatar = {
          ...user,
          preferences: { ...user.preferences, avatarId: selectedAvatar.id }
        };

        login(userWithAvatar, 'temp_token');
        onClose();
      } else {
        const user = await AuthService.login(formData.email, formData.password);
        login(user, 'temp_token');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    setError('');
    if (mode === 'login') {
      setSelectedAvatar(getRandomAvatar());
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000001] flex items-center justify-center p-4">
        <div className="bg-[#18181B] rounded-2xl w-full max-w-md mx-auto border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Privacy Notice (Register only) */}
            {mode === 'register' && <PrivacyNotice />}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Avatar Selection (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Profile Avatar</label>
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedAvatar.gradient} flex items-center justify-center relative cursor-pointer group ring-2 ring-gray-600`}
                       onClick={() => setIsAvatarSelectorOpen(true)}>
                    <span className="text-5xl">{selectedAvatar.characterEmoji}</span>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedAvatar.name}</p>
                    <p className="text-gray-400 text-xs">{selectedAvatar.anime}</p>
                    <button
                      type="button"
                      onClick={() => setIsAvatarSelectorOpen(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors mt-1"
                    >
                      Change Avatar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Username (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#27272A] border border-gray-600 text-white rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-gray-700/50">
              <p className="text-gray-400">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {isAvatarSelectorOpen && (
        <AvatarSelector
          currentAvatarId={selectedAvatar.id}
          onSelect={handleAvatarSelect}
          onClose={() => setIsAvatarSelectorOpen(false)}
        />
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <ForgotPassword
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          onBackToLogin={() => {
            setIsForgotPasswordOpen(false);
          }}
        />
      )}
    </>
  );
};

export default AuthModal;