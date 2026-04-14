
import { BOARD_SIZE, MOVES_FOR_KING_DOMINANCE_DRAW, MOVES_FOR_STAGNATION_DRAW, REPETITIONS_FOR_DRAW, MOVES_KING_ENDGAME_2_3_PIECES, MOVES_KING_ENDGAME_4_5_PIECES, MOVES_KING_ENDGAME_6_7_PIECES } from '../constants.ts';
import { BoardState, Move, PieceType, Player, Position, SquareState, GameStatus, GameHistoryEntry } from '../types.ts';

export const createInitialSquareState = (player: Player, type: PieceType): SquareState => ({ player, type });
export const createEmptySquareState = (): SquareState => ({ player: Player.NONE });

export const initializeBoard = (): BoardState => {
  const board: BoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null).map(() => createEmptySquareState()));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 0) { // Playable dark squares, (0,0) is light
        if (row < 3) {
          board[row][col] = createInitialSquareState(Player.AI, PieceType.MAN);
        } else if (row > BOARD_SIZE - 4) {
          board[row][col] = createInitialSquareState(Player.USER, PieceType.MAN);
        }
      }
    }
  }
  return board;
};

const isWithinBoard = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

// Helper to get opponent player
const getOpponent = (player: Player): Player => player === Player.USER ? Player.AI : Player.USER;

const getPieceMoves = (board: BoardState, pos: Position, player: Player, pieceType: PieceType): Move[] => {
  const moves: Move[] = [];
  const { row, col } = pos;
  const opponent = getOpponent(player);

  if (pieceType === PieceType.MAN) {
    // Simple moves (forward only for men)
    const forwardDir = player === Player.USER ? -1 : 1;
    for (const dc of [-1, 1]) { // Diagonal left/right
      const nextRow = row + forwardDir;
      const nextCol = col + dc;
      if (isWithinBoard(nextRow, nextCol) && board[nextRow][nextCol].player === Player.NONE) {
        moves.push({ from: pos, to: { row: nextRow, col: nextCol }, isJump: false });
      }
    }

    // Jump moves (forward and backward for men in Russian Draughts)
    for (const dr of [-1, 1]) { // Check both forward and backward jump directions
      for (const dc of [-1, 1]) {
        const opponentRow = row + dr;
        const opponentCol = col + dc;
        const landRow = row + dr * 2;
        const landCol = col + dc * 2;

        if (
          isWithinBoard(opponentRow, opponentCol) &&
          board[opponentRow][opponentCol].player === opponent &&
          isWithinBoard(landRow, landCol) &&
          board[landRow][landCol].player === Player.NONE
        ) {
          moves.push({ from: pos, to: { row: landRow, col: landCol }, isJump: true, jumpedPiece: { row: opponentRow, col: opponentCol } });
        }
      }
    }
  } else if (pieceType === PieceType.KING) {
    // Flying King moves (simple and jumps)
    const directions = [-1, 1];
    for (const dr of directions) {
      for (const dc of directions) { // Iterate all 4 diagonal directions
        // Simple moves (flying)
        for (let k = 1; k < BOARD_SIZE; k++) {
          const nextRow = row + dr * k;
          const nextCol = col + dc * k;
          if (!isWithinBoard(nextRow, nextCol) || board[nextRow][nextCol].player !== Player.NONE) {
            break; // Blocked or off board
          }
          moves.push({ from: pos, to: { row: nextRow, col: nextCol }, isJump: false });
        }

        // Jump moves (flying king)
        let opponentPiecePos: Position | null = null;
        for (let k = 1; k < BOARD_SIZE; k++) {
          const checkRow = row + dr * k;
          const checkCol = col + dc * k;

          if (!isWithinBoard(checkRow, checkCol)) break;

          const squareContent = board[checkRow][checkCol];
          if (squareContent.player === player) break; // Own piece blocks path

          if (squareContent.player === opponent) {
            if (opponentPiecePos) break; // Can only jump one piece per leap, found a second opponent piece in line.
            opponentPiecePos = { row: checkRow, col: checkCol };
          } else if (squareContent.player === Player.NONE) {
            if (opponentPiecePos) { // Found an empty square after an opponent piece
              // King can land on any empty square beyond the jumped piece in this line
              moves.push({ from: pos, to: { row: checkRow, col: checkCol }, isJump: true, jumpedPiece: opponentPiecePos });
            }
          }
        }
      }
    }
  }
  return moves;
};


