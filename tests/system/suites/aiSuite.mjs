const buildCheck = ({ id, group, target, probe }) => ({
  id,
  group,
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testOpponentMoveResolver(tools) {
  const probe = await tools.apiSmokeProbe('opponent move resolver');
  return buildCheck({
    id: 'AI-301',
    group: 'ai',
    target: 'opponent move resolver',
    probe,
  });
}

export async function testGoogleApiConnection(tools) {
  const probe = await tools.apiSmokeProbe('google api connection');
  return buildCheck({
    id: 'API-302',
    group: 'external-api',
    target: 'google api connection',
    probe,
  });
}

export async function runAiSuite(tools) {
  return [await testOpponentMoveResolver(tools), await testGoogleApiConnection(tools)];
}
