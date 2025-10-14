import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faLock, 
  faServer, 
  faHdd, 
  faUserShield,
  faDatabase,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FontAwesomeIcon icon={faShieldAlt} className="text-6xl text-blue-500 mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Privacy & Data Security</h1>
          <p className="text-gray-300 text-lg">
            Your privacy matters. Here's how we protect your data.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* End-to-End Encryption */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faLock} className="text-green-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">End-to-End Encrypted</h2>
                <p className="text-gray-300 mb-3">
                  Your password is never stored in plain text. We use industry-standard bcrypt hashing with salt rounds to ensure your password is secure.
                </p>
                <div className="bg-[#27272A] rounded-lg p-4 border border-gray-700">
                  <code className="text-green-400 text-sm">
                    Password → Bcrypt (10 rounds) → Encrypted Hash → Database
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Server Storage */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faServer} className="text-purple-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">What We Store on Our Servers (NeonDB)</h2>
                <p className="text-gray-300 mb-3">
                  When you create an account, we store the following data on our secure servers:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Email Address</strong> - For account recovery and authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Username</strong> - Your display name</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Encrypted Password</strong> - Hashed and salted, never in plain text</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Profile Preferences</strong> - Avatar selection, language preference, playback settings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">•</span>
                    <span><strong>Account Creation Date</strong> - When you joined</span>
                  </li>
                </ul>
                <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-2">
                    <strong>🔄 NEW: Sync Your Data Across Devices</strong>
                  </p>
                  <p className="text-gray-300 text-sm">
                    When logged in, your <strong>Favorites</strong>, <strong>Watchlist</strong>, and <strong>Watch History</strong> are automatically synced to our secure servers. This means you can access your data from any device by simply logging in!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Storage System */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faHdd} className="text-yellow-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Dual Storage: Your Device + Cloud (Optional)</h2>
                <p className="text-gray-300 mb-4">
                  We use a <strong className="text-blue-400">dual storage system</strong> to give you the best of both worlds:
                </p>

                {/* Logged In Users */}
                <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-400 mb-2">🔐 When You're Logged In:</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Data is saved to <strong>both your device (localStorage)</strong> and <strong>our secure servers (NeonDB)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Access your Favorites, Watchlist, and Watch History from <strong>any device</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Automatic cloud backup - your data is safe even if you clear browser data</span>
                    </li>
                  </ul>
                </div>

                {/* Guest Users */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">👤 When You're Not Logged In (Guest Mode):</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">✓</span>
                      <span>Data is saved <strong>only to your device (localStorage)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">✓</span>
                      <span>No server storage - <strong>100% private</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠</span>
                      <span>Data is tied to this device only - clearing browser data will delete it</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-gray-400 text-sm font-medium mb-2">What's stored:</p>
                  <ul className="space-y-1 text-gray-300 text-sm ml-4">
                    <li>• <strong>Favorites</strong> - Anime you've liked</li>
                    <li>• <strong>Watchlist</strong> - Anime with status (Watching, Completed, On Hold, Dropped, Plan to Watch)</li>
                    <li>• <strong>Watch History</strong> - Your viewing history with progress tracking</li>
                    <li>• <strong>Continue Watching</strong> - Recently watched episodes</li>
                    <li>• <strong>Player Settings</strong> - Autoplay, auto-next, server preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faUserShield} className="text-blue-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Your Privacy is Guaranteed</h2>
                <div className="space-y-3 text-gray-300">
                  <p>
                    ✅ <strong>We DO NOT</strong> sell or share your personal information with third parties
                  </p>
                  <p>
                    ✅ <strong>We DO NOT</strong> store your password in plain text (bcrypt encrypted)
                  </p>
                  <p>
                    ✅ <strong>We DO NOT</strong> use tracking cookies for advertising
                  </p>
                  <p>
                    ✅ <strong>We DO NOT</strong> share your viewing data with anyone
                  </p>
                  <p>
                    ✅ <strong>We DO NOT</strong> require an account to use the platform (guest mode available)
                  </p>
                  <p className="text-blue-400 font-medium mt-4">
                    ℹ️ Your anime data (favorites, watchlist, history) is only synced to our servers when you're logged in, and only for the purpose of cross-device sync.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database Security */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faDatabase} className="text-indigo-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Database Security (NeonDB)</h2>
                <p className="text-gray-300 mb-3">
                  We use NeonDB, a serverless Postgres database with enterprise-grade security:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>SSL/TLS encrypted connections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Regular automated backups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Data encryption at rest</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Password Reset */}
          <div className="bg-[#18181B] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-500/10 p-3 rounded-lg">
                <FontAwesomeIcon icon={faKey} className="text-red-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset Security</h2>
                <p className="text-gray-300 mb-3">
                  Our password reset process is secure:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>Reset links expire after 1 hour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>One-time use tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>Sent only to verified email addresses</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-white mb-4">Questions About Privacy?</h3>
            <p className="text-gray-300 mb-6">
              If you have any questions about how we handle your data, feel free to reach out.
            </p>
            <Link
              to="/contact"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;