'use client'
import { useEffect, useState } from 'react'
import type { Playlist, PlaylistSummary } from '@/lib/types'
import PlaylistCover from './PlaylistCover'
import { CloseIcon } from './icons'
import styles from './library.module.css'

type Changes = Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>

type Props = {
  playlist: PlaylistSummary
  onClose: () => void
  onSave: (changes: Changes) => Promise<void>
}

/** "Edit details" dialog: name, description, cover image URL, public/private. */
export default function DetailsModal({ playlist, onClose, onSave }: Props) {
  const [title, setTitle] = useState(playlist.title)
  const [description, setDescription] = useState(playlist.description ?? '')
  const [coverUrl, setCoverUrl] = useState(playlist.cover_url ?? '')
  const [isPublic, setIsPublic] = useState(playlist.is_public !== false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const name = title.trim()
    if (!name) return setError('Playlist name is required.')
    if (coverUrl.trim() && !/^https?:\/\//i.test(coverUrl.trim())) return setError('Cover image must be an http(s) URL.')
    setSaving(true)
    await onSave({
      title: name,
      description: description.trim() || null,
      cover_url: coverUrl.trim() || null,
      is_public: isPublic,
    })
    setSaving(false)
  }

  return (
    <div className={styles.modalScrim} onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className={styles.modalHead}>
          <h2 id="details-title">Edit details</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className={styles.modalGrid}>
          <PlaylistCover coverUrl={coverUrl.trim() || null} artwork={playlist.artwork} size={180} />
          <div className={styles.modalFields}>
            <label className={styles.floatField}>
              <span>Name</span>
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} autoFocus placeholder="Add a name" />
            </label>
            <label className={`${styles.floatField} ${styles.grow}`}>
              <span>Description</span>
              <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={300} placeholder="Add an optional description" />
            </label>
          </div>
        </div>

        <label className={styles.floatField}>
          <span>Cover image URL</span>
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://… (leave empty to use song artwork)" />
        </label>

        <label className={styles.switchRow}>
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          <span className={styles.switch} aria-hidden="true" />
          Public playlist
        </label>

        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.modalFoot}>
          <button type="submit" className={styles.pillBtnLight} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
