'use client'

// Navigační lišta - hlavní menu, profilový dropdown a mobilní slide menu

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { logoutUser } from '@/lib/auth'

export default function Navbar() {
  const { user, loading } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen])

  if (loading) return null

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <Image src="/naicon.svg" alt="Logo" width={32} height={32} priority />
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            <li><Link href="/">Domů</Link></li>
            <li><Link href="/barvy">Barvy</Link></li>
            <li><Link href="/fonty">Fonty</Link></li>
            <li><Link href="/moodboard">Moodboard</Link></li>
            <li><Link href="/galerie">Galerie</Link></li>
            <li><Link href="/uceni">Učení</Link></li>
            <li><Link href="/minihra">Minihra</Link></li>
          </ul>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="profile-wrapper" ref={dropdownRef}>
              <button
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
              <div className="profile-avatar-small">
              </div>
                <span className="profile-text">Můj profil</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                 <div className="profile-avatar-small">
                </div>
                    <span className="profile-name">{user.displayName || user.email}</span>
                  </div>

                  <Link href="/profil" className="dropdown-item" onClick={() => setProfileOpen(false)}>Můj profil</Link>
                  <Link href="/oblibene" className="dropdown-item" onClick={() => setProfileOpen(false)}>Oblíbené</Link>
                  <Link href="/nastaveni" className="dropdown-item" onClick={() => setProfileOpen(false)}>Nastavení</Link>
                  <button className="dropdown-item logout-btn" onClick={() => { logoutUser(); setProfileOpen(false) }}>Odhlásit se</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/prihlaseni" className="desktop-only">Přihlásit</Link>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            &#9776;
          </button>
        </div>
      </nav>

      <div className={`slide-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>&times;</button>
        <ul className="slide-links">
          <li><Link href="/" onClick={() => setMenuOpen(false)}>Domů</Link></li>
          <li><Link href="/barvy" onClick={() => setMenuOpen(false)}>Barvy</Link></li>
          <li><Link href="/fonty" onClick={() => setMenuOpen(false)}>Fonty</Link></li>
          <li><Link href="/moodboard" onClick={() => setMenuOpen(false)}>Moodboard</Link></li>
          <li><Link href="/galerie" onClick={() => setMenuOpen(false)}>Galerie</Link></li>
          <li><Link href="/uceni" onClick={() => setMenuOpen(false)}>Učení</Link></li>
          <li><Link href="/minihra" onClick={() => setMenuOpen(false)}>Minihra</Link></li>
        </ul>
        <ul className="down-links">
          <li><Link href="/oblibene" onClick={() => setMenuOpen(false)}>Oblíbené</Link></li>
          <li><Link href="/nastaveni" onClick={() => setMenuOpen(false)}>Nastavení</Link></li>
        </ul>

        {!user && (
        <div className="mobile-profile">
          <Link
            href="/prihlaseni"
            className="profile-menu-link"
            onClick={() => setMenuOpen(false)}
          >
            Přihlásit se
          </Link>
        </div>
        )}

        {user && (
          <div className="mobile-profile">
            <Link
              href="/profil"
              className="profile-menu-link"
              onClick={() => setMenuOpen(false)}
            >
               <div className="profile-avatar">
              </div>
              <span>Můj profil</span>
            </Link>
            <button
              className="profile-menu-link logout-btn"
              onClick={() => { logoutUser(); setMenuOpen(false) }}
            >
              Odhlásit se
            </button>
          </div>
        )}
      </div>
    </>
  )
}
