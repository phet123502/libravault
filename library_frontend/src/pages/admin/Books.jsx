import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../context/ToastContext'

const EMPTY_BOOK = { title: '', author: '', genre: '', isbn: '', stock: 1, year: '' }

export default function Books({ searchQuery = '' }) {
  const { toast } = useToast()
  const [books, setBooks] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [issueBook, setIssueBook] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [newBook, setNewBook] = useState(EMPTY_BOOK)
  const [members, setMembers] = useState([])
  const [issueForm, setIssueForm] = useState({ memberId: '', dueDate: defaultDue() })

  function defaultDue() {
    const d = new Date(); d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  }

  async function load() {
    try {
      const data = await api('GET', '/books/')
      setBooks(data.books)
    } catch (e) { toast(e.message, 'danger') }
  }

  useEffect(() => { load() }, [])

  const filtered = books.filter(b =>
    !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleAdd(e) {
    e.preventDefault()
    if (!newBook.title || !newBook.author) { toast('Title and author are required.', 'danger'); return }
    try {
      const res = await api('POST', '/books/', { ...newBook, stock: parseInt(newBook.stock) || 1, year: parseInt(newBook.year) || null })
      toast(`"${res.title}" added to catalogue.`, 'success')
      setAddModal(false); setNewBook(EMPTY_BOOK); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  async function handleEdit(e) {
    e.preventDefault()
    try {
      await api('PUT', `/books/${editBook.id}/`, { title: editBook.title, author: editBook.author, genre: editBook.genre, stock: parseInt(editBook.stock) || 1 })
      toast('Book updated successfully.', 'success')
      setEditBook(null); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  async function handleDelete() {
    try {
      await api('DELETE', `/books/${confirmDel.id}/`)
      toast('Book deleted.', 'success')
      setConfirmDel(null); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  async function openIssue(book) {
    setIssueBook(book)
    setIssueForm({ memberId: '', dueDate: defaultDue() })
    try {
      const data = await api('GET', '/users/')
      setMembers(data.users.filter(u => u.role === 'User'))
    } catch (e) { toast('Failed to load members.', 'danger') }
  }

  async function handleIssue(e) {
    e.preventDefault()
    if (!issueForm.memberId) { toast('Please select a member.', 'danger'); return }
    try {
      const result = await api('POST', '/issues/', { bookId: issueBook.id, userId: parseInt(issueForm.memberId), dueDate: issueForm.dueDate })
      toast(result.message, 'success')
      setIssueBook(null); load()
    } catch (e) { toast(e.message, 'danger') }
  }

  return (
    <div>
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title"><i className="bi bi-book me-2" style={{ color: 'var(--accent)' }}></i>
            Book Catalogue
            <span style={{ fontFamily: 'sans-serif', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
              {filtered.length} of {books.length}
            </span>
          </span>
          <button className="btn btn-accent" onClick={() => setAddModal(true)}><i className="bi bi-plus-lg"></i> Add Book</button>
        </div>
        <div className="section-card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Author</th><th>Genre</th><th>Stock</th><th>Availability</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><i className="bi bi-search"></i><p>No books found</p></div></td></tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'sans-serif', color: 'var(--muted)', fontSize: '0.78rem' }}>#{b.id}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{b.emoji || '📖'} {b.title}</span>
                    <br /><span style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>{b.year ? b.year + ' · ' : ''}{b.isbn || ''}</span>
                  </td>
                  <td style={{ fontFamily: 'sans-serif' }}>{b.author}</td>
                  <td><span className="badge badge-genre">{b.genre || '—'}</span></td>
                  <td style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>{b.stock}</td>
                  <td>
                    <span className={`badge ${b.available > 0 ? 'badge-avail' : 'badge-issue'}`}>
                      {b.available > 0 ? `${b.available} available` : 'All issued'}
                    </span>
                    <div style={{ fontFamily: 'sans-serif', fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{b.stock - b.available} issued</div>
                  </td>
                  <td style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-edit-sm" onClick={() => setEditBook({ ...b })} title="Edit"><i className="bi bi-pencil"></i></button>
                    <button className="btn-danger-sm" onClick={() => setConfirmDel({ id: b.id, title: b.title })} title="Delete"><i className="bi bi-trash"></i></button>
                    {b.available > 0
                      ? <button className="btn-sm-sage" onClick={() => openIssue(b)}><i className="bi bi-arrow-right-circle"></i> Issue</button>
                      : <span style={{ fontFamily: 'sans-serif', fontSize: '0.72rem', color: 'var(--muted)' }}>Unavailable</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-plus-circle me-2" style={{ color: 'var(--accent)' }}></i>Add New Book</span>
              <button className="modal-close" onClick={() => setAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Title *</label><input className="form-control" placeholder="Book title" value={newBook.title} onChange={e => setNewBook(b => ({ ...b, title: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Author *</label><input className="form-control" placeholder="Author name" value={newBook.author} onChange={e => setNewBook(b => ({ ...b, author: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Genre</label><input className="form-control" placeholder="e.g. Fiction" value={newBook.genre} onChange={e => setNewBook(b => ({ ...b, genre: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">ISBN</label><input className="form-control" placeholder="ISBN number" value={newBook.isbn} onChange={e => setNewBook(b => ({ ...b, isbn: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Stock</label><input type="number" className="form-control" min="1" value={newBook.stock} onChange={e => setNewBook(b => ({ ...b, stock: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Year</label><input type="number" className="form-control" placeholder="2023" value={newBook.year} onChange={e => setNewBook(b => ({ ...b, year: e.target.value }))} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent"><i className="bi bi-plus-lg"></i> Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editBook && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditBook(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-pencil me-2" style={{ color: 'var(--gold)' }}></i>Edit Book</span>
              <button className="modal-close" onClick={() => setEditBook(null)}>&times;</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={editBook.title} onChange={e => setEditBook(b => ({ ...b, title: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Author</label><input className="form-control" value={editBook.author} onChange={e => setEditBook(b => ({ ...b, author: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Genre</label><input className="form-control" value={editBook.genre || ''} onChange={e => setEditBook(b => ({ ...b, genre: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Stock</label><input type="number" className="form-control" min="0" value={editBook.stock} onChange={e => setEditBook(b => ({ ...b, stock: e.target.value }))} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditBook(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {issueBook && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIssueBook(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title"><i className="bi bi-arrow-right-circle me-2" style={{ color: 'var(--sage)' }}></i>Issue Book</span>
              <button className="modal-close" onClick={() => setIssueBook(null)}>&times;</button>
            </div>
            <form onSubmit={handleIssue}>
              <div className="modal-body">
                <div style={{ background: 'var(--paper)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700 }}>{issueBook.emoji} {issueBook.title}</div>
                  <div style={{ fontFamily: 'sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>by {issueBook.author} · {issueBook.available} {issueBook.available === 1 ? 'copy' : 'copies'} available</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Member *</label>
                  <select className="form-control" value={issueForm.memberId} onChange={e => setIssueForm(f => ({ ...f, memberId: e.target.value }))}>
                    <option value="">— choose a member —</option>
                    {members.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email}) · {u.borrowed} borrowed</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={issueForm.dueDate} onChange={e => setIssueForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIssueBook(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent"><i className="bi bi-arrow-right-circle"></i> Issue Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDel(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#991b1b' }}><i className="bi bi-trash me-2"></i>Delete Book</span>
              <button className="modal-close" onClick={() => setConfirmDel(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem' }}>Delete "<b>{confirmDel.title}</b>"? This cannot be undone.</p>
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
