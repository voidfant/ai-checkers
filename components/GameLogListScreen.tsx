
import React from 'react';
import { LoggedGame } from '../types.ts';
// LogoText import removed
import ThemeToggleButton from './ThemeToggleButton.tsx';

interface GameLogListScreenProps {
  logs: LoggedGame[];
  onSelectLog: (log: LoggedGame) => void;
  onClose: () => void;
  onClearLogs: () => void;
}

const GameLogListScreen: React.FC<GameLogListScreenProps> = ({ logs, onSelectLog, onClose, onClearLogs }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    } catch (e) {
      return "Invalid Date";
    }
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
          Game logs
        </h1>

        {logs.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 text-lg my-10">No game logs found.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {logs.slice().reverse().map((log) => ( 
              <button
                key={log.id}
                onClick={() => onSelectLog(log)}
                className="w-full text-left p-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800/80 dark:to-neutral-700/80 hover:from-neutral-200 hover:to-neutral-300 dark:hover:from-neutral-700 dark:hover:to-neutral-600 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-700 dark:text-neutral-100">
                    Vs AI (played as {log.humanPlayedAs.toLowerCase()})
                  </span>
                  <span className={`font-bold ${
                    log.result === "1-0" 
                      ? 'text-green-600 dark:text-green-400' 
                      : log.result === "0-1" 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-500 dark:text-yellow-400'
                  }`}>
                    {log.result}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(log.date)} {log.opponentType ? `(${log.opponentType})` : ''}</p>
              </button>
            ))}
          </div>
        )}

        {logs.length > 0 && (
           <button 
            type="button"
            onClick={onClearLogs}
            className="w-full max-w-xs mt-4 mb-4 px-6 py-2.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-orange-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-base block mx-auto"
          >
            Clear all logs
          </button>
        )}

        <button 
          type="button"
          onClick={onClose}
          className="w-full max-w-xs mt-4 mb-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg block mx-auto"
        >
          Back to menu
        </button>
      </div>
    </div>
  );
};

export default GameLogListScreen;
