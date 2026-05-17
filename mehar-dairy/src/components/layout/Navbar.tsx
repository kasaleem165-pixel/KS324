import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/animals', label: 'Animals' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight group">
            <span className="font-display text-xl font-bold text-primary-800 group-hover:text-primary-700 transition-colors">
              {siteConfig.name}
            </span>
            <span className="font-urdu text-xs text-gold-600" style={{ lineHeight: 1.4 }}>
              {siteConfig.nameUrdu}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-700 border-b-2 border-primary-600 pb-0.5'
                      : 'text-gray-600 hover:text-primary-700',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-2 px-4 py-1.5 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-primary-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium py-1.5',
                  isActive ? 'text-primary-700' : 'text-gray-600',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-primary-700"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setOpen(false) }}
                className="text-sm font-medium text-red-600 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary-700"
            >
              Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
