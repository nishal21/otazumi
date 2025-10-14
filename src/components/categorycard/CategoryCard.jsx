import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import "./CategoryCard.css";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";

const CategoryCard = React.memo(
  ({
    label,
    data,
    showViewMore = true,
    className,
    categoryPage = false,
    cardStyle,
    path,
    limit,
  }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    
    if (limit) {
      data = data.slice(0, limit);
    }

    const [itemsToRender, setItemsToRender] = useState({
      firstRow: [],
      remainingItems: [],
    });

    const getItemsToRender = useCallback(() => {
      if (categoryPage) {
        const firstRow =
          window.innerWidth > 758 && data.length > 4 ? data.slice(0, 4) : [];
        const remainingItems =
          window.innerWidth > 758 && data.length > 4
            ? data.slice(4)
            : data.slice(0);
        return { firstRow, remainingItems };
      }
      return { firstRow: [], remainingItems: data.slice(0) };
    }, [categoryPage, data]);

    useEffect(() => {
      const handleResize = () => {
        setItemsToRender(getItemsToRender());
      };
      const newItems = getItemsToRender();
      setItemsToRender((prev) => {
        if (
          JSON.stringify(prev.firstRow) !== JSON.stringify(newItems.firstRow) ||
          JSON.stringify(prev.remainingItems) !==
            JSON.stringify(newItems.remainingItems)
        ) {
          return newItems;
        }
        return prev;
      });

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [getItemsToRender]);

    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-semibold text-2xl text-white max-[478px]:text-[18px] capitalize tracking-wide">
            {label}
          </h1>
          {showViewMore && (
            <Link
              to={`/${path}`}
              className="flex items-center gap-x-1 py-1 px-2 -mr-2 rounded-md
                text-[13px] font-medium text-[#ffffff80] hover:text-white
                transition-all duration-300 group"
            >
              View all
              <FaChevronRight className="text-[10px] transform transition-transform duration-300 
                group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <>
          {categoryPage && (
            <div
              className={`grid grid-cols-4 gap-x-3 gap-y-8 transition-all duration-300 ease-in-out ${
                categoryPage && itemsToRender.firstRow.length > 0
                  ? "mt-8 max-[758px]:hidden"
                  : ""
              }`}
            >
              {itemsToRender.firstRow.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col category-card-container"
                  style={{ height: "fit-content" }}
                >
                  <div className="w-full h-auto pb-[140%] relative inline-block overflow-hidden rounded-lg shadow-lg group">
                    <div
                      className="inline-block bg-gray-900 absolute left-0 top-0 w-full h-full group hover:cursor-pointer"
                      onClick={() =>
                        navigate(
                          `${
                            path === "top-upcoming"
                              ? `/${item.id}`
                              : `/watch/${item.id}`
                          }`
                        )
                      }
                    >
                      <img
                        src={`${item.poster}`}
                        alt={item.title}
                        className="block w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:blur-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <FontAwesomeIcon
                            icon={faPlay}
                            className="text-[50px] text-white drop-shadow-lg max-[450px]:text-[36px]"
                          />
                        </div>
                      </div>
                    </div>
                    {(item.tvInfo?.rating === "18+" ||
                      item?.adultContent === true) && (
                      <div className="text-white px-2 py-0.5 rounded-lg bg-red-600 absolute top-3 left-3 flex items-center justify-center text-[12px] font-bold">
                        18+
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 pb-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                      <div className="flex items-center justify-start w-full space-x-1.5 z-[100] flex-wrap gap-y-1.5">
                        {item.tvInfo?.sub && (
                          <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-2 text-white py-1">
                            <FontAwesomeIcon
                              icon={faClosedCaptioning}
                              className="text-[11px]"
                            />
                            <p className="text-[11px] font-medium">
                              {item.tvInfo.sub}
                            </p>
                          </div>
                        )}
                        {item.tvInfo?.dub && (
                          <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-2 text-white py-1">
                            <FontAwesomeIcon
                              icon={faMicrophone}
                              className="text-[11px]"
                            />
                            <p className="text-[11px] font-medium">
                              {item.tvInfo.dub}
                            </p>
                          </div>
                        )}
                        {item.tvInfo?.showType && (
                          <div className="bg-[#2a2a2a] text-white rounded-[2px] px-2 py-1 text-[11px] font-medium">
                            {item.tvInfo.showType.split(" ").shift()}
                          </div>
                        )}
                        {item.releaseDate && (
                          <div className="bg-[#2a2a2a] text-white rounded-[2px] px-2 py-1 text-[11px] font-medium">
                            {item.releaseDate}
                          </div>
                        )}
                        {!item.tvInfo?.showType && item.type && (
                          <div className="bg-[#2a2a2a] text-white rounded-[2px] px-2 py-1 text-[11px] font-medium">
                            {item.type}
                          </div>
                        )}
                        {(item.tvInfo?.duration || item.duration) && (
                          <div className="bg-[#2a2a2a] text-white rounded-[2px] px-2 py-1 text-[11px] font-medium">
                            {item.tvInfo?.duration === "m" ||
                            item.tvInfo?.duration === "?" ||
                            item.duration === "m" ||
                            item.duration === "?"
                              ? "N/A"
                              : item.tvInfo?.duration || item.duration || "N/A"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/${item.id}`}
                    className="text-white font-semibold mt-3 item-title hover:text-white hover:cursor-pointer line-clamp-1"
                  >
                    {language === "EN" ? item.title : item.japanese_title}
                  </Link>
                  {item.description && (
                    <div className="line-clamp-3 text-[13px] font-light text-gray-400 mt-3 max-[1200px]:hidden">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className={`grid ${cardStyle || 'grid-cols-6 max-[1400px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3'} gap-x-3 gap-y-8 mt-6 transition-all duration-300 ease-in-out max-[478px]:gap-x-2`}>
            {itemsToRender.remainingItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col transition-transform duration-300 ease-in-out"
                style={{ height: "fit-content" }}
              >
                <div className="w-full h-auto pb-[140%] relative inline-block overflow-hidden rounded-lg shadow-lg group">
                  <div
                    className="inline-block bg-gray-900 absolute left-0 top-0 w-full h-full group hover:cursor-pointer"
                    onClick={() =>
                      navigate(
                        `${
                          path === "top-upcoming"
                            ? `/${item.id}`
                            : `/watch/${item.id}`
                        }`
                      )
                    }
                  >
                    <img
                      src={`${item.poster}`}
                      alt={item.title}
                      className="block w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="text-[50px] text-white drop-shadow-lg max-[450px]:text-[36px]"
                        />
                      </div>
                    </div>
                  </div>
                  {(item.tvInfo?.rating === "18+" ||
                    item?.adultContent === true) && (
                    <div className="text-white px-2 py-0.5 rounded-lg bg-red-600 absolute top-3 left-3 flex items-center justify-center text-[12px] font-bold">
                      18+
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <div className="flex items-center justify-start w-full space-x-1 max-[478px]:space-x-0.5 z-[100] flex-wrap gap-y-1">
                      {item.tvInfo?.sub && (
                        <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-1.5 text-white py-0.5 max-[478px]:py-0.5 max-[478px]:px-1">
                          <FontAwesomeIcon
                            icon={faClosedCaptioning}
                            className="text-[10px]"
                          />
                          <p className="text-[10px] font-medium">
                            {item.tvInfo.sub}
                          </p>
                        </div>
                      )}
                      {item.tvInfo?.dub && (
                        <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-1.5 text-white py-0.5 max-[478px]:py-0.5 max-[478px]:px-1">
                          <FontAwesomeIcon
                            icon={faMicrophone}
                            className="text-[10px]"
                          />
                          <p className="text-[10px] font-medium">
                            {item.tvInfo.dub}
                          </p>
                        </div>
                      )}
                      {item.tvInfo?.showType && (
                        <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1 max-[478px]:hidden">
                          {item.tvInfo.showType.split(" ").shift()}
                        </div>
                      )}
                      {item.releaseDate && (
                        <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1">
                          {item.releaseDate}
                        </div>
                      )}
                      {!item.tvInfo?.showType && item.type && (
                        <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1">
                          {item.type}
                        </div>
                      )}
                      {(item.tvInfo?.duration || item.duration) && (
                        <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1 max-[478px]:hidden">
                          {item.tvInfo?.duration === "m" ||
                          item.tvInfo?.duration === "?" ||
                          item.duration === "m" ||
                          item.duration === "?"
                            ? "N/A"
                            : item.tvInfo?.duration || item.duration || "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/${item.id}`}
                  className="text-white font-semibold mt-3 item-title hover:text-white hover:cursor-pointer line-clamp-1"
                >
                  {language === "EN" ? item.title : item.japanese_title}
                </Link>
              </div>
            ))}
          </div>
        </>
      </div>
    );
  }
);

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
