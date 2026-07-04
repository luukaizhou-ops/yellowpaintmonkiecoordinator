import { formatShort } from '../dateUtils'

// Pinned to the very top. Shows the locked-in hangout, or a gentle nudge
// to pick one if none is set yet.
export default function HangoutBanner({ hangout, onClear }) {
  // No hangout chosen yet? Show nothing at all — no banner.
  if (!hangout) return null

  return (
    <div className="banner banner-set">
      <div className="banner-main">
        <span className="banner-label">Next hangout</span>
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
