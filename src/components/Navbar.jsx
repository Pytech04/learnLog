import { Link, useLocation } from 'react-router-dom'
import { Flame, ArrowLeft, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isSubpage = location.pathname !== '/'

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" id="navbar-logo">
          <div className="navbar-logo-icon">
            <Flame size={20} strokeWidth={2.5} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-logo-text">LearnLog</span>
            <span className="navbar-tagline">Forge your path</span>
          </div>
        </Link>

        <div className="navbar-right">
          {isSubpage && (
            <Link to="/" className="btn btn-ghost btn-sm navbar-back" id="navbar-back-btn">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          )}

          {user && (
            <div className="navbar-user">
              <span className="navbar-username">
                <User size={14} />
                {user.username}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={logout} id="navbar-logout-btn">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
