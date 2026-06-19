import type { ISODate } from './types.ts';

const MS_PER_DAY = 86_400_000;

export function isoDateToDayIndex(date: ISODate): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY);
}

export function dayIndexToISODate(dayIndex: number): ISODate {
  return new Date(dayIndex * MS_PER_DAY).toISOString().slice(0, 10);
}

export function addDays(date: ISODate, days: number): ISODate {
  return dayIndexToISODate(isoDateToDayIndex(date) + days);
}
