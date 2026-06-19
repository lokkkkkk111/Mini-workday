import { getWorkerStateAsOf } from './worker.ts';
import type { Worker } from './types.ts';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  }
}

// w-1: HIRE -> COMPENSATION_CHANGE -> future-dated TRANSFER
const w1: Worker = {
  id: 'w-1',
  legalName: 'Alex Chen',
  workerType: 'EMPLOYEE',
  versions: [
    {
      versionId: 'w1-v1',
      effectiveDate: '2024-01-01',
      entryMoment: '2024-01-01T09:00:00Z',
      eventType: 'HIRE',
      isCorrection: false,
      fields: {
        jobProfile: 'ENGINEER',
        jobLevel: '2-1',
        supervisoryOrgId: 'org-1',
        baseSalary: 100000,
        currency: 'USD',
        companyId: 'co-1',
        costCenterId: 'cc-1',
      },
    },
    {
      versionId: 'w1-v2',
      effectiveDate: '2025-06-01',
      entryMoment: '2025-06-01T09:00:00Z',
      eventType: 'COMPENSATION_CHANGE',
      isCorrection: false,
      fields: {
        jobProfile: 'ENGINEER',
        jobLevel: '2-1',
        supervisoryOrgId: 'org-1',
        baseSalary: 120000,
        currency: 'USD',
        companyId: 'co-1',
        costCenterId: 'cc-1',
      },
    },
    {
      versionId: 'w1-v3',
      effectiveDate: '2026-12-01',
      entryMoment: '2026-06-10T09:00:00Z',
      eventType: 'TRANSFER',
      isCorrection: false,
      fields: {
        jobProfile: 'ENGINEER',
        jobLevel: '2-1',
        supervisoryOrgId: 'org-2',
        baseSalary: 120000,
        currency: 'USD',
        companyId: 'co-1',
        costCenterId: 'cc-2',
      },
    },
  ],
};

// w-2: HIRE -> backdated PROMOTION entered long after its effective date
const w2: Worker = {
  id: 'w-2',
  legalName: 'Bao Li',
  workerType: 'EMPLOYEE',
  versions: [
    {
      versionId: 'w2-v1',
      effectiveDate: '2024-01-01',
      entryMoment: '2024-01-01T09:00:00Z',
      eventType: 'HIRE',
      isCorrection: false,
      fields: {
        jobProfile: 'ENGINEER',
        jobLevel: '1-1',
        supervisoryOrgId: 'org-1',
        baseSalary: 90000,
        currency: 'USD',
        companyId: 'co-1',
        costCenterId: 'cc-1',
      },
    },
    {
      versionId: 'w2-v2',
      effectiveDate: '2024-06-01',
      entryMoment: '2026-01-15T09:00:00Z',
      eventType: 'PROMOTION',
      isCorrection: false,
      fields: {
        jobProfile: 'ENGINEER',
        jobLevel: '2-1',
        supervisoryOrgId: 'org-1',
        baseSalary: 95000,
        currency: 'USD',
        companyId: 'co-1',
        costCenterId: 'cc-1',
      },
    },
  ],
};

// ① 正常取最新生效版
assertEqual(
  getWorkerStateAsOf(w1, '2025-12-01')?.versionId,
  'w1-v2',
  '应返回生效日期 <= asOfDate 中最新的版本'
);

// ② 未来生效的变更对"今天"不可见
assertEqual(
  getWorkerStateAsOf(w1, '2026-06-19')?.versionId,
  'w1-v2',
  '未来生效（2026-12-01）的版本不应在今天可见'
);

// ③ 入职前查询返回 null
assertEqual(
  getWorkerStateAsOf(w1, '2023-01-01'),
  null,
  '入职日期之前查询应返回 null'
);

// ④ 追溯补录（entryMoment 晚但 effectiveDate 早）能被正确取到
assertEqual(
  getWorkerStateAsOf(w2, '2025-01-01')?.versionId,
  'w2-v2',
  '即使补录发生在很晚的 entryMoment，只要不限制 knowledgeMoment，仍应取到该生效版本'
);

console.log('worker.test.ts: all assertions passed');
