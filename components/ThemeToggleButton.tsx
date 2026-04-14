
import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center h-7 w-14 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-neutral-900 ${
        isDark ? 'bg-neutral-700' : 'bg-sky-400' // Changed light bg to sky-400 to better match new icon
      }`}
    >
      <span className="sr-only">Toggle theme</span>
      {/* Thumb */}
      <span
        className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-[1.875rem]' : 'translate-x-[0.125rem]' // 30px and 2px
        }`}
      >
        {/* Icon inside the thumb */}
        {isDark ? (
          // EyeSlash Icon for dark theme (when switch is "on" for dark)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" className="w-[1.125rem] h-[1.125rem] text-neutral-700"> {/* 18px */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          // Eye Icon for light theme (when switch is "off" for dark)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.9} stroke="currentColor" className="w-[1.125rem] h-[1.125rem] text-sky-600"> {/* 18px */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
