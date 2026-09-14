let audioContext: AudioContext | null = null

export function prepareTimerSound() {
  // Safari's default ambient audio session can be muted independently of media.
  const audioSession = (navigator as Navigator & {
    audioSession?: { type: string }
  }).audioSession
  try {
    if (audioSession) audioSession.type = 'playback'
  } catch {
    // Older browsers may not support selecting an audio session category.
  }

  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext()
    }
    // Resume and start a source directly within the tap's user activation.
    // Safari may report an interrupted state after an audio interruption.
    if (audioContext.state !== 'running') {
      void audioContext.resume().catch(() => undefined)
    }
    const source = audioContext.createBufferSource()
    source.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate)
    source.connect(audioContext.destination)
    source.onended = () => source.disconnect()
    source.start()
  } catch {
    // Timers still work if the browser cannot provide audio.
  }
}

export function playTimerSound() {
  if (!audioContext || audioContext.state === 'closed') return

  const context = audioContext
  if (context.state !== 'running') {
    void context.resume().then(() => {
      if (context.state === 'running') playChime(context)
    }).catch(() => undefined)
    return
  }
  playChime(context)
}

function playChime(context: AudioContext) {
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
