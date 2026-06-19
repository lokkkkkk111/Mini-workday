import type { ISODate } from '../../model/types.ts';

export function todayISODate(): ISODate {
  return new Date().toISOString().slice(0, 10);
}
