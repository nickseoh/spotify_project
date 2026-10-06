'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
      supabase.from('playlists').select('*').then(({ data, error }) => {
        if (error) setErrorMsg(`${error.code}: ${error.message}`)
        setItems(data ?? [])
      })
    })
  }, [router])

  async function handleLogOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <main style={{ padding: 24 }}>Loading…</main>

  return (
    <main style={{ padding: 24 }}>
      <p>
        Logged in as <b>{user.email}</b>{' '}
        <button onClick={handleLogOut}>Log out</button>
      </p>
      <h1>My playlists</h1>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <ul>{items.map(i => <li key={i.id}>{i.title}</li>)}</ul>
    </main>
  )
}