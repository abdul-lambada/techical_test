import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

async function fetchVehicles(page: number, query: string) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', '10')
  if (query) params.set('query', query)
  const res = await fetch(`/api/vehicles?${params.toString()}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to load vehicles')
  return res.json() as Promise<{ items: Array<{ id: string; plate: string; label: string }>; total: number; page: number; limit: number }>
}

export default function Dashboard() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vehicles', page, q],
    queryFn: () => fetchVehicles(page, q)
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 10))

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial' }}>
      <h2>Vehicles</h2>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="Search plate/label" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, flex: 1 }} />
        <button onClick={() => { setPage(1); refetch() }}>Search</button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Plate</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Label</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v: { id: string; plate: string; label: string }) => (
                <tr key={v.id}>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{v.plate}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{v.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <div>Page {page} / {totalPages}</div>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
