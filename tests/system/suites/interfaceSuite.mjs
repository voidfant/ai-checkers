const buildCheck = ({ id, target, probe }) => ({
  id,
  group: 'interface',
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testBoardRenderer(tools) {
  const probe = await tools.reactTestingLibraryProbe('board renderer');
  return buildCheck({
    id: 'UI-101',
    target: 'board renderer',
    probe,
  });
}

export async function testPieceSelection(tools) {
  const probe = await tools.reactTestingLibraryProbe('piece selection');
  return buildCheck({
    id: 'UI-102',
    target: 'piece selection',
    probe,
  });
}

export async function runInterfaceSuite(tools) {
  return [await testBoardRenderer(tools), await testPieceSelection(tools)];
}
