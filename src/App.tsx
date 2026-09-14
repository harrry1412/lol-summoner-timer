import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [flashEndsAt, setFlashEndsAt] = useState<number | null>(null)
  const [flashSecondsLeft, setFlashSecondsLeft] = useState(0)

  useEffect(() => {
    if (flashEndsAt === null) return

    const intervalId = window.setInterval(() => {
      // Use elapsed time so delayed ticks do not lengthen the cooldown.
      const secondsLeft = Math.max(0, Math.ceil((flashEndsAt - Date.now()) / 1000))
      setFlashSecondsLeft(secondsLeft)

      if (secondsLeft === 0) {
        setFlashEndsAt(null)
      }
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [flashEndsAt])

  function startFlashTimer() {
    if (flashEndsAt !== null) return

    const durationSecond=60
    setFlashSecondsLeft(durationSecond)
    setFlashEndsAt(Date.now() + durationSecond*1000)
  }

  const flashTime = `${Math.floor(flashSecondsLeft / 60)}:${String(flashSecondsLeft % 60).padStart(2, '0')}`

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
            <button
              type="button"
              className="spell-button spell-flash"
              onClick={startFlashTimer}
              disabled={flashEndsAt !== null}
            >
              {flashEndsAt === null ? 'Flash' : `Flash ${flashTime}`}
            </button>
            <button type="button" className="spell-button spell-ignite">
              Ignite
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
