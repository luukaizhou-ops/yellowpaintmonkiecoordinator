import { formatShort } from '../dateUtils'

// Pinned to the very top. Shows every upcoming hangout (soonest first), each
// with its own clear (✕) button. Renders nothing when none are planned.
export default function HangoutBanner({ hangouts, onClear }) {
  if (!hangouts.length) return null

  return (
    <div className="banner-stack">
      {hangouts.map((h, i) => (
        <div className="banner banner-set" key={h.id}>
          <div className="banner-main">
            <span className="banner-label">
              {i === 0 ? 'Next hangout' : 'Also planned'}
            </span>
            <span className="banner-title">{h.title}</span>
            <span className="banner-when">
              {formatShort(h.date)} · {h.slot}
            </span>
          </div>
          <button
            className="banner-clear"
            onClick={() => onClear(h)}
            title="Clear this hangout"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
