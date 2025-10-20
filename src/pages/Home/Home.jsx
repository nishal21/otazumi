import website_name from "@/src/config/website.js";
import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Trending from "@/src/components/trending/Trending.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import Schedule from "@/src/components/schedule/Schedule";
import ContinueWatching from "@/src/components/continue/ContinueWatching";
import TabbedAnimeSection from "@/src/components/tabbed-anime/TabbedAnimeSection";
import PWAInstallPrompt from "@/src/components/pwa-install/PWAInstallPrompt";
import SeasonalCalendarPreview from "@/src/components/seasonal-calendar-preview/SeasonalCalendarPreview";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();
  
  console.log('Home - Loading:', homeInfoLoading, 'Error:', error, 'Data:', homeInfo ? 'exists' : 'null');
  
  if (homeInfoLoading) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Loader type="home" />
      </div>
    );
  }
  
  if (error) {
    console.error('Home - Error loading:', error);
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Error />
      </div>
    );
  }
  
  if (!homeInfo) {
    console.warn('Home - No data available');
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Error error="404" />
      </div>
    );
  }
  
  return (
    <>
      {/* PWA Install Prompt - Shows once a week */}
      <PWAInstallPrompt />
      
      <div className="pt-16 w-full min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <Spotlight spotlights={homeInfo.spotlights} />
        <div className="mt-6">
          <Genre data={homeInfo.genres} />
        </div>
        <ContinueWatching />
        
        <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
          <div>
            <CategoryCard
              label="Latest Episode"
              data={homeInfo.latest_episode}
              className="mt-[60px]"
              path="recently-updated"
              limit={12}
            />
            <Schedule className="mt-8" />
            <SeasonalCalendarPreview />
            <TabbedAnimeSection 
              topAiring={homeInfo.top_airing}
              mostFavorite={homeInfo.most_favorite}
              latestCompleted={homeInfo.latest_completed}
              className="mt-8"
            />
          </div>
          <div className="w-full mt-[60px]">
            <Trending trending={homeInfo.trending} />
            <Topten data={homeInfo.topten} className="mt-12" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
