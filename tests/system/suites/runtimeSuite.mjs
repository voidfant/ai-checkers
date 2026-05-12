const buildCheck = ({ id, group, target, probe }) => ({
  id,
  group,
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testApplicationBootstrap(tools) {
  const probe = await tools.dockerSmokeProbe('application bootstrap');
  return buildCheck({
    id: 'CORE-001',
    group: 'runtime',
    target: 'application bootstrap',
    probe,
  });
}

export async function runRuntimeSuite(tools) {
  return [await testApplicationBootstrap(tools)];
}
