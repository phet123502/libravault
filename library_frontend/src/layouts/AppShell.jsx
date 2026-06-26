import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Books from '../pages/admin/Books'
import Issues from '../pages/admin/Issues'
import Users from '../pages/admin/Users'
import Reports from '../pages/admin/Reports'
import UserDashboard from '../pages/user/UserDashboard'
import BrowseBooks from '../pages/user/BrowseBooks'
import Account from '../pages/user/Account'

const ADMIN_NAV = [
  { section: 'OVERVIEW' },
  { icon: 'bi-speedometer2', label: 'Dashboard',        panel: 'admin-dashboard', title: 'Dashboard' },
  { section: 'LIBRARY' },
  { icon: 'bi-book',         label: 'Book Catalogue',   panel: 'books',           title: 'Book Catalogue' },
  { icon: 'bi-arrow-left-right', label: 'Issue Management', panel: 'issues',      title: 'Issue Management' },
  { section: 'ADMINISTRATION' },
  { icon: 'bi-people',       label: 'Members',           panel: 'users',          title: 'Members' },
  { icon: 'bi-bar-chart',    label: 'Reports',           panel: 'reports',        title: 'Reports' },
]

const USER_NAV = [
  { icon: 'bi-grid',   label: 'My Dashboard', panel: 'user-dashboard', title: 'My Dashboard' },
  { icon: 'bi-search', label: 'Browse Books', panel: 'browse',         title: 'Browse Books' },
  { icon: 'bi-person', label: 'My Account',   panel: 'account',        title: 'My Account' },
]

const PANEL_MAP = {
  'admin-dashboard': AdminDashboard,
  'books':           Books,
  'issues':          Issues,
  'users':           Users,
  'reports':         Reports,
  'user-dashboard':  UserDashboard,
  'browse':          BrowseBooks,
  'account':         Account,
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

export default function AppShell() {
  const { currentUser, setCurrentUser } = useAuth()
  const isAdmin = currentUser.role === 'Admin'
  const defaultPanel = isAdmin ? 'admin-dashboard' : 'user-dashboard'

  const [activePanel, setActivePanel] = useState(defaultPanel)
  const [activeTitle, setActiveTitle] = useState(isAdmin ? 'Dashboard' : 'My Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nav = isAdmin ? ADMIN_NAV : USER_NAV

  function navigate(panel, title) {
    setActivePanel(panel)
    setActiveTitle(title)
    setSearchQuery('')
    setSidebarOpen(false)
  }

  function handleLogout() {
    setCurrentUser(null)
  }

  const Panel = PANEL_MAP[activePanel] || (() => <div className="empty-state"><i className="bi bi-question-circle"></i><p>Panel not found</p></div>)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-brand">
            <div className="sidebar-icon"><i className="bi bi-book-half"></i></div>
            <div>
              <div className="sidebar-brand-name">LibraVault</div>
              <div className="sidebar-brand-tag">Library System</div>
            </div>
          </div>
        </div>

        <div className="user-pill">
          <div className="user-avatar">{initials(currentUser.name)}</div>
          <div>
            <div className="user-name">{currentUser.name}</div>
            <span className={`user-role-badge ${isAdmin ? 'admin' : 'user'}`}>
              {isAdmin ? 'Administrator' : 'Member'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>
            }
            return (
              <div
                key={item.panel}
                className={`nav-item${activePanel === item.panel ? ' active' : ''}`}
                onClick={() => navigate(item.panel, item.title)}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </div>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i> Logout
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
            <i className="bi bi-list"></i>
          </button>
          <div>
            <div className="topbar-title">{activeTitle}</div>
          </div>
          <div className="topbar-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="content-area">
          <Panel searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  )
}
