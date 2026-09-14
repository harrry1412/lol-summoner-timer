import './App.css'

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
            <button type="button" className="spell-button spell-flash">
              Flash
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
