import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function AdminDashboard() {
  const { toast } = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    api('GET', '/dashboard/admin/')
      .then(setData)
      .catch(() => toast('Failed to load dashboard.', 'danger'))
  }, [])

  if (!data) {
    return <div className="empty-state"><i className="bi bi-hourglass-split"></i><p>Loading dashboard…</p></div>
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card c1">
          <div className="stat-icon"><i className="bi bi-book-fill"></i></div>
          <div className="stat-value">{data.totalBooks}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card c3">
          <div className="stat-icon"><i className="bi bi-check2-circle"></i></div>
          <div className="stat-value">{data.availableCopies}</div>
          <div className="stat-label">Available Copies</div>
        </div>
        <div className="stat-card c2">
          <div className="stat-icon"><i className="bi bi-arrow-left-right"></i></div>
          <div className="stat-value">{data.activeIssues}</div>
          <div className="stat-label">Issued Out</div>
        </div>
        <div className="stat-card c4">
          <div className="stat-icon"><i className="bi bi-exclamation-triangle-fill"></i></div>
          <div className="stat-value">{data.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--muted)' }}>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: 'var(--muted)' }}><i className="bi bi-people-fill"></i></div>
          <div className="stat-value">{data.totalMembers}</div>
          <div className="stat-label">Members</div>
        </div>
      </div>

      {/* Book availability */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-book me-2" style={{ color: 'var(--accent)' }}></i>Book Availability</span>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Book</th><th>Genre</th><th>Stock</th><th>Issued</th><th>Available</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.booksStatus.map(b => {
                  const pct = b.stock > 0 ? Math.round((b.issued / b.stock) * 100) : 0
                  const statusBadge = b.available === 0
                    ? <span className="badge badge-issue">Fully Issued</span>
                    : b.available === b.stock
                      ? <span className="badge badge-avail">All Available</span>
                      : <span className="badge badge-cat">Partially Issued</span>
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.emoji} {b.title}</td>
                      <td><span className="badge badge-genre">{b.genre}</span></td>
                      <td style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>{b.stock}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'sans-serif', color: 'var(--accent)', fontWeight: 600 }}>{b.issued}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'sans-serif', color: 'var(--sage)', fontWeight: 600 }}>{b.available}</td>
                      <td>
                        {statusBadge}
                        <div className="progress-bar-wrap" style={{ marginTop: 4, width: 80 }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity + Overdue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title"><i className="bi bi-clock-history me-2" style={{ color: 'var(--sage)' }}></i>Recent Activity</span>
          </div>
          <div className="section-card-body">
            {data.activity.length ? data.activity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot borrow"><i className="bi bi-book-half"></i></div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }}></div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            )) : <div className="empty-state"><i className="bi bi-inbox"></i><p>No activity yet</p></div>}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title"><i className="bi bi-alarm me-2" style={{ color: 'var(--accent)' }}></i>Overdue Books</span>
          </div>
          <div className="section-card-body">
            {data.overdueList.length ? data.overdueList.map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot borrow"><i className="bi bi-alarm"></i></div>
                <div>
                  <div className="activity-text"><b>{item.bookTitle}</b><br /><span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{item.userName}</span></div>
                  <div className="activity-time" style={{ color: 'var(--accent)', fontWeight: 700 }}>{item.daysOverdue} days overdue</div>
                </div>
              </div>
            )) : <div className="empty-state"><i className="bi bi-check-circle-fill" style={{ color: 'var(--sage)' }}></i><p>No overdue books</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
