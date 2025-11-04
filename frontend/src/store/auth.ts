import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as apiLogin, refresh as apiRefresh, logout as apiLogout, me as apiMe } from '../api'

interface User { id: string; email: string; name: string }

interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  refresh: () => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      loading: false,
      error: null,
      async login(email, password) {
        set({ loading: true, error: null })
        try {
          const res = await apiLogin(email, password)
          set({ accessToken: res.accessToken, user: res.user })
        } catch (e: any) {
          set({ error: e?.message || 'Login failed' })
          throw e
        } finally {
          set({ loading: false })
        }
      },
      async refresh() {
        try {
          const res = await apiRefresh()
          set({ accessToken: res.accessToken })
        } catch {
          // ignore, token may be expired
        }
      },
      async fetchMe() {
        const token = get().accessToken
        if (!token) return
        try {
          const data = await apiMe(token)
          set({ user: data.user ?? data })
        } catch {
          // if failed, try refresh then retry once
          await get().refresh()
          const t2 = get().accessToken
          if (!t2) return
          try {
            const data = await apiMe(t2)
            set({ user: data.user ?? data })
          } catch {
            // still failed
          }
        }
      },
      async logout() {
        try { await apiLogout() } catch {}
        set({ user: null, accessToken: null })
      },
      clearError() { set({ error: null }) }
    }),
    { name: 'vt-auth' }
  )
)
