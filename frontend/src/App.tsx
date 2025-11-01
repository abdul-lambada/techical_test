import { useEffect, useState } from 'react'
import { fetchHealth } from './api'

export default function App() {
  const [health, setHealth] = useState<string>('checking...')

  useEffect(() => {
    fetchHealth()
      .then((d) => setHealth(`API ${d.status} at ${d.time}`))
      .catch(() => setHealth('API not reachable'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial'
    }}>
      <div>
        <h1>Vehicle Tracker Dashboard</h1>
        <p>{health}</p>
        <p>Scaffold ready. Next: auth, dashboard, tables, pagination, downloads.</p>
      </div>
    </div>
  )
}
