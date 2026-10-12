'use client'
import { useEffect } from 'react'
import styles from './library.module.css'

type Props = {
  title: string
  body: React.ReactNode
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className={styles.modalScrim} onMouseDown={e => e.target === e.currentTarget && onCancel()}>
      <div className={`${styles.modal} ${styles.confirm}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        <div className={styles.modalFoot}>
          <button className={styles.textBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.pillBtnGreen} onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
