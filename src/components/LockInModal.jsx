import { useEffect, useState } from 'react'
import { formatShort } from '../dateUtils'

// A clean, on-theme dialog for naming and confirming the chosen hangout —
// replaces the browser's native prompt() box.
export default function LockInModal({ target, defaultTitle, onConfirm, onCancel }) {
  const [title, setTitle] = useState(defaultTitle)

  // Reset the title each time a new date/slot is opened.
  useEffect(() => {
    if (target) setTitle(defaultTitle)
  }, [target, defaultTitle])

  // Close on Escape.
  useEffect(() => {
    if (!target) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onCancel])

  if (!target) return null

  const confirm = () => onConfirm(title.trim() || 'Pie baking')

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Lock in the hangout</h2>
        <p className="modal-when">
          {formatShort(target.date)} · <span>{target.slot}</span>
        </p>

        <label className="modal-label" htmlFor="hangout-title">
          What's it called?
        </label>
        <input
          id="hangout-title"
          className="modal-input"
          type="text"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirm()
          }}
          placeholder="Pie baking"
        />

        <div className="modal-actions">
          <button className="modal-btn modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-confirm" onClick={confirm}>
            Lock it in
          </button>
        </div>
      </div>
    </div>
  )
}
