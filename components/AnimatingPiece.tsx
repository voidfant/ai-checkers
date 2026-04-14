import React, { useState, useEffect, useMemo } from 'react';
import { Player, Position, AnimatingPieceComponentDetails } from '../types.ts';
import Piece from './Piece.tsx';
import { BOARD_SIZE } from '../constants.ts';

interface AnimatingPieceProps {
  details: AnimatingPieceComponentDetails; // Includes from, to, player, type, animationKey, humanPlayerId
  squareSize: number;
  animationDuration: number;
}

const AnimatingPiece: React.FC<AnimatingPieceProps> = ({ details, squareSize, animationDuration }) => {
  const { from, to, player, type, animationKey, humanPlayerId } = details;

  const isFlipped = humanPlayerId === Player.AI;

  const calculateVisualCoords = (pos: Position): { x: number; y: number } => {
    let visualRow = pos.row;
    let visualCol = pos.col;

    if (isFlipped) {
      visualRow = BOARD_SIZE - 1 - pos.row;
      visualCol = BOARD_SIZE - 1 - pos.col;
    }
    return { x: visualCol * squareSize, y: visualRow * squareSize };
  };

  const startCoords = useMemo(() => calculateVisualCoords(from), [from, squareSize, isFlipped]);
  const endCoords = useMemo(() => calculateVisualCoords(to), [to, squareSize, isFlipped]);
  
  const [currentPos, setCurrentPos] = useState(startCoords);

  useEffect(() => {
    console.log('[AnimatingPiece] Details:', details, 'SquareSize:', squareSize, 'Start:', startCoords, 'End:', endCoords, 'Key:', animationKey);
    // Set initial position without transition
    setCurrentPos(startCoords);

    // Use a microtask or minimal timeout to allow React to batch state updates
    // and apply the initial style before starting the transition to the end position.
    const rafId = requestAnimationFrame(() => {
        setCurrentPos(endCoords);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [startCoords, endCoords, animationKey, details, squareSize]); // Added details and squareSize for logging consistency

  if (player === Player.NONE || !type || squareSize <= 0) { // Added squareSize <= 0 check
    console.warn('[AnimatingPiece] Rendering null. Player:', player, 'Type:', type, 'SquareSize:', squareSize);
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0, // Left and top are handled by transform
        top: 0,
        width: squareSize,
        height: squareSize,
        transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
        transition: `transform ${animationDuration}ms ease-in-out`,
        zIndex: 10, // Above board cells
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true" // It's a visual animation, not interactive
    >
      <Piece player={player} type={type} isSelected={false} />
    </div>
  );
};

export default AnimatingPiece;
