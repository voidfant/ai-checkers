import { describe, expect, it } from 'vitest';
import { expectHttpOk, httpOk } from '../helpers/httpStatus.ts';
import { runRuntimeSuite } from '../suites/runtimeSuite.mjs';
import { createProbeTools } from '../tools/probeTools.mjs';

describe('runtime smoke checks', () => {
  it('boots the isolated test container', async () => {
    const checks = await runRuntimeSuite(createProbeTools());
    const body = expectHttpOk(httpOk(checks));

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: 'CORE-001',
      status: 200,
      tool: 'docker smoke',
    });
  });
});
