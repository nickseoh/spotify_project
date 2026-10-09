'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMessage(error.message)
    router.push('/')
  }

  async function handleSignUp() {
    if (password.length < 6) return setMessage('Password must be at least 6 characters.')
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return setMessage(error.message)
    if (data.session) router.push('/')
    else setMessage('Check your email to confirm your account, then log in.')
  }

  return (
    <main style={{ padding: 24, maxWidth: 360 }}>
      <h1>Log in</h1>
      <form onSubmit={handleLogIn} style={{ display: 'grid', gap: 8 }}>
        <input
          type="email" placeholder="Email" required
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: 8, color: 'black', background: 'white', borderRadius: 4 }}
        />
        <input
          type="password" placeholder="Password (6+ characters)" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: 8, color: 'black', background: 'white', borderRadius: 4 }}
        />
        <button type="submit" disabled={loading}>Log in</button>
        <button type="button" onClick={handleSignUp} disabled={loading}>Sign up</button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </main>
  )
}