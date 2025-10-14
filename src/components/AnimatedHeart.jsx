import React from 'react';

const AnimatedHeart = ({ isFavorite, onToggle, className = "" }) => {
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
          <div className="z-10 transition group-hover:translate-x-4">
            {isFavorite ? 'LIKED' : 'LIKE'}
          </div>
          <svg
            className="size-6 transition duration-500 group-hover:scale-[1100%]"
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