import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api'

export default function SignIn({ onNavigate }) {
  const { setCurrentUser } = useAuth()
  const [role, setRole] = useState('User')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [alert, setAlert] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setAlert({ type: 'danger', msg: 'Please fill in all fields.' }); return }
    try {
      const user = await api('POST', '/auth/signin/', { email, password, role })
      setAlert({ type: 'success', msg: `Welcome back, ${user.name}!` })
      setTimeout(() => setCurrentUser(user), 900)
    } catch (err) {
      setAlert({ type: 'danger', msg: err.message })
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-bg-pattern"></div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark"><i className="bi bi-book-half"></i></div>
          <div className="auth-title">LibraVault</div>
          <div className="auth-subtitle">Library Management System</div>
        </div>
        <div className="auth-body">
          <div className="role-tabs">
            <div className={`role-tab${role === 'User' ? ' active' : ''}`} onClick={() => setRole('User')}>
              <i className="bi bi-person-fill"></i>Member
            </div>
            <div className={`role-tab${role === 'Admin' ? ' active' : ''}`} onClick={() => setRole('Admin')}>
              <i className="bi bi-shield-fill"></i>Admin
            </div>
          </div>

          {alert && (
            <div className={`alert-box ${alert.type}`}>
              <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                <i className="bi bi-envelope field-icon"></i>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <input type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
                <i
                  className={`bi ${showPwd ? 'bi-eye' : 'bi-eye-slash'} field-icon clickable`}
                  onClick={() => setShowPwd(v => !v)}
                ></i>
              </div>
            </div>
            <div className="forgot-link">
              <a onClick={() => onNavigate('forgot')}>Forgot Password?</a>
            </div>
            <button type="submit" className="btn-primary-auth">
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </button>
          </form>

          <div className="divider-or">or</div>
          <div className="auth-footer">
            No account? <a onClick={() => onNavigate('signup')}>Register here</a>
          </div>
          <div className="auth-footer" style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#aaa' }}>
            Demo — Admin: admin@libravault.com / admin123 &nbsp;|&nbsp; User: user@libravault.com / user123
            <br /><span style={{ color: '#e57373' }}>Requires Django server on localhost:8000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
