
/** Supported players occupying board squares. */
export enum Player {
  NONE = 'NONE',
  USER = 'USER', // Represents White pieces
  AI = 'AI',     // Represents Black pieces
}

/** Piece categories used in Russian draughts. */
export enum PieceType {
  MAN = 'MAN',
  KING = 'KING',
}

/** State of a single board square. */
export interface SquareState {
  player: Player;
  type?: PieceType;
}

/** Complete 8x8 board state. */
export type BoardState = SquareState[][];

/** Matrix position on the board. */
export interface Position {
  row: number;
  col: number;
}

/** Move model for both simple and capture moves. */
export interface Move {
  from: Position;
  to: Position;
  isJump: boolean;
  jumpedPiece?: Position;
}

/** High-level game lifecycle and outcome states. */
export enum GameStatus {
  PLAYING = 'PLAYING',
  USER_WINS = 'USER_WINS', // White pieces (Player.USER) win
  AI_WINS = 'AI_WINS',     // Black pieces (Player.AI) win
  DRAW_REPETITION = 'DRAW_REPETITION', 
  DRAW_KING_DOMINANCE = 'DRAW_KING_DOMINANCE', 
  DRAW_STAGNATION = 'DRAW_STAGNATION', 
  DRAW_NO_PROGRESS_KING_ENDGAME = 'DRAW_NO_PROGRESS_KING_ENDGAME',
  AI_ERROR = 'AI_ERROR'
}

/** Fallback message shown when Gemini API credentials are missing. */
export const API_KEY_ERROR_MESSAGE =
  'Gemini API Key not configured. AI opponent is disabled. Ensure API_KEY environment variable is set.';

/** Candidate move suggested by AI. */
export interface AISuggestion {
  from: Position;
  to: Position;
}

/** Historical board snapshot for repetition-draw detection. */
export interface GameHistoryEntry {
  boardHash: string; 
  playerToMove: Player;
}

/** Structured move metadata stored in game logs. */
export interface MoveLogEntry {
  pieceType: PieceType; 
  isCapture: boolean;
  player: Player;
  wasPromotion: boolean; 
}

/** Stored representation of a completed game. */
export interface LoggedGame {
  id: string; // Unique identifier for the game
  moves: string[]; // Array of moves in algebraic notation, e.g., ["1. e3-d4 d6-c5", "2. f2-f4 c5:e3:g5"]
  result: string; // Game result, e.g., "1-0", "0-1", "1/2-1/2"
  date: string; // ISO string date of when the game ended
  humanPlayedAs: 'White' | 'Black'; // Which color the human player controlled
  opponentType?: string; // e.g. "AI (Standard)"
}

/** Piece animation payload for a movement transition. */
export interface AnimatingPieceDetails {
  player: Player;
  type: PieceType;
  from: Position;
  to: Position;
  animationKey: number; // For re-triggering animation if same piece moves again (e.g. multi-jump)
}

/** Props payload for `AnimatingPiece` including board-orientation context. */
export interface AnimatingPieceComponentDetails extends AnimatingPieceDetails {
  humanPlayerId: Player;
}

/** Piece metadata for fade/disappear capture animation. */
export interface DisappearingPieceInfo {
  player: Player;
  type: PieceType;
  pos: Position;
  key: number; // To re-trigger animation if needed (though usually one-off)
  humanPlayerId: Player; // To correctly orient if board is flipped
}
