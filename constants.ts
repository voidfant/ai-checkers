
/** Size of one side of the draughts board (8x8). */
export const BOARD_SIZE = 8;
/** Number of playable starting pieces per row for each side. */
export const INITIAL_PIECES_PER_ROW = 4; // not directly used, but implies 12 pieces per side
/** Bottom row index from the user's perspective. */
export const USER_START_ROW = BOARD_SIZE - 1;
/** Top row index from the AI's perspective. */
export const AI_START_ROW = 0;

/** Default Gemini model identifier used for move generation. */
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

/** Dominance-move threshold for a king-dominance draw rule. */
export const MOVES_FOR_KING_DOMINANCE_DRAW = 15; // Moves by the dominant player
/** Ply threshold for king-only stagnation draw rule. */
export const MOVES_FOR_STAGNATION_DRAW = 15; // Total game plys (king moves only, no captures, no man moves)
/** Number of repeated positions required for a repetition draw. */
export const REPETITIONS_FOR_DRAW = 3;

/** No-progress threshold when 2-3 total pieces remain in king endgames (plies). */
export const MOVES_KING_ENDGAME_2_3_PIECES = 5;
/** No-progress threshold when 4-5 total pieces remain in king endgames (plies). */
export const MOVES_KING_ENDGAME_4_5_PIECES = 30;
/** No-progress threshold when 6-7 total pieces remain in king endgames (plies). */
export const MOVES_KING_ENDGAME_6_7_PIECES = 60;

/** Standard piece movement animation duration in milliseconds. */
export const ANIMATION_DURATION_MS = 300;
/** Capture disappearance animation duration in milliseconds. */
export const CAPTURE_ANIMATION_DURATION_MS = 250; // For captured piece disappearing
