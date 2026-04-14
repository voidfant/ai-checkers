
import React from 'react';
// LogoText import removed
import ThemeToggleButton from './ThemeToggleButton.tsx';

interface RulesScreenProps {
  onClose: () => void;
}

const RulesScreen: React.FC<RulesScreenProps> = ({ onClose }) => {
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
          Russian draughts rules
        </h1>
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm p-5 sm:p-8 rounded-lg shadow-2xl text-neutral-700 dark:text-neutral-200 space-y-4">
          <p><strong>Objective:</strong> Capture all of the opponent's pieces or block them so they have no legal moves.</p>
          
          <p><strong>Board:</strong> Played on an 8x8 board with alternating dark and light squares. Pieces only move on the dark squares.</p>
          
          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Pieces (men):</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Each player starts with 12 men on the three rows closest to them, on the dark squares.</li>
              <li>Men move one step diagonally forward to an unoccupied square.</li>
              <li><strong>Capture (Men):</strong> Men capture by jumping over an adjacent opponent's piece (forward or backward diagonally) to an empty square immediately beyond it. Multiple jumps can be made in a single turn by the same piece if, after a jump, another capture is available from the new square. If a multi-jump sequence is started, it must be completed.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Kings:</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>When a man reaches the farthest row from its starting side (the opponent's back rank), it is promoted to a King.</li>
              <li>Kings can move any number of squares diagonally forward or backward along unblocked diagonals (they are "flying kings").</li>
              <li><strong>Capture (Kings):</strong> A king captures by jumping over an opponent's piece along a diagonal to any empty square beyond that piece, provided the path is clear. The king must land on an empty square directly after the jumped piece or any empty square further along that same diagonal line if clear. Only one piece can be jumped per single leap. If, after a jump, the king can make another jump from its new position (even in a different diagonal direction), it must do so to complete the capture sequence.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Important rules:</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><strong>Mandatory Capture:</strong> If a player has a capture available, they MUST make a capture. If multiple capture options are available (either with different pieces or different jump sequences for one piece), the player may choose among them.</li>
              <li><strong>Completion of Captures:</strong> If a piece makes a capture and, from its new position, can make another capture (with the same piece), it MUST continue capturing until no more captures are possible with that piece in that turn.</li>
              <li>If a man reaches the back rank by means of a capture and becomes a king, and can immediately continue jumping as a king from that square, it must do so in the same turn.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-1 text-pink-600 dark:text-pink-400">Winning & drawing:</h3>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><strong>Win:</strong> A player wins if the opponent has no pieces left, or if the opponent has pieces but cannot make any legal moves.</li>
              <li><strong>Draw:</strong> A draw can occur under several conditions (e.g., three-fold repetition of position with the same player to move, 15 moves by the stronger side in certain king endgames without capture or progress, 15 consecutive king-only moves by both sides without captures or man moves).</li>
            </ul>
          </div>

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

export default RulesScreen;
