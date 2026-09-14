import { useEffect, useState } from 'react'
import './App.css'
import { useCallback } from 'react'
import { playTimerSound, prepareTimerSound } from './timerSound'
import cdBoots from './assets/cdboots.jpg'
import cdBootsPro from './assets/cdbootspro.png'

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

function SpellTimer({ slot, initialSpell, summonerHaste, onComplete }: {
  slot: number
  initialSpell: string
  summonerHaste: number
  onComplete: () => void
}) {
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
      if (remaining === 0) {
        window.clearInterval(intervalId)
        setEndsAt(null)
        onComplete()
        playTimerSound()
      }
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [endsAt, onComplete])

  function startTimer() {
    prepareTimerSound()
    // Smite's cast lockout is fixed; haste only affects its charge recovery.
    const duration = spell.name === 'Smite'
      ? spell.cooldown
      : spell.cooldown / (1 + summonerHaste / 100)
    // Snapshot haste on cast so changing boots leaves active timers intact.
    setSecondsLeft(Math.ceil(duration))
    setEndsAt(Date.now() + duration * 1000)
  }

  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
  const isEndingSoon = endsAt !== null && secondsLeft > 0 && secondsLeft <= 5

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
        className={`spell-button spell-${spellName.toLowerCase()}${isEndingSoon ? ' spell-ending-soon' : ''}`}
        onClick={startTimer}
        aria-label={endsAt === null ? spellName : `${spellName} ${time} remaining, click to restart`}
      >
        {endsAt === null ? spellName : time}
      </button>
    </div>
  )
}

function BootToggle({ image, label, active, onToggle }: {
  image: string
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="boot-toggle"
      aria-label={label}
      aria-pressed={active}
      onClick={onToggle}
    >
      <img src={image} alt="" />
    </button>
  )
}

function App() {
  const [pendingFlashes, setPendingFlashes] = useState(0)
  const [flashSequence, setFlashSequence] = useState(0)
  const handleCountdownComplete = useCallback(() => {
    setPendingFlashes((pending) => pending + 1)
  }, [])

  // Ionian Boots: 10 summoner haste; Crimson Lucidity: 20 (Riot patch 26.1).
  const [bootsByRole, setBootsByRole] = useState<Record<string, number>>({})

  function toggleBoots(role: string, haste: number) {
    setBootsByRole((previous) => ({
      ...previous,
      [role]: previous[role] === haste ? 0 : haste,
    }))
  }

  return (
    <main className="timer-app">
      {pendingFlashes > 0 && (
        <div
          key={flashSequence}
          className="completion-flash"
          aria-hidden="true"
          onAnimationEnd={() => {
            setPendingFlashes((pending) => pending - 1)
            setFlashSequence((sequence) => sequence + 1)
          }}
        />
      )}
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
            <div className="role-controls">
              <div className="boot-toggles">
                <BootToggle
                  image={cdBoots}
                  label={`${role} Ionian Boots of Lucidity: 10 summoner haste`}
                  active={bootsByRole[role] === 10}
                  onToggle={() => toggleBoots(role, 10)}
                />
                <BootToggle
                  image={cdBootsPro}
                  label={`${role} Crimson Lucidity: 20 summoner haste`}
                  active={bootsByRole[role] === 20}
                  onToggle={() => toggleBoots(role, 20)}
                />
              </div>
              <div className="spell-buttons">
                <SpellTimer slot={1} initialSpell="Flash" summonerHaste={bootsByRole[role] ?? 0} onComplete={handleCountdownComplete} />
                <SpellTimer slot={2} initialSpell="Ignite" summonerHaste={bootsByRole[role] ?? 0} onComplete={handleCountdownComplete} />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

export default App

