import { describe, expect, it } from 'vitest';
import {
  applyMove,
  getValidMoves,
  initializeBoard,
} from '../../../services/checkersLogic.ts';
import { PieceType, Player } from '../../../types.ts';
import {
  createMandatoryCaptureBoard,
  createPromotionBoard,
} from '../helpers/boardFixtures.ts';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runRulesSuite } from '../suites/rulesSuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

describe('rules engine checks', () => {
  it('initializes a legal 8x8 board state', () => {
    const board = initializeBoard();
    const squares = board.flat();
    const userPieces = squares.filter((square) => square.player === Player.USER);
    const aiPieces = squares.filter((square) => square.player === Player.AI);

    const body = expectHttpOk(
      httpOk({
        rows: board.length,
        columns: board[0].length,
        userPieces: userPieces.length,
        aiPieces: aiPieces.length,
      }),
    );

    expect(body).toEqual({
      rows: 8,
      columns: 8,
      userPieces: 12,
      aiPieces: 12,
    });
  });

  it('enforces mandatory capture over a simple move', () => {
    const moves = getValidMoves(createMandatoryCaptureBoard(), Player.USER);
    const body = expectHttpOk(httpOk({ moves }));

    expect(body.moves).toHaveLength(1);
    expect(body.moves[0]).toMatchObject({
      from: { row: 5, col: 0 },
      to: { row: 3, col: 2 },
      isJump: true,
      jumpedPiece: { row: 4, col: 1 },
    });
  });

  it('promotes a man to king on the last rank', () => {
    const board = createPromotionBoard();
    const result = applyMove(board, {
      from: { row: 1, col: 2 },
      to: { row: 0, col: 1 },
      isJump: false,
    });
    const body = expectHttpOk(httpOk(result));

    expect(body.pieceTypeAtOrigin).toBe(PieceType.MAN);
    expect(body.pieceTypeAtLanding).toBe(PieceType.KING);
    expect(body.newBoard[0][1].type).toBe(PieceType.KING);
  });

  it('executes rules probes as 200 OK checks', async () => {
    const checks = await runRulesSuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body).toHaveLength(3);
    expect(body.every((check) => check.status === 200)).toBe(true);
  });
});
