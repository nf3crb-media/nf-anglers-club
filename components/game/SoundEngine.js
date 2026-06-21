let audioCtx = null;

function beep(freq = 600, dur = 0.08, type = "sine", vol = 0.15) {
  try {
    if (typeof window === "undefined") return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch {
    /* Web Audio blocked until user gesture */
  }
}

export const SFX = {
  tap: () => beep(520, 0.05, "sine", 0.08),
  tab: () => beep(440, 0.06, "triangle", 0.1),
  pop: () => beep(720, 0.07, "sine", 0.12),
  reveal: () => {
    beep(523, 0.1, "sine", 0.12);
    setTimeout(() => beep(659, 0.1, "sine", 0.12), 100);
    setTimeout(() => beep(784, 0.18, "sine", 0.14), 200);
  },
  legendary: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => beep(f, i === 4 ? 0.35 : 0.2, "sine", 0.16), i * 120)
    );
    setTimeout(() => beep(784, 0.15, "triangle", 0.1), 700);
  },
  cast: () => beep(300, 0.25, "sawtooth", 0.08),
};

export function haptic(ms = 12) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch {
    /* no haptic */
  }
}

export function primeAudio() {
  SFX.tap();
}
