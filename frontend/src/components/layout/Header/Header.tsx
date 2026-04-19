import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MotorsLogo}  from '../../shared/LogoM'
import { useAuth } from '../../../hooks/useAuth'

interface NavLinkItem {
  readonly label: string
  readonly to: string
}

const navLinks: NavLinkItem[] = [
  { label: 'Accueil', to: '/' },
  { label: 'Catalogue', to: '/vehicles' },
  { label: 'À Propos', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-background border-b border-black/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <MotorsLogo className="w-6 h-6text-primary group-hover:text-foreground transition-colors" />
            <span className="text-foreground font-display font-extrabold text-lg tracking-widest">
              M-MOTORS
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `hover-link text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted hover:text-foreground'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-foreground">
                  Bonjour {user?.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-foreground transition-colors px-3 py-1.5 text-sm font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted hover:text-foreground transition-colors px-3 py-1.5 text-sm font-medium"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="hover-btn bg-primary text-white px-4 py-1.5 rounded text-sm font-semibold"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Burger menu mobile */}
          <button
            className="md:hidden text-muted hover:text-foreground p-2 transition-colors"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3" aria-label="Navigation mobile">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium py-2 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-foreground py-2">
                  Bonjour {user?.firstName}
                </span>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout() }}
                  className="text-muted hover:text-foreground text-sm font-medium py-2 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-muted hover:text-foreground text-sm font-medium py-2 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="hover-btn bg-primary text-white text-center py-2 rounded text-sm font-semibold"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
