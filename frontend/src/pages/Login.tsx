import { FormEvent, useState } from 'react'
import { useAuth } from '../store/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/')
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial' }}>
      <form onSubmit={onSubmit} style={{ width: 320, display: 'grid', gap: 12 }}>
        <h2>Login</h2>
        <label>
          <div>Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div>Password</div>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 8 }} />
        </label>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ padding: '10px 12px' }}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  )
}