export const getValidMoves = (board: BoardState, player: Player, specificPiecePos?: Position, midJumpPiecePos?: Position): Move[] => {
  // 1. Handle mid-jump continuation: If a piece just jumped and can jump again, it MUST.
  if (midJumpPiecePos) {
    const piece = board[midJumpPiecePos.row][midJumpPiecePos.col];
    if (piece.player === player && piece.type) {
      // Only jump moves are allowed for the piece that just jumped, if it can continue.
      return getPieceMoves(board, midJumpPiecePos, player, piece.type).filter(m => m.isJump);
    }
    return []; // Should not happen if midJumpPiecePos is correctly set with a valid piece
  }

  // 2. Not a mid-jump: Determine if any jump is available for the player across all their pieces.
  let allPlayerJumps: Move[] = [];
  let allPlayerSimpleMoves: Move[] = []; // Collect simple moves in case no jumps are found

  // Iterate over all player's pieces to find all possible jumps and simple moves.
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].player === player) {
        const currentPiecePos = { row: r, col: c };
        const piece = board[r][c];
        if (piece.type) {
          const pieceMoves = getPieceMoves(board, currentPiecePos, player, piece.type);
          allPlayerJumps.push(...pieceMoves.filter(m => m.isJump));
          allPlayerSimpleMoves.push(...pieceMoves.filter(m => !m.isJump));
        }
      }
    }
  }

  // If jumps are available anywhere for the player, those are the only valid moves (capture is mandatory).
  if (allPlayerJumps.length > 0) {
    if (specificPiecePos) {
      // If a specific piece was selected by the user, only return its jump moves.
      // If this piece has no jumps, this will be empty, correctly indicating it cannot make a (mandatory) move.
      return allPlayerJumps.filter(m => m.from.row === specificPiecePos.row && m.from.col === specificPiecePos.col);
    }
    // For AI or a general check of all player moves, return all available jumps.
    return allPlayerJumps;
  }

  // No jumps available for any piece, so simple moves are allowed.
  if (specificPiecePos) {
    // If a specific piece was selected, return its simple moves.
    return allPlayerSimpleMoves.filter(m => m.from.row === specificPiecePos.row && m.from.col === specificPiecePos.col);
  }
  // For AI or a general check, return all available simple moves.
  return allPlayerSimpleMoves;
};


export const applyMove = (board: BoardState, move: Move): { newBoard: BoardState; pieceJustMoved: Position; pieceTypeAtOrigin: PieceType; pieceTypeAtLanding: PieceType } => {
  const newBoard = board.map(row => row.map(square => ({ ...square })));
  const pieceBeingMoved = { ...newBoard[move.from.row][move.from.col] }; // Copy of piece before moving
  const pieceTypeAtOrigin = pieceBeingMoved.type as PieceType;

  newBoard[move.to.row][move.to.col] = pieceBeingMoved; // pieceBeingMoved still has its original type here
  newBoard[move.from.row][move.from.col] = createEmptySquareState();

  if (move.isJump && move.jumpedPiece) {
    newBoard[move.jumpedPiece.row][move.jumpedPiece.col] = createEmptySquareState();
  }

  let finalPieceType = pieceBeingMoved.type as PieceType;

  // Kinging: A man becomes a king if it lands on the opponent's back rank.
  if (pieceBeingMoved.type === PieceType.MAN) {
    if ((pieceBeingMoved.player === Player.USER && move.to.row === 0) || 
        (pieceBeingMoved.player === Player.AI && move.to.row === BOARD_SIZE - 1)) {
      newBoard[move.to.row][move.to.col].type = PieceType.KING;
      finalPieceType = PieceType.KING;
    }
  }
  return { newBoard, pieceJustMoved: move.to, pieceTypeAtOrigin, pieceTypeAtLanding: finalPieceType };
};

// Helper to generate a simple hash for board state for repetition checks
export const hashBoard = (board: BoardState): string => {
  return board.map(row => 
    row.map(sq => `${sq.player === Player.NONE ? 'N' : sq.player === Player.USER ? 'U' : 'A'}${sq.type === PieceType.KING ? 'K' : 'M'}`)
       .join('')
  ).join('|');
};

// Helper to count pieces
const countPieces = (board: BoardState): { userMen: number, userKings: number, aiMen: number, aiKings: number } => {
  let userMen = 0, userKings = 0, aiMen = 0, aiKings = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece.player === Player.USER) {
        if (piece.type === PieceType.MAN) userMen++;
        else if (piece.type === PieceType.KING) userKings++;
      } else if (piece.player === Player.AI) {
        if (piece.type === PieceType.MAN) aiMen++;
        else if (piece.type === PieceType.KING) aiKings++;
      }
    }
  }
  return { userMen, userKings, aiMen, aiKings };
};

