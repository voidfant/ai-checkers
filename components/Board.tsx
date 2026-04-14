

import React, { useRef, useState, useEffect } from 'react';
import { BoardState, Position, Move, Player, AnimatingPieceDetails, DisappearingPieceInfo } from '../types.ts';
import Piece from './Piece.tsx';
import AnimatingPiece from './AnimatingPiece.tsx';
import DisappearingJumpedPiece from './DisappearingJumpedPiece.tsx'; // Import new component
import { BOARD_SIZE } from '../constants.ts';

interface BoardProps {
  boardState: BoardState;
  onSquareClick: (row: number, col: number) => void;
  selectedPiecePos: Position | null;
  validMovesForSelected: Move[];
  disabled: boolean; 
  humanPlayerId: Player; 
  animatingPieceDetails: AnimatingPieceDetails | null; 
  animationDuration: number; 
  disappearingJumpedPieceInfo: DisappearingPieceInfo | null;
  captureAnimationDuration: number;
}

const Board: React.FC<BoardProps> = ({ 
  boardState, 
  onSquareClick, 
  selectedPiecePos, 
  validMovesForSelected, 
  disabled, 
  humanPlayerId,
  animatingPieceDetails,
  animationDuration,
  disappearingJumpedPieceInfo,
  captureAnimationDuration
}) => {
  const isSquarePlayable = (row: number, col: number) => (row + col) % 2 !== 0;
  const isFlipped = humanPlayerId === Player.AI;

  const boardDisplayRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(0);

  useEffect(() => {
    const boardElement = boardDisplayRef.current;
    if (!boardElement) return;

    const calculateSize = () => {
      const newSize = boardElement.offsetWidth / BOARD_SIZE;
      setSquareSize(newSize);
      // console.log('[Board.tsx] Recalculated squareSize:', newSize, 'from offsetWidth:', boardElement.offsetWidth);
    };

    calculateSize();
    const resizeObserver = new ResizeObserver(calculateSize);
    resizeObserver.observe(boardElement);
    return () => resizeObserver.unobserve(boardElement);
  }, []); 

  return (
    <div 
      ref={boardDisplayRef}
      className={`grid grid-cols-8 gap-0 w-full max-w-md md:max-w-lg aspect-square shadow-2xl border-2 border-neutral-300 dark:border-neutral-700 rounded overflow-hidden relative ${disabled ? 'opacity-70 cursor-not-allowed' : ''} transition-none`}
      role="grid"
    >
      {Array.from({ length: BOARD_SIZE }).map((_, visualRowIndex) =>
        Array.from({ length: BOARD_SIZE }).map((_, visualColIndex) => {
          const actualRow = isFlipped ? BOARD_SIZE - 1 - visualRowIndex : visualRowIndex;
          const actualCol = isFlipped ? BOARD_SIZE - 1 - visualColIndex : visualColIndex;
          
          const square = boardState[actualRow][actualCol];
          const isPlayable = isSquarePlayable(actualRow, actualCol);

          const isSelected = selectedPiecePos?.row === actualRow && selectedPiecePos?.col === actualCol;
          const isDest = validMovesForSelected.some(move => move.to.row === actualRow && move.to.col === actualCol);

          let squareBgColor = isPlayable 
            ? 'bg-neutral-500/70 dark:bg-neutral-700/70' // Slightly transparent for gradient bg to show
            : 'bg-neutral-200/70 dark:bg-neutral-400/70'; 
          
          if (isPlayable && isDest) {
            squareBgColor = 'bg-sky-400/80 dark:bg-sky-600/80'; 
          }

          // Check if this square contains the piece that is currently being captured and animated out
          const isDisappearing = disappearingJumpedPieceInfo?.pos.row === actualRow && disappearingJumpedPieceInfo?.pos.col === actualCol;

          return (
            <div
              key={`${visualRowIndex}-${visualColIndex}`}
              className={`relative w-full h-full flex items-center justify-center ${squareBgColor} ${ (isPlayable && !disabled) ? 'cursor-pointer' : ''}`}
              onClick={() => isPlayable && !disabled && onSquareClick(actualRow, actualCol)}
              aria-label={isPlayable ? `Square ${actualRow}-${actualCol}${square.player !== Player.NONE ? `, contains ${square.player} ${square.type}` : ', empty'}${isSelected ? ', selected' : ''}${isDest ? ', valid move' : ''}` : `Non-playable square ${actualRow}-${actualCol}`}
              role="gridcell" 
              tabIndex={isPlayable && !disabled ? 0 : -1}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (isPlayable && !disabled) onSquareClick(actualRow, actualCol);}}}
            >
              {square.player !== Player.NONE && square.type &&
                !(animatingPieceDetails && animatingPieceDetails.from.row === actualRow && animatingPieceDetails.from.col === actualCol) &&
                !isDisappearing && // Don't render static piece if it's disappearing
                <Piece player={square.player} type={square.type} isSelected={isSelected} />
              }
            </div>
          );
        })
      )}
      {animatingPieceDetails && squareSize > 0 && (
        <AnimatingPiece
          details={{...animatingPieceDetails, humanPlayerId: humanPlayerId}}
          squareSize={squareSize}
          animationDuration={animationDuration}
        />
      )}
      {disappearingJumpedPieceInfo && squareSize > 0 && (
        <DisappearingJumpedPiece
          details={disappearingJumpedPieceInfo}
          squareSize={squareSize}
          animationDuration={captureAnimationDuration}
        />
      )}
    </div>
  );
};

export default Board;
