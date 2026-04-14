
import React from 'react';
import { LoggedGame } from '../types.ts';
// LogoText import removed
import ThemeToggleButton from './ThemeToggleButton.tsx';

interface GameLogViewScreenProps {
  log: LoggedGame;
  onClose: () => void;
}

const GameLogViewScreen: React.FC<GameLogViewScreenProps> = ({ log, onClose }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    } catch (e) { return "Invalid Date"; }
  };

  return (
    <div className="flex flex-col items-center justify-start flex-grow text-neutral-800 dark:text-neutral-100 p-4 sm:p-6 w-full overflow-y-hidden transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggleButton />
        </div>
        <div className="my-4 md:my-6 text-center mt-12 sm:mt-16">
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 mb-3 md:mb-4">
            CHECKERS VS. GEMINI
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 my-6 sm:my-8 text-center">
          Game notation
        </h1>
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm p-5 sm:p-8 rounded-lg shadow-2xl text-sm sm:text-base text-neutral-700 dark:text-neutral-200 space-y-3">
          <div className="flex flex-wrap justify-between items-center mb-4 pb-2 border-b border-neutral-300 dark:border-neutral-700 gap-2">
            <p><strong>Date:</strong> {formatDate(log.date)}</p>
            <p><strong>Played as:</strong> {log.humanPlayedAs}</p>
            <p><strong>Opponent:</strong> {log.opponentType || 'AI'}</p>
            <p><strong>Result:</strong> <span className={`font-bold ${
              log.result === "1-0" 
                ? 'text-green-600 dark:text-green-400' 
                : log.result === "0-1" 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-yellow-500 dark:text-yellow-400'
            }`}>{log.result}</span></p>
          </div>
          
          <div className="font-mono bg-neutral-200/50 dark:bg-neutral-900/50 p-4 rounded max-h-96 overflow-y-auto text-neutral-800 dark:text-neutral-200">
            {log.moves.length === 0 && <p className="text-neutral-500 dark:text-neutral-400">No moves recorded for this game.</p>}
            {log.moves.map((move, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {move}
              </div>
            ))}
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="w-full max-w-xs mt-6 sm:mt-8 mb-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg block mx-auto"
        >
          Back to log list
        </button>
      </div>
    </div>
  );
};

export default GameLogViewScreen;
