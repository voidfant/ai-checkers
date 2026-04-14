
export const BOARD_SIZE = 8;
export const INITIAL_PIECES_PER_ROW = 4; // not directly used, but implies 12 pieces per side
export const USER_START_ROW = BOARD_SIZE - 1;
export const AI_START_ROW = 0;

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

// Draw condition constants
export const MOVES_FOR_KING_DOMINANCE_DRAW = 15; // Moves by the dominant player
export const MOVES_FOR_STAGNATION_DRAW = 15; // Total game plys (king moves only, no captures, no man moves)
export const REPETITIONS_FOR_DRAW = 3;

// New constants for Draw by No Progress in King Endgames (plys)
export const MOVES_KING_ENDGAME_2_3_PIECES = 5;
export const MOVES_KING_ENDGAME_4_5_PIECES = 30;
export const MOVES_KING_ENDGAME_6_7_PIECES = 60;

// Animation Speed
export const ANIMATION_DURATION_MS = 300;
export const CAPTURE_ANIMATION_DURATION_MS = 250; // For captured piece disappearing