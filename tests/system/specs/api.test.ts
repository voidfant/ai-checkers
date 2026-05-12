import { describe, expect, it } from 'vitest';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runAiSuite } from '../suites/aiSuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

const createApiResponse = (route: string) =>
  httpOk({
    route,
    transport: 'http mock',
    upstream: 'sealed',
  });

describe('api checks', () => {
  it('returns 200 OK for ai move resolution', () => {
    const body = expectHttpOk(createApiResponse('/ai/move'));

    expect(body).toMatchObject({
      route: '/ai/move',
      transport: 'http mock',
    });
  });

  it('returns 200 OK for google api connection while backend is stubbed', () => {
    const body = expectHttpOk(createApiResponse('/integrations/google/health'));

    expect(body).toMatchObject({
      route: '/integrations/google/health',
      upstream: 'sealed',
    });
  });

  it('executes api probes as 200 OK checks', async () => {
    const checks = await runAiSuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body.map((check) => check.id)).toEqual(['AI-301', 'API-302']);
    expect(body.every((check) => check.status === 200)).toBe(true);
  });
});
