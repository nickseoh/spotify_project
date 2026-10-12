// Data access for the playlists library (Supabase).
// Tables and security rules: supabase/migrations/001_playlists_library.sql
import { supabase } from './supabase'
import type { Playlist, PlaylistId, PlaylistSummary, PlaylistTrack, Song } from './types'

function fail(error: { message: string; code?: string } | null): never {
  throw new Error(error ? `${error.code ? error.code + ': ' : ''}${error.message}` : 'Unknown error')
}

/** All playlists for the user, with track counts and up to 4 cover images each. */
export async function fetchLibrary(userId: string): Promise<PlaylistSummary[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(artwork_url, position)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) fail(error)

  type Row = Playlist & { playlist_tracks: { artwork_url: string | null; position: number }[] | null }
  return (data as Row[]).map(({ playlist_tracks, ...p }) => {
    const tracks = [...(playlist_tracks ?? [])].sort((a, b) => a.position - b.position)
    return {
      ...p,
      trackCount: tracks.length,
      artwork: tracks.map(t => t.artwork_url).filter((u): u is string => !!u).slice(0, 4),
    }
  })
}

export async function fetchTracks(playlistId: PlaylistId): Promise<PlaylistTrack[]> {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })
    .order('added_at', { ascending: true })
  if (error) fail(error)
  return data as PlaylistTrack[]
}

/** Creates "My Playlist #N" like Spotify does, then the user can rename it. */
export async function createPlaylist(userId: string, existingTitles: string[]): Promise<Playlist> {
  let n = existingTitles.length + 1
  while (existingTitles.includes(`My Playlist #${n}`)) n++

  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, title: `My Playlist #${n}` })
    .select()
    .single()
  if (error) fail(error)
  return data as Playlist
}

export async function updatePlaylist(
  id: PlaylistId,
  changes: Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>,
): Promise<Playlist> {
  const { data, error } = await supabase.from('playlists').update(changes).eq('id', id).select().single()
  if (error) fail(error)
  return data as Playlist
}

export async function deletePlaylist(id: PlaylistId) {
  const { error } = await supabase.from('playlists').delete().eq('id', id)
  if (error) fail(error)
}

export async function addSong(playlistId: PlaylistId, song: Song, position: number): Promise<PlaylistTrack> {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert({
      playlist_id: playlistId,
      track_id: song.trackId,
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork_url: song.artworkUrl,
      preview_url: song.previewUrl,
      duration_ms: song.durationMs,
      explicit: song.explicit,
      position,
    })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('That song is already in this playlist.')
    fail(error)
  }
  return data as PlaylistTrack
}

export async function removeTrack(trackRowId: string) {
  const { error } = await supabase.from('playlist_tracks').delete().eq('id', trackRowId)
  if (error) fail(error)
}

/** Converts a saved track back into a Song (for the player). */
export function trackToSong(t: PlaylistTrack): Song {
  return {
    trackId: t.track_id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    artworkUrl: t.artwork_url,
    previewUrl: t.preview_url,
    durationMs: t.duration_ms,
    explicit: t.explicit,
  }
}
