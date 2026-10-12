'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'

// Put real album-cover URLs here (e.g. from your music API or /public).
// Leave it empty to use green gradient placeholder tiles.
const COVER_URLS: string[] = []

const TILE_COUNT = 80 // tiles per copy of the grid (10 columns x 8 rows)
const PLACEHOLDER_COLORS = [
  ['#1db954', '#0b3d20'], ['#1ed760', '#121212'], ['#0f5f30', '#1db954'],
  ['#2a2a2a', '#1db954'], ['#0b3d20', '#000'], ['#1db954', '#0d7a3a'],
  ['#3a3a3a', '#121212'], ['#147a3c', '#1ed760'],
]

// Deterministic "random" so the server and browser render the same tiles
// (Math.random() here would cause a hydration mismatch).
function pseudoRandom(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const TILES = Array.from({ length: TILE_COUNT }, (_, i) => {
  if (COVER_URLS.length) return `url("${COVER_URLS[i % COVER_URLS.length]}")`
  const [a, b] = PLACEHOLDER_COLORS[Math.floor(pseudoRandom(i) * PLACEHOLDER_COLORS.length)]
  return `linear-gradient(${Math.floor(pseudoRandom(i + 1000) * 360)}deg, ${a}, ${b})`
})

function MosaicGrid() {
  return (
    <div className={styles.mosaicGrid}>
      {TILES.map((bg, i) => (
        <div key={i} className={styles.tile} style={{ backgroundImage: bg }} />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(true)
  const [loading, setLoading] = useState(false)

  function showMessage(text: string, error = true) {
    setIsError(error)
    setMessage(text)
  }

  async function handleLogIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return showMessage(error.message)
    router.push('/')
  }

  async function handleSignUp() {
    if (password.length < 6) return showMessage('Password must be at least 6 characters.')
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return showMessage(error.message)
    if (data.session) router.push('/')
    else showMessage('Check your email to confirm your account, then log in.', false)
  }

  return (
    <div className={styles.page}>
      {/* Animated blurred mosaic backdrop */}
      <div className={styles.mosaicBg} aria-hidden="true">
        <div className={styles.mosaicTilt}>
          <div className={styles.mosaicTrack}>
            <MosaicGrid />
            <MosaicGrid /> {/* second copy makes the scroll loop seamlessly */}
          </div>
        </div>
      </div>
      <div className={styles.vignette} />

      <div className={styles.stage}>
        <main className={styles.card}>
          <div className={styles.logo} aria-hidden="true">
            {/* Placeholder mark: swap in your own logo */}
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="22" fill="#1db954" />
              <path d="M17 30V15l12-3v15" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14.5" cy="30" r="3.5" fill="#000" />
              <circle cx="26.5" cy="27" r="3.5" fill="#000" />
            </svg>
          </div>
          <h1 className={styles.title}>Log in to continue</h1>

          <form onSubmit={handleLogIn}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email" type="email" placeholder="you@example.com" required autoComplete="email"
                className={styles.input}
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password" type="password" placeholder="Password (6+ characters)" required autoComplete="current-password"
                className={styles.input}
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Please wait…' : 'Log in'}
            </button>
          </form>

          {message && (
            <p className={styles.message} style={isError ? undefined : { color: '#1ed760' }}>
              {message}
            </p>
          )}

          <p className={styles.foot}>
            Don&apos;t have an account?{' '}
            <button type="button" className={styles.linkBtn} onClick={handleSignUp} disabled={loading}>
              Sign up
            </button>
          </p>
        </main>
      </div>
    </div>
  )
}