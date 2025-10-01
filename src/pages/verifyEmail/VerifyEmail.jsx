import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmailToken(token);
  }, [searchParams]);

  const verifyEmailToken = async (token) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email...');
      
      const result = await AuthService.verifyEmail(token);
      
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');
      
      // Update user in context if they're logged in
      if (result.user && user) {
        const updatedUser = {
          ...user,
          isVerified: true,
          updatedAt: new Date().toISOString()
        };
        updateUser(updatedUser);
      }
      
      // Auto-redirect after successful verification
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Email verification failed. The link may be expired or invalid.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!resendEmail) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setResending(true);
      await AuthService.resendVerificationEmail(resendEmail);
      setMessage('Verification email sent! Please check your inbox.');
      setResendEmail('');
    } catch (error) {
      console.error('Resend error:', error);
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              {status === 'verifying' && (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              )}
              {status === 'success' && (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === 'error' && (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {status === 'verifying' && 'Verifying Email'}
              {status === 'success' && '✅ Email Verified!'}
              {status === 'error' && '❌ Verification Failed'}
            </h1>
            <p className="text-gray-300">
              {message}
            </p>
          </div>

          {/* Success Actions */}
          {status === 'success' && (
            <div className="space-y-4">
              <Link
                to="/"
                className="w-full block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Continue to Homepage
              </Link>
            </div>
          )}

          {/* Error Actions - Resend Verification */}
          {status === 'error' && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-400 mb-4 text-center">
                  Need a new verification link?
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
              </div>

              <Link
                to="/"
                className="w-full block text-center px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Back to Homepage
              </Link>
            </div>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="animate-pulse text-gray-400">
                  Please wait while we verify your email...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Having trouble?{' '}
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
