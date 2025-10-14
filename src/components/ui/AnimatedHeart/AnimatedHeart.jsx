import React from 'react';

const AnimatedHeart = ({ isFavorite, onToggle, className = "", size = "default", variant = "default" }) => {
  const isCompact = variant === "compact" || size === "small";

  if (isCompact) {
    return (
      <div className={className}>
        <label className="block relative cursor-pointer text-xl select-none transition-all duration-100">
          <input
            className="absolute opacity-0 cursor-pointer h-0 w-0"
            checked={isFavorite}
            onChange={onToggle}
            type="checkbox"
          />
          <div className="top-0 left-0 h-6 w-6 transition-all duration-100 animate-pulse">
            <svg
              className={`w-full h-full transition-all duration-400 ${isFavorite ? 'animate-ping' : ''}`}
              viewBox="0 0 256 256"
            >
              <rect fill="none" height="256" width="256"></rect>
              <path
                className={`${isFavorite ? 'fill-red-500 stroke-0' : 'fill-none stroke-white'}`}
                d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"
                strokeWidth="20px"
                stroke="#ffff"
              ></path>
            </svg>
          </div>
        </label>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="">
        <input
          className="peer hidden"
          checked={isFavorite}
          onChange={onToggle}
          type="checkbox"
        />
        <div className="group flex w-fit cursor-pointer items-center gap-2 overflow-hidden border rounded-full border-pink-700 fill-none p-2 px-3 font-extrabold text-pink-500 transition-all active:scale-90 peer-checked:fill-pink-500 peer-checked:hover:text-white">
          <div className="z-10 transition">
            {isFavorite ? 'LIKED' : 'LIKE'}
          </div>
          <svg
            className="size-6 transition duration-500"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
          </svg>
        </div>
      </label>
    </div>
  );
};

export default AnimatedHeart;