'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Song } from '@/lib/types'

// Minimal music player.
// - Songs with a previewUrl play their real 30s preview audio.
// - Songs without one (built-in catalog) are "played" by a timer so the
//   progress bar, next/prev and queue behave the same way.

export type Player = ReturnType<typeof usePlayer>

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [index, setIndex] = useState(-1)
  const [contextId, setContextId] = useState<string | null>(null) // which playlist is playing
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0) // seconds
  const [duration, setDuration] = useState(0) // seconds
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [loadId, setLoadId] = useState(0) // bumps on every load so replaying the same song restarts it

  const current = index >= 0 ? queue[index] ?? null : null
  const simulated = !!current && !current.previewUrl

  // create the <audio> element once (browser only)
  useEffect(() => {
    const audio = new Audio()
    audio.volume = 0.8
    audioRef.current = audio
    const onTime = () => setPosition(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 30)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audioRef.current = null
    }
  }, [])

  /** Point the player at a song (called from event handlers, not effects). */
  const load = useCallback((song: Song | null) => {
    setLoadId(n => n + 1)
    setPosition(0)
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      if (song?.previewUrl) audio.src = song.previewUrl
      else audio.removeAttribute('src')
    }
    setDuration(song ? (song.previewUrl ? 30 : song.durationMs / 1000) : 0)
  }, [])

  const goTo = useCallback(
    (i: number, list: Song[]) => {
      setIndex(i)
      load(list[i] ?? null)
      setIsPlaying(true)
    },
    [load],
  )

  const next = useCallback(() => {
    if (!queue.length) return
    let n: number
    if (shuffle && queue.length > 1) {
      do n = Math.floor(Math.random() * queue.length)
      while (n === index)
    } else {
      n = index + 1
      if (n >= queue.length) n = repeat ? 0 : -1
    }
    if (n === -1) {
      // reached the end: stop on the last song
      setIsPlaying(false)
      setPosition(0)
      if (audioRef.current) audioRef.current.currentTime = 0
      return
    }
    goTo(n, queue)
  }, [queue, index, shuffle, repeat, goTo])

  const seek = useCallback(
    (sec: number) => {
      setPosition(sec)
      if (audioRef.current && !simulated) audioRef.current.currentTime = sec
    },
    [simulated],
  )

  const prev = useCallback(() => {
    if (position > 3 || index <= 0) seek(0)
    else goTo(index - 1, queue)
  }, [position, index, queue, seek, goTo])

  // keep the latest values reachable from long-lived listeners/timers
  const nextRef = useRef(next)
  const positionRef = useRef(position)
  const durationRef = useRef(duration)
  useEffect(() => {
    nextRef.current = next
    positionRef.current = position
    durationRef.current = duration
  })

  // play / pause the real audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current || simulated) return
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [isPlaying, current, simulated, loadId])

  // go to the next song when a preview ends
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => nextRef.current()
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  // timer for songs without preview audio
  useEffect(() => {
    if (!simulated || !isPlaying) return
    const id = setInterval(() => {
      const p = positionRef.current + 0.25
      if (durationRef.current > 0 && p >= durationRef.current) nextRef.current()
      else setPosition(p)
    }, 250)
    return () => clearInterval(id)
  }, [simulated, isPlaying])

  /** Start playing a list of songs from a given index. */
  const playQueue = useCallback(
    (songs: Song[], startIndex: number, ctx: string | null) => {
      if (!songs.length) return
      setQueue(songs)
      setContextId(ctx)
      goTo(startIndex, songs)
    },
    [goTo],
  )

  const toggle = useCallback(() => {
    if (current) setIsPlaying(p => !p)
  }, [current])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  return {
    queue, index, current, contextId, isPlaying, position, duration, shuffle, repeat, volume, simulated,
    playQueue, toggle, next, prev, seek, setVolume,
    setShuffle, setRepeat, setIsPlaying,
  }
}
