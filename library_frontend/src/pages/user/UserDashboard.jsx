import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

export default function UserDashboard() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    api('GET', `/dashboard/user/${currentUser.id}/`)
      .then(setData)
      .catch(() => toast('Failed to load dashboard.', 'danger'))
  }, [])

  if (!data) return <div className="empty-state"><i className="bi bi-hourglass-split"></i><p>Loading…</p></div>

  return (
    <div>
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {currentUser.name.split(' ')[0]}! 👋</h2>
          <p>Here's your reading summary</p>
        </div>
        <div className="welcome-avatar">{initials(currentUser.name)}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card c1"><div className="stat-icon"><i className="bi bi-book-fill"></i></div><div className="stat-value">{data.borrowedCount}</div><div className="stat-label">Currently Borrowed</div></div>
        <div className="stat-card c3"><div className="stat-icon"><i className="bi bi-check2-all"></i></div><div className="stat-value">{data.returnedCount}</div><div className="stat-label">Books Returned</div></div>
        <div className="stat-card c4"><div className="stat-icon"><i className="bi bi-journal-bookmark"></i></div><div className="stat-value">{data.totalBooks}</div><div className="stat-label">Books in Library</div></div>
        <div className="stat-card c2"><div className="stat-icon"><i className="bi bi-exclamation-triangle"></i></div><div className="stat-value">{data.overdue}</div><div className="stat-label">Overdue Books</div></div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-book me-2" style={{ color: 'var(--accent)' }}></i>Currently Borrowed</span>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead><tr><th>Book</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {data.borrowedList.length ? data.borrowedList.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>{item.bookEmoji} {item.bookTitle}</td>
                  <td style={{ fontFamily: 'sans-serif', fontSize: '0.82rem', color: item.overdue ? 'var(--accent)' : undefined, fontWeight: item.overdue ? 700 : undefined }}>{item.dueDate}</td>
                  <td><span className={`badge ${item.overdue ? 'badge-issue' : 'badge-cat'}`}>{item.overdue ? 'Overdue' : 'Active'}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="3"><div className="empty-state"><i className="bi bi-inbox"></i><p>No books borrowed</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-clock-history me-2" style={{ color: 'var(--gold)' }}></i>Reading History</span>
        </div>
        <div className="section-card-body">
          {data.history.length ? data.history.map((item, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot return"><i className="bi bi-check2-circle"></i></div>
              <div>
                <div className="activity-text">{item.bookTitle}</div>
                <div className="activity-time">Returned by {item.dueDate}</div>
              </div>
            </div>
          )) : <div className="empty-state"><i className="bi bi-clock-history"></i><p>No reading history yet</p></div>}
        </div>
      </div>
    </div>
  )
}
