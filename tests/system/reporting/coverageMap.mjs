export const buildCoverageMap = () => [
  {
    requirement: 'board and pieces',
    component: 'react ui',
    probes: ['CORE-001', 'UI-101'],
  },
  {
    requirement: 'piece selection and legal move',
    component: 'move selector, apply move',
    probes: ['UI-102', 'RULE-201'],
  },
  {
    requirement: 'checkers rules',
    component: 'get valid moves, game status',
    probes: ['RULE-202', 'RULE-203'],
  },
  {
    requirement: 'ai opponent',
    component: 'get ai move',
    probes: ['AI-301'],
  },
  {
    requirement: 'google api connection',
    component: 'gemini api adapter',
    probes: ['API-302'],
  },
  {
    requirement: 'state recovery',
    component: 'storage adapter',
    probes: ['STATE-401'],
  },
  {
    requirement: 'move history',
    component: 'game history entry',
    probes: ['LOG-501'],
  },
  {
    requirement: 'interaction latency',
    component: 'react ui render loop',
    probes: ['PERF-601'],
  },
];
