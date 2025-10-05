import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
  faUser,
  faSignInAlt,
  faNewspaper,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";
import AuthModal from "../auth/AuthModal";
import UserProfile from "../auth/UserProfile";
import { getAvatarById, defaultAvatar } from "@/src/config/avatars";
import Avatar from "../ui/Avatar/Avatar";

function Navbar() {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [isNotHomePage, setIsNotHomePage] = useState(
    location.pathname !== "/" && location.pathname !== "/home"
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleHamburgerClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleRandomClick = () => {
    if (location.pathname === "/random") {
      window.location.reload();
    }
  };

  useEffect(() => {
    setIsNotHomePage(
      location.pathname !== "/" && location.pathname !== "/home"
    );
  }, [location.pathname]);

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000] transition-all duration-300 ease-in-out bg-[#0a0a0a]
          ${isScrolled ? "bg-opacity-80 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon
                icon={faBars}
                className="text-xl text-gray-200 cursor-pointer hover:text-white transition-colors"
                onClick={handleHamburgerClick}
              />
              <Link to="/home" className="flex items-center">
                <img src="/logo.svg" alt="Otazumi Logo" className="h-10 w-auto" />
              </Link>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 flex justify-center items-center max-w-none mx-8 hidden md:flex">
            <div className="flex items-center gap-2 w-[600px]">
              <WebSearch />
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>
            </div>
          </div>

          {/* Language Toggle - Desktop */}
          <div className="hidden md:flex items-center mr-4">
            <div className="language-toggle-wrapper-nav">
              <input 
                type="checkbox" 
                id="language-toggle-nav"
                className="language-toggle-nav"
                checked={language === 'JP'}
                onChange={(e) => toggleLanguage(e.target.checked ? 'JP' : 'EN')}
              />
              <div className="language-labels-nav">
                <span className={`language-label-nav ${language === 'EN' ? 'active' : ''}`}>EN</span>
                <span className="language-label-divider-nav">to</span>
                <span className={`language-label-nav ${language === 'JP' ? 'active' : ''}`}>JP</span>
              </div>
            </div>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* News Link */}
            <Link
              to="/news"
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a]/75 hover:bg-[#3F3F46] text-white/70 hover:text-white rounded-lg transition-colors"
              title="Anime News"
            >
              <FontAwesomeIcon icon={faNewspaper} className="text-lg" />
              <span className="font-medium">News</span>
            </Link>

            {/* Quotes Link */}
            <Link
              to="/quotes"
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a]/75 hover:bg-[#3F3F46] text-white/70 hover:text-white rounded-lg transition-colors"
              title="Anime Quotes"
            >
              <FontAwesomeIcon icon={faQuoteLeft} className="text-lg" />
              <span className="font-medium">Quotes</span>
            </Link>

            {/* User Authentication */}
            {isAuthenticated ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white rounded-lg transition-colors"
                title={`${user?.username}'s Profile`}
              >
                <Avatar 
                  avatar={getAvatarById(user?.preferences?.avatarId || user?.avatarId || 1)}
                  size="w-8 h-8"
                />
                <span className="font-medium">{user?.username}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Right Section - Search & Auth */}
          <div className="md:hidden flex items-center gap-2">
            {/* User Authentication - Mobile */}
            {isAuthenticated ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 px-2 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white rounded-lg transition-colors"
                title={`${user?.username}'s Profile`}
              >
                <Avatar 
                  avatar={getAvatarById(user?.preferences?.avatarId || user?.avatarId || 1)}
                  size="w-8 h-8"
                />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            
            {/* Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-[10px] aspect-square bg-[#2a2a2a]/75 text-white/50 hover:text-white rounded-lg transition-colors flex items-center justify-center w-[38px] h-[38px]"
              title={isMobileSearchOpen ? "Close Search" : "Search Anime"}
            >
              <FontAwesomeIcon 
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass} 
                className="w-[18px] h-[18px] transition-transform duration-200"
                style={{ transform: isMobileSearchOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-[#18181B] shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
        </div>
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />

        {/* User Profile Modal */}
        <UserProfile 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;

