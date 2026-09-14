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
      <select
        aria-label={`Spell ${slot}`}
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
        aria-label={endsAt === null ? spellName : `${spellName} ${time} remaining`}
      >
        {endsAt === null ? spellName : time}
      </button>
    </div>
  )
}

function App() {
  return (
    <main className="timer-app">
      <h1>Summoner Spell Timer</h1>

      <section className="enemy-section" aria-label="Enemy team">
        {['Top', 'Jungle', 'Mid', 'ADC', 'Support'].map((role) => (
          <div className="enemy-row" key={role} role="group" aria-label={`${role} enemy`}>
            <div className="champion">
              <h3>
                <span className={`role-icon role-icon-${role.toLowerCase()}`} aria-hidden="true" />
                {role}
              </h3>
            </div>
            <div className="spell-buttons">
              <SpellTimer slot={1} initialSpell="Flash" />
              <SpellTimer slot={2} initialSpell="Ignite" />
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

export default App

