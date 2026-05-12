import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Board from '../../../components/Board.tsx';
import { initializeBoard } from '../../../services/checkersLogic.ts';
import { Player } from '../../../types.ts';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runInterfaceSuite } from '../suites/interfaceSuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

describe('interface checks', () => {
  it('renders the board through React Testing Library', () => {
    const onSquareClick = vi.fn();

    render(
      <Board
        boardState={initializeBoard()}
        onSquareClick={onSquareClick}
        selectedPiecePos={{ row: 5, col: 0 }}
        validMovesForSelected={[{ from: { row: 5, col: 0 }, to: { row: 4, col: 1 }, isJump: false }]}
        disabled={false}
        humanPlayerId={Player.USER}
        animatingPieceDetails={null}
        animationDuration={0}
        disappearingJumpedPieceInfo={null}
        captureAnimationDuration={0}
      />,
    );

    const body = expectHttpOk(httpOk({ renderedCells: screen.getAllByRole('gridcell').length }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(body.renderedCells).toBe(64);

    fireEvent.click(screen.getByLabelText(/Square 5-0/));
    expect(onSquareClick).toHaveBeenCalledWith(5, 0);
  });

  it('executes interface probes as 200 OK checks', async () => {
    const checks = await runInterfaceSuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body.map((check) => check.status)).toEqual([200, 200]);
    expect(body.map((check) => check.tool)).toEqual([
      'react testing library',
      'react testing library',
    ]);
  });
});
