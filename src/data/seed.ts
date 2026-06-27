import type { SupervisoryOrg, Worker } from '../model/types.ts';

// Demo "today" is assumed to be mid-2026 (e.g. 2026-06-19): versions effective
// on/before that date are already visible; the 2026-09-01 transfer is not yet.
export const seedWorkers: Worker[] = [
  {
    id: 'w-001',
    legalName: 'Jordan Lee',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-001-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'CHIEF_EXECUTIVE',
          jobLevel: '6-1',
          supervisoryOrgId: 'org-exec',
          baseSalary: 280000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-exec',
        },
      },
    ],
  },
  {
    id: 'w-002',
    legalName: 'Priya Natarajan',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-002-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'ENGINEERING_MANAGER',
          jobLevel: '4-1',
          supervisoryOrgId: 'org-eng',
          baseSalary: 190000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-eng',
        },
      },
    ],
  },
  {
    id: 'w-003',
    legalName: 'Sam Okafor',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-003-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'SOFTWARE_ENGINEER',
          jobLevel: '2-1',
          supervisoryOrgId: 'org-eng',
          baseSalary: 120000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-eng',
        },
      },
      {
        versionId: 'w-003-v2',
        effectiveDate: '2026-04-01',
        entryMoment: '2026-04-01T09:00:00Z',
        eventType: 'COMPENSATION_CHANGE',
        isCorrection: false,
        fields: {
          jobProfile: 'SOFTWARE_ENGINEER',
          jobLevel: '2-1',
          supervisoryOrgId: 'org-eng',
          baseSalary: 132000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-eng',
        },
      },
      {
        versionId: 'w-003-v3',
        effectiveDate: '2026-09-01',
        entryMoment: '2026-06-15T10:00:00Z',
        eventType: 'TRANSFER',
        isCorrection: false,
        fields: {
          jobProfile: 'SOFTWARE_ENGINEER',
          jobLevel: '2-1',
          supervisoryOrgId: 'org-sales',
          baseSalary: 132000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-sales',
        },
      },
    ],
  },
  {
    id: 'w-004',
    legalName: 'Elena Garcia',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-004-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'PRODUCT_DESIGNER',
          jobLevel: '3-1',
          supervisoryOrgId: 'org-eng',
          baseSalary: 110000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-eng',
        },
      },
      {
        // Retroactive backfill: effective in March, but only entered in June.
        versionId: 'w-004-v2',
        effectiveDate: '2026-03-01',
        entryMoment: '2026-06-10T09:00:00Z',
        eventType: 'PROMOTION',
        isCorrection: false,
        fields: {
          jobProfile: 'PRODUCT_DESIGNER',
          jobLevel: '3-2',
          supervisoryOrgId: 'org-eng',
          baseSalary: 118000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-eng',
        },
      },
    ],
  },
  {
    id: 'w-005',
    legalName: 'Marcus Webb',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-005-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'SALES_DIRECTOR',
          jobLevel: '4-2',
          supervisoryOrgId: 'org-sales',
          baseSalary: 175000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-sales',
        },
      },
    ],
  },
  {
    id: 'w-006',
    legalName: 'Nadia Petrova',
    workerType: 'EMPLOYEE',
    versions: [
      {
        versionId: 'w-006-v1',
        effectiveDate: '2026-01-01',
        entryMoment: '2026-01-01T09:00:00Z',
        eventType: 'HIRE',
        isCorrection: false,
        fields: {
          jobProfile: 'HR_BUSINESS_PARTNER',
          jobLevel: '3-2',
          supervisoryOrgId: 'org-hr',
          baseSalary: 105000,
          currency: 'USD',
          companyId: 'co-aurora',
          costCenterId: 'cc-hr',
        },
      },
    ],
  },
];

// 3-level supervisory org tree: org-exec -> {org-eng, org-sales, org-hr},
// org-eng -> org-eng-platform (vacant, to demo the "经理空缺" empty state).
export const seedOrgs: SupervisoryOrg[] = [
  {
    id: 'org-exec',
    name: '高管办',
    code: 'EXEC',
    managerWorkerId: 'w-001',
    parentOrgId: null,
  },
  {
    id: 'org-eng',
    name: '工程部',
    code: 'ENG',
    managerWorkerId: 'w-002',
    parentOrgId: 'org-exec',
  },
  {
    id: 'org-sales',
    name: '销售部',
    code: 'SALES',
    managerWorkerId: 'w-005',
    parentOrgId: 'org-exec',
  },
  {
    id: 'org-hr',
    name: '人力资源部',
    code: 'HR',
    managerWorkerId: 'w-006',
    parentOrgId: 'org-exec',
  },
  {
    id: 'org-eng-platform',
    name: '平台组',
    code: 'ENG-PLAT',
    managerWorkerId: null,
    parentOrgId: 'org-eng',
  },
];
