
import React from 'react';
import { Player, PieceType } from '../types.ts';

interface PieceProps {
  player: Player;
  type: PieceType;
  isSelected: boolean;
}

const Piece: React.FC<PieceProps> = ({ player, type, isSelected }) => {
  if (player === Player.NONE) return null;

  const playerClass = player === Player.USER ? 'piece-user' : 'piece-ai';
  const kingClass = type === PieceType.KING ? 'piece-king' : '';
  const selectedClass = isSelected ? 'selected-piece ring-4 ring-sky-400 ring-opacity-75' : ''; // Updated ring color

  return (
    <div
      className={`w-[70%] h-[70%] rounded-full flex items-center justify-center transform ${playerClass} ${kingClass} ${selectedClass} transition-none`}
    >
      {/* King indicator is handled by CSS ::after for simplicity */}
    </div>
  );
};

export default Piece;
