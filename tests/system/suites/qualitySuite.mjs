const buildCheck = ({ id, group, target, probe }) => ({
  id,
  group,
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testBoardInteractionLatency(tools) {
  const probe = await tools.chromeDevtoolsProbe('board interaction latency');
  return buildCheck({
    id: 'PERF-601',
    group: 'performance',
    target: 'board interaction latency',
    probe,
  });
}

export async function testCriticalPathReplay(tools) {
  const probe = await tools.manualChecklistRunner('critical path replay');
  return buildCheck({
    id: 'REG-701',
    group: 'regression',
    target: 'critical path replay',
    probe,
  });
}

export async function runQualitySuite(tools) {
  return [await testBoardInteractionLatency(tools), await testCriticalPathReplay(tools)];
}
