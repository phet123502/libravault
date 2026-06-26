import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const SPINE_COLORS = ['#e8f4fd', '#fef9ec', '#edfaf3', '#fef2f2', '#f3f0ff', '#fff8e7']

export default function BrowseBooks({ searchQuery = '' }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [genreFilter, setGenreFilter] = useState('')
  const [availFilter, setAvailFilter] = useState('')

  async function load() {
    try {
      const data = await api('GET', '/books/')
      setBooks(data.books)
      setGenres([...new Set(data.books.map(b => b.genre).filter(Boolean))])
    } catch (e) { toast('Failed to load books.', 'danger') }
  }

  useEffect(() => { load() }, [])

  async function borrowBook(bookId) {
    try {
      const result = await api('POST', '/issues/', { bookId, userId: currentUser.id })
      toast(result.message, 'success')
      load()
    } catch (e) { toast(e.message, 'danger') }
  }

  let filtered = books
  if (genreFilter) filtered = filtered.filter(b => b.genre === genreFilter)
  if (availFilter === 'Available') filtered = filtered.filter(b => b.available > 0)
  if (availFilter === 'Issued')    filtered = filtered.filter(b => b.available === 0)
  if (searchQuery) filtered = filtered.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="section-card" style={{ marginBottom: '1rem' }}>
        <div className="section-card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-control" style={{ maxWidth: 180 }} value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 180 }} value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Issued">Fully Issued</option>
          </select>
          <span style={{ fontFamily: 'sans-serif', fontSize: '0.82rem', color: 'var(--muted)', marginLeft: 'auto' }}>
            {filtered.length} book{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><i className="bi bi-search"></i><p>No books match your filter</p></div>
      ) : (
        <div className="books-grid">
          {filtered.map((b, idx) => (
            <div key={b.id} className="book-card">
              <div className="book-spine" style={{ background: SPINE_COLORS[idx % SPINE_COLORS.length] }}>{b.emoji || '📖'}</div>
              <div className="book-info">
                <div className="book-title">{b.title}</div>
                <div className="book-author">{b.author}</div>
                <div className="book-footer">
                  <span className={`badge ${b.available > 0 ? 'badge-avail' : 'badge-issue'}`}>{b.available > 0 ? 'Available' : 'Issued'}</span>
                  <button className="borrow-btn" disabled={b.available === 0} onClick={() => borrowBook(b.id)}>
                    {b.available > 0 ? 'Borrow' : 'Unavail.'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
