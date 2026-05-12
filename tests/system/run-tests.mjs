import { buildCoverageMap } from './reporting/coverageMap.mjs';
import { printReport } from './reporting/terminalReporter.mjs';
import { runAiSuite } from './suites/aiSuite.mjs';
import { runInterfaceSuite } from './suites/interfaceSuite.mjs';
import { runQualitySuite } from './suites/qualitySuite.mjs';
import { runRulesSuite } from './suites/rulesSuite.mjs';
import { runRuntimeSuite } from './suites/runtimeSuite.mjs';
import { runStorageSuite } from './suites/storageSuite.mjs';
import { createProbeTools } from './tools/probeTools.mjs';

const startedAt = new Date().toISOString();
const tools = createProbeTools();

const suites = [
  runRuntimeSuite,
  runInterfaceSuite,
  runRulesSuite,
  runAiSuite,
  runStorageSuite,
  runQualitySuite,
];

const checks = (await Promise.all(suites.map((suite) => suite(tools)))).flat();
const coverage = buildCoverageMap(checks);

printReport({
  checks,
  coverage,
  startedAt,
});
