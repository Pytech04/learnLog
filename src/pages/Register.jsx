import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../api'
import './Auth.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { user, token } = await registerUser(username, email, password)
      login(user, token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card animate-scale-in">
        <div className="auth-header">
          <div className="auth-logo">
            <Flame size={28} />
          </div>
          <h1>Join the Grind</h1>
          <p>Create your account and start building</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="register-username">Username</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit">
            {loading ? <Loader2 size={16} className="spin" /> : <Flame size={16} />}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
