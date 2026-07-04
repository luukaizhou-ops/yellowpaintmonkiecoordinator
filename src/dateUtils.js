import { DAYS_AHEAD } from './constants'

// We store dates as plain "YYYY-MM-DD" strings so they map 1:1 to the
// Postgres `date` column and never get shifted around by timezones.

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Build the list of upcoming dates, starting today.
export function buildUpcomingDates() {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(toISODate(d))
  }
  return dates
}

// Parse a "YYYY-MM-DD" string into a local Date (no timezone surprises).
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// e.g. "Sat Jul 4"
export function formatShort(iso) {
  const d = parseISODate(iso)
  return `${WEEKDAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function weekdayLabel(iso) {
  return WEEKDAYS[parseISODate(iso).getDay()]
}

export function dayNumber(iso) {
  return parseISODate(iso).getDate()
}

export function monthLabel(iso) {
  return MONTHS[parseISODate(iso).getMonth()]
}

export function isWeekend(iso) {
  const day = parseISODate(iso).getDay()
  return day === 0 || day === 6
}
