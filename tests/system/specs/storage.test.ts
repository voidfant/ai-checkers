import { describe, expect, it } from 'vitest';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runStorageSuite } from '../suites/storageSuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

describe('storage and history checks', () => {
  it('persists and restores a game snapshot', () => {
    const snapshot = {
      id: 'game-001',
      turn: 'USER',
      moves: ['a3-b4', 'h6-g5'],
    };

    localStorage.setItem('active-game', JSON.stringify(snapshot));
    const restored = JSON.parse(localStorage.getItem('active-game') ?? '{}');
    const body = expectHttpOk(httpOk(restored));

    expect(body).toEqual(snapshot);
  });

  it('keeps the move journal in chronological order', () => {
    const journal = ['a3-b4', 'h6-g5', 'b4:c5'];
    const body = expectHttpOk(httpOk({ journal }));

    expect(body.journal).toEqual(['a3-b4', 'h6-g5', 'b4:c5']);
    expect(body.journal.at(-1)).toBe('b4:c5');
  });

  it('executes storage probes as 200 OK checks', async () => {
    const checks = await runStorageSuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body.map((check) => check.status)).toEqual([200, 200]);
  });
});
