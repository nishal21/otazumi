/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { UserDataService } from "@/src/services/userDataService";
import { useAuth } from "@/src/context/AuthContext";

export default function IframePlayer({
  episodeId,
  serverName,
  servertype,
  animeInfo,
  episodeNum,
  episodes,
  playNext,
  autoNext,
}) {
  const { user } = useAuth();
  const watchRecordedRef = useRef(false);
  const baseURL =
    serverName.toLowerCase() === "hd-1" || serverName.toLowerCase() === "hd-3"
      ? import.meta.env.VITE_BASE_IFRAME_URL
      : serverName.toLowerCase() === "hd-4"
      ? import.meta.env.VITE_BASE_IFRAME_URL_2
      : undefined; 

  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    const loadIframeUrl = async () => {
      setLoading(true);
      setIframeLoaded(false);
      setIframeSrc("");

      setIframeSrc(`${baseURL}/${episodeId}/${servertype}`);
    };

    loadIframeUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype, serverName, animeInfo]);

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
    // Reset watch recorded flag when episode changes
    watchRecordedRef.current = false;
  }, [episodeId, episodes]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data;
      if (typeof currentTime === "number" && typeof duration === "number") {
        if (
          currentTime >= duration &&
          currentEpisodeIndex < episodes?.length - 1 &&
          autoNext
        ) {
          playNext(episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, currentEpisodeIndex, episodes, playNext]);

  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    
    // Record watch history when iframe loads
    if (!watchRecordedRef.current && animeInfo && episodeId) {
      watchRecordedRef.current = true;
      
      UserDataService.addToWatchHistory(user?.id, {
        animeId: animeInfo.id || animeInfo.data_id,
        episodeId: episodeId,
        episodeNumber: parseInt(episodeNum) || parseInt(episodeId),
        title: animeInfo.title,
        japanese_title: animeInfo.japanese_title,
        poster: animeInfo.poster,
        adultContent: animeInfo.adultContent,
        progress: 0,
        completed: false,
      }).catch(err => console.error('Failed to record watch history:', err));
    }
    
    return () => {
      // Save continue watching to localStorage
      const continueWatching = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };
      
      if (newEntry.data_id) {
        const existingIndex = continueWatching.findIndex(
          (item) => item.data_id === newEntry.data_id
        );
        if (existingIndex !== -1) {
          continueWatching[existingIndex] = newEntry;
        } else {
          continueWatching.push(newEntry);
        }
        localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <iframe
        key={`${episodeId}-${servertype}-${serverName}-${iframeSrc}`}
        src={iframeSrc}
        allowFullScreen
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 1000);
        }}
      ></iframe>
    </div>
  );
}
