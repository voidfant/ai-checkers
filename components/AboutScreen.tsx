
import React from 'react';
// LogoText import removed
import ThemeToggleButton from './ThemeToggleButton.tsx';

interface AboutScreenProps {
  onClose: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onClose }) => {
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
          About this project
        </h1>
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm p-5 sm:p-8 rounded-lg shadow-2xl text-neutral-700 dark:text-neutral-200 space-y-4">
          <p><strong>Project Name:</strong> AI-Checkers (Russian Draughts vs Gemini)</p>
          
          <p><strong>Purpose:</strong> This application is a Telegram Mini App allowing users to play Russian Draughts (Shashki) against an AI opponent powered by Google's Gemini model.</p>
          
          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Key features:</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Play Russian Draughts against an AI.</li>
              <li>Choose to play as White or Black, or have it randomly assigned.</li>
              <li>Visual board that flips based on chosen player color.</li>
              <li>Adherence to standard Russian Draughts rules, including mandatory captures, multi-jumps, and flying kings.</li>
              <li>Game status updates and various draw condition detection.</li>
              <li>Light and Dark theme support.</li>
              <li>Piece movement and capture animations.</li>
              <li>Persistent game log storage.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Technology stack:</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><strong>Frontend Framework:</strong> React with TypeScript</li>
              <li><strong>Styling:</strong> Tailwind CSS</li>
              <li><strong>AI Opponent:</strong> Google Gemini API (<code>gemini-2.5-flash-preview-04-17</code> model) via 
              <code>@google/genai</code> SDK.</li>
              <li><strong>Game Logic:</strong> Custom TypeScript implementation.</li>
              <li><strong>Environment:</strong> Telegram Mini App.</li>
            </ul>
          </div>
          
          <p>This project demonstrates the integration of a generative AI model into a classic board game, providing a dynamic and challenging opponent, all within the Telegram Mini App ecosystem.</p>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="w-full max-w-xs mt-6 sm:mt-8 mb-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg block mx-auto"
        >
          Back to setup
        </button>
      </div>
    </div>
  );
};

export default AboutScreen;
