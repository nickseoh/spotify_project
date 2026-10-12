'use client'
import { useEffect, useState } from 'react'
import type { Song } from '@/lib/types'
import { formatTrackTime } from '@/lib/format'
import { SongArt } from './PlaylistCover'
import { CheckIcon, CloseIcon, PlayIcon, SearchIcon } from './icons'
import styles from './library.module.css'

type Props = {
  query: string
  onQueryChange: (q: string) => void
  existingIds: Set<string>
  onAdd: (song: Song) => Promise<void> | void
  onPreview: (song: Song) => void
  onClose?: () => void
}

/** "Let's find something for your playlist" — search songs and add them. */
export default function SongSearch({ query, onQueryChange, existingIds, onAdd, onPreview, onClose }: Props) {
  const [results, setResults] = useState<Song[]>([])
  const [source, setSource] = useState<'itunes' | 'local' | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  // debounced search
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setFailed(false)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { source: 'itunes' | 'local'; results: Song[] }
        setResults(data.results)
        setSource(data.source)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  async function add(song: Song) {
    setAdding(song.trackId)
    try {
      await onAdd(song)
    } finally {
      setAdding(null)
    }
  }

  return (
    <section className={styles.addSection} aria-label="Add songs">
      <div className={styles.addHead}>
        <div>
          <h3>Let&apos;s find something for your playlist</h3>
          <label className={styles.addSearch}>
            <SearchIcon size={18} />
            <input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Search for songs"
              aria-label="Search for songs"
            />
            {query && (
              <button className={styles.iconBtn} onClick={() => onQueryChange('')} aria-label="Clear">
                <CloseIcon size={14} />
              </button>
            )}
          </label>
        </div>
        {onClose && (
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close add songs">
            <CloseIcon />
          </button>
        )}
      </div>

      {!query.trim() && results.length > 0 && <p className={styles.addHint}>Suggested</p>}
      {failed && <p className={styles.addHint}>Couldn&apos;t search right now. Try again in a moment.</p>}
      {!loading && !failed && query.trim() && results.length === 0 && (
        <p className={styles.addHint}>No results found for “{query}”.</p>
      )}

      <ul className={`${styles.resultList} ${loading ? styles.dim : ''}`}>
        {results.map(song => {
          const added = existingIds.has(song.trackId)
          return (
            <li key={song.trackId} className={styles.resultRow}>
              <button className={styles.resultArt} onClick={() => onPreview(song)} aria-label={`Play ${song.title}`}>
                <SongArt src={song.artworkUrl} seed={song.trackId} />
                <span className={styles.resultArtPlay}><PlayIcon size={16} /></span>
              </button>
              <span className={styles.titleText}>
                <span className={styles.trackName}>{song.title}</span>
                <span className={styles.trackArtist}>
                  {song.explicit && <span className={styles.explicit}>E</span>}
                  {song.artist}
                </span>
              </span>
              <span className={styles.resultAlbum}>{song.album}</span>
              <span className={styles.resultTime}>{formatTrackTime(song.durationMs)}</span>
              <button
                className={added ? styles.addedBtn : styles.addBtn}
                disabled={added || adding === song.trackId}
                onClick={() => add(song)}
              >
                {added ? <><CheckIcon /> Added</> : adding === song.trackId ? 'Adding…' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>

      {source === 'local' && query.trim() && (
        <p className={styles.addFoot}>Showing results from the built-in sample catalog (online search unavailable).</p>
      )}
    </section>
  )
}
