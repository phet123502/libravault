import { useState } from 'react'
import { api } from '../../api'

export default function SignUp({ onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [alert, setAlert] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) { setAlert({ type: 'danger', msg: 'All fields are required.' }); return }
    if (password.length < 6) { setAlert({ type: 'danger', msg: 'Password must be at least 6 characters.' }); return }
    try {
      await api('POST', '/auth/signup/', { name, email, password })
      setAlert({ type: 'success', msg: 'Account created! Redirecting to sign in…' })
      setTimeout(() => onNavigate('signin'), 1200)
    } catch (err) {
      setAlert({ type: 'danger', msg: err.message })
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-bg-pattern"></div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark"><i className="bi bi-person-plus-fill"></i></div>
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Join the LibraVault community</div>
        </div>
        <div className="auth-body">
          {alert && (
            <div className={`alert-box ${alert.type}`}>
              <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {alert.msg}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className="field-wrap">
                <input type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
                <i className="bi bi-person field-icon"></i>
              </div>
            </div>
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
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                <i className={`bi ${showPwd ? 'bi-eye' : 'bi-eye-slash'} field-icon clickable`} onClick={() => setShowPwd(v => !v)}></i>
              </div>
            </div>
            <button type="submit" className="btn-primary-auth">
              <i className="bi bi-person-check-fill"></i> Create Account
            </button>
          </form>
          <div className="divider-or">or</div>
          <div className="auth-footer">
            Already have an account? <a onClick={() => onNavigate('signin')}>Sign In</a>
          </div>
        </div>
      </div>
    </div>
  )
}
