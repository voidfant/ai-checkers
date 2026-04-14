import React from 'react';
import { Player, DisappearingPieceInfo } from '../types.ts';
import { useState, useEffect, useMemo } from 'react';
import Piece from './Piece.tsx';
import { BOARD_SIZE } from '../constants.ts';

interface DisappearingJumpedPieceProps {
  details: DisappearingPieceInfo;
  squareSize: number;
  animationDuration: number;
}

const DisappearingJumpedPiece: React.FC<DisappearingJumpedPieceProps> = ({ details, squareSize, animationDuration }) => {
  const { player, type, pos, key, humanPlayerId } = details;
  const [isVisible, setIsVisible] = useState(true);

  const isFlipped = humanPlayerId === Player.AI;

  const visualCoords = useMemo(() => {
    let visualRow = pos.row;
    let visualCol = pos.col;

    if (isFlipped) {
      visualRow = BOARD_SIZE - 1 - pos.row;
      visualCol = BOARD_SIZE - 1 - pos.col;
    }
    return { x: visualCol * squareSize, y: visualRow * squareSize };
  }, [pos, squareSize, isFlipped]);

  useEffect(() => {
    // Start the disappearing animation immediately
    setIsVisible(true); // Ensure it's visible initially if re-rendered with new key
    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger fade out and shrink
    }, 20); // Small delay to ensure transition applies

    return () => clearTimeout(timer);
  }, [key]); // Re-trigger if the key changes (e.g. another piece captured)

  if (player === Player.NONE || !type || squareSize <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: visualCoords.x,
        top: visualCoords.y,
        width: squareSize,
        height: squareSize,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.3)',
        transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-in`,
        zIndex: 5, // Below moving piece, above board cells
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      <Piece player={player} type={type} isSelected={false} />
    </div>
  );
};

export default DisappearingJumpedPiece;