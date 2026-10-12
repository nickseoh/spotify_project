'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  addSong, createPlaylist, deletePlaylist, fetchLibrary, fetchTracks, removeTrack, trackToSong, updatePlaylist,
} from '@/lib/library'
import type { Playlist, PlaylistId, PlaylistSummary, PlaylistTrack, Song } from '@/lib/types'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import PlaylistView from './PlaylistView'
import PlayerBar from './PlayerBar'
import NowPlayingPanel from './NowPlayingPanel'
import DetailsModal from './DetailsModal'
import ConfirmDialog from './ConfirmDialog'
import { usePlayer } from './usePlayer'
import { PlusIcon, MusicNoteIcon } from './icons'
import styles from './library.module.css'

const LAST_PLAYLIST_KEY = 'library:lastPlaylist'
const readLast = () => { try { return localStorage.getItem(LAST_PLAYLIST_KEY) } catch { return null } }
const saveLast = (id: string) => { try { localStorage.setItem(LAST_PLAYLIST_KEY, id) } catch {} }

/**
 * The page users land on after logging in: their playlists library.
 * Owns all library state and passes it down to the panels.
 */
export default function LibraryApp() {
  const router = useRouter()
  const player = usePlayer()

  const [user, setUser] = useState<User | null>(null)
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([])
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // songs of the open playlist, tagged with the playlist they belong to
  const [loadedTracks, setLoadedTracks] = useState<{ id: string; rows: PlaylistTrack[] } | null>(null)

  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showNowPlaying, setShowNowPlaying] = useState(true)
  const [mobileView, setMobileView] = useState<'library' | 'playlist'>('library')
  const [songQuery, setSongQuery] = useState('') // shared by the top search bar and "Add songs"
  const [addOpenSignal, setAddOpenSignal] = useState(0)

  const selected = useMemo(
    () => playlists.find(p => String(p.id) === selectedId) ?? null,
    [playlists, selectedId],
  )
  const tracksReady = !!selectedId && loadedTracks?.id === selectedId
  const tracks = useMemo(() => (tracksReady ? loadedTracks!.rows : []), [tracksReady, loadedTracks])
  const setTracks = (rows: PlaylistTrack[]) => selectedId && setLoadedTracks({ id: selectedId, rows })
  const username = user?.email?.split('@')[0] ?? ''

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(t => (t === msg ? '' : t)), 2600)
  }, [])

  const report = useCallback((err: unknown) => {
    setError(err instanceof Error ? err.message : String(err))
  }, [])

  // --- auth + initial library load ------------------------------------
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      try {
        const lib = await fetchLibrary(data.user.id)
        setPlaylists(lib)
        const last = readLast()
        const start = lib.find(p => String(p.id) === last) ?? lib[0]
        if (start) setSelectedId(String(start.id))
      } catch (err) {
        const partial = (err as { partial?: PlaylistSummary[] }).partial
        if (partial) {
          setPlaylists(partial)
          const last = readLast()
          const start = partial.find(p => String(p.id) === last) ?? partial[0]
          if (start) setSelectedId(String(start.id))
        }
        report(err)
      } finally {
        setLibraryLoaded(true)
      }
    })
  }, [router, report])

  // --- load songs for the selected playlist ---------------------------
  useEffect(() => {
    if (!selected) return
    const id = String(selected.id)
    let cancelled = false
    fetchTracks(selected.id)
      .then(rows => { if (!cancelled) setLoadedTracks({ id, rows }) })
      .catch(err => {
        if (cancelled) return
        setLoadedTracks({ id, rows: [] }) // stop showing "Loading songs…"
        report(err)
      })
    return () => { cancelled = true }
    // only refetch when the playlist itself changes, not its summary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, report])

  // keep the sidebar summary (count + mosaic) in sync with the open playlist
  const syncSummary = useCallback((id: PlaylistId, rows: PlaylistTrack[]) => {
    setPlaylists(list => {
      const updated = list.map(p =>
        String(p.id) === String(id)
          ? {
              ...p,
              trackCount: rows.length,
              artwork: rows.map(t => t.artwork_url).filter((u): u is string => !!u).slice(0, 4),
              updated_at: new Date().toISOString(),
            }
          : p,
      )
      return updated
    })
  }, [])

  // --- actions ---------------------------------------------------------
  function selectPlaylist(id: string) {
    setSelectedId(id)
    saveLast(id)
    setMobileView('playlist')
  }

  async function handleCreate() {
    if (!user) return
    try {
      const created = await createPlaylist(user.id, playlists.map(p => p.title))
      setPlaylists(list => [{ ...created, trackCount: 0, artwork: [] }, ...list])
      selectPlaylist(String(created.id))
      setAddOpenSignal(s => s + 1) // open "Add songs" right away
      flash(`Created “${created.title}”`)
    } catch (err) {
      report(err)
    }
  }

  async function handleSaveDetails(changes: Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>) {
    if (!selected) return
    try {
      const saved = await updatePlaylist(selected.id, changes)
      setPlaylists(list => list.map(p => (String(p.id) === String(saved.id) ? { ...p, ...saved } : p)))
      setDetailsOpen(false)
      flash('Playlist details saved')
    } catch (err) {
      report(err)
    }
  }

  async function handleDelete() {
    if (!selected) return
    const id = selected.id
    try {
      await deletePlaylist(id)
      const rest = playlists.filter(p => String(p.id) !== String(id))
      setPlaylists(rest)
      setSelectedId(rest[0] ? String(rest[0].id) : null)
      setConfirmDelete(false)
      setMobileView('library')
      flash(`Removed “${selected.title}” from Your Library`)
    } catch (err) {
      report(err)
    }
  }

  async function handleAddSong(song: Song) {
    if (!selected) return
    if (tracks.some(t => t.track_id === song.trackId)) {
      flash('Already in this playlist')
      return
    }
    try {
      const position = tracks.reduce((max, t) => Math.max(max, t.position), -1) + 1
      const row = await addSong(selected.id, song, position)
      const rows = [...tracks, row]
      setTracks(rows)
      syncSummary(selected.id, rows)
      flash(`Added to ${selected.title}`)
    } catch (err) {
      report(err)
    }
  }

  async function handleRemoveTrack(track: PlaylistTrack) {
    if (!selected) return
    const before = tracks
    const rows = tracks.filter(t => t.id !== track.id)
    setTracks(rows) // optimistic
    syncSummary(selected.id, rows)
    try {
      await removeTrack(track.id)
      flash(`Removed “${track.title}”`)
    } catch (err) {
      setTracks(before)
      syncSummary(selected.id, before)
      report(err)
    }
  }

  function playTracks(list: PlaylistTrack[], start: number, shuffle = false) {
    if (!selected || !list.length) return
    player.setShuffle(shuffle)
    const startAt = shuffle ? Math.floor(Math.random() * list.length) : start
    player.playQueue(list.map(trackToSong), startAt, String(selected.id))
  }

  async function handleLogOut() {
    player.setIsPlaying(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  // --- render ------------------------------------------------------------
  if (!user) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingScreen}>Loading your library…</div>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <TopBar
        email={user.email ?? ''}
        query={songQuery}
        onQueryChange={q => {
          setSongQuery(q)
          if (selected) {
            setAddOpenSignal(s => s + 1)
            setMobileView('playlist')
          }
        }}
        onHome={() => setMobileView('library')}
        onLogOut={handleLogOut}
        searchDisabled={!selected}
      />

      <div
        className={styles.main}
        data-view={mobileView}
        data-now-playing={showNowPlaying && player.current ? 'on' : 'off'}
      >
        <Sidebar
          playlists={playlists}
          selectedId={selectedId}
          playingId={player.isPlaying ? player.contextId : null}
          username={username}
          loaded={libraryLoaded}
          onSelect={selectPlaylist}
          onCreate={handleCreate}
        />

        <section className={styles.content}>
          {selected ? (
            <PlaylistView
              key={String(selected.id)}
              playlist={selected}
              tracks={tracks}
              loading={!tracksReady}
              username={username}
              player={player}
              songQuery={songQuery}
              onSongQueryChange={setSongQuery}
              addOpenSignal={addOpenSignal}
              onPlay={playTracks}
              onAddSong={handleAddSong}
              onRemoveTrack={handleRemoveTrack}
              onEditDetails={() => setDetailsOpen(true)}
              onDelete={() => setConfirmDelete(true)}
              onBack={() => setMobileView('library')}
            />
          ) : (
            libraryLoaded && (
              <div className={styles.emptyLibrary}>
                <MusicNoteIcon size={64} />
                <h2>Create your first playlist</h2>
                <p>It&apos;s easy, we&apos;ll help you.</p>
                <button className={styles.pillBtnLight} onClick={handleCreate}>
                  <PlusIcon /> Create playlist
                </button>
              </div>
            )
          )}
        </section>

        {showNowPlaying && player.current && (
          <NowPlayingPanel player={player} contextTitle={playlists.find(p => String(p.id) === player.contextId)?.title ?? ''} onClose={() => setShowNowPlaying(false)} />
        )}
      </div>

      <PlayerBar player={player} nowPlayingOpen={showNowPlaying} onToggleNowPlaying={() => setShowNowPlaying(v => !v)} />

      {detailsOpen && selected && (
        <DetailsModal playlist={selected} onClose={() => setDetailsOpen(false)} onSave={handleSaveDetails} />
      )}
      {confirmDelete && selected && (
        <ConfirmDialog
          title="Delete from Your Library?"
          body={<>This will delete <b>{selected.title}</b> from <b>Your Library</b>.</>}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </div>
  )
}
