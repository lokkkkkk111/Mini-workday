import { useState } from 'react'
import { WorkerList } from './features/time-machine/WorkerList.tsx'
import { WorkerDetail } from './features/time-machine/WorkerDetail.tsx'
import './App.css'

function App() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)

  return (
    <main>
      <h1>Mini Workday</h1>
      {selectedWorkerId ? (
        <WorkerDetail workerId={selectedWorkerId} onBack={() => setSelectedWorkerId(null)} />
      ) : (
        <WorkerList onSelectWorker={setSelectedWorkerId} />
      )}
    </main>
  )
}

export default App
