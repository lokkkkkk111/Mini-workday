import { getDirectMembers } from './org.ts';
import type { Worker } from './types.ts';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  }
}

function makeWorker(id: string, versions: Worker['versions']): Worker {
  return { id, legalName: id, workerType: 'EMPLOYEE', versions };
}

const base = {
  jobProfile: 'ENGINEER',
  jobLevel: '2-1',
  baseSalary: 100000,
  currency: 'USD',
  companyId: 'co-1',
  costCenterId: 'cc-1',
};

// w-a: hired into org-1, then transfers to org-2 effective 2026-09-01.
const wa = makeWorker('w-a', [
  {
    versionId: 'wa-v1',
    effectiveDate: '2026-01-01',
    entryMoment: '2026-01-01T09:00:00Z',
    eventType: 'HIRE',
    isCorrection: false,
    fields: { ...base, supervisoryOrgId: 'org-1' },
  },
  {
    versionId: 'wa-v2',
    effectiveDate: '2026-09-01',
    entryMoment: '2026-06-15T09:00:00Z',
    eventType: 'TRANSFER',
    isCorrection: false,
    fields: { ...base, supervisoryOrgId: 'org-2' },
  },
]);

// w-b: stays in org-1 the whole time.
const wb = makeWorker('w-b', [
  {
    versionId: 'wb-v1',
    effectiveDate: '2026-01-01',
    entryMoment: '2026-01-01T09:00:00Z',
    eventType: 'HIRE',
    isCorrection: false,
    fields: { ...base, supervisoryOrgId: 'org-1' },
  },
]);

// w-c: not hired until 2026-07-01.
const wc = makeWorker('w-c', [
  {
    versionId: 'wc-v1',
    effectiveDate: '2026-07-01',
    entryMoment: '2026-07-01T09:00:00Z',
    eventType: 'HIRE',
    isCorrection: false,
    fields: { ...base, supervisoryOrgId: 'org-1' },
  },
]);

const workers = [wa, wb, wc];

// ① 转岗前：w-a 与 w-b 都在 org-1，w-c 尚未入职
assertEqual(
  getDirectMembers(workers, 'org-1', '2026-06-28').map((w) => w.id).join(','),
  'w-a,w-b',
  '转岗生效前 org-1 应含 w-a、w-b，未入职的 w-c 不计入'
);

// ② 转岗生效后：w-a 归属随有效版本切到 org-2，不再算 org-1 直属
assertEqual(
  getDirectMembers(workers, 'org-1', '2026-09-15').map((w) => w.id).join(','),
  'w-b,w-c',
  '转岗生效后 w-a 应离开 org-1，w-c 已入职加入'
);

assertEqual(
  getDirectMembers(workers, 'org-2', '2026-09-15').map((w) => w.id).join(','),
  'w-a',
  '转岗生效后 w-a 的当前有效版本应把他放进 org-2'
);

console.log('org.test.ts: all assertions passed');
