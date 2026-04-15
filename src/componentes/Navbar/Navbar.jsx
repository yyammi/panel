import { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { id: 'interno', label: 'Registro', href: '#interno', icon: '🏢' },
  { id: 'panel',   label: 'Hoja',   href: '#panel',   icon: '📊' },
  { id: 'historial', label: 'Historial', href: '#historial', icon: '🗂️' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [activeLink, setActiveLink] = useState('interno')
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const mobileMenuRef = useRef(null)

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    window.dispatchEvent(new CustomEvent('global-search', { detail: val }))
  }

  // Theme auto-apply
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light')

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('.navbar__hamburger')
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu when scrolling page
  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen) {
        setMenuOpen(false)
      }
    }
    // Set passive to improve performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])

  const handleLinkClick = (id) => {
    setActiveLink(id)
    setMenuOpen(false)
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Navegación principal">
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <a href="#" className="navbar__logo" aria-label="Ir al inicio">
            <div className="navbar__logo-icon">YP</div>
            <span className="navbar__logo-text">yamiPrueba</span>
          </a>

          {/* ── Desktop Links (centered) ── */}
          <ul className="navbar__links" role="menubar">
            {NAV_LINKS.map((link) => (
              <li key={link.id} role="none">
                <a
                  id={`nav-link-${link.id}`}
                  href={link.href}
                  role="menuitem"
                  className={`navbar__link${activeLink === link.id ? ' active' : ''}`}
                  onClick={() => handleLinkClick(link.id)}
                  aria-current={activeLink === link.id ? 'page' : undefined}
                >
                  <span className="navbar__link-icon" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* ── Actions (Search, Theme Toggle, Hamburger) ── */}
          <div className="navbar__actions">
            {activeLink !== 'interno' && (
              <div className="navbar__search">
                <div className="navbar__search-wrapper">
                  <input
                    id="navbar-search-desktop"
                    type="search"
                    className="navbar__search-input"
                    placeholder="Filtrar datos..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Buscar y filtrar datos"
                    autoComplete="off"
                  />
                  <span className="navbar__search-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                </div>
              </div>
            )}

            <button
              className="navbar__theme-toggle"
              onClick={toggleTheme}
              aria-label="Alternar tema claro/oscuro"
              title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              id="navbar-hamburger"
              className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="navbar-mobile-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        id="navbar-mobile-menu"
        ref={mobileMenuRef}
        className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}
        role="menu"
        aria-label="Menú móvil"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            id={`nav-mobile-link-${link.id}`}
            href={link.href}
            role="menuitem"
            className={`navbar__mobile-link${activeLink === link.id ? ' active' : ''}`}
            onClick={() => handleLinkClick(link.id)}
            aria-current={activeLink === link.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </a>
        ))}

        <div className="navbar__mobile-divider" />

        {/* Mobile Filter & Footer options */}
        {activeLink !== 'interno' && (
          <div className="navbar__mobile-search navbar__search-wrapper">
            <input
              id="navbar-search-mobile"
              type="search"
              className="navbar__search-input"
              placeholder="Filtrar datos..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Buscar y filtrar datos"
              autoComplete="off"
            />
            <span className="navbar__search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
          </div>
        )}
      </div>
    </>
  )
}
