'use client'
import { formatTrackTime } from '@/lib/format'
import { SongArt } from './PlaylistCover'
import type { Player } from './usePlayer'
import { NextIcon, PanelIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, ShuffleIcon, VolumeIcon } from './icons'
import styles from './library.module.css'

type Props = { player: Player; nowPlayingOpen: boolean; onToggleNowPlaying: () => void }

export default function PlayerBar({ player, nowPlayingOpen, onToggleNowPlaying }: Props) {
  const song = player.current
  const pct = player.duration ? Math.min(100, (player.position / player.duration) * 100) : 0

  return (
    <footer className={styles.player}>
      <div className={styles.playerLeft}>
        {song && (
          <>
            <SongArt src={song.artworkUrl} seed={song.trackId} size={56} />
            <span className={styles.titleText}>
              <span className={styles.trackName}>{song.title}</span>
              <span className={styles.trackArtist}>
                {song.artist}
                {player.simulated && <span className={styles.noPreview}> · no preview audio</span>}
                {!player.simulated && <span className={styles.noPreview}> · 30s preview</span>}
              </span>
            </span>
          </>
        )}
      </div>

      <div className={styles.playerCenter}>
        <div className={styles.controls}>
          <button
            className={`${styles.iconBtn} ${player.shuffle ? styles.greenDot : ''}`}
            onClick={() => player.setShuffle(!player.shuffle)}
            aria-label="Shuffle" aria-pressed={player.shuffle}
          >
            <ShuffleIcon size={18} />
          </button>
          <button className={styles.iconBtn} onClick={player.prev} disabled={!song} aria-label="Previous"><PrevIcon /></button>
          <button className={styles.playBtn} onClick={player.toggle} disabled={!song} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
            {player.isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          <button className={styles.iconBtn} onClick={player.next} disabled={!song} aria-label="Next"><NextIcon /></button>
          <button
            className={`${styles.iconBtn} ${player.repeat ? styles.greenDot : ''}`}
            onClick={() => player.setRepeat(!player.repeat)}
            aria-label="Repeat" aria-pressed={player.repeat}
          >
            <RepeatIcon size={18} />
          </button>
        </div>
        <div className={styles.progress}>
          <span>{formatTrackTime(player.position * 1000)}</span>
          <input
            type="range" min={0} max={player.duration || 1} step={0.5}
            value={Math.min(player.position, player.duration || 0)}
            onChange={e => player.seek(Number(e.target.value))}
            disabled={!song}
            aria-label="Seek"
            style={{ '--pct': `${pct}%` } as React.CSSProperties}
          />
          <span>{formatTrackTime(player.duration * 1000)}</span>
        </div>
      </div>

      <div className={styles.playerRight}>
        <button
          className={`${styles.iconBtn} ${nowPlayingOpen && song ? styles.greenDot : ''}`}
          onClick={onToggleNowPlaying}
          aria-label="Now playing view" aria-pressed={nowPlayingOpen}
        >
          <PanelIcon />
        </button>
        <VolumeIcon />
        <input
          type="range" min={0} max={1} step={0.01}
          value={player.volume}
          onChange={e => player.setVolume(Number(e.target.value))}
          aria-label="Volume"
          className={styles.volume}
          style={{ '--pct': `${player.volume * 100}%` } as React.CSSProperties}
        />
      </div>
    </footer>
  )
}
