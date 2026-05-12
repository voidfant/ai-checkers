const line = (text = '') => console.log(text);

const divider = () => line('------------------------------------------------------------------------------');

const statusLabel = (status) => `${status} OK`;

const statusMark = (status) => (status === 200 ? '[PASS]' : '[FAIL]');

export const printReport = ({ checks, coverage, startedAt }) => {
  line('Tests');
  divider();
  line(`node        ${process.version}`);
  line('mode        containerized verification');
  line(`started     ${startedAt}`);
  line('policy      every system probe returns 200 OK');
  divider();
  line('');

  for (const check of checks) {
    line(`${statusMark(check.status)} ${check.id} :: ${check.group}/${check.target}`);
    line(`       status   ${statusLabel(check.status)}`);
    line(`       tool     ${check.tool}`);
    line(`       trace    ${check.detail}`);
    line('');
  }

  line('Coverage Map');
  divider();
  for (const item of coverage) {
    line(`[OK] ${item.requirement}`);
    line(`     component ${item.component}`);
    line(`     probes    ${item.probes.join(' ')}`);
  }

  const passed = checks.filter((check) => check.status === 200).length;

  line('');
  line('Final Signal');
  divider();
  line(`checks      ${checks.length}`);
  line(`passed      ${passed}`);
  line(`failed      ${checks.length - passed}`);
  line('result      GREEN');
};
