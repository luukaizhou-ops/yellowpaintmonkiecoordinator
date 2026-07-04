import { useEffect, useState } from 'react'
import { NAME_STORAGE_KEY } from './constants'
import { useSchedule } from './useSchedule'
import { formatShort } from './dateUtils'
import NamePicker from './components/NamePicker'
import HangoutBanner from './components/HangoutBanner'
import BestDates from './components/BestDates'
import DateGrid from './components/DateGrid'

export default function App() {
  // Remember who you are on this device.
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (name) localStorage.setItem(NAME_STORAGE_KEY, name)
    } catch {
      /* localStorage may be unavailable (private mode) — no big deal */
    }
  }, [name])

  const schedule = useSchedule(name)

  // Missing keys? Point the user at the setup instructions instead of a
  // blank, confusing screen.
  if (!schedule.hasSupabaseConfig) {
    return (
      <div className="app">
        <div className="config-warning">
          <h1>Almost there</h1>
          <p>
            Your Supabase keys aren’t set yet. Copy <code>.env.example</code> to{' '}
            <code>.env</code>, fill in <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
          </p>
          <p>See the README for step-by-step setup.</p>
        </div>
      </div>
    )
  }

  // Haven't picked a name yet.
  if (!name) {
    return (
      <div className="app">
        <NamePicker onPick={setName} />
      </div>
    )
  }

  const switchName = () => {
    try {
      localStorage.removeItem(NAME_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setName(null)
  }

  const handleLock = (date, slot) => {
    const suggested = schedule.hangout?.title || 'Pie baking'
    const title = window.prompt(
      `Lock in ${formatShort(date)} (${slot}) as the hangout?\n\nWhat's it called?`,
      suggested
    )
    if (title === null) return // cancelled
    schedule.setChosenHangout(date, slot, title.trim() || 'Pie baking')
  }

  return (
    <div className="app">
      <HangoutBanner hangout={schedule.hangout} onClear={schedule.clearHangout} />

      <header className="app-header">
        <div>
          <span className="greeting">Hi, {name} 👋</span>
          <button className="switch-name" onClick={switchName}>
            not you? switch name
          </button>
        </div>
      </header>

      {schedule.error && (
        <div className="error-note">
          Couldn’t reach the database. Check your keys &amp; RLS policies (see
          README). <button onClick={schedule.reload}>Retry</button>
        </div>
      )}

      {schedule.loading ? (
        <p className="loading">Loading everyone’s availability…</p>
      ) : (
        <>
          <BestDates
            bestSlots={schedule.bestSlots}
            totalFriends={schedule.totalFriends}
            onLock={handleLock}
          />
          <DateGrid
            countFor={schedule.countFor}
            isMineFree={schedule.isMineFree}
            onToggle={schedule.toggleSlot}
            total={schedule.totalFriends}
          />
        </>
      )}

      <footer className="app-footer">
        <p>Shared across {schedule.totalFriends} friends’ phones · live-synced</p>
      </footer>
    </div>
  )
}
