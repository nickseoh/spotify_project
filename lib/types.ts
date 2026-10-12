// Shared types for the playlists library.

/** A song as returned by /api/search (not yet saved anywhere). */
export type Song = {
  trackId: string
  title: string
  artist: string
  album: string
  artworkUrl: string | null
  previewUrl: string | null
  durationMs: number
  explicit: boolean
}

/** playlists.id can be uuid (string) or bigint (number) depending on your table. */
export type PlaylistId = string | number

/** A row in public.playlists */
export type Playlist = {
  id: PlaylistId
  user_id: string | null
  title: string
  description: string | null
  cover_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

/** A row in public.playlist_tracks */
export type PlaylistTrack = {
  id: string
  playlist_id: PlaylistId
  track_id: string
  title: string
  artist: string
  album: string
  artwork_url: string | null
  preview_url: string | null
  duration_ms: number
  explicit: boolean
  position: number
  added_at: string
}

/** Library sidebar entry: a playlist plus a little summary of its songs. */
export type PlaylistSummary = Playlist & {
  trackCount: number
  artwork: string[] // up to 4 artwork urls, used for the mosaic cover
}
