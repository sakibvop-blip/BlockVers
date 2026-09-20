// BLOCKVERSE: NEON RUSH - Procedural Web Audio Synthesizer & Haptics Engine

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.vibrationEnabled = true;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.synthGain = null;
    this.musicGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.synthGain = this.ctx.createGain();
        this.synthGain.gain.value = 0.8;
        this.synthGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25;
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Haptic feedback with AndroidBridge fallback
  vibrate(pattern) {
    if (!this.vibrationEnabled) return;
    try {
      if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === "function") {
        if (Array.isArray(pattern)) {
          if (window.AndroidBridge.vibratePatternStr) {
            window.AndroidBridge.vibratePatternStr(pattern.join(","));
          } else if (window.AndroidBridge.vibratePattern) {
            window.AndroidBridge.vibratePattern(pattern);
          } else {
            window.AndroidBridge.vibrate(pattern[0] || 40);
          }
        } else {
          window.AndroidBridge.vibrate(pattern);
        }
        return;
      }
      if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Haptics not supported or blocked
    }
  }

  playButtonClick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(12);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playBlockPickup() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(15);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBlockPlace() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(28);

    const now = this.ctx.currentTime;
    // Acoustic low thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.09);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(this.synthGain);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // High subtle click
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(450, now + 0.04);
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc2.connect(gain2);
    gain2.connect(this.synthGain);
    osc2.start(now);
    osc2.stop(now + 0.04);
  }

  playInvalid() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([20, 40, 20]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playLineClear(linesCount, comboCount = 1) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    if (linesCount >= 4) {
      this.playMegaClear(comboCount);
      return;
    }

    const now = this.ctx.currentTime;
    this.vibrate(linesCount === 1 ? 45 : (linesCount === 2 ? 65 : 85));

    // Base frequencies in pentatonic scale
    const baseFreqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    const pitchOffset = Math.min(6, comboCount);

    const notes = linesCount === 1 ? [0, 2] : (linesCount === 2 ? [0, 2, 4] : [0, 2, 4, 5]);

    notes.forEach((noteIdx, i) => {
      const startTime = now + i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqIndex = Math.min(baseFreqs.length - 1, noteIdx + pitchOffset);
      const freq = baseFreqs[freqIndex];

      osc.type = i % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.15);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.synthGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  playMegaClear(comboCount = 1) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([60, 40, 90, 40, 120]);

    const now = this.ctx.currentTime;

    // Heavy sub bass drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.45);
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    sub.connect(subGain);
    subGain.connect(this.synthGain);
    sub.start(now);
    sub.stop(now + 0.45);

    // Sparkle chime cascade
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    chords.forEach((freq, idx) => {
      const startTime = now + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.25);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.synthGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playComboSound(combo) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([25, 30, 40]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 440 * Math.pow(1.12, Math.min(12, combo));
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(baseFreq * 0.7, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.18);

    // Low pass filter to make it cyber & smooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playPowerup() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([40, 30, 60]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.synthGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playCoinReward() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(20);

    const now = this.ctx.currentTime;
    [1318.51, 1760].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.synthGain);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  playAchievement() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([50, 40, 50, 40, 120]);

    const now = this.ctx.currentTime;
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50];
    fanfareNotes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.45 : 0.15));

      osc.connect(gain);
      gain.connect(this.synthGain);

      osc.start(t);
      osc.stop(t + (idx === 3 ? 0.45 : 0.15));
    });
  }

  playLevelUp() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([80, 50, 80, 50, 160]);

    const now = this.ctx.currentTime;
    const chords = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    chords.forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2500, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playGameOver() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([100, 50, 150]);

    const now = this.ctx.currentTime;
    const downNotes = [440, 392, 349.23, 293.66, 220];
    downNotes.forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.2);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.synthGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Procedural Futuristic Cyber Synthwave Music
  startMusic() {
    if (!this.musicEnabled || this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 110, 98, 98, 123.47, 98];
    const melodyChords = [440, 523.25, 659.25, 587.33, 392, 440, 493.88, 523.25];

    this.bgmInterval = setInterval(() => {
      if (!this.musicEnabled || !this.bgmPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Bass beat
      const bassFreq = bassline[step % bassline.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      bassGain.gain.setValueAtTime(0.12, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.35);

      // Subtle atmospheric synth lead
      if (step % 2 === 0) {
        const leadFreq = melodyChords[(step / 2) % melodyChords.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = "sine";
        leadOsc.frequency.setValueAtTime(leadFreq, now);
        leadGain.gain.setValueAtTime(0.08, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.65);
      }

      step++;
    }, 450);
  }

  // Special Block & Chain Reaction Sounds
  playBombExplode() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([70, 40, 110, 50, 160]);

    const now = this.ctx.currentTime;
    // Sub bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.55);

    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(this.synthGain);
    subOsc.start(now);
    subOsc.stop(now + 0.55);

    // White noise explosion burst
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.45);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.synthGain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);
    } catch (e) {}
  }

  playLightningZap() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([40, 20, 70]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.synthGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playRainbowBlast() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([30, 30, 40, 30, 90]);

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.synthGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.35);
    });
  }

  playIceCrack() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(20);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.synthGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playIceShatter() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([40, 30, 80]);

    const now = this.ctx.currentTime;
    [1800, 2200, 3100].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(400, now + idx * 0.02 + 0.18);

      gain.gain.setValueAtTime(0.25, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.18);

      osc.connect(gain);
      gain.connect(this.synthGain);
      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.18);
    });
  }

  playMultiplierDing() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([30, 20, 50]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.synthGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playChainReaction(level = 1) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([35, 25, 60, 30, 100]);

    const now = this.ctx.currentTime;
    const baseFreq = 480 * Math.pow(1.18, Math.min(6, level));

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.22);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(this.synthGain);
    osc1.start(now);
    osc1.stop(now + 0.35);
  }

  playFeverMode() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([60, 40, 80, 40, 140, 50, 200]);

    const now = this.ctx.currentTime;
    // Siren rising sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.synthGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  playSnapFeedback() {
    if (!this.sfxEnabled) return;
    this.vibrate(10);
  }

  stopMusic() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  toggleVibration() {
    this.vibrationEnabled = !this.vibrationEnabled;
    if (this.vibrationEnabled) {
      this.vibrate(40);
    }
    return this.vibrationEnabled;
  }
}

const SOUND = new SoundEngine();
