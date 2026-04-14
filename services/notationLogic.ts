import { GameStatus, Position } from '../types.ts';

/**
 * Converts a board position to Russian Draughts algebraic notation.
 * (0,0) is a8, (7,0) is a1, (0,7) is h8, (7,7) is h1.
 * @param pos The position to convert.
 * @returns Algebraic notation string (e.g., "a1", "h8").
 */
export const positionToNotation = (pos: Position): string => {
  const colChar = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const rowChar = (8 - pos.row).toString();
  return `${colChar}${rowChar}`;
};

/**
 * Determines the game result string (e.g., "1-0", "0-1", "1/2-1/2")
 * from White's perspective.
 * @param status The final game status.
 * @param humanPlayerId The Player ID (Player.USER or Player.AI) that the human was controlling.
 *                      Player.USER pieces are White, Player.AI pieces are Black.
 * @returns The result string.
 */
export const getGameResultString = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.USER_WINS: // Player.USER pieces (White) won
      return "1-0";
    case GameStatus.AI_WINS:   // Player.AI pieces (Black) won
      return "0-1";
    case GameStatus.DRAW_REPETITION:
    case GameStatus.DRAW_KING_DOMINANCE:
    case GameStatus.DRAW_STAGNATION:
    case GameStatus.DRAW_NO_PROGRESS_KING_ENDGAME:
      return "1/2-1/2";
    case GameStatus.AI_ERROR: // Consider AI error a draw or undecided if not handled elsewhere
      return "Error"; 
    default:
      return "*"; // Undecided or ongoing
  }
};
