import { FRIENDS } from '../constants'

// First screen: tap your name. Remembered on this device afterwards.
export default function NamePicker({ onPick }) {
  return (
    <div className="name-picker">
      <img className="app-logo" src="/logo.png" alt="monkies-coordinator logo" />
      <h1>monkies-coordinator</h1>
      <p className="subtitle">Who are you?</p>
      <div className="name-grid">
        {FRIENDS.map((name) => (
          <button
            key={name}
            className="name-button"
            onClick={() => onPick(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="hint">
        Your pick is saved on this device — you won't have to choose again.
      </p>
    </div>
  )
}
