
import React from 'react';
import { GameStatus, Player } from '../types.ts';

interface GameStatusDisplayProps {
  status: GameStatus;
  currentPlayer: Player;
  humanPlayerId: Player;
  isLoadingAI: boolean;
  isGeminiReady: boolean;
  onNewGame: () => void;
  aiThinkingTime: number; // In 10ms intervals
}

const GRADIENT_CLASS = 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500';
const GREEN_GRADIENT_CLASS = 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-500 dark:to-teal-500';
const BLUE_GRADIENT_CLASS = 'text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-500';

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({ status, currentPlayer, humanPlayerId, isLoadingAI, isGeminiReady, onNewGame, aiThinkingTime }) => {
  const isHumanTurn = currentPlayer === humanPlayerId;
  const isUserActivePlayTurn = isHumanTurn && status === GameStatus.PLAYING && !isLoadingAI;

  let currentStatusText = '';
  let textElementClasses = 'font-bold'; 

  if (isLoadingAI && currentPlayer !== humanPlayerId) {
    const seconds = (aiThinkingTime / 100).toFixed(1);
    currentStatusText = `AI is thinking... ${seconds}s`;
    textElementClasses += ` animate-pulse ${GRADIENT_CLASS}`;
  } else {
    switch (status) {
      case GameStatus.PLAYING:
        if (isHumanTurn) {
          currentStatusText = `Your turn to move`;
        } else { 
          currentStatusText = `AI's turn to move`;
          if (!isGeminiReady && !isLoadingAI) {
            currentStatusText += ' (random moves)';
          }
          textElementClasses += ` ${BLUE_GRADIENT_CLASS}`;
        }
        break;
      case GameStatus.USER_WINS: 
        currentStatusText = humanPlayerId === Player.USER 
            ? 'Congratulations, you win!' 
            : 'White wins! Better luck next time.'; 
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.AI_WINS: 
        currentStatusText = humanPlayerId === Player.AI 
            ? 'Congratulations, you win!' 
            : 'Black wins! Better luck next time.'; 
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.AI_ERROR:
        currentStatusText = 'AI encountered an error, picking random move.';
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.DRAW_REPETITION:
        currentStatusText = "It's a draw by three-fold repetition!";
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.DRAW_KING_DOMINANCE:
        currentStatusText = "Draw: 3+ kings vs 1 king (15 moves rule)!";
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.DRAW_STAGNATION:
        currentStatusText = "Draw: 15 king-only, no-capture moves!";
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      case GameStatus.DRAW_NO_PROGRESS_KING_ENDGAME:
        currentStatusText = "Draw: No progress in king endgame (5/30/60 moves rule)!";
        textElementClasses += ` ${GRADIENT_CLASS}`;
        break;
      default:
        if ((status as string).startsWith('DRAW_')) {
          currentStatusText = "It's a draw!";
        } else if (status !== GameStatus.PLAYING) { 
          currentStatusText = "Game over";
        }
        textElementClasses += ` ${GRADIENT_CLASS}`; 
        break;
    }

    if (currentStatusText === '' && status === GameStatus.PLAYING) {
       if (isHumanTurn) { 
          currentStatusText = `Your turn to move`;
       } else { 
          currentStatusText = `AI's turn to move`;
          if (!isGeminiReady && !isLoadingAI) currentStatusText += ' (random moves)';
          if (!textElementClasses.includes(BLUE_GRADIENT_CLASS)) { 
             textElementClasses += ` ${BLUE_GRADIENT_CLASS}`;
          }
       }
    }
  }
  
  const showNewGameButton = !isLoadingAI &&
                            (status !== GameStatus.PLAYING || (currentPlayer !== humanPlayerId && !isGeminiReady));

  return (
    <div className="text-center p-4 my-4 w-full max-w-sm sm:max-w-md mx-auto">
      <p className={`text-2xl sm:text-3xl mb-3 min-h-16 flex items-center justify-center bg-[var(--status-bar-bg)] shadow-lg rounded-lg px-4 py-3 border border-neutral-200 dark:border-neutral-700 ${textElementClasses}`}>
        {isUserActivePlayTurn ? (
          <>
            <span className={GREEN_GRADIENT_CLASS}>
              {currentStatusText}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 ml-2 shrink-0 text-green-600 dark:text-green-500">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          currentStatusText
        )}
      </p>
      <button
        onClick={onNewGame}
        className={`px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-500 focus:ring-opacity-75 ${
          showNewGameButton ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden={!showNewGameButton}
        tabIndex={showNewGameButton ? 0 : -1}
      >
        New game
      </button>
    </div>
  );
};

export default GameStatusDisplay;