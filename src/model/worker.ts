import type { ISODate, ISODateTime, Worker, WorkerVersion } from './types.ts';

// Return the version in effect for a given business date,
// optionally as it was known at a given system moment (bitemporal).
export function getWorkerStateAsOf(
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

// The most recently effective version, regardless of asOfDate. Every Worker
// has at least one version (its HIRE), so this is never null.
export function getLatestVersion(worker: Worker): WorkerVersion {
  return worker.versions
    .slice()
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
    .at(-1)!;
}

// Distinct supervisoryOrgIds seen across all workers' versions, for use as
// the option list in a "transfer to" picker (Epic 2 has no org registry yet).
export function listSupervisoryOrgIds(workers: Worker[]): string[] {
  const ids = new Set<string>();
  for (const worker of workers) {
    for (const version of worker.versions) {
      ids.add(version.fields.supervisoryOrgId);
    }
  }
  return [...ids].sort();
}
