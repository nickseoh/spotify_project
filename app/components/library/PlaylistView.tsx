'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PlaylistSummary, PlaylistTrack, Song } from '@/lib/types'
import { formatTotalTime } from '@/lib/format'
import PlaylistCover from './PlaylistCover'
import TrackTable, { type SortState } from './TrackTable'
import SongSearch from './SongSearch'
import type { Player } from './usePlayer'
import {
  CheckIcon, CloseIcon, ListIcon, MoreIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, SearchIcon, ShuffleIcon, TrashIcon,
} from './icons'
import styles from './library.module.css'

const SORT_LABELS: Record<SortState['key'], string> = {
  custom: 'Custom order',
  title: 'Title',
  artist: 'Artist',
  album: 'Album',
  added: 'Date added',
  duration: 'Duration',
}

type Props = {
  playlist: PlaylistSummary
  tracks: PlaylistTrack[]
  loading: boolean
  username: string
  player: Player
  songQuery: string
  onSongQueryChange: (q: string) => void
  addOpenSignal: number
  onPlay: (list: PlaylistTrack[], start: number, shuffle?: boolean) => void
  onAddSong: (song: Song) => void
  onRemoveTrack: (track: PlaylistTrack) => void
  onEditDetails: () => void
  onDelete: () => void
  onBack: () => void
}

function hueFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

