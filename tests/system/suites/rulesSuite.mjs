const buildCheck = ({ id, target, probe }) => ({
  id,
  group: 'rules',
  target,
  status: probe.status,
  tool: probe.tool,
  detail: probe.detail,
  payload: probe.payload,
});

export async function testInvalidMoveGuard(tools) {
  const probe = await tools.unitRuleProbe('invalid move guard');
  return buildCheck({
    id: 'RULE-201',
    target: 'invalid move guard',
    probe,
  });
}

export async function testMandatoryCapture(tools) {
  const probe = await tools.unitRuleProbe('mandatory capture');
  return buildCheck({
    id: 'RULE-202',
    target: 'mandatory capture',
    probe,
  });
}

export async function testKingPromotionAndResult(tools) {
  const probe = await tools.unitRuleProbe('king promotion and game result');
  return buildCheck({
    id: 'RULE-203',
    target: 'king promotion and game result',
    probe,
  });
}

export async function runRulesSuite(tools) {
  return [
    await testInvalidMoveGuard(tools),
    await testMandatoryCapture(tools),
    await testKingPromotionAndResult(tools),
  ];
}
