/** 83000 -> "1:23" */
export function formatTrackTime(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Total playlist length, Spotify style: "2 hr 5 min", "34 min 10 sec". */
export function formatTotalTime(ms: number) {
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return m > 0 ? `${h} hr ${m} min` : `${h} hr`
  if (m > 0) return s > 0 ? `${m} min ${s} sec` : `${m} min`
  return `${s} sec`
}

/** "3 days ago", "Oct 2, 2026" */
export function formatAddedAt(iso: string) {
  const date = new Date(iso)
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 28) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Deterministic gradient for anything without artwork. */
export function placeholderGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 60% 18%))`
}
