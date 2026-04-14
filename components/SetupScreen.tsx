
import React, { useState } from 'react';
// LogoText import removed as it's replaced locally for the main title
// ThemeToggleButton import removed

export type DifficultyLevel = 'easy' | 'standard' | 'hard'; 

interface SetupScreenProps {
  onStartGame: (config: { color: 'white' | 'black' | 'random', difficulty: DifficultyLevel }) => void;
  onViewRules: () => void;
  onViewAbout: () => void; 
  onViewLogs: () => void;
}

type ColorPreference = 'white' | 'black' | 'random';

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, onViewRules, onViewAbout, onViewLogs }) => {
  const [colorPref, setColorPref] = useState<ColorPreference>('white');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({ color: colorPref, difficulty });
  };

  const OptionButton: React.FC<{
    value: string;
    currentValue: string;
    onClick: (value: any) => void;
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ value, currentValue, onClick, children, disabled = false }) => (
    <button
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled}
      className={`px-4 py-2 text-sm sm:text-base rounded-md border-transparent border-2 font-bold 
                  ${currentValue === value 
                    ? 'bg-orange-400 hover:bg-orange-500 text-white' // Light orange for selected
                    : disabled 
                      ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed opacity-70'
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600'}`}
    >
      {children}
    </button>
  );


  return (
    <div className="flex flex-col items-center justify-start flex-grow overflow-y-hidden text-neutral-800 dark:text-neutral-100 p-4 w-full pt-16 sm:pt-20">
      <div className="mb-8 sm:mb-10 text-center"> 
        {/* Replaced LogoText component with a direct div for "CHECKERS VS. GEMINI" */}
        <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 mb-3 md:mb-4">
          CHECKERS VS. GEMINI
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center space-y-5"> 
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mb-4 sm:mb-6 text-center">
          Game setup
        </h1>
        
        <div className="w-full">
          <div className="flex items-center w-full mb-3">
            <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
            <h2 className="text-xl sm:text-2xl font-bold mx-3 sm:mx-4 text-[var(--setup-label-text)] text-center shrink-0">Play as:</h2>
            <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
          <div className="flex justify-center space-x-2 sm:space-x-3">
            <OptionButton value="white" currentValue={colorPref} onClick={setColorPref}>White</OptionButton>
            <OptionButton value="black" currentValue={colorPref} onClick={setColorPref}>Black</OptionButton>
            <OptionButton value="random" currentValue={colorPref} onClick={setColorPref}>Random</OptionButton>
          </div>
        </div>

        <div className="w-full">
           <div className="flex items-center w-full mb-3">
            <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
            <h2 className="text-xl sm:text-2xl font-bold mx-3 sm:mx-4 text-[var(--setup-label-text)] text-center shrink-0">Difficulty:</h2>
            <div className="flex-grow h-px bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
          <div className="flex justify-center space-x-2 sm:space-x-3">
            <OptionButton value="easy" currentValue={difficulty} onClick={setDifficulty}>Easy</OptionButton>
            <OptionButton value="standard" currentValue={difficulty} onClick={setDifficulty}>Standard</OptionButton>
            <OptionButton value="hard" currentValue={difficulty} onClick={setDifficulty}>Hard</OptionButton>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-green-500 via-teal-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-teal-300 focus:ring-opacity-75 text-lg sm:text-xl"
        >
          Start game
        </button>
        <button 
          type="button"
          onClick={onViewRules}
          className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 text-white dark:from-neutral-600 dark:to-neutral-700 dark:hover:from-neutral-700 dark:hover:to-neutral-800 dark:text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-300 focus:ring-opacity-75 text-base sm:text-lg"
        >
          View rules
        </button>
        <button 
          type="button"
          onClick={onViewLogs}
          className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 text-white dark:from-neutral-600 dark:to-neutral-700 dark:hover:from-neutral-700 dark:hover:to-neutral-800 dark:text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-300 focus:ring-opacity-75 text-base sm:text-lg"
        >
          View game logs
        </button>
        <button 
          type="button"
          onClick={onViewAbout}
          className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 text-white dark:from-neutral-600 dark:to-neutral-700 dark:hover:from-neutral-700 dark:hover:to-neutral-800 dark:text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-300 focus:ring-opacity-75 text-base sm:text-lg"
        >
          About project
        </button>
      </form>
    </div>
  );
};

export default SetupScreen;
