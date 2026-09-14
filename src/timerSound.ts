let audioContext: AudioContext | null = null

export function prepareTimerSound() {
  try {
    // Unlock audio during the button tap, including on iPad browsers.
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') {
      void audioContext.resume().catch(() => undefined)
    }
  } catch {
    // Timers still work if the browser cannot provide audio.
  }
}

export function playTimerSound() {
  if (!audioContext || audioContext.state !== 'running') return

  const context = audioContext
  const start = context.currentTime
  for (const [index, frequency] of [660, 880].entries()) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const noteStart = start + index * 0.18

    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0, noteStart)
    gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
    oscillator.start(noteStart)
    oscillator.stop(noteStart + 0.32)
  }
}
