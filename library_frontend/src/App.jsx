import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import AppShell from './layouts/AppShell'

export default function App() {
  const { currentUser } = useAuth()
  const [authScreen, setAuthScreen] = useState('signin')

  if (currentUser) return <AppShell />

  if (authScreen === 'signup')
    return <SignUp onNavigate={setAuthScreen} />
  if (authScreen === 'forgot')
    return <ForgotPassword onNavigate={setAuthScreen} />
  return <SignIn onNavigate={setAuthScreen} />
}
