import { seedWorkers } from '../../data/seed.ts';
import { getWorkerStateAsOf } from '../../model/worker.ts';
import { todayISODate } from './today.ts';

interface WorkerListProps {
  onSelectWorker: (workerId: string) => void;
}

export function WorkerList({ onSelectWorker }: WorkerListProps) {
  const today = todayISODate();

  return (
    <>
      <h2>员工列表</h2>
      <table className="worker-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>当前职位 / 职级</th>
            <th>当前所属组织</th>
          </tr>
        </thead>
        <tbody>
          {seedWorkers.map((worker) => {
            const state = getWorkerStateAsOf(worker, today);
            return (
              <tr key={worker.id} className="clickable-row" onClick={() => onSelectWorker(worker.id)}>
                <td>{worker.legalName}</td>
                <td>{state ? `${state.fields.jobProfile} · ${state.fields.jobLevel}` : '尚未入职'}</td>
                <td>{state ? state.fields.supervisoryOrgId : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
