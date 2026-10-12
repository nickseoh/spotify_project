import type { NextRequest } from 'next/server'
import { searchCatalog } from '@/lib/catalog'
import type { Song } from '@/lib/types'

// GET /api/search?q=weeknd
// Searches songs with the public iTunes Search API (no key needed; gives real
// artwork and 30-second previews). Falls back to the built-in catalog in
// lib/catalog.ts if the request fails, so the UI keeps working offline.

type ItunesTrack = {
  trackId: number
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string
  trackTimeMillis?: number
  trackExplicitness?: string
  kind?: string
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)

  if (!q) {
    return Response.json({ source: 'local', results: searchCatalog('', 12) })
  }

  try {
    const url = new URL('https://itunes.apple.com/search')
    url.searchParams.set('term', q)
    url.searchParams.set('media', 'music')
    url.searchParams.set('entity', 'song')
    url.searchParams.set('limit', '25')

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) throw new Error(`iTunes responded ${res.status}`)
    const data = (await res.json()) as { results?: ItunesTrack[] }

    const results: Song[] = (data.results ?? [])
      .filter(t => t.kind === 'song' && t.trackName)
      .map(t => ({
        trackId: `itunes-${t.trackId}`,
        title: t.trackName!,
        artist: t.artistName ?? '',
        album: t.collectionName ?? '',
        // ask for a bigger image than the 100px default
        artworkUrl: t.artworkUrl100?.replace('100x100bb', '300x300bb') ?? null,
        previewUrl: t.previewUrl ?? null,
        durationMs: t.trackTimeMillis ?? 0,
        explicit: t.trackExplicitness === 'explicit',
      }))

    return Response.json({ source: 'itunes', results })
  } catch (err) {
    console.warn('[api/search] falling back to local catalog:', (err as Error).message)
    return Response.json({ source: 'local', results: searchCatalog(q) })
  }
}
