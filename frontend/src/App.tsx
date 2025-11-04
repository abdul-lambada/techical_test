import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchHealth } from './api'
import Login from './pages/Login'
import { useAuth } from './store/auth'

function Protected({ children }: { children: JSX.Element }) {
  const { accessToken } = useAuth()
  if (!accessToken) return <Navigate to="/login" replace />
  return children
}

function Dashboard() {
  const { user, logout } = useAuth()
  const [health, setHealth] = useState<string>('checking...')
  useEffect(() => {
    fetchHealth()
      .then((d) => setHealth(`API ${d.status} at ${d.time}`))
      .catch(() => setHealth('API not reachable'))
  }, [])
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Vehicle Tracker Dashboard</h1>
        <div>{health}</div>
        <div>{user ? `Hello, ${user.name}` : 'Not logged in'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => logout()}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
