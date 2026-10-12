'use client'
import type { PlaylistTrack } from '@/lib/types'
import { formatAddedAt, formatTrackTime } from '@/lib/format'
import { SongArt } from './PlaylistCover'
import type { Player } from './usePlayer'
import { ClockIcon, PauseIcon, PlayIcon, SortArrowIcon, TrashIcon } from './icons'
import styles from './library.module.css'

export type SortState = {
  key: 'custom' | 'title' | 'artist' | 'album' | 'added' | 'duration'
  dir: 'asc' | 'desc'
}

type Props = {
  tracks: PlaylistTrack[]
  sort: SortState
  onSort: (s: SortState) => void
  player: Player
  playlistId: string
  onPlay: (index: number) => void
  onRemove: (track: PlaylistTrack) => void
}

export default function TrackTable({ tracks, sort, onSort, player, playlistId, onPlay, onRemove }: Props) {
  // clicking a header: asc → desc → back to custom order
  function headerClick(key: SortState['key']) {
    if (sort.key !== key) onSort({ key, dir: 'asc' })
    else if (sort.dir === 'asc') onSort({ key, dir: 'desc' })
    else onSort({ key: 'custom', dir: 'asc' })
  }

  const arrow = (key: SortState['key']) =>
    sort.key === key ? <SortArrowIcon up={sort.dir === 'asc'} className={styles.green} /> : null

  return (
    <div className={styles.table} role="table" aria-label="Songs">
      <div className={`${styles.row} ${styles.headRow}`} role="row">
        <span className={styles.colNum} role="columnheader">#</span>
        <button className={styles.colTitle} role="columnheader" onClick={() => headerClick('title')}>Title {arrow('title')}</button>
        <button className={styles.colAlbum} role="columnheader" onClick={() => headerClick('album')}>Album {arrow('album')}</button>
        <button className={styles.colAdded} role="columnheader" onClick={() => headerClick('added')}>Date added {arrow('added')}</button>
        <button className={styles.colTime} role="columnheader" onClick={() => headerClick('duration')} aria-label="Duration">
          {arrow('duration')} <ClockIcon />
        </button>
        <span className={styles.colActions} />
      </div>

      {tracks.map((t, i) => {
        const isCurrent = player.contextId === playlistId && player.current?.trackId === t.track_id
        const playingNow = isCurrent && player.isPlaying
        return (
          <div
            key={t.id}
            role="row"
            className={`${styles.row} ${styles.trackRow} ${isCurrent ? styles.trackRowCurrent : ''}`}
            onDoubleClick={() => onPlay(i)}
          >
            <span className={styles.colNum}>
              <span className={styles.numText}>
                {playingNow ? <span className={styles.eq} aria-label="Playing"><i /><i /><i /></span> : i + 1}
              </span>
              <button
                className={styles.rowPlay}
                aria-label={playingNow ? `Pause ${t.title}` : `Play ${t.title}`}
                onClick={() => (isCurrent ? player.toggle() : onPlay(i))}
              >
                {playingNow ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              </button>
            </span>
            <span className={styles.colTitle}>
              <SongArt src={t.artwork_url} seed={t.track_id} />
              <span className={styles.titleText}>
                <span className={`${styles.trackName} ${isCurrent ? styles.green : ''}`}>{t.title}</span>
                <span className={styles.trackArtist}>
                  {t.explicit && <span className={styles.explicit} title="Explicit">E</span>}
                  {t.artist}
                </span>
              </span>
            </span>
            <span className={styles.colAlbum}>{t.album}</span>
            <span className={styles.colAdded}>{formatAddedAt(t.added_at)}</span>
            <span className={styles.colTime}>{formatTrackTime(t.duration_ms)}</span>
            <span className={styles.colActions}>
              <button className={styles.rowRemove} onClick={() => onRemove(t)} aria-label={`Remove ${t.title} from this playlist`} title="Remove from this playlist">
                <TrashIcon />
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}
