import { useEffect, useState } from 'react'
import { NAME_STORAGE_KEY } from './constants'
import { useSchedule } from './useSchedule'
import { formatShort } from './dateUtils'
import NamePicker from './components/NamePicker'
import HangoutBanner from './components/HangoutBanner'
import BestDates from './components/BestDates'
import DateGrid from './components/DateGrid'
import LockInModal from './components/LockInModal'
import ConfirmDialog from './components/ConfirmDialog'

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

  // Which date/slot the "lock in" modal is open for (null = closed).
  const [lockTarget, setLockTarget] = useState(null)
  // Which hangout the "clear this hangout" confirmation is for (null = closed).
  const [clearTarget, setClearTarget] = useState(null)
  // Whether the "clear everyone's dates" reset confirmation is showing.
  const [confirmingReset, setConfirmingReset] = useState(false)

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

  // Open the modal instead of a native prompt.
  const handleLock = (date, slot) => setLockTarget({ date, slot })

  const confirmLock = (title) => {
    if (lockTarget) {
      schedule.addHangout(lockTarget.date, lockTarget.slot, title)
    }
    setLockTarget(null)
  }

  return (
    <div className="app">
      <HangoutBanner hangouts={schedule.hangouts} onClear={setClearTarget} />

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
          <div className="round-bar">
            <span>Planning a fresh hangout?</span>
            <button
              className="round-reset"
              onClick={() => setConfirmingReset(true)}
            >
              Clear everyone’s dates
            </button>
          </div>
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

      <LockInModal
        target={lockTarget}
        defaultTitle={schedule.hangouts[0]?.title || 'Pie baking'}
        onConfirm={confirmLock}
        onCancel={() => setLockTarget(null)}
      />

      <ConfirmDialog
        open={!!clearTarget}
        title="Clear this hangout?"
        message={
          clearTarget
            ? `This removes “${clearTarget.title}” on ${formatShort(
                clearTarget.date
              )} (${clearTarget.slot}) for everyone.`
            : ''
        }
        confirmLabel="Clear it"
        cancelLabel="Keep it"
        onConfirm={() => {
          schedule.removeHangout(clearTarget.id)
          setClearTarget(null)
        }}
        onCancel={() => setClearTarget(null)}
      />

      <ConfirmDialog
        open={confirmingReset}
        title="Clear everyone’s dates?"
        message="This wipes all availability marks so you can plan a fresh hangout from scratch. Locked-in hangouts stay. This affects everyone and can’t be undone."
        confirmLabel="Clear all dates"
        cancelLabel="Cancel"
        onConfirm={() => {
          schedule.clearAllAvailability()
          setConfirmingReset(false)
        }}
        onCancel={() => setConfirmingReset(false)}
      />
    </div>
  )
}
