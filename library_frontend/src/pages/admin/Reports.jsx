import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function Reports() {
  const { toast } = useToast()
  const [dash, setDash] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    Promise.all([api('GET', '/dashboard/admin/'), api('GET', '/users/')])
      .then(([d, u]) => { setDash(d); setUsers(u.users) })
      .catch(() => toast('Failed to load reports.', 'danger'))
  }, [])

  if (!dash) return <div className="empty-state"><i className="bi bi-hourglass-split"></i><p>Loading reports…</p></div>

  return (
    <div>
      <div style={{ marginBottom: '1rem', fontFamily: 'sans-serif', fontSize: '0.82rem', color: 'var(--muted)' }}>
        Generated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card c1"><div className="stat-icon"><i className="bi bi-book-fill"></i></div><div className="stat-value">{dash.totalBooks}</div><div className="stat-label">Total Books</div></div>
        <div className="stat-card c3"><div className="stat-icon"><i className="bi bi-people-fill"></i></div><div className="stat-value">{dash.totalMembers}</div><div className="stat-label">Total Members</div></div>
        <div className="stat-card c2"><div className="stat-icon"><i className="bi bi-arrow-left-right"></i></div><div className="stat-value">{dash.activeIssues}</div><div className="stat-label">Active Issues</div></div>
        <div className="stat-card c4"><div className="stat-icon"><i className="bi bi-exclamation-triangle-fill"></i></div><div className="stat-value">{dash.overdue}</div><div className="stat-label">Overdue</div></div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-people me-2"></i>All Members</span>
        </div>
        <div className="section-card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'sans-serif', color: 'var(--muted)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
