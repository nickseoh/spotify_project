'use client'
import { useState } from 'react'
import { HomeIcon, SearchIcon, CloseIcon } from './icons'
import styles from './library.module.css'

type Props = {
  email: string
  query: string
  searchDisabled: boolean
  onQueryChange: (q: string) => void
  onHome: () => void
  onLogOut: () => void
}

export default function TopBar({ email, query, searchDisabled, onQueryChange, onHome, onLogOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initial = (email[0] ?? '?').toUpperCase()

  return (
    <header className={styles.topbar}>
      <div className={styles.brand} aria-hidden="true">
        {/* same placeholder mark as the login page */}
        <svg width="32" height="32" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="22" fill="#1db954" />
          <path d="M17 30V15l12-3v15" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14.5" cy="30" r="3.5" fill="#000" />
          <circle cx="26.5" cy="27" r="3.5" fill="#000" />
        </svg>
      </div>

      <div className={styles.topCenter}>
        <button className={styles.homeBtn} onClick={onHome} aria-label="Home">
          <HomeIcon />
        </button>
        <label className={styles.topSearch}>
          <SearchIcon size={22} />
          <input
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder={searchDisabled ? 'Create a playlist to start adding songs' : 'What do you want to add?'}
            disabled={searchDisabled}
            aria-label="Search songs to add"
          />
          {query && (
            <button className={styles.iconBtn} onClick={() => onQueryChange('')} aria-label="Clear search">
              <CloseIcon size={16} />
            </button>
          )}
        </label>
      </div>

      <div className={styles.menuWrap}>
        <button className={styles.avatar} onClick={() => setMenuOpen(v => !v)} aria-label="Account" aria-expanded={menuOpen}>
          {initial}
        </button>
        {menuOpen && (
          <>
            <div className={styles.menuScrim} onClick={() => setMenuOpen(false)} />
            <div className={`${styles.menu} ${styles.menuRight}`} role="menu">
              <div className={styles.menuLabel}>{email}</div>
              <button role="menuitem" className={styles.menuItem} onClick={onLogOut}>Log out</button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
