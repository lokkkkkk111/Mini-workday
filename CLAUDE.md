# CLAUDE.md — Mini Workday

This file is the project memory. Read it at the start of **every** session before writing code.

## What this is
A **teaching demo** of three core Workday concepts: effective dating, supervisory org + role inheritance, and a mini business-process engine. It is NOT a real HR system. Optimize for conceptual clarity and a smooth live demo, not for completeness or production-readiness.

## Golden rules (do not violate)
1. **One user story per session.** Before writing code, restate your understanding of the data model and the story's acceptance criteria, then wait for confirmation.
2. **Incremental edits only.** Never do a "big refactor" unprompted. Touch the minimum needed for the current story.
3. **One commit per story.** Keep diffs small and reviewable.
4. **The data model below is the single source of truth.** Do not "simplify" the bitemporal version model into mutable fields (see invariant). If a change seems to require altering the model, stop and ask.

## Tech stack & constraints
- **Vite + React + TypeScript**, pure frontend SPA. No backend, no database, no router library unless a story needs it.
- **State lives in memory** in a single store (plain React context/useState or a tiny zustand store is fine). Support JSON export/import so demo state can be saved/loaded.
- **Tailwind CSS** for styling. (Let me wire up Tailwind v4 via its Vite plugin — don't hand-roll PostCSS config from memory; check current Tailwind setup.)
- No `localStorage`/`sessionStorage` assumptions beyond what the demo needs; in-memory + JSON file is the baseline.

## Data model (source of truth)

```typescript
type ISODate = string;        // "2026-04-01"  — business dates
type ISODateTime = string;    // "2026-03-15T10:30:00Z" — system moments

type EventType =
  | 'HIRE' | 'PROMOTION' | 'COMPENSATION_CHANGE' | 'TRANSFER' | 'TERMINATION';

interface WorkerFields {
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

interface WorkerVersion {
  versionId: string;
  effectiveDate: ISODate;     // when it takes effect (business)
  entryMoment: ISODateTime;   // when it was recorded (system)
  eventType: EventType;
  isCorrection: boolean;      // true = Correction (fix a record); false = new effective change
  fields: WorkerFields;       // full snapshot of state as of this version
}

interface Worker {
  id: string;
  legalName: string;
  workerType: 'EMPLOYEE' | 'CONTINGENT';
  versions: WorkerVersion[];  // APPEND-ONLY, sorted by effectiveDate
}

interface SupervisoryOrg {
  id: string;
  name: string;
  code: string;
  managerWorkerId: string | null;  // null = vacant
  parentOrgId: string | null;
}

type RoleType = 'HRBP' | 'COMPENSATION_PARTNER' | 'RECRUITER';

interface RoleAssignment {
  id: string;
  roleType: RoleType;
  workerId: string;           // role holder
  orgId: string;              // anchored org; inherits down the whole subtree
}

type StepType = 'INITIATION' | 'APPROVAL' | 'SERVICE' | 'COMPLETION';
type ApproverRule = 'MANAGER' | 'NEXT_LEVEL_MANAGER' | 'HRBP';

interface BPStepDef {
  id: string;
  type: StepType;
  name: string;
  approverRule?: ApproverRule;       // for APPROVAL steps
}

interface BPDefinition {
  id: string;
  name: string;                      // e.g. "Change Job"
  steps: BPStepDef[];
}

interface BPHistoryEntry {
  stepId: string;
  actorWorkerId: string;
  action: 'INITIATED' | 'APPROVED' | 'DENIED' | 'COMPLETED';
  timestamp: ISODateTime;
  comment?: string;
}

interface BPInstance {
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
```

## The core invariant (the whole point of the project)
**A change is never an in-place update — it is a new `WorkerVersion` appended to `versions`.**
The "time machine" is one pure function:

```typescript
// Return the version in effect for a given business date,
// optionally as it was known at a given system moment (bitemporal).
function getWorkerStateAsOf(
  worker: Worker,
  asOfDate: ISODate,
  knowledgeMoment?: ISODateTime
): WorkerVersion | null {
  return worker.versions
    .filter(v => v.effectiveDate <= asOfDate)
    .filter(v => !knowledgeMoment || v.entryMoment <= knowledgeMoment)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
    .at(-1) ?? null;
}
```

Everything in Epic 1 is a UI on top of this function. Do not bypass it with mutable current-state fields.

## The closing loop (Epic 3 → Epic 1)
When a `BPInstance` reaches `COMPLETION`, it must create a new `WorkerVersion` on the subject worker from `proposedChange` (using `effectiveDate` and `eventType`). This is the demo climax — keep the wiring explicit and visible.

## Folder structure (suggested)
```
src/
  model/        # types above + pure logic (getWorkerStateAsOf, org-tree helpers, bp engine)
  store/        # in-memory store + JSON import/export
  data/         # seed data
  features/
    time-machine/
    org-tree/
    bp-engine/
  App.tsx
```
Keep `model/` framework-free and unit-testable. UI imports from model, never the reverse.

## Seed data spec
A small fictional company. Aim for ~12 workers, a 3-level org tree, 2–3 companies (to enable the cross-company rule later), and at least one worker with multiple versions (a hire + a comp change + a future-dated transfer) so the time machine has something to show on day one.

## Definition of Done (per story)
- Acceptance criteria in PRD.md met.
- Core logic lives in `model/` and is covered by at least a couple of plain assertions/tests.
- TypeScript compiles with no `any` on model types.
- One commit, small diff, reviewed by me.

## Out of scope (do not build unless asked)
Payroll calc, recruiting, performance, benefits, real auth, persistence/DB, multi-currency FX, i18n, mobile layout. If tempted to add these, stop.