export default function PlaylistView(props: Props) {
  const { playlist, tracks, loading, username, player } = props
  const id = String(playlist.id)

  const [sort, setSort] = useState<SortState>({ key: 'custom', dir: 'asc' })
  const [sortMenu, setSortMenu] = useState(false)
  const [moreMenu, setMoreMenu] = useState(false)
  const [filter, setFilter] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const addRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // empty playlists open "Add songs" automatically, and it stays open
  // while the user adds songs (until they close it)
  if (!loading && tracks.length === 0 && !addOpen) setAddOpen(true)
  const showAdd = addOpen

  // open + scroll to "Add songs" when asked from outside (Create, top search).
  // (State is adjusted during render — React's recommended pattern — and
  // the scroll, which touches the DOM, happens in an effect.)
  const [seenSignal, setSeenSignal] = useState(props.addOpenSignal)
  if (props.addOpenSignal !== seenSignal) {
    setSeenSignal(props.addOpenSignal)
    setAddOpen(true)
  }
  const mountSignal = useRef(props.addOpenSignal)
  useEffect(() => {
    if (props.addOpenSignal === mountSignal.current) return
    const t = setTimeout(() => addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    return () => clearTimeout(t)
  }, [props.addOpenSignal])

  const visibleTracks = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = q
      ? tracks.filter(t => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q))
      : [...tracks]
    const dir = sort.dir === 'asc' ? 1 : -1
    const by: Record<SortState['key'], (a: PlaylistTrack, b: PlaylistTrack) => number> = {
      custom: (a, b) => a.position - b.position,
      title: (a, b) => a.title.localeCompare(b.title),
      artist: (a, b) => a.artist.localeCompare(b.artist),
      album: (a, b) => a.album.localeCompare(b.album),
      added: (a, b) => a.added_at.localeCompare(b.added_at),
      duration: (a, b) => a.duration_ms - b.duration_ms,
    }
    return list.sort((a, b) => by[sort.key](a, b) * dir)
  }, [tracks, filter, sort])

  const totalMs = tracks.reduce((sum, t) => sum + t.duration_ms, 0)
  const isThisPlaying = player.isPlaying && player.contextId === id
  const titleSize = playlist.title.length > 28 ? 'small' : playlist.title.length > 14 ? 'medium' : 'large'

  function handlePlayButton() {
    if (player.contextId === id && player.current) player.toggle()
    else props.onPlay(visibleTracks, 0)
  }

  return (
    <div className={styles.playlistScroll} ref={scrollRef} style={{ '--hue': hueFor(id) } as React.CSSProperties}>
      <button className={styles.backBtn} onClick={props.onBack}>‹ Your Library</button>

      {/* ---------- Header ---------- */}
      <header className={styles.plHeader}>
        <button className={styles.plCoverBtn} onClick={props.onEditDetails} aria-label="Edit details">
          <PlaylistCover coverUrl={playlist.cover_url} artwork={playlist.artwork} size={232} />
          <span className={styles.plCoverHover}><PencilIcon size={40} /><span>Choose photo</span></span>
        </button>
        <div className={styles.plInfo}>
          <span className={styles.plType}>{playlist.is_public !== false ? 'Public Playlist' : 'Private Playlist'}</span>
          <button className={styles.plTitle} data-size={titleSize} onClick={props.onEditDetails}>
            {playlist.title}
          </button>
          {playlist.description && <p className={styles.plDesc}>{playlist.description}</p>}
          <p className={styles.plMeta}>
            <span className={styles.ownerDot}>{username[0]?.toUpperCase()}</span>
            <b>{username}</b>
            {tracks.length > 0 && (
              <span className={styles.muted}>
                {' '}• {tracks.length} song{tracks.length === 1 ? '' : 's'}, {formatTotalTime(totalMs)}
              </span>
            )}
          </p>
        </div>
      </header>

      {/* ---------- Action bar ---------- */}
      <div className={styles.plBody}>
        <div className={styles.actionBar}>
          <button
            className={styles.bigPlay}
            onClick={handlePlayButton}
            disabled={!tracks.length}
            aria-label={isThisPlaying ? 'Pause' : 'Play'}
          >
            {isThisPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
          </button>
          <button
            className={`${styles.iconBtnLg} ${player.shuffle && player.contextId === id ? styles.green : ''}`}
            onClick={() => props.onPlay(visibleTracks, 0, true)}
            disabled={!tracks.length}
            aria-label="Shuffle play"
            title="Shuffle play"
          >
            <ShuffleIcon size={30} />
          </button>

          <div className={styles.menuWrap}>
            <button className={styles.iconBtnLg} onClick={() => setMoreMenu(v => !v)} aria-label={`More options for ${playlist.title}`}>
              <MoreIcon size={30} />
            </button>
            {moreMenu && (
              <>
                <div className={styles.menuScrim} onClick={() => setMoreMenu(false)} />
                <div className={styles.menu} role="menu">
                  <button role="menuitem" className={styles.menuItem} onClick={() => { setMoreMenu(false); setAddOpen(true) }}>
                    <PlusIcon /> Add songs
                  </button>
                  <button role="menuitem" className={styles.menuItem} onClick={() => { setMoreMenu(false); props.onEditDetails() }}>
                    <PencilIcon /> Edit details
                  </button>
                  <button role="menuitem" className={styles.menuItem} onClick={() => { setMoreMenu(false); props.onDelete() }}>
                    <TrashIcon /> Delete
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={styles.actionRight}>
            <div className={`${styles.libSearch} ${filterOpen ? styles.libSearchOpen : ''}`}>
              <button className={styles.iconBtn} aria-label="Search in playlist" onClick={() => setFilterOpen(true)}>
                <SearchIcon size={18} />
              </button>
              {filterOpen && (
                <>
                  <input
                    autoFocus
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Search in playlist"
                    aria-label="Search in playlist"
                  />
                  <button className={styles.iconBtn} aria-label="Clear" onClick={() => { setFilter(''); setFilterOpen(false) }}>
                    <CloseIcon size={14} />
                  </button>
                </>
              )}
            </div>
            <div className={styles.menuWrap}>
              <button className={styles.sortBtn} onClick={() => setSortMenu(v => !v)}>
                {SORT_LABELS[sort.key]} <ListIcon />
              </button>
              {sortMenu && (
                <>
                  <div className={styles.menuScrim} onClick={() => setSortMenu(false)} />
                  <div className={`${styles.menu} ${styles.menuRight}`} role="menu">
                    <div className={styles.menuLabel}>Sort by</div>
                    {(Object.keys(SORT_LABELS) as SortState['key'][]).map(k => (
                      <button
                        key={k}
                        className={`${styles.menuItem} ${sort.key === k ? styles.menuItemActive : ''}`}
                        onClick={() => { setSort({ key: k, dir: 'asc' }); setSortMenu(false) }}
                      >
                        {SORT_LABELS[k]} {sort.key === k && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.pillRow}>
          <button className={styles.pillBtn} onClick={() => { setAddOpen(true); setTimeout(() => addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}>
            <PlusIcon /> Add
          </button>
          <button className={styles.pillBtn} onClick={props.onEditDetails}>
            <PencilIcon /> Name &amp; details
          </button>
        </div>

        {/* ---------- Songs ---------- */}
        {loading ? (
          <div className={styles.tableLoading}>Loading songs…</div>
        ) : tracks.length > 0 ? (
          <TrackTable
            tracks={visibleTracks}
            sort={sort}
            onSort={setSort}
            player={player}
            playlistId={id}
            onPlay={index => props.onPlay(visibleTracks, index)}
            onRemove={props.onRemoveTrack}
          />
        ) : null}
        {!loading && tracks.length > 0 && visibleTracks.length === 0 && (
          <p className={styles.muted} style={{ padding: '16px 0' }}>No songs match “{filter}”.</p>
        )}

        {/* ---------- Add songs ---------- */}
        <div ref={addRef}>
          {showAdd ? (
            <SongSearch
              query={props.songQuery}
              onQueryChange={props.onSongQueryChange}
              existingIds={new Set(tracks.map(t => t.track_id))}
              onAdd={props.onAddSong}
              onPreview={song => player.playQueue([song], 0, null)}
              onClose={tracks.length ? () => setAddOpen(false) : undefined}
            />
          ) : (
            <button className={styles.findMore} onClick={() => setAddOpen(true)}>
              Find more
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
