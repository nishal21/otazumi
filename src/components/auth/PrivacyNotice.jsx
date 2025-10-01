import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const PrivacyNotice = () => {
  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-blue-300 font-semibold text-sm mb-2">Privacy & Security</h4>
          <ul className="space-y-1.5 text-xs text-gray-300">
            <li>🔒 Password encrypted (bcrypt) - we never see it</li>
            <li>☁️ Cloud: Email, Username, Avatar, Favorites, Watchlist only</li>
            <li>💾 Your device: Favorites, Watchlist, History</li>
            <li>📧 Email verification required</li>
            <li>🚫 No data tracking or selling</li>
            <li>🗑️ Delete account anytime</li>
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            By signing up, you agree to our{' '}
            <Link to="/terms-of-service" className="text-blue-400 hover:underline" target="_blank">
              Terms
            </Link>
            {' & '}
            <Link to="/dmca" className="text-blue-400 hover:underline" target="_blank">
              DMCA Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;