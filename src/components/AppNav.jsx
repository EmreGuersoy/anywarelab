/**
 * AppNav.jsx — Global navigation bar shown on every page.
 * Title left · Nav links center · Support has a dropdown.
 */

import { useRef, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const SUPPORT_LINKS = [
  { to: 'https://anywarelab.readthedocs.io', label: 'Docs', external: true },
  { to: '/support/faq',                      label: 'FAQ'                  },
  { to: '/support/contact',                  label: 'Contact'              },
]

const linkCls = active =>
  'text-sm font-medium transition-colors px-1.5 py-1 rounded ' +
  (active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')

export function AppNav() {
  const location = useLocation()
  const [supportOpen, setSupportOpen] = useState(false)
  const supportRef = useRef(null)

  const supportActive = location.pathname.startsWith('/support')

  useEffect(() => {
    function onClickOutside(e) {
      if (supportRef.current && !supportRef.current.contains(e.target)) {
        setSupportOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close dropdown on navigation
  useEffect(() => { setSupportOpen(false) }, [location.pathname])

  return (
    <header className="flex items-center px-6 bg-white border-b border-gray-200 flex-shrink-0 h-14 relative z-50">

      {/* Left: app title */}
      <span className="font-bold text-base tracking-tight text-gray-900 w-[240px] flex-shrink-0">
        Anywarelab
      </span>

      {/* Center: nav links */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-7">

        <NavLink to="/" end className={({ isActive }) => linkCls(isActive)}>
          Home
        </NavLink>

        <NavLink to="/design" className={({ isActive }) => linkCls(isActive)}>
          Design
        </NavLink>

<NavLink to="/about" className={({ isActive }) => linkCls(isActive)}>
          About
        </NavLink>

        {/* Support with dropdown */}
        <div ref={supportRef} className="relative">
          <button
            onClick={() => setSupportOpen(v => !v)}
            className={linkCls(supportActive) + ' flex items-center gap-1'}
          >
            Support
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {supportOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[150px] overflow-hidden">
              {SUPPORT_LINKS.map(({ to, label, external }) =>
                external ? (
                  <a
                    key={to}
                    href={to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    {label}
                    <svg className="w-2.5 h-2.5 text-gray-300 flex-shrink-0" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 1h6v6M9 1L1 9"/>
                    </svg>
                  </a>
                ) : (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      'block px-4 py-2 text-xs transition-colors border-b last:border-b-0 border-gray-100 ' +
                      (isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50')
                    }
                  >
                    {label}
                  </NavLink>
                )
              )}
            </div>
          )}
        </div>

      </nav>

      {/* Right: GitHub star */}
      <div className="ml-auto flex-shrink-0">
        <GitHubStarButton />
      </div>

    </header>
  )
}

function GitHubStarButton() {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href="https://github.com/EmreGuersoy/anywarelab"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        'flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 select-none ' +
        (hovered
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-white border-gray-300 text-gray-700')
      }
    >
      {/* GitHub mark */}
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
          0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
          -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
          .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
          -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09
          2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82
          2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01
          2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>

      {/* Star icon */}
      <svg
        viewBox="0 0 16 16"
        className={'w-3 h-3 flex-shrink-0 transition-transform duration-150 ' + (hovered ? 'scale-125' : '')}
        fill={hovered ? '#facc15' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.35l-3.71 1.95.71-4.13-3-2.93 4.15-.6z"/>
      </svg>

      Star
    </a>
  )
}
