import { SLOTS } from '../constants'
import {
  weekdayLabel,
  dayNumber,
  monthLabel,
  isWeekend,
  buildUpcomingDates,
} from '../dateUtils'

// Turn a "how many people are free" ratio into a heat color.
// Empty = neutral; a few = pale yellow; nearly-everyone = warm orange.
function heatStyle(count, total) {
  if (count === 0) {
    return { background: 'var(--cell-empty)', color: 'var(--text-muted)' }
  }
  const ratio = Math.min(count / total, 1)
  // Pale yellow (few) -> saturated orange (many).
  const hue = 52 - ratio * 20 // 52 -> 32
  const light = 88 - ratio * 36 // 88% -> 52%
  const sat = 92
  const textColor = ratio > 0.62 ? '#fff' : '#5b4a10'
  return {
    background: `hsl(${hue} ${sat}% ${light}%)`,
    color: textColor,
  }
}

function SlotCell({ date, slot, count, total, mineFree, onToggle }) {
  const style = heatStyle(count, total)
  return (
    <button
      className={`slot-cell${mineFree ? ' mine' : ''}`}
      style={style}
      onClick={() => onToggle(date, slot)}
      aria-pressed={mineFree}
    >
      <span className="slot-name">{slot}</span>
      <span className="slot-count">
        {count}/{total}
      </span>
      {mineFree && <span className="slot-check">✓ you</span>}
    </button>
  )
}

export default function DateGrid({ countFor, isMineFree, onToggle, total }) {
  const dates = buildUpcomingDates()

  return (
    <div className="date-grid">
      <div className="grid-help">
        <p>Tap a slot to mark yourself free. Tap again to unmark.</p>
        <p className="slot-legend">
          <strong>Afternoon</strong> = before 4pm ·{' '}
          <strong>Evening</strong> = 4pm onward
        </p>
      </div>
      {dates.map((date) => (
        <div
          key={date}
          className={`date-row${isWeekend(date) ? ' weekend' : ''}`}
        >
          <div className="date-label">
            <span className="dow">{weekdayLabel(date)}</span>
            <span className="dnum">{dayNumber(date)}</span>
            <span className="dmon">{monthLabel(date)}</span>
          </div>
          <div className="slots">
            {SLOTS.map((slot) => (
              <SlotCell
                key={slot}
                date={date}
                slot={slot}
                total={total}
                count={countFor(date, slot)}
                mineFree={isMineFree(date, slot)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
