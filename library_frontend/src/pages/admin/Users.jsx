import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Users() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  async function load() {
    try {
      const data = await api('GET', '/users/')
      setUsers(data.users)
    } catch (e) { toast('Failed to load users.', 'danger') }
  }

  useEffect(() => { load() }, [])

  async function handleEdit(e) {
    e.preventDefault()
    try {
      await api('PUT', `/users/${editUser.id}/`, { name: editUser.name, email: editUser.email, role: editUser.role })
      toast('Member updated.', 'success')
      setEditUser(null); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  async function handleDelete() {
    try {
      await api('DELETE', `/users/${confirmDel.id}/`)
      toast('Member deleted.', 'success')
      setConfirmDel(null); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  function exportDoc() {
    const rows = users.map((u, i) => {
      const bg = i % 2 === 0 ? '#f8f9fa' : '#ffffff'
      return `<tr><td style="border:1px solid #ccc;padding:6px;background:${bg}">${u.id}</td><td style="border:1px solid #ccc;padding:6px;background:${bg}">${u.name}</td><td style="border:1px solid #ccc;padding:6px;background:${bg}">${u.email}</td><td style="border:1px solid #ccc;padding:6px;background:${bg}">${u.role}</td></tr>`
    }).join('')
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;margin:40px}h1{color:#0d1b2a}table{border-collapse:collapse;width:100%}th{background:#0d1b2a;color:#fff;padding:8px;border:1px solid #ccc}</style></head><body><h1>LibraVault — Member Report</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table><p><b>Total: ${users.length}</b></p></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'LibraVault_Members.doc'
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    toast('Report exported.', 'success')
  }

  return (
    <div>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-people me-2" style={{ color: 'var(--accent)' }}></i>Members ({users.length})</span>
          <button className="btn btn-outline" onClick={exportDoc}><i className="bi bi-download"></i> Export</button>
        </div>
        <div className="section-card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Borrowed</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'sans-serif', color: 'var(--muted)', fontSize: '0.78rem' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                  <td style={{ fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{u.borrowed} book{u.borrowed !== 1 ? 's' : ''}</td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-edit-sm" onClick={() => setEditUser({ ...u })}><i className="bi bi-pencil"></i></button>
                    <button className="btn-danger-sm" onClick={() => setConfirmDel({ id: u.id, name: u.name })} disabled={u.id === currentUser.id} title={u.id === currentUser.id ? 'Cannot delete yourself' : ''}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-pencil me-2" style={{ color: 'var(--gold)' }}></i>Edit Member</span>
              <button className="modal-close" onClick={() => setEditUser(null)}>&times;</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} /></div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={editUser.role} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDel(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#991b1b' }}><i className="bi bi-trash me-2"></i>Delete Member</span>
              <button className="modal-close" onClick={() => setConfirmDel(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem' }}>Delete member "<b>{confirmDel.name}</b>"? This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn" style={{ background: '#991b1b', color: '#fff' }} onClick={handleDelete}><i className="bi bi-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