export const checkGameStatus = (
  board: BoardState, 
  currentPlayer: Player, // Player whose turn it WOULD BE next
  gameHistory: GameHistoryEntry[],
  kingDominanceMoves: number, // Moves made by dominant player under 3K+ vs 1K (no men for weaker)
  stagnationMoves: number, // Consecutive king-only, no-capture, no-man-move plys
  kingEndgameNoProgressMoves: number // Consecutive plys in K vs K+ endgames with no capture/promotion
): GameStatus => {
  const opponent = getOpponent(currentPlayer);
  
  // 1. Check for Wins (No pieces or no moves)
  const piecesCount = countPieces(board);
  const currentPlayerTotalPieces = currentPlayer === Player.USER ? (piecesCount.userMen + piecesCount.userKings) : (piecesCount.aiMen + piecesCount.aiKings);
  const opponentTotalPieces = opponent === Player.USER ? (piecesCount.userMen + piecesCount.userKings) : (piecesCount.aiMen + piecesCount.aiKings);

  if (opponentTotalPieces === 0) {
    return currentPlayer === Player.USER ? GameStatus.USER_WINS : GameStatus.AI_WINS;
  }
  if (currentPlayerTotalPieces === 0) {
    return currentPlayer === Player.USER ? GameStatus.AI_WINS : GameStatus.USER_WINS;
  }

  const currentPlayerValidMoves = getValidMoves(board, currentPlayer);
  if (currentPlayerValidMoves.length === 0) {
    // If current player has no moves, they lose (it's opponent's "turn" to have won)
    return currentPlayer === Player.USER ? GameStatus.AI_WINS : GameStatus.USER_WINS;
  }

  // 2. Check for Draw Conditions
  // 2a. Three-fold repetition
  const currentBoardHash = hashBoard(board);
  let repetitions = 0;
  for (const historyEntry of gameHistory) {
    if (historyEntry.boardHash === currentBoardHash && historyEntry.playerToMove === currentPlayer) {
      repetitions++;
    }
  }
  if (repetitions >= REPETITIONS_FOR_DRAW -1) { // Current state + 2 previous identical states
    return GameStatus.DRAW_REPETITION;
  }
  
  // 2b. King Dominance (3+ kings (no men) vs 1 king (no men))
  const { userKings, aiKings, userMen, aiMen } = piecesCount;
  // Weaker side must have NO men for this rule to apply
  let dominantPlayerIsUser = userKings >= 3 && aiKings === 1 && aiMen === 0;
  let dominantPlayerIsAI = aiKings >= 3 && userKings === 1 && userMen === 0;

  if (dominantPlayerIsUser || dominantPlayerIsAI) {
    // kingDominanceMoves is the count of moves made by the dominant player under this condition
    if (kingDominanceMoves >= MOVES_FOR_KING_DOMINANCE_DRAW) {
        return GameStatus.DRAW_KING_DOMINANCE;
    }
  }

  // 2c. Stagnation (15 plys: king moves only, no captures, no man moves)
  if (stagnationMoves >= MOVES_FOR_STAGNATION_DRAW) {
    return GameStatus.DRAW_STAGNATION;
  }

  // 2d. No Progress in King Endgames (both have kings, no captures/promotions for X moves)
  if (userKings > 0 && aiKings > 0) {
    const totalPieces = userMen + userKings + aiMen + aiKings;
    let limit = 0;
    if (totalPieces === 2 || totalPieces === 3) limit = MOVES_KING_ENDGAME_2_3_PIECES;
    else if (totalPieces === 4 || totalPieces === 5) limit = MOVES_KING_ENDGAME_4_5_PIECES;
    else if (totalPieces >= 6 && totalPieces <= 7) limit = MOVES_KING_ENDGAME_6_7_PIECES;
    
    if (limit > 0 && kingEndgameNoProgressMoves >= limit) {
      return GameStatus.DRAW_NO_PROGRESS_KING_ENDGAME;
    }
  }

  return GameStatus.PLAYING;
};

export const boardToText = (board: BoardState, perspective: Player): string => {
  let text = "Board (8x8, (0,0) is top-left):\n";
  text += "  0 1 2 3 4 5 6 7 (cols)\n";
  for (let r = 0; r < BOARD_SIZE; r++) {
    text += `${r} `;
    for (let c = 0; c < BOARD_SIZE; c++) {
      const sq = board[r][c];
      let char = "."; // Empty dark square (playable)
      if ((r + c) % 2 === 0) char = " "; // Light square (unplayable, for visual context)
      
      if (sq.player === Player.USER) char = sq.type === PieceType.KING ? "UK" : "U";
      else if (sq.player === Player.AI) char = sq.type === PieceType.KING ? "AK" : "A";
      
      text += char.padEnd(2) + " ";
    }
    text += "\n";
  }
  text += `Perspective: Player ${perspective}. Your pieces are '${perspective === Player.USER ? "U/UK (White)" : "A/AK (Black)"}'.\n`;
  text += "Rules: Russian Draughts. Capture is mandatory. Men capture forwards/backwards. Kings are 'flying kings' (move/capture any distance along clear diagonals). If a piece makes a jump and can make further jumps with the same piece, that sequence must be completed. Men promote on opponent's back rank and can continue jumping as kings if applicable.\n";
  return text;
};

export const movesToText = (moves: Move[]): string => {
  if (moves.length === 0) return "No available moves.";
  return moves
    .map(
      (m, i) =>
        `${i + 1}. From [${m.from.row},${m.from.col}] to [${m.to.row},${m.to.col}] ${
          m.isJump ? `(Jump over [${m.jumpedPiece?.row},${m.jumpedPiece?.col}])` : "(Simple move)"
        }`
    )
    .join("\n");
};
