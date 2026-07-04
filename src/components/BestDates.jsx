import { formatShort } from '../dateUtils'

// The top 3 date/slot combos, so the winner is obvious at a glance.
export default function BestDates({ bestSlots, totalFriends }) {
  const withPeople = bestSlots.filter((b) => b.count > 0)

  if (withPeople.length === 0) {
    return (
      <div className="best-dates">
        <h2>Best dates</h2>
        <p className="empty">
          No availability yet — be the first to mark some dates below!
        </p>
      </div>
    )
  }

  return (
    <div className="best-dates">
      <h2>Best dates</h2>
      <ol className="best-list">
        {withPeople.map((b, i) => (
          <li key={`${b.date}|${b.slot}`} className="best-item">
            <span className={`medal medal-${i + 1}`}>{i + 1}</span>
            <span className="best-when">
              {formatShort(b.date)} <em>{b.slot}</em>
            </span>
            <span className="best-count">
              {b.count}/{totalFriends}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
