import { useLanguage } from "@/src/context/LanguageContext";
import {
  faAngleDown,
  faCirclePlay,
  faList,
  faCheck,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import "./Episodelist.css";

function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState("1-100");
  const [episodeNum, setEpisodeNum] = useState(currentEpisode);
  const dropDownRef = useRef(null);
  const [searchedEpisode, setSearchedEpisode] = useState(null);
  const [showFillerInfo, setShowFillerInfo] = useState(false);

  // Check if there are any filler episodes
  const hasFillerEpisodes = episodes?.some((item) => item?.filler);

  const scrollToActiveEpisode = () => {
    if (activeEpisodeRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEpisode = activeEpisodeRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.clientHeight;
      const activeEpisodeTop = activeEpisode.getBoundingClientRect().top;
      const activeEpisodeHeight = activeEpisode.clientHeight;
      const offset = activeEpisodeTop - containerTop;
      container.scrollTop =
        container.scrollTop +
        offset -
        containerHeight / 2 +
        activeEpisodeHeight / 2;
    }
  };
  useEffect(() => {
    setActiveEpisodeId(episodeNum);
  }, [episodeNum]);
  useEffect(() => {
    scrollToActiveEpisode();
  }, [activeEpisodeId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setShowDropDown(false);
      }
      // Close filler info popup when clicking outside
      if (showFillerInfo && !event.target.closest('.filler-info-container')) {
        setShowFillerInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFillerInfo]);

  function handleChange(e) {
    const value = e.target.value;
    if (value.trim() === "") {
      const newRange = findRangeForEpisode(1);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!value || isNaN(value)) {
      setSearchedEpisode(null);
    } else if (
      !isNaN(value) &&
      parseInt(value, 10) > totalEpisodes &&
      episodeNum !== null
    ) {
      const newRange = findRangeForEpisode(episodeNum);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
    } else if (!isNaN(value) && value.trim() !== "") {
      const num = parseInt(value, 10);
      const foundEpisode = episodes.find((item) => item?.episode_no === num);
      if (foundEpisode) {
        const newRange = findRangeForEpisode(num);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
        setSearchedEpisode(foundEpisode?.id);
      }
    } else {
      setSearchedEpisode(null);
    }
  }

  function findRangeForEpisode(episodeNumber) {
    const step = 100;
    const start = Math.floor((episodeNumber - 1) / step) * step + 1;
    const end = Math.min(start + step - 1, totalEpisodes);
    return [start, end];
  }

  function generateRangeOptions(totalEpisodes) {
    const ranges = [];
    const step = 100;

    for (let i = 0; i < totalEpisodes; i += step) {
      const start = i + 1;
      const end = Math.min(i + step, totalEpisodes);
      ranges.push(`${start}-${end}`);
    }
    return ranges;
  }
  useEffect(() => {
    if (currentEpisode && episodeNum) {
      if (episodeNum < selectedRange[0] || episodeNum > selectedRange[1]) {
        const newRange = findRangeForEpisode(episodeNum);
        setSelectedRange(newRange);
        setActiveRange(`${newRange[0]}-${newRange[1]}`);
      }
    }
  }, [currentEpisode, totalEpisodes, episodeNum]);

  const handleRangeSelect = (range) => {
    const [start, end] = range.split("-").map(Number);
    setSelectedRange([start, end]);
  };

  useEffect(() => {
    const activeEpisode = episodes.find(
      (item) => item?.id.match(/ep=(\d+)/)?.[1] === activeEpisodeId
    );
    if (activeEpisode) {
      setEpisodeNum(activeEpisode?.episode_no);
    }
  }, [activeEpisodeId, episodes]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2a2a2a] max-[600px]:px-2">
        <div className="flex items-center gap-4 max-[600px]:gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-semibold text-white max-[600px]:text-[13px]">Episodes</h1>
            {hasFillerEpisodes && (
              <div className="relative filler-info-container">
                <button
                  onClick={() => setShowFillerInfo(!showFillerInfo)}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                  title="Filler episode info"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="text-[12px] max-[600px]:text-[11px]" />
                </button>
                {showFillerInfo && (
                  <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#2a2a2a] border border-amber-800/50 rounded-lg p-3 shadow-xl z-50 max-[600px]:w-[240px] max-[600px]:left-auto max-[600px]:right-0">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-800/50 flex-shrink-0 mt-0.5"></div>
                      <div>
                        <p className="text-[12px] text-amber-300 font-semibold mb-1 max-[600px]:text-[11px]">Filler Episodes</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed max-[600px]:text-[10px]">
                          Episodes marked in <span className="text-amber-400 font-medium">orange/amber</span> are filler content not part of the original manga storyline.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFillerInfo(false)}
                      className="mt-2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors max-[600px]:text-[9px]"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {totalEpisodes > 100 && (
            <div className="flex items-center">
              <div
                onClick={() => setShowDropDown((prev) => !prev)}
                className="text-gray-300 relative cursor-pointer flex items-center gap-2 hover:text-white transition-colors max-[600px]:gap-1"
                ref={dropDownRef}
              >
                <FontAwesomeIcon icon={faList} className="text-gray-400" />
                <p className="text-[12px] max-[600px]:text-[11px]">
                  {selectedRange[0]}-{selectedRange[1]}
                </p>
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className="text-[10px]"
                />
                {showDropDown && (
                  <div className="absolute top-full mt-2 left-0 z-30 bg-[#2a2a2a] w-[150px] max-h-[200px] overflow-y-auto rounded-lg border border-[#3a3a3a] shadow-lg">
                    {generateRangeOptions(totalEpisodes).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleRangeSelect(item);
                          setActiveRange(item);
                        }}
                        className={`hover:bg-[#3a3a3a] cursor-pointer transition-colors ${
                          item === activeRange ? "bg-[#404040]" : ""
                        }`}
                      >
                        <p className="font-medium text-[12px] p-2.5 flex justify-between items-center text-gray-300 hover:text-white max-[600px]:text-[11px] max-[600px]:p-2">
                          {item}
                          {item === activeRange ? (
                            <FontAwesomeIcon icon={faCheck} className="text-white" />
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {totalEpisodes > 100 && (
          <div className="flex items-center min-w-[180px] max-[600px]:min-w-[120px]">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] focus-within:border-gray-500 transition-colors max-[600px]:px-2 max-[600px]:py-1">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-[12px] text-gray-400"
              />
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none text-[13px] text-white placeholder:text-gray-500 max-[600px]:text-[12px]"
                placeholder="Go to episode..."
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
      
      <div ref={listContainerRef} className="w-full flex-1 overflow-y-auto bg-[#1a1a1a] max-h-[calc(100vh-200px)] max-[1200px]:max-h-[400px]">
        <div
          className={`${
            totalEpisodes > 30
              ? "p-4 grid gap-2 max-[600px]:p-2 max-[600px]:gap-1.5" + 
                (totalEpisodes > 100 
                  ? " grid-cols-5" 
                  : " grid-cols-5 max-[1200px]:grid-cols-12 max-[860px]:grid-cols-10 max-[575px]:grid-cols-8 max-[478px]:grid-cols-6 max-[350px]:grid-cols-5")
              : ""
          }`}
        >
          {totalEpisodes > 30
            ? episodes
                .slice(selectedRange[0] - 1, selectedRange[1])
                .map((item, index) => {
                  const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
                  const isActive =
                    activeEpisodeId === episodeNumber ||
                    currentEpisode === episodeNumber;
                  const isSearched = searchedEpisode === item?.id;

                  return (
                    <div
                      key={item?.id}
                      ref={isActive ? activeEpisodeRef : null}
                      className={`flex items-center justify-center rounded-lg h-[35px] text-[13px] font-medium cursor-pointer transition-all max-[600px]:h-[30px] max-[600px]:text-[12px] ${
                        item?.filler
                          ? isActive
                            ? "bg-white text-black ring-1 ring-amber-500"
                            : "bg-gradient-to-br from-amber-900/40 to-orange-900/40 text-amber-400 border border-amber-800/50"
                          : isActive
                          ? "bg-white text-black ring-1 ring-white"
                          : "bg-[#2a2a2a] text-gray-400"
                      } ${
                        item?.filler
                          ? "hover:bg-amber-800/60 hover:text-amber-200"
                          : "hover:bg-[#404040] hover:text-white"
                      } ${isSearched ? "ring-2 ring-white" : ""}`}
                      onClick={() => {
                        if (episodeNumber) {
                          onEpisodeClick(episodeNumber);
                          setActiveEpisodeId(episodeNumber);
                          setSearchedEpisode(null);
                        }
                      }}
                      title={item?.filler ? "Filler Episode" : ""}
                    >
                      <span className="transition-colors">
                        {index + selectedRange[0]}
                      </span>
                    </div>
                  );
                })
            : episodes?.map((item, index) => {
                const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
                const isActive =
                  activeEpisodeId === episodeNumber ||
                  currentEpisode === episodeNumber;
                const isSearched = searchedEpisode === item?.id;

                return (
                  <div
                    key={item?.id}
                    ref={isActive ? activeEpisodeRef : null}
                    className={`w-full px-4 py-2.5 flex items-center justify-start gap-x-4 cursor-pointer transition-all max-[600px]:px-3 max-[600px]:py-2 max-[600px]:gap-x-3 ${
                      item?.filler
                        ? isActive
                          ? "bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-l-2 border-amber-500"
                          : "bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-l-2 border-amber-800/50"
                        : (index + 1) % 2 && !isActive
                        ? "bg-[#202020]"
                        : isActive
                        ? "bg-[#2a2a2a]"
                        : "bg-[#1a1a1a]"
                    } ${
                      item?.filler
                        ? "hover:bg-gradient-to-r hover:from-amber-800/50 hover:to-orange-800/50"
                        : "hover:bg-[#2a2a2a]"
                    } ${isSearched ? "ring-1 ring-white" : ""}`}
                    onClick={() => {
                      if (episodeNumber) {
                        onEpisodeClick(episodeNumber);
                        setActiveEpisodeId(episodeNumber);
                        setSearchedEpisode(null);
                      }
                    }}
                  >
                    <p className={`text-[14px] font-medium max-[600px]:text-[13px] ${
                      item?.filler
                        ? "text-amber-400"
                        : isActive
                        ? "text-white"
                        : "text-gray-400"
                    }`}>
                      {index + 1}
                    </p>
                    <div className="w-full flex items-center justify-between gap-x-[5px]">
                      <div className="flex items-center gap-x-2 flex-1 min-w-0">
                        <h1 className={`line-clamp-1 text-[14px] transition-colors max-[600px]:text-[13px] ${
                          item?.filler
                            ? "text-amber-300 font-medium"
                            : isActive
                            ? "text-white font-medium"
                            : "text-gray-400 font-normal"
                        }`}>
                          {language === "EN" ? item?.title : item?.japanese_title}
                        </h1>
                        {item?.filler && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-900/60 text-amber-300 rounded border border-amber-700/50 whitespace-nowrap max-[600px]:text-[9px] max-[600px]:px-1">
                            FILLER
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <FontAwesomeIcon
                          icon={faCirclePlay}
                          className={`w-[18px] h-[18px] max-[600px]:w-[16px] max-[600px]:h-[16px] ${
                            item?.filler ? "text-amber-400" : "text-white"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default Episodelist;