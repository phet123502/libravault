import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function Issues({ searchQuery = '' }) {
  const { toast } = useToast()
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('all')
  const [newIssueModal, setNewIssueModal] = useState(false)
  const [availBooks, setAvailBooks] = useState([])
  const [members, setMembers] = useState([])
  const [niForm, setNiForm] = useState({ bookId: '', memberId: '', dueDate: defaultDue() })

  function defaultDue() {
    const d = new Date(); d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  }

  async function load() {
    try {
      const data = await api('GET', '/issues/')
      setIssues(data.issues)
    } catch (e) { toast(e.message, 'danger') }
  }

  useEffect(() => { load() }, [])

  async function openNewIssue() {
    setNiForm({ bookId: '', memberId: '', dueDate: defaultDue() })
    try {
      const [bData, uData] = await Promise.all([api('GET', '/books/'), api('GET', '/users/')])
      setAvailBooks(bData.books.filter(b => b.available > 0))
      setMembers(uData.users.filter(u => u.role === 'User'))
      setNewIssueModal(true)
    } catch (e) { toast('Failed to load data.', 'danger') }
  }

  async function handleNewIssue(e) {
    e.preventDefault()
    if (!niForm.bookId) { toast('Please select a book.', 'danger'); return }
    if (!niForm.memberId) { toast('Please select a member.', 'danger'); return }
    try {
      const result = await api('POST', '/issues/', { bookId: parseInt(niForm.bookId), userId: parseInt(niForm.memberId), dueDate: niForm.dueDate })
      toast(result.message, 'success')
      setNewIssueModal(false); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  async function returnBook(issueId) {
    try {
      await api('PUT', `/issues/${issueId}/return/`)
      toast('Book marked as returned.', 'success')
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, returned: true, overdue: false } : i))
    } catch (e) { toast(e.message, 'danger') }
  }

  async function deleteIssue(issue) {
    if (!confirm(`Delete issue #${issue.id} (${issue.bookTitle} — ${issue.userName})?\nThis permanently removes the record.`)) return
    try {
      await api('DELETE', `/issues/${issue.id}/delete/`)
      setIssues(prev => prev.filter(i => i.id !== issue.id))
      toast('Issue record deleted.', 'success')
    } catch (e) { toast(e.message, 'danger') }
  }

  const counts = {
    all: issues.length,
    active: issues.filter(i => !i.returned).length,
    overdue: issues.filter(i => i.overdue).length,
    returned: issues.filter(i => i.returned).length,
  }

  let filtered = issues
  if (filter === 'active')   filtered = issues.filter(i => !i.returned)
  if (filter === 'overdue')  filtered = issues.filter(i => i.overdue)
  if (filter === 'returned') filtered = issues.filter(i => i.returned)
  if (searchQuery) filtered = filtered.filter(i =>
    i.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-arrow-left-right me-2" style={{ color: 'var(--accent)' }}></i>Issue Management</span>
          <button className="btn btn-accent" onClick={openNewIssue}><i className="bi bi-plus-lg"></i> New Issue</button>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['all', 'active', 'overdue', 'returned'].map(f => (
              <button key={f} className={`issue-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)} <span className="tab-cnt">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Book</th><th>Member</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No issues found.</td></tr>
                ) : filtered.map(i => {
                  const status = i.returned
                    ? <span className="badge badge-avail">Returned</span>
                    : i.overdue ? <span className="badge badge-issue">Overdue</span> : <span className="badge badge-cat">Active</span>
                  return (
                    <tr key={i.id}>
                      <td style={{ fontFamily: 'sans-serif', color: 'var(--muted)', fontSize: '0.78rem' }}>#{i.id}</td>
                      <td style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>{i.bookEmoji || '📖'} {i.bookTitle}</td>
                      <td style={{ fontFamily: 'sans-serif' }}>{i.userName}</td>
                      <td style={{ fontFamily: 'sans-serif', fontSize: '0.82rem' }}>{i.issueDate}</td>
                      <td style={{ fontFamily: 'sans-serif', fontSize: '0.82rem', color: i.overdue && !i.returned ? 'var(--accent)' : undefined, fontWeight: i.overdue && !i.returned ? 700 : undefined }}>{i.dueDate}</td>
                      <td>{status}</td>
                      <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {!i.returned && <button className="btn-sm-sage" onClick={() => returnBook(i.id)}><i className="bi bi-check2-circle"></i> Return</button>}
                        <button className="btn-danger-sm" onClick={() => deleteIssue(i)} title="Delete record"><i className="bi bi-trash"></i></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Issue Modal */}
      {newIssueModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setNewIssueModal(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-plus-circle me-2" style={{ color: 'var(--accent)' }}></i>Create New Issue</span>
              <button className="modal-close" onClick={() => setNewIssueModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleNewIssue}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Book *</label>
                  <select className="form-control" value={niForm.bookId} onChange={e => setNiForm(f => ({ ...f, bookId: e.target.value }))}>
                    <option value="">— choose a book —</option>
                    {availBooks.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.title} ({b.available} available)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Member *</label>
                  <select className="form-control" value={niForm.memberId} onChange={e => setNiForm(f => ({ ...f, memberId: e.target.value }))}>
                    <option value="">— choose a member —</option>
                    {members.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={niForm.dueDate} onChange={e => setNiForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setNewIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent"><i className="bi bi-check-lg"></i> Create Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
