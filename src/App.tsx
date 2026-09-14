import { useEffect, useState } from 'react'
import './App.css'

// Base cooldowns from Riot Data Dragon 16.18.1 (Summoner's Rift and ARAM).
const summonerSpells = [
  { name: 'Barrier', cooldown: 180 },
  { name: 'Clarity', cooldown: 240 },
  { name: 'Cleanse', cooldown: 240 },
  { name: 'Exhaust', cooldown: 240 },
  { name: 'Flash', cooldown: 300 },
  { name: 'Ghost', cooldown: 240 },
  { name: 'Heal', cooldown: 240 },
  { name: 'Ignite', cooldown: 180 },
  { name: 'Mark', cooldown: 80 },
  { name: 'Smite', cooldown: 15 },
  { name: 'Teleport', cooldown: 300 },
]

function SpellTimer({ slot, initialSpell }: { slot: number; initialSpell: string }) {
  const [spellName, setSpellName] = useState(initialSpell)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const spell = summonerSpells.find((entry) => entry.name === spellName)!

  useEffect(() => {
    if (endsAt === null) return

    const intervalId = window.setInterval(() => {
      // Use elapsed time so delayed ticks do not lengthen the cooldown.
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) setEndsAt(null)
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [endsAt])

  function startTimer() {
    if (endsAt !== null) return
    setSecondsLeft(spell.cooldown)
    setEndsAt(Date.now() + spell.cooldown * 1000)
  }

  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <div className="spell-slot">
      <label htmlFor={`spell-${slot}`}>Spell {slot}</label>
      <select
        id={`spell-${slot}`}
        value={spellName}
        onChange={(event) => {
          setSpellName(event.target.value)
          setEndsAt(null)
          setSecondsLeft(0)
        }}
      >
        {summonerSpells.map((entry) => (
          <option key={entry.name} value={entry.name}>{entry.name}</option>
        ))}
      </select>
      <button
        type="button"
        className={`spell-button spell-${spellName.toLowerCase()}`}
        onClick={startTimer}
        disabled={endsAt !== null}
      >
        {endsAt === null ? spellName : `${spellName} ${time}`}
      </button>
    </div>
  )
}

function App() {
  return (
    <main className="timer-app">
      <h1>Summoner Spell Timer</h1>

      <section className="enemy-section" aria-labelledby="enemy-heading">
        <h2 id="enemy-heading">Enemy team</h2>
        <div className="enemy-row">
          <div className="champion">
            <span className="player-label">Enemy 1</span>
            <h3>Champion name</h3>
          </div>
          <div className="spell-buttons">
            <SpellTimer slot={1} initialSpell="Flash" />
            <SpellTimer slot={2} initialSpell="Ignite" />
          </div>
        </div>
        <p className="cooldown-note">
          Base cooldowns for Summoner’s Rift and ARAM. No haste or mode adjustments.
          Smite tracks the 15-second cast cooldown, not charge recovery.
          Changing a spell resets its timer.
        </p>
      </section>
    </main>
  )
}

export default App

