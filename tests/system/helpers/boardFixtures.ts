import { BOARD_SIZE } from '../../../constants.ts';
import {
  createEmptySquareState,
  createInitialSquareState,
} from '../../../services/checkersLogic.ts';
import { BoardState, PieceType, Player } from '../../../types.ts';

export const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => createEmptySquareState()),
  );

export const createMandatoryCaptureBoard = (): BoardState => {
  const board = createEmptyBoard();
  board[5][0] = createInitialSquareState(Player.USER, PieceType.MAN);
  board[4][1] = createInitialSquareState(Player.AI, PieceType.MAN);
  board[6][5] = createInitialSquareState(Player.USER, PieceType.MAN);
  return board;
};

export const createPromotionBoard = (): BoardState => {
  const board = createEmptyBoard();
  board[1][2] = createInitialSquareState(Player.USER, PieceType.MAN);
  return board;
};
