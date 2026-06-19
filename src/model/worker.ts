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
