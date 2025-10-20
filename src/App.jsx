import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { HomeInfoProvider } from "./context/HomeInfoContext";
import { AuthProvider } from "./context/AuthContext";
import { PWAProvider } from "./context/PWAContext";
import Home from "./pages/Home/Home";
import AnimeInfo from "./pages/animeInfo/AnimeInfo";
import Profile from "./pages/profile/Profile";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import Category from "./pages/category/Category";
import AtoZ from "./pages/a2z/AtoZ";
import { azRoute, categoryRoutes } from "./utils/category.utils";
import "./App.css";
import Search from "./pages/search/Search";
import Watch from "./pages/watch/Watch";
import Producer from "./components/producer/Producer";
import SplashScreen from "./components/splashscreen/SplashScreen";
import Terms from "./pages/terms/Terms";
import DMCA from "./pages/dmca/DMCA";
import Contact from "./pages/contact/Contact";
import Privacy from "./pages/privacy/Privacy";
import ResetPassword from "./pages/resetPassword/ResetPassword";
import VerifyEmail from "./pages/verifyEmail/VerifyEmail";
import FAQ from "./pages/faq/FAQ";
import SubtitleDownload from "./pages/subtitle-download/SubtitleDownload";
import Support from "./pages/support/Support";
import StatsDashboard from "./pages/statistics/StatsDashboard";
import AnimeNews from "./pages/anime-news/AnimeNews";
import AnimeQuotes from "./pages/anime-quotes/AnimeQuotes";
import AnimeVideoDownload from "./pages/anime-video-download/AnimeVideoDownload";
import { Toaster } from 'react-hot-toast';
import Health from "./pages/health/Health";
import Games from "./pages/games/Games";
import AnimeQuiz from "./pages/games/anime-quiz/AnimeQuiz";
import CharacterMemory from "./pages/games/character-memory/CharacterMemory";
import AnimeTrivia from "./pages/games/anime-trivia/AnimeTrivia";
import SpeedQuiz from "./pages/games/speed-quiz/SpeedQuiz";
import AnimeGallery from "./pages/games/anime-gallery/AnimeGallery";
import UpdateHistoryPopup from "./components/UpdateHistoryPopup";
import AnimeCompare from "./pages/anime-compare/AnimeCompare";
import SeasonalCalendar from "./pages/seasonal-calendar/SeasonalCalendar";

function App() {
  const location = useLocation();

  // Scroll to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Check if the current route is for the splash screen or health page
  const isSplashScreen = location.pathname === "/";
  const isHealthPage = location.pathname === "/health";
  const showNavigation = !isSplashScreen && !isHealthPage;

  return (
    <PWAProvider>
      <AuthProvider>
        <HomeInfoProvider>
          <div className="app-container px-4 lg:px-10" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
            <main className="content max-w-[2048px] mx-auto w-full">
              {showNavigation && <Navbar />}
            <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/:id" element={<AnimeInfo />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/random" element={<AnimeInfo random={true} />} />
            <Route path="/404-not-found-page" element={<Error error="404" />} />
            <Route path="/error-page" element={<Error />} />
            <Route path="/terms-of-service" element={<Terms />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/subtitle-download" element={<SubtitleDownload />} />
            <Route path="/anime-video-download" element={<AnimeVideoDownload />} />
            <Route path="/support" element={<Support />} />
            <Route path="/statistics" element={<StatsDashboard />} />
            <Route path="/news" element={<AnimeNews />} />
            <Route path="/quotes" element={<AnimeQuotes />} />
            <Route path="/health" element={<Health />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/anime-quiz" element={<AnimeQuiz />} />
            <Route path="/games/character-memory" element={<CharacterMemory />} />
            <Route path="/games/anime-trivia" element={<AnimeTrivia />} />
            <Route path="/games/speed-quiz" element={<SpeedQuiz />} />
            <Route path="/games/anime-gallery" element={<AnimeGallery />} />
            <Route path="/compare" element={<AnimeCompare />} />
            <Route path="/seasonal-calendar" element={<SeasonalCalendar />} />
            {/* Render category routes */}
            {categoryRoutes.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <Category path={path} label={path.split("-").join(" ")} />
                }
              />
            ))}
            {/* Render A to Z routes */}
            {azRoute.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={<AtoZ path={path} />}
              />
            ))}
            <Route path="/producer/:id" element={<Producer />} />
            <Route path="/search" element={<Search />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Error error="404" />} />
          </Routes>
          {showNavigation && <Footer />}
        </main>
        <UpdateHistoryPopup />
        <Toaster />
      </div>
        </HomeInfoProvider>
      </AuthProvider>
    </PWAProvider>
  );
}

export default App;

