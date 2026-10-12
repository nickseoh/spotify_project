/* eslint-disable @next/next/no-img-element -- covers come from arbitrary URLs */
import { placeholderGradient } from '@/lib/format'
import { MusicNoteIcon } from './icons'
import styles from './library.module.css'

type Props = {
  coverUrl?: string | null
  artwork?: string[]
  size: number
  radius?: number
  className?: string
}

/**
 * Playlist artwork, Spotify style:
 * custom cover → 2x2 mosaic of the first 4 songs → first song's art → music-note placeholder.
 */
export default function PlaylistCover({ coverUrl, artwork = [], size, radius = 4, className }: Props) {
  const box = { width: size, height: size, borderRadius: radius }
  const cls = `${styles.cover} ${className ?? ''}`

  if (coverUrl) return <img src={coverUrl} alt="" className={cls} style={box} />

  if (artwork.length >= 4) {
    return (
      <div className={`${cls} ${styles.coverMosaic}`} style={box}>
        {artwork.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" />)}
      </div>
    )
  }

  if (artwork.length > 0) return <img src={artwork[0]} alt="" className={cls} style={box} />

  return (
    <div className={`${cls} ${styles.coverEmpty}`} style={box}>
      <MusicNoteIcon size={Math.round(size * 0.42)} />
    </div>
  )
}

/** Small square artwork for a single song. */
export function SongArt({ src, seed, size = 40 }: { src: string | null; seed: string; size?: number }) {
  if (src) return <img src={src} alt="" className={styles.songArt} style={{ width: size, height: size }} />
  return (
    <div className={styles.songArt} style={{ width: size, height: size, background: placeholderGradient(seed) }}>
      <MusicNoteIcon size={Math.round(size * 0.45)} />
    </div>
  )
}
