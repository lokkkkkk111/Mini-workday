import { useState } from 'react'
import { seedWorkers } from './data/seed.ts'
import { listSupervisoryOrgIds } from './model/worker.ts'
import { WorkerList } from './features/time-machine/WorkerList.tsx'
import { WorkerDetail } from './features/time-machine/WorkerDetail.tsx'
import type { Worker } from './model/types.ts'
import './App.css'

function App() {
  const [workers, setWorkers] = useState<Worker[]>(seedWorkers)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)

  function handleUpdateWorker(updatedWorker: Worker) {
    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)))
  }

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) ?? null

  return (
    <main>
      <h1>Mini Workday</h1>
      {selectedWorker ? (
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
