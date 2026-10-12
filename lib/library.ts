// Data access for the playlists library (Supabase).
// Tables and security rules: supabase/migrations/001_playlists_library.sql
import { supabase } from './supabase'
import type { Playlist, PlaylistId, PlaylistSummary, PlaylistTrack, Song } from './types'

// PostgREST codes that mean "the database tables/columns aren't set up yet"
const SETUP_CODES = new Set(['PGRST200', 'PGRST204', 'PGRST205', '42P01', '42703', '42501'])
export const SETUP_MESSAGE =
  'Database setup is incomplete. In Supabase → SQL Editor, run supabase/migrations/001_playlists_library.sql, then reload this page.'

function fail(error: { message: string; code?: string } | null): never {
  if (error?.code && SETUP_CODES.has(error.code)) throw new Error(`${SETUP_MESSAGE} (${error.code}: ${error.message})`)
  throw new Error(error ? `${error.code ? error.code + ': ' : ''}${error.message}` : 'Unknown error')
}

/** Fill in defaults so the UI never sees undefined for optional columns. */
function normalize(row: Partial<Playlist> & { id: PlaylistId; title: string }): Playlist {
  const created = row.created_at ?? new Date().toISOString()
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    title: row.title ?? 'Untitled playlist',
    description: row.description ?? null,
    cover_url: row.cover_url ?? null,
    is_public: row.is_public ?? true,
    created_at: created,
    updated_at: row.updated_at ?? created,
  }
}

/** All playlists for the user, with track counts and up to 4 cover images each. */
export async function fetchLibrary(userId: string): Promise<PlaylistSummary[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_tracks(artwork_url, position)')
    .eq('user_id', userId)
  if (error) {
    // playlist_tracks missing? Still show the playlists, then report the setup problem.
    if (error.code && SETUP_CODES.has(error.code)) {
      const plain = await supabase.from('playlists').select('*').eq('user_id', userId)
      if (plain.error) fail(plain.error)
      const list = (plain.data as Playlist[]).map(p => ({ ...normalize(p), trackCount: 0, artwork: [] }))
      throw Object.assign(new Error(SETUP_MESSAGE), { partial: list })
    }
    fail(error)
  }

  type Row = Playlist & { playlist_tracks: { artwork_url: string | null; position: number }[] | null }
  return (data as Row[])
    .map(({ playlist_tracks, ...p }) => {
      const tracks = [...(playlist_tracks ?? [])].sort((a, b) => a.position - b.position)
      return {
        ...normalize(p),
        trackCount: tracks.length,
        artwork: tracks.map(t => t.artwork_url).filter((u): u is string => !!u).slice(0, 4),
      }
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
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
  return normalize(data as Playlist)
}

export async function updatePlaylist(
  id: PlaylistId,
  changes: Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>,
): Promise<Playlist> {
  const { data, error } = await supabase.from('playlists').update(changes).eq('id', id).select().single()
  if (error) fail(error)
  return normalize(data as Playlist)
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
