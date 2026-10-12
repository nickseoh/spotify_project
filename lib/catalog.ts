import type { Song } from './types'

// Small built-in catalog. /api/search uses it when the online music search
// can't be reached (offline, blocked network, rate limit) so adding songs
// always works during development. Durations are approximate and there is
// no artwork/preview audio for these entries.
const RAW: [title: string, artist: string, album: string, seconds: number, explicit?: boolean][] = [
  ['SMD', 'iamjakehill', 'bad times friend', 48, true],
  ['Gojo Satoru Limitless - PHONK', 'Bakrou, PHONK NOW', 'Gojo Satoru Limitless', 74],
  ['Zaraki Kenpachi Bankai - PHONK', 'Bakrou, PHONK NOW', 'Zaraki Kenpachi Bankai', 82],
  ['Tanjiro Sun Halo Dragon', 'Bakrou, PHONK NOW', 'Tanjiro Sun Halo Dragon', 85],
  ['ESPADA FUNK - SPED UP', 'NUEKI, TOLCHONOV', 'ESPADA FUNK', 86, true],
  ['VILLAIN (Anime Aspect)', 'scraizis', 'VILLAIN (Anime Aspect)', 86],
  ['Toji Fushiguro - PHONK', 'Bakrou, ICEYYX, PHONK NOW', 'Toji Fushiguro', 89],
  ['Comedown - Sped Up', 'Toby Hobart', 'Comedown', 132],
  ['Comedown', 'Toby Hobart', 'Comedown', 176],
  ['Blinding Lights', 'The Weeknd', 'After Hours', 200],
  ['Save Your Tears', 'The Weeknd', 'After Hours', 215],
  ['Starboy', 'The Weeknd, Daft Punk', 'Starboy', 230, true],
  ['Redbone', 'Childish Gambino', 'Awaken, My Love!', 327],
  ['Nights', 'Frank Ocean', 'Blonde', 307, true],
  ['Pink + White', 'Frank Ocean', 'Blonde', 184],
  ['Sunflower', 'Post Malone, Swae Lee', 'Spider-Man: Into the Spider-Verse', 158],
  ['Circles', 'Post Malone', "Hollywood's Bleeding", 215],
  ['Lose Yourself', 'Eminem', '8 Mile', 326, true],
  ['Till I Collapse', 'Eminem, Nate Dogg', 'The Eminem Show', 297, true],
  ['Stronger', 'Kanye West', 'Graduation', 312, true],
  ['Power', 'Kanye West', 'My Beautiful Dark Twisted Fantasy', 292, true],
  ['HUMBLE.', 'Kendrick Lamar', 'DAMN.', 177, true],
  ['Money Trees', 'Kendrick Lamar, Jay Rock', 'good kid, m.A.A.d city', 386, true],
  ['Kill Bill', 'SZA', 'SOS', 154],
  ['Snooze', 'SZA', 'SOS', 202],
  ['Die For You', 'The Weeknd', 'Starboy', 260],
  ['Heat Waves', 'Glass Animals', 'Dreamland', 239],
  ['Electric Feel', 'MGMT', 'Oracular Spectacular', 229],
  ['Sweater Weather', 'The Neighbourhood', 'I Love You.', 240],
  ['Do I Wanna Know?', 'Arctic Monkeys', 'AM', 272],
  ['505', 'Arctic Monkeys', 'Favourite Worst Nightmare', 253],
  ['Riptide', 'Vance Joy', 'Dream Your Life Away', 204],
  ['Eye of the Tiger', 'Survivor', 'Eye of the Tiger', 245],
  ['Unravel', 'TK from Ling tosite sigure', 'Unravel', 239],
  ['Gurenge', 'LiSA', 'LEO-NiNE', 239],
  ['Blue Bird', 'Ikimonogakari', 'Blue Bird', 220],
  ['Kick Back', 'Kenshi Yonezu', 'Kick Back', 193],
  ['Specialz', 'King Gnu', 'Specialz', 237],
  ['Idol', 'YOASOBI', 'Idol', 213],
  ['Murder In My Mind', 'Kordhell', 'Murder In My Mind', 143],
  ['Close Eyes', 'DVRST', 'Close Eyes', 132],
  ['METAMORPHOSIS', 'INTERWORLD', 'METAMORPHOSIS', 143],
  ['RAPTURE', 'INTERWORLD', 'RAPTURE', 154],
  ['Sahara', 'Hensonn', 'Sahara', 182],
  ['Override', 'KSLV Noh', 'Override', 133],
  ['Neon Blade', 'MoonDeity', 'Neon Blade', 109],
  ['Lofi Study', 'Chill Beats Collective', 'Late Night Study', 150],
  ['Rainy Window', 'Chill Beats Collective', 'Late Night Study', 168],
]

export const CATALOG: Song[] = RAW.map(([title, artist, album, seconds, explicit], i) => ({
  trackId: `local-${i + 1}`,
  title,
  artist,
  album,
  artworkUrl: null,
  previewUrl: null,
  durationMs: seconds * 1000,
  explicit: !!explicit,
}))

export function searchCatalog(query: string, limit = 25): Song[] {
  const q = query.trim().toLowerCase()
  if (!q) return CATALOG.slice(0, limit)
  const words = q.split(/\s+/)
  return CATALOG.filter(song => {
    const hay = `${song.title} ${song.artist} ${song.album}`.toLowerCase()
    return words.every(w => hay.includes(w))
  }).slice(0, limit)
}
