import { useState } from 'react';
import type { FormEvent } from 'react';
import { getLatestVersion, getWorkerStateAsOf } from '../../model/worker.ts';
import { addDays, dayIndexToISODate, isoDateToDayIndex } from '../../model/date.ts';
import { todayISODate } from './today.ts';
import type { ISODate, Worker, WorkerFields, WorkerVersion } from '../../model/types.ts';

interface WorkerDetailProps {
  worker: Worker;
  orgIds: string[];
  onBack: () => void;
  onUpdateWorker: (worker: Worker) => void;
}

type ChangeEventType = 'COMPENSATION_CHANGE' | 'TRANSFER';

export function WorkerDetail({ worker, orgIds, onBack, onUpdateWorker }: WorkerDetailProps) {
  const [asOfDate, setAsOfDate] = useState<ISODate>(todayISODate());

  const [changeEventType, setChangeEventType] = useState<ChangeEventType>('COMPENSATION_CHANGE');
  const [targetSalary, setTargetSalary] = useState('');
  const [targetOrgId, setTargetOrgId] = useState(orgIds[0] ?? '');
  const [changeEffectiveDate, setChangeEffectiveDate] = useState('');

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

  const sortedVersions = [...worker.versions].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  const nextChangeDate = sortedVersions
    .map((v) => v.effectiveDate)
    .filter((d) => d > asOfDate)
    .at(0);

  function handleSubmitChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const latest = getLatestVersion(worker);
    const fields: WorkerFields =
      changeEventType === 'COMPENSATION_CHANGE'
        ? { ...latest.fields, baseSalary: Number(targetSalary) }
        : { ...latest.fields, supervisoryOrgId: targetOrgId };

    const newVersion: WorkerVersion = {
      versionId: crypto.randomUUID(),
      effectiveDate: changeEffectiveDate,
      entryMoment: new Date().toISOString(),
      eventType: changeEventType,
      isCorrection: false,
      fields,
    };

    onUpdateWorker({ ...worker, versions: [...worker.versions, newVersion] });

    setTargetSalary('');
    setChangeEffectiveDate('');
  }

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

      {state && nextChangeDate && (
        <p className="future-hint">提示：该状态将在 {nextChangeDate} 被新版本取代</p>
      )}

      <h3>版本历史</h3>
      <table className="worker-table version-history">
        <thead>
          <tr>
            <th>事件类型</th>
            <th>生效日期</th>
            <th>录入时刻</th>
            <th>薪资</th>
            <th>组织</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedVersions.map((v) => {
            const isFuture = v.effectiveDate > asOfDate;
            const isActive = v.versionId === state?.versionId;
            const isBackfilled = v.entryMoment.slice(0, 10) > v.effectiveDate;
            const rowClass = [isFuture && 'future-version', isActive && 'active-version']
              .filter(Boolean)
              .join(' ');
            return (
              <tr key={v.versionId} className={rowClass || undefined}>
                <td>{v.eventType}</td>
                <td>{v.effectiveDate}</td>
                <td>{v.entryMoment}</td>
                <td>{v.fields.baseSalary} {v.fields.currency}</td>
                <td>{v.fields.supervisoryOrgId}</td>
                <td>
                  {isActive && <span className="active-badge">当前</span>}
                  {isFuture && <span className="future-badge">未来生效</span>}
                  {isBackfilled && <span className="backfilled-badge">追溯补录</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>提交变更</h3>
      <form className="submit-change-form" onSubmit={handleSubmitChange}>
        <label>
          事件类型
          <select
            value={changeEventType}
            onChange={(e) => setChangeEventType(e.target.value as ChangeEventType)}
          >
            <option value="COMPENSATION_CHANGE">调薪</option>
            <option value="TRANSFER">转岗</option>
          </select>
        </label>

        {changeEventType === 'COMPENSATION_CHANGE' ? (
          <label>
            新薪资
            <input
              type="number"
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              required
            />
          </label>
        ) : (
          <label>
            新所属组织
            <select value={targetOrgId} onChange={(e) => setTargetOrgId(e.target.value)} required>
              {orgIds.map((orgId) => (
                <option key={orgId} value={orgId}>{orgId}</option>
              ))}
            </select>
          </label>
        )}

        <label>
          生效日期
          <input
            type="date"
            value={changeEffectiveDate}
            onChange={(e) => setChangeEffectiveDate(e.target.value)}
            required
          />
        </label>

        <button type="submit">提交变更</button>
      </form>
    </>
  );
}
