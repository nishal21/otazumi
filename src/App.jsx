import { useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { HomeInfoProvider } from "./context/HomeInfoContext";
import { AuthProvider } from "./context/AuthContext";
import { PWAProvider } from "./context/PWAContext";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import { azRoute, categoryRoutes } from "./utils/category.utils";
import "./App.css";
import Producer from "./components/producer/Producer";
import SplashScreen from "./components/splashscreen/SplashScreen";
import { Toaster } from 'react-hot-toast';
import UpdateHistoryPopup from "./components/UpdateHistoryPopup";

// Lazy load page components for code splitting
const Home = lazy(() => import("./pages/Home/Home"));
const AnimeInfo = lazy(() => import("./pages/animeInfo/AnimeInfo"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Category = lazy(() => import("./pages/category/Category"));
const AtoZ = lazy(() => import("./pages/a2z/AtoZ"));
const Search = lazy(() => import("./pages/search/Search"));
const Watch = lazy(() => import("./pages/watch/Watch"));
const Terms = lazy(() => import("./pages/terms/Terms"));
const DMCA = lazy(() => import("./pages/dmca/DMCA"));
const Contact = lazy(() => import("./pages/contact/Contact"));
const Privacy = lazy(() => import("./pages/privacy/Privacy"));
const CodeOfConduct = lazy(() => import("./pages/code-of-conduct/CodeOfConduct"));
const ResetPassword = lazy(() => import("./pages/resetPassword/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/verifyEmail/VerifyEmail"));
const FAQ = lazy(() => import("./pages/faq/FAQ"));
const SubtitleDownload = lazy(() => import("./pages/subtitle-download/SubtitleDownload"));
const Support = lazy(() => import("./pages/support/Support"));
const StatsDashboard = lazy(() => import("./pages/statistics/StatsDashboard"));
const AnimeNews = lazy(() => import("./pages/anime-news/AnimeNews"));
const AnimeQuotes = lazy(() => import("./pages/anime-quotes/AnimeQuotes"));
const AnimeVideoDownload = lazy(() => import("./pages/anime-video-download/AnimeVideoDownload"));
const Health = lazy(() => import("./pages/health/Health"));
const Games = lazy(() => import("./pages/games/Games"));
const AnimeQuiz = lazy(() => import("./pages/games/anime-quiz/AnimeQuiz"));
const CharacterMemory = lazy(() => import("./pages/games/character-memory/CharacterMemory"));
const AnimeTrivia = lazy(() => import("./pages/games/anime-trivia/AnimeTrivia"));
const SpeedQuiz = lazy(() => import("./pages/games/speed-quiz/SpeedQuiz"));
const AnimeGallery = lazy(() => import("./pages/games/anime-gallery/AnimeGallery"));
const AnimeCompare = lazy(() => import("./pages/anime-compare/AnimeCompare"));
const SeasonalCalendar = lazy(() => import("./pages/seasonal-calendar/SeasonalCalendar"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

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
            <Suspense fallback={<LoadingSpinner />}>
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
                <Route path="/code-of-conduct" element={<CodeOfConduct />} />
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
            </Suspense>
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

