/* eslint-disable react/prop-types */
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import artplayerPluginChapter from "./artPlayerPluinChaper";
import autoSkip from "./autoSkip";
import artplayerPluginVttThumbnail from "./artPlayerPluginVttThumbnail";
import {
  backward10Icon,
  backwardIcon,
  captionIcon,
  forward10Icon,
  forwardIcon,
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  logo,
  muteIcon,
  pauseIcon,
  pipIcon,
  playIcon,
  playIconLg,
  settingsIcon,
  volumeIcon,
} from "./PlayerIcons";
import "./Player.css";
import website_name from "@/src/config/website";
import getChapterStyles from "./getChapterStyle";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginUploadSubtitle from "./artplayerPluginUploadSubtitle";
import { UserDataService } from "@/src/services/userDataService";
import { useAuth } from "@/src/context/AuthContext";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

const KEY_CODES = {
  M: "m",
  I: "i",
  F: "f",
  V: "v",
  SPACE: " ",
  ARROW_UP: "arrowup",
  ARROW_DOWN: "arrowdown",
  ARROW_RIGHT: "arrowright",
  ARROW_LEFT: "arrowleft",
};

export default function Player({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  autoSkipIntro,
  autoPlay,
  autoNext,
  episodeId,
  episodes,
  playNext,
  animeInfo,
  episodeNum,
  streamInfo,
}) {
  const { user } = useAuth();
  const artRef = useRef(null);
  const leftAtRef = useRef(0);
  const watchRecordedRef = useRef(false);
  const proxy = import.meta.env.VITE_PROXY_URL;
  const m3u8proxy = import.meta.env.VITE_M3U8_PROXY_URL?.split(",") || [];
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

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
    const applyChapterStyles = () => {
      const existingStyles = document.querySelectorAll(
        "style[data-chapter-styles]"
      );
      existingStyles.forEach((style) => style.remove());
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-chapter-styles", "true");
      const styles = getChapterStyles(intro, outro);
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      return () => {
        styleElement.remove();
      };
    };

    if (streamUrl || intro || outro) {
      const cleanup = applyChapterStyles();
      return cleanup;
    }
  }, [streamUrl, intro, outro]);

  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();
      
      const iframeUrl = streamInfo?.streamingLink?.iframe;
      const headers = {};
      if (iframeUrl) {
        try {
          headers.referer = new URL(iframeUrl).origin + "/";
        } catch (e) {
          console.error("Invalid iframe URL:", iframeUrl);
        }
      }
      
      // Custom loader to proxy all HLS requests
      class ProxyLoader extends Hls.DefaultConfig.loader {
        constructor(config) {
          super(config);
          const load = this.load.bind(this);
          this.load = function(context, config, callbacks) {
            let url = context.url;
            
            // Fix URLs that were incorrectly rewritten by the proxy to 127.0.0.1:8080
            // The proxy rewrites URLs to local endpoints like /m3u8-proxy and /ts-proxy
            if (url.includes('127.0.0.1:8080')) {
              const proxyDomain = m3u8proxy[0].split('/m3u8-proxy')[0];
              // Replace localhost with the actual proxy domain
              url = url.replace('http://127.0.0.1:8080', proxyDomain);
            }
            
            // Only proxy if URL doesn't already include the proxy domain
            if (m3u8proxy.length > 0 && !url.includes(m3u8proxy[0].split('/m3u8-proxy')[0])) {
              const proxyUrl = m3u8proxy[Math.floor(Math.random() * m3u8proxy.length)];
              context.url = proxyUrl + encodeURIComponent(url) + "&headers=" + encodeURIComponent(JSON.stringify(headers));
            } else {
              context.url = url;
            }
            
            return load(context, config, callbacks);
          };
        }
      }
      
      const hls = new Hls({
        loader: ProxyLoader,
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      // Error handling with fallback
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, attempting to recover...');
              // Try to recover
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover:', data);
              // Optionally: Try loading without proxy as fallback
              break;
          }
        }
      });
      
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;

      art.on("destroy", () => hls.destroy());

      // hls.on(Hls.Events.ERROR, (event, data) => {
      //   console.error("HLS.js error:", data);
      // });
      video.addEventListener("timeupdate", () => {
        const currentTime = Math.round(video.currentTime);
        const duration = Math.round(video.duration);
        if (duration > 0 && currentTime >= duration) {
            art.pause();
            if (currentEpisodeIndex < episodes?.length - 1 && autoNext) {
              playNext(
                episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
              );
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("timeupdate", () => {
        const currentTime = Math.round(video.currentTime);
        const duration = Math.round(video.duration);
        if (duration > 0 && currentTime >= duration) {
            art.pause();
            if (currentEpisodeIndex < episodes?.length - 1 && autoNext) {
              playNext(
                episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
              );
          }
        }
      });
    } else {
      console.log("Unsupported playback format: m3u8");
    }
  };

  const createChapters = () => {
    const chapters = [];
    if (intro?.start !== 0 || intro?.end !== 0) {
      chapters.push({ start: intro.start, end: intro.end, title: "intro" });
    }
    if (outro?.start !== 0 || outro?.end !== 0) {
      chapters.push({ start: outro.start, end: outro.end, title: "outro" });
    }
    return chapters;
  };

  const handleKeydown = (event, art) => {
    const tagName = event.target.tagName.toLowerCase();

    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case KEY_CODES.M:
        art.muted = !art.muted;
        break;
      case KEY_CODES.I:
        art.pip = !art.pip;
        break;
      case KEY_CODES.F:
        event.preventDefault();
        event.stopPropagation();
        art.fullscreen = !art.fullscreen;
        break;
      case KEY_CODES.V:
        event.preventDefault();
        event.stopPropagation();
        art.subtitle.show = !art.subtitle.show;
        break;
      case KEY_CODES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        art.playing ? art.pause() : art.play();
        break;
      case KEY_CODES.ARROW_UP:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.min(art.volume + 0.1, 1);
        break;
      case KEY_CODES.ARROW_DOWN:
        event.preventDefault();
        event.stopPropagation();
        art.volume = Math.max(art.volume - 0.1, 0);
        break;
      case KEY_CODES.ARROW_RIGHT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.min(art.currentTime + 10, art.duration);
        break;
      case KEY_CODES.ARROW_LEFT:
        event.preventDefault();
        event.stopPropagation();
        art.currentTime = Math.max(art.currentTime - 10, 0);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    const iframeUrl = streamInfo?.streamingLink?.iframe;
    const headers = {};
    if (iframeUrl) {
      headers.referer = new URL(iframeUrl).origin + "/";
    }
    console.log(m3u8proxy[Math.floor(Math.random() * m3u8proxy?.length)] +
        encodeURIComponent(streamUrl) +
         "&headers=" +
         encodeURIComponent(JSON.stringify(headers)));

    const art = new Artplayer({
      url:
        m3u8proxy[Math.floor(Math.random() * m3u8proxy?.length)] +
        encodeURIComponent(streamUrl) +
         "&headers=" +
         encodeURIComponent(JSON.stringify(headers)),
      container: artRef.current,
      type: "m3u8",
      autoplay: autoPlay,
      volume: 1,
      setting: true,
      playbackRate: true,
      pip: true,
      hotkey: false,
      fullscreen: true,
      mutex: true,
      playsInline: true,
      lock: true,
      airplay: true,
      autoOrientation: true,
      fastForward: true,
      aspectRatio: true,
      moreVideoAttr: {
        crossOrigin: 'anonymous',
        preload: 'none',
        playsInline: true,
      },
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level) => level.height + "P",
            title: "Quality",
            auto: "Auto",
          },
        }),
        artplayerPluginUploadSubtitle(),
        artplayerPluginChapter({ chapters: createChapters() }),
      ],
      subtitle: {
        style: {
          color: "#fff",
          "font-weight": "400",
          left: "50%",
          transform: "translateX(-50%)",
          "margin-bottom": "2rem",
        },
        escape: false,
      },
      layers: [
        {
          name: website_name,
          html: logo,
          tooltip: website_name,
          style: {
            opacity: 1,
            position: "absolute",
            top: "5px",
            right: "5px",
            transition: "opacity 0.5s ease-out",
          },
        },
        {
          html: "",
          style: {
            position: "absolute",
            left: "50%",
            top: 0,
            width: "20%",
            height: "100%",
            transform: "translateX(-50%)",
          },
          disable: !Artplayer.utils.isMobile,
          click: () => art.toggle(),
        },
        {
          name: "rewind",
          html: "",
          style: { position: "absolute", left: 0, top: 0, width: "40%", height: "100%" },
          disable: !Artplayer.utils.isMobile,
          click: () => {
            art.controls.show = !art.controls.show;
          },
        },
        {
          name: "forward",
          html: "",
          style: { position: "absolute", right: 0, top: 0, width: "40%", height: "100%" },
          disable: !Artplayer.utils.isMobile,
          click: () => {
            art.controls.show = !art.controls.show;
          },
        },
        {
          name: "backwardIcon",
          html: backwardIcon,
          style: {
            position: "absolute",
            left: "25%",
            top: "50%",
            transform: "translate(50%,-50%)",
            opacity: 0,
            transition: "opacity 0.5s ease-in-out",
          },
          disable: !Artplayer.utils.isMobile,
        },
        {
          name: "forwardIcon",
          html: forwardIcon,
          style: {
            position: "absolute",
            right: "25%",
            top: "50%",
            transform: "translate(50%, -50%)",
            opacity: 0,
            transition: "opacity 0.5s ease-in-out",
          },
          disable: !Artplayer.utils.isMobile,
        },
      ],
      controls: [
        {
          html: backward10Icon,
          position: "right",
          tooltip: "Backward 10s",
          click: () => {
            art.currentTime = Math.max(art.currentTime - 10, 0);
          },
        },
        {
          html: forward10Icon,
          position: "right",
          tooltip: "Forward 10s",
          click: () => {
            art.currentTime = Math.min(art.currentTime + 10, art.duration);
          },
        },
      ],
      icons: {
        play: playIcon,
        pause: pauseIcon,
        setting: settingsIcon,
        volume: volumeIcon,
        pip: pipIcon,
        volumeClose: muteIcon,
        state: playIconLg,
        loading: loadingIcon,
        fullscreenOn: fullScreenOnIcon,
        fullscreenOff: fullScreenOffIcon,
      },
      customType: { m3u8: playM3u8 },
    });
    art.on("resize", () => {
      art.subtitle.style({
        fontSize:
          (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + "px",
      });
    });
    art.on("ready", () => {
      const continueWatchingList = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const currentEntry = continueWatchingList.find((item) => item.episodeId === episodeId);
      if (currentEntry?.leftAt) art.currentTime = currentEntry.leftAt;

      // Record watch history when video starts playing
      art.on("video:play", () => {
        if (!watchRecordedRef.current && animeInfo) {
          watchRecordedRef.current = true;
          
          // Record to watch history
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
      });

      art.on("video:timeupdate", () => {
        leftAtRef.current = Math.floor(art.currentTime);
        
        // Update watch progress every 30 seconds if video is playing
        const currentProgress = Math.floor(art.currentTime);
        if (currentProgress > 0 && currentProgress % 30 === 0 && animeInfo) {
          const watchedPercentage = (art.currentTime / art.duration) * 100;
          const isCompleted = watchedPercentage >= 90; // Consider completed if 90% watched
          
          UserDataService.addToWatchHistory(user?.id, {
            animeId: animeInfo.id || animeInfo.data_id,
            episodeId: episodeId,
            episodeNumber: parseInt(episodeNum) || parseInt(episodeId),
            title: animeInfo.title,
            japanese_title: animeInfo.japanese_title,
            poster: animeInfo.poster,
            adultContent: animeInfo.adultContent,
            progress: currentProgress,
            completed: isCompleted,
          }).catch(err => console.error('Failed to update watch progress:', err));
        }
      });

      setTimeout(() => {
        art.layers[website_name].style.opacity = 0;
      }, 2000);

      const defaultSubtitle = subtitles?.find((sub) => sub.label.toLowerCase() === "english");
      if (defaultSubtitle) {
        art.subtitle.switch(defaultSubtitle.file, {
          name: defaultSubtitle.label,
          default: true,
        });
      }

      const skipRanges = [
        ...(intro.start != null && intro.end != null ? [[intro.start + 1, intro.end - 1]] : []),
        ...(outro.start != null && outro.end != null ? [[outro.start + 1, outro.end]] : []),
      ];
      autoSkipIntro && art.plugins.add(autoSkip(skipRanges));

      document.addEventListener("keydown", (event) => handleKeydown(event, art));

      art.subtitle.style({
        fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + "px",
      });

      if (thumbnail) {
        art.plugins.add(
          artplayerPluginVttThumbnail({
            vtt: `${proxy}${thumbnail}`,
          })
        );
      }
      const $rewind = art.layers["rewind"];
      const $forward = art.layers["forward"];
      Artplayer.utils.isMobile &&
        art.proxy($rewind, "dblclick", () => {
          art.currentTime = Math.max(0, art.currentTime - 10);
          art.layers["backwardIcon"].style.opacity = 1;
          setTimeout(() => {
            art.layers["backwardIcon"].style.opacity = 0;
          }, 300);
        });
      Artplayer.utils.isMobile &&
        art.proxy($forward, "dblclick", () => {
          art.currentTime = Math.max(0, art.currentTime + 10);
          art.layers["forwardIcon"].style.opacity = 1;
          setTimeout(() => {
            art.layers["forwardIcon"].style.opacity = 0;
          }, 300);
        });
      if (subtitles?.length > 0) {
        const defaultEnglishSub =
          subtitles.find((sub) => sub.label.toLowerCase() === "english" && sub.default) ||
          subtitles.find((sub) => sub.label.toLowerCase() === "english");

        art.setting.add({
          name: "captions",
          icon: captionIcon,
          html: "Subtitle",
          tooltip: defaultEnglishSub?.label || "default",
          position: "right",
          selector: [
            {
              html: "Display",
              switch: true,
              onSwitch: (item) => {
                item.tooltip = item.switch ? "Hide" : "Show";
                art.subtitle.show = !item.switch;
                return !item.switch;
              },
            },
            ...subtitles.map((sub) => ({
              default: sub.label.toLowerCase() === "english" && sub === defaultEnglishSub,
              html: sub.label,
              url: sub.file,
            })),
          ],
          onSelect: (item) => {
            art.subtitle.switch(item.url, { name: item.html });
            return item.html;
          },
        });
      }
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
      document.removeEventListener("keydown", handleKeydown);
      
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
        leftAt: leftAtRef.current,
      };

      if (newEntry.data_id) {
        const existingIndex = continueWatching.findIndex((item) => item.data_id === newEntry.data_id);
        if (existingIndex !== -1) {
          continueWatching[existingIndex] = newEntry;
        } else {
          continueWatching.push(newEntry);
        }
        localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
        
        // Record final watch state to history if video was played
        if (watchRecordedRef.current && animeInfo && art) {
          const finalProgress = leftAtRef.current;
          const watchedPercentage = art.duration > 0 ? (finalProgress / art.duration) * 100 : 0;
          const isCompleted = watchedPercentage >= 90;
          
          UserDataService.addToWatchHistory(user?.id, {
            animeId: animeInfo.id || animeInfo.data_id,
            episodeId: episodeId,
            episodeNumber: parseInt(episodeNum) || parseInt(episodeId),
            title: animeInfo.title,
            japanese_title: animeInfo.japanese_title,
            poster: animeInfo.poster,
            adultContent: animeInfo.adultContent,
            progress: finalProgress,
            completed: isCompleted,
          }).catch(err => console.error('Failed to save final watch state:', err));
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl, subtitles, intro, outro]);

  return <div ref={artRef} className="w-full h-full"></div>;
}