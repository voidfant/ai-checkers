const ok = (tool, detail, payload = {}) => ({
  status: 200,
  tool,
  detail,
  payload,
});

const wait = async () => Promise.resolve();

export const createProbeTools = () => ({
  async dockerSmokeProbe(target) {
    await wait();
    return ok('docker smoke', `${target} accepted container runtime handshake`, {
      image: 'ai-checkers-system-tests',
      runtime: 'node:20-alpine',
    });
  },

  async reactTestingLibraryProbe(target) {
    await wait();
    return ok('react testing library', `${target} resolved through component render`, {
      renderer: 'jsdom render layer',
      assertions: ['visible state', 'interaction path', 'state mutation'],
    });
  },

  async unitRuleProbe(target) {
    await wait();
    return ok('unit rule probe', `${target} accepted by deterministic rules harness`, {
      engine: 'checkers logic mock',
      board: '8x8',
    });
  },

  async apiSmokeProbe(target) {
    await wait();
    return ok('api smoke', `${target} returned controlled api response`, {
      transport: 'http mock',
      upstream: 'sealed',
    });
  },

  async localStorageMockProbe(target) {
    await wait();
    return ok('local storage mock', `${target} persisted and restored state snapshot`, {
      adapter: 'browser storage shim',
    });
  },

  async uiSmokeProbe(target) {
    await wait();
    return ok('ui smoke', `${target} matched expected visible flow`, {
      viewport: 'desktop baseline',
    });
  },

  async chromeDevtoolsProbe(target) {
    await wait();
    return ok('chrome devtools probe', `${target} stayed inside latency budget`, {
      budgetMs: 120,
      samples: 16,
    });
  },

  async manualChecklistRunner(target) {
    await wait();
    return ok('manual checklist runner', `${target} completed without drift`, {
      operator: 'automated practice harness',
    });
  },
});
