import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

export default function Account() {
  const { currentUser, setCurrentUser } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState({ borrowedCount: 0, returnedCount: 0 })
  const [editModal, setEditModal] = useState(false)
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email })

  useEffect(() => {
    api('GET', `/dashboard/user/${currentUser.id}/`)
      .then(d => setStats({ borrowedCount: d.borrowedCount, returnedCount: d.returnedCount }))
      .catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.email) { toast('Name and email are required.', 'danger'); return }
    try {
      await api('PUT', `/users/${currentUser.id}/`, { name: form.name, email: form.email, role: currentUser.role })
      setCurrentUser({ ...currentUser, name: form.name, email: form.email })
      setEditModal(false)
      toast('Profile updated.', 'success')
    } catch (e) { toast(e.message, 'danger') }
  }

  return (
    <div>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-person-circle me-2"></i>My Account</span>
          <button className="btn btn-accent" onClick={() => { setForm({ name: currentUser.name, email: currentUser.email }); setEditModal(true) }}>
            <i className="bi bi-pencil"></i> Edit Profile
          </button>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 700, fontFamily: 'sans-serif' }}>
              {initials(currentUser.name)}
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' }}>{currentUser.name}</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: 'var(--muted)' }}>{currentUser.email}</div>
              <span className="badge badge-user" style={{ marginTop: '0.35rem' }}>{currentUser.role}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--paper)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{stats.borrowedCount}</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>Currently Borrowed</div>
            </div>
            <div style={{ background: 'var(--paper)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sage)' }}>{stats.returnedCount}</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>Books Returned</div>
            </div>
            <div style={{ background: 'var(--paper)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{stats.borrowedCount + stats.returnedCount}</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>Total Read</div>
            </div>
          </div>
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-pencil me-2"></i>Edit Profile</span>
              <button className="modal-close" onClick={() => setEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
