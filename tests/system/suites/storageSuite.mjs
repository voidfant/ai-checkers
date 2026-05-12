const buildCheck = ({ id, group, target, probe }) => ({
  id,
  group,
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testSessionPersistence(tools) {
  const probe = await tools.localStorageMockProbe('session persistence');
  return buildCheck({
    id: 'STATE-401',
    group: 'storage',
    target: 'session persistence',
    probe,
  });
}

export async function testMoveJournal(tools) {
  const probe = await tools.uiSmokeProbe('move journal');
  return buildCheck({
    id: 'LOG-501',
    group: 'history',
    target: 'move journal',
    probe,
  });
}

export async function runStorageSuite(tools) {
  return [await testSessionPersistence(tools), await testMoveJournal(tools)];
}
