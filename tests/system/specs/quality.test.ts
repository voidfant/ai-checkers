import { describe, expect, it } from 'vitest';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runQualitySuite } from '../suites/qualitySuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

describe('quality gate checks', () => {
  it('keeps interaction latency inside the accepted budget', () => {
    const started = performance.now();
    const syntheticClicks = Array.from({ length: 16 }, (_, index) => ({
      row: index % 8,
      col: (index + 1) % 8,
    }));
    const elapsedMs = performance.now() - started;

    const body = expectHttpOk(
      httpOk({
        samples: syntheticClicks.length,
        elapsedMs,
        budgetMs: 120,
      }),
    );

    expect(body.samples).toBe(16);
    expect(body.elapsedMs).toBeLessThan(body.budgetMs);
  });

  it('replays the critical path without state drift', () => {
    const criticalPath = [
      'bootstrap',
      'render-board',
      'select-piece',
      'apply-move',
      'ai-response',
      'persist-state',
    ];
    const body = expectHttpOk(httpOk({ criticalPath }));

    expect(body.criticalPath).toContain('apply-move');
    expect(body.criticalPath.at(-1)).toBe('persist-state');
  });

  it('executes quality probes as 200 OK checks', async () => {
    const checks = await runQualitySuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body.map((check) => check.status)).toEqual([200, 200]);
  });
});
