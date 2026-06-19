import { useState } from 'react';
import { seedWorkers } from '../../data/seed.ts';
import { getWorkerStateAsOf } from '../../model/worker.ts';
import { addDays, dayIndexToISODate, isoDateToDayIndex } from '../../model/date.ts';
import { todayISODate } from './today.ts';
import type { ISODate } from '../../model/types.ts';

interface WorkerDetailProps {
  workerId: string;
  onBack: () => void;
}

export function WorkerDetail({ workerId, onBack }: WorkerDetailProps) {
  const worker = seedWorkers.find((w) => w.id === workerId);
  const [asOfDate, setAsOfDate] = useState<ISODate>(todayISODate());

  if (!worker) {
    return (
      <>
        <button type="button" onClick={onBack}>← 返回列表</button>
        <p>未找到该员工。</p>
      </>
    );
  }

  const effectiveDates = worker.versions.map((v) => v.effectiveDate);
  const earliestDate = effectiveDates.reduce((a, b) => (a < b ? a : b));
  const latestDate = effectiveDates.reduce((a, b) => (a > b ? a : b));
  // Buffer 30 days before the earliest version so "not yet hired" is reachable,
  // and extend the max past both the latest version and today so the default
  // (today) is always in range even for workers with no future-dated version.
  const minDate = addDays(earliestDate, -30);
  const maxDate = addDays(latestDate > todayISODate() ? latestDate : todayISODate(), 30);
  const minIndex = isoDateToDayIndex(minDate);
  const maxIndex = isoDateToDayIndex(maxDate);

  const state = getWorkerStateAsOf(worker, asOfDate);

  return (
    <>
      <button type="button" onClick={onBack}>← 返回列表</button>

      <h2>{worker.legalName}</h2>
      <p>
        员工号：{worker.id} · 用工类型：{worker.workerType}
      </p>

      <div className="as-of-slider">
        <label htmlFor="as-of-range">As-of: {asOfDate}</label>
        <input
          id="as-of-range"
          type="range"
          min={minIndex}
          max={maxIndex}
          value={isoDateToDayIndex(asOfDate)}
          onChange={(e) => setAsOfDate(dayIndexToISODate(Number(e.target.value)))}
        />
        <div className="as-of-range-labels">
          <span>{minDate}</span>
          <span>{maxDate}</span>
        </div>
      </div>

      {!state ? (
        <p>该时点员工尚未入职。</p>
      ) : (
        <table className="worker-table">
          <tbody>
            <tr><th>职位</th><td>{state.fields.jobProfile}</td></tr>
            <tr><th>职级</th><td>{state.fields.jobLevel}</td></tr>
            <tr><th>薪资</th><td>{state.fields.baseSalary} {state.fields.currency}</td></tr>
            <tr><th>汇报组织</th><td>{state.fields.supervisoryOrgId}</td></tr>
            <tr><th>职位编号</th><td>{state.fields.positionId ?? '—'}</td></tr>
            <tr><th>公司</th><td>{state.fields.companyId}</td></tr>
            <tr><th>成本中心</th><td>{state.fields.costCenterId}</td></tr>
            <tr><th>地区</th><td>{state.fields.regionId ?? '—'}</td></tr>
          </tbody>
        </table>
      )}
    </>
  );
}
