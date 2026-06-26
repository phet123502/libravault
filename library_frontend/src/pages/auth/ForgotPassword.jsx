import { useState } from 'react'
import { api } from '../../api'

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [alert, setAlert] = useState(null)

  async function verifyEmail(e) {
    e.preventDefault()
    if (!email) { setAlert({ type: 'danger', msg: 'Enter your email address.' }); return }
    try {
      await api('POST', '/auth/verify-email/', { email })
      setAlert({ type: 'success', msg: 'Email verified!' })
      setTimeout(() => { setAlert(null); setStep(2) }, 700)
    } catch (err) {
      setAlert({ type: 'danger', msg: err.message })
    }
  }

  async function resetPassword(e) {
    e.preventDefault()
    if (!newPwd || newPwd.length < 6) { setAlert({ type: 'danger', msg: 'Password must be at least 6 characters.' }); return }
    if (newPwd !== confirmPwd) { setAlert({ type: 'danger', msg: 'Passwords do not match.' }); return }
    try {
      await api('POST', '/auth/reset-password/', { email, new_password: newPwd })
      setAlert({ type: 'success', msg: 'Password reset! Redirecting…' })
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
          <div className="brand-mark"><i className="bi bi-key-fill"></i></div>
          <div className="auth-title">Reset Password</div>
          <div className="auth-subtitle">We'll verify your account</div>
        </div>
        <div className="auth-body">
          {alert && (
            <div className={`alert-box ${alert.type}`}>
              <i className={`bi bi-${alert.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
              {alert.msg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={verifyEmail}>
              <div className="field-group">
                <label className="field-label">Registered Email</label>
                <div className="field-wrap">
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <i className="bi bi-envelope field-icon"></i>
                </div>
              </div>
              <button type="submit" className="btn-primary-auth">
                <i className="bi bi-search"></i> Verify Email
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword}>
              <div className="field-group">
                <label className="field-label">New Password</label>
                <div className="field-wrap">
                  <input type="password" placeholder="Min 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                  <i className="bi bi-lock field-icon"></i>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className="field-wrap">
                  <input type="password" placeholder="Repeat password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                  <i className="bi bi-lock-fill field-icon"></i>
                </div>
              </div>
              <button type="submit" className="btn-primary-auth">
                <i className="bi bi-check-circle-fill"></i> Reset Password
              </button>
            </form>
          )}

          <div className="divider-or">or</div>
          <div className="auth-footer">
            <a onClick={() => onNavigate('signin')}><i className="bi bi-arrow-left"></i> Back to Sign In</a>
          </div>
        </div>
      </div>
    </div>
  )
}
