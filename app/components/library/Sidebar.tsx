'use client'
import { useMemo, useRef, useState } from 'react'
import type { PlaylistSummary } from '@/lib/types'
import PlaylistCover from './PlaylistCover'
import { CheckIcon, CloseIcon, LibraryIcon, ListIcon, PlusIcon, SearchIcon, VolumeIcon } from './icons'
import styles from './library.module.css'

type SortKey = 'recents' | 'added' | 'alpha'
const SORT_LABELS: Record<SortKey, string> = {
  recents: 'Recents',
  added: 'Recently Added',
  alpha: 'Alphabetical',
}

type Props = {
  playlists: PlaylistSummary[]
  selectedId: string | null
  playingId: string | null
  username: string
  loaded: boolean
  onSelect: (id: string) => void
  onCreate: () => void
}

export default function Sidebar({ playlists, selectedId, playingId, username, loaded, onSelect, onCreate }: Props) {
  const [filter, setFilter] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('recents')
  const [sortMenu, setSortMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = q ? playlists.filter(p => p.title.toLowerCase().includes(q)) : [...playlists]
    if (sort === 'alpha') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'added') list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    else list.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    return list
  }, [playlists, filter, sort])

  return (
    <aside className={styles.sidebar} aria-label="Your Library">
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>
          <LibraryIcon size={22} /> Your Library
        </h2>
        <button className={styles.createBtn} onClick={onCreate} title="Create playlist">
          <PlusIcon /> <span>Create</span>
        </button>
      </div>

      <div className={styles.chips}>
        <span className={`${styles.chip} ${styles.chipActive}`}>Playlists</span>
      </div>

      <div className={styles.sidebarTools}>
        <div className={`${styles.libSearch} ${searchOpen ? styles.libSearchOpen : ''}`}>
          <button
            className={styles.iconBtn}
            aria-label="Search in Your Library"
            onClick={() => {
              setSearchOpen(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
          >
            <SearchIcon size={18} />
          </button>
          {searchOpen && (
            <>
              <input
                ref={inputRef}
                value={filter}
                onChange={e => setFilter(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && (setFilter(''), setSearchOpen(false))}
                placeholder="Search in Your Library"
                aria-label="Search in Your Library"
              />
              <button className={styles.iconBtn} aria-label="Clear search" onClick={() => { setFilter(''); setSearchOpen(false) }}>
                <CloseIcon size={14} />
              </button>
            </>
          )}
        </div>

        <div className={styles.menuWrap}>
          <button className={styles.sortBtn} onClick={() => setSortMenu(v => !v)} aria-haspopup="menu" aria-expanded={sortMenu}>
            {SORT_LABELS[sort]} <ListIcon />
          </button>
          {sortMenu && (
            <>
              <div className={styles.menuScrim} onClick={() => setSortMenu(false)} />
              <div className={styles.menu} role="menu">
                <div className={styles.menuLabel}>Sort by</div>
                {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
                  <button
                    key={k}
                    role="menuitemradio"
                    aria-checked={sort === k}
                    className={`${styles.menuItem} ${sort === k ? styles.menuItemActive : ''}`}
                    onClick={() => { setSort(k); setSortMenu(false) }}
                  >
                    {SORT_LABELS[k]} {sort === k && <CheckIcon />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ul className={styles.libList}>
        {!loaded &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className={styles.libSkeleton}><span /><span /></li>
          ))}

        {loaded && visible.map(p => {
          const id = String(p.id)
          const isSelected = id === selectedId
          const isPlaying = id === playingId
          return (
            <li key={id}>
              <button
                className={`${styles.libItem} ${isSelected ? styles.libItemActive : ''}`}
                onClick={() => onSelect(id)}
                aria-current={isSelected ? 'page' : undefined}
              >
                <PlaylistCover coverUrl={p.cover_url} artwork={p.artwork} size={56} />
                <span className={styles.libText}>
                  <span className={`${styles.libName} ${isPlaying ? styles.green : ''}`}>{p.title}</span>
                  <span className={styles.libMeta}>
                    Playlist • {username}
                    {p.trackCount > 0 && ` • ${p.trackCount} song${p.trackCount === 1 ? '' : 's'}`}
                  </span>
                </span>
                {isPlaying && <VolumeIcon className={styles.green} />}
              </button>
            </li>
          )
        })}

        {loaded && playlists.length > 0 && visible.length === 0 && (
          <li className={styles.libEmpty}>No playlists match “{filter}”.</li>
        )}
        {loaded && playlists.length === 0 && (
          <li className={styles.libPromo}>
            <b>Create your first playlist</b>
            <span>It&apos;s easy, we&apos;ll help you.</span>
            <button className={styles.pillBtnLight} onClick={onCreate}>Create playlist</button>
          </li>
        )}
      </ul>
    </aside>
  )
}
