'use client'
import { SongArt } from './PlaylistCover'
import type { Player } from './usePlayer'
import { CloseIcon } from './icons'
import styles from './library.module.css'

type Props = { player: Player; contextTitle: string; onClose: () => void }

/** Right-hand "now playing" panel with the up-next queue. */
export default function NowPlayingPanel({ player, contextTitle, onClose }: Props) {
  const song = player.current
  if (!song) return null
  const upNext = player.queue.slice(player.index + 1, player.index + 6)

  return (
    <aside className={styles.nowPlaying} aria-label="Now playing">
      <div className={styles.npHead}>
        <b>{contextTitle || 'Now playing'}</b>
        <button className={styles.iconBtn} onClick={onClose} aria-label="Close now playing"><CloseIcon size={18} /></button>
      </div>
      <div className={styles.npArt}>
        <SongArt src={song.artworkUrl} seed={song.trackId} size={280} />
      </div>
      <div className={styles.npTitle}>
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
      </div>

      {upNext.length > 0 && (
        <div className={styles.npCard}>
          <b>Next in queue</b>
          <ul>
            {upNext.map((s, i) => (
              <li key={`${s.trackId}-${i}`}>
                <SongArt src={s.artworkUrl} seed={s.trackId} size={40} />
                <span className={styles.titleText}>
                  <span className={styles.trackName}>{s.title}</span>
                  <span className={styles.trackArtist}>{s.artist}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
