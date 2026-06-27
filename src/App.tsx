import { useState } from 'react'
import { seedOrgs, seedWorkers } from './data/seed.ts'
import { listSupervisoryOrgIds } from './model/worker.ts'
import { WorkerList } from './features/time-machine/WorkerList.tsx'
import { WorkerDetail } from './features/time-machine/WorkerDetail.tsx'
import { OrgTree } from './features/org-tree/OrgTree.tsx'
import type { Worker } from './model/types.ts'
import './App.css'

type Tab = 'time-machine' | 'org-tree'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('time-machine')
  const [workers, setWorkers] = useState<Worker[]>(seedWorkers)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)

  function handleUpdateWorker(updatedWorker: Worker) {
    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)))
  }

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) ?? null

  return (
    <main>
      <h1>Mini Workday</h1>

      <nav className="tabs">
        <button
          type="button"
          className={activeTab === 'time-machine' ? 'active' : undefined}
          onClick={() => setActiveTab('time-machine')}
        >
          时间机器
        </button>
        <button
          type="button"
          className={activeTab === 'org-tree' ? 'active' : undefined}
          onClick={() => setActiveTab('org-tree')}
        >
          组织树
        </button>
      </nav>

      {activeTab === 'org-tree' ? (
        <OrgTree orgs={seedOrgs} workers={workers} />
      ) : selectedWorker ? (
        <WorkerDetail
          worker={selectedWorker}
          orgIds={listSupervisoryOrgIds(workers)}
          onBack={() => setSelectedWorkerId(null)}
          onUpdateWorker={handleUpdateWorker}
        />
      ) : (
        <WorkerList workers={workers} onSelectWorker={setSelectedWorkerId} />
      )}
    </main>
  )
}

export default App
