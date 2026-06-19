export type ISODate = string;        // "2026-04-01"  — business dates
export type ISODateTime = string;    // "2026-03-15T10:30:00Z" — system moments

export type EventType =
  | 'HIRE' | 'PROMOTION' | 'COMPENSATION_CHANGE' | 'TRANSFER' | 'TERMINATION';

export interface WorkerFields {
  jobProfile: string;         // -> JobProfile.id
  jobLevel: string;           // e.g. "2-1"
  supervisoryOrgId: string;   // -> SupervisoryOrg.id   (a worker belongs to exactly one)
  positionId?: string;
  baseSalary: number;
  currency: string;
  companyId: string;          // legal entity
  costCenterId: string;
  regionId?: string;
}

export interface WorkerVersion {
  versionId: string;
  effectiveDate: ISODate;     // when it takes effect (business)
  entryMoment: ISODateTime;   // when it was recorded (system)
  eventType: EventType;
  isCorrection: boolean;      // true = Correction (fix a record); false = new effective change
  fields: WorkerFields;       // full snapshot of state as of this version
}

export interface Worker {
  id: string;
  legalName: string;
  workerType: 'EMPLOYEE' | 'CONTINGENT';
  versions: WorkerVersion[];  // APPEND-ONLY, sorted by effectiveDate
}

export interface SupervisoryOrg {
  id: string;
  name: string;
  code: string;
  managerWorkerId: string | null;  // null = vacant
  parentOrgId: string | null;
}

export type RoleType = 'HRBP' | 'COMPENSATION_PARTNER' | 'RECRUITER';

export interface RoleAssignment {
  id: string;
  roleType: RoleType;
  workerId: string;           // role holder
  orgId: string;              // anchored org; inherits down the whole subtree
}

export type StepType = 'INITIATION' | 'APPROVAL' | 'SERVICE' | 'COMPLETION';
export type ApproverRule = 'MANAGER' | 'NEXT_LEVEL_MANAGER' | 'HRBP';

export interface BPStepDef {
  id: string;
  type: StepType;
  name: string;
  approverRule?: ApproverRule;       // for APPROVAL steps
}

export interface BPDefinition {
  id: string;
  name: string;                      // e.g. "Change Job"
  steps: BPStepDef[];
}

export interface BPHistoryEntry {
  stepId: string;
  actorWorkerId: string;
  action: 'INITIATED' | 'APPROVED' | 'DENIED' | 'COMPLETED';
  timestamp: ISODateTime;
  comment?: string;
}

export interface BPInstance {
  id: string;
  definitionId: string;
  subjectWorkerId: string;
  proposedChange: Partial<WorkerFields> & {
    effectiveDate: ISODate;
    eventType: EventType;
  };
  currentStepIndex: number;
  status: 'IN_PROGRESS' | 'APPROVED' | 'DENIED' | 'COMPLETED';
  history: BPHistoryEntry[];          // Process History — full audit trail
}
