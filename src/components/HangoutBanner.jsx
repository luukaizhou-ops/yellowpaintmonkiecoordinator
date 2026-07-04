import { formatShort } from '../dateUtils'

// Pinned to the very top. Shows the locked-in hangout, or a gentle nudge
// to pick one if none is set yet.
export default function HangoutBanner({ hangout, onClear }) {
  if (!hangout) {
    return (
      <div className="banner banner-empty">
        <span className="banner-label">No hangout locked in yet</span>
        <span className="banner-sub">
          Find a hot date below and tap “Lock this in”.
        </span>
      </div>
    )
  }

  return (
    <div className="banner banner-set">
      <div className="banner-main">
        <span className="banner-label">Next hangout 🥧</span>
        <span className="banner-title">{hangout.title}</span>
        <span className="banner-when">
          {formatShort(hangout.date)} · {hangout.slot}
        </span>
      </div>
      <button className="banner-clear" onClick={onClear} title="Clear hangout">
        ✕
      </button>
    </div>
  )
}
