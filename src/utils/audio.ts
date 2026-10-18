/**
 * Web Audio API synthesizer for RBT Ninja 5
 * Provides responsive sound effects (SFX) and background music (BGM)
 * without depending on external audio file links that could fail or load slowly.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: any = null;
  private tempo: number = 132;

  constructor() {
    // Initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Button click SFX (tactile crisp pop)
  public playButtonClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext safe catch
    }
  }

  // Fruit/Component Ninja Slice SFX (swish + impact)
  public playSlice() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Noise buffer for swoosh
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);

      // Pitch blade ping
      const blade = this.ctx.createOscillator();
      const bladeGain = this.ctx.createGain();
      blade.type = 'triangle';
      blade.frequency.setValueAtTime(950, now);
      blade.frequency.exponentialRampToValueAtTime(1400, now + 0.06);

      bladeGain.gain.setValueAtTime(0.18, now);
      bladeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      blade.connect(bladeGain);
      bladeGain.connect(this.ctx.destination);

      blade.start(now);
      blade.stop(now + 0.08);
    } catch {
      // AudioContext safe catch
    }
  }

  // Bomb explosion SFX (avoid hitting bomb)
  public playBomb() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext safe catch
    }
  }

  // Correct answer chime (melodic ascending triad)
  public playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // AudioContext safe catch
    }
  }

  // Wrong answer SFX (dull descending buzz)
  public playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext safe catch
    }
  }

  // Fanfare celebratory chime
  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0 },
        { freqs: [587.33, 739.99, 880.0], time: 0.2 },
        { freqs: [659.25, 830.61, 987.77], time: 0.4 },
        { freqs: [783.99, 1046.5, 1318.51], time: 0.65 },
      ];

      const now = this.ctx.currentTime;
      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const startTime = now + chord.time;
          const duration = 0.35;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      });
    } catch {
      // AudioContext safe catch
    }
  }

  // Background Music: Upbeat Ninja Dojo melody loop
  public startMusic() {
    if (this.musicPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.musicPlaying = true;

    // Melody notes in pentatonic minor (Ninja vibe)
    const melody = [
      { note: 440, dur: 0.2 }, // A4
      { note: 523.25, dur: 0.2 }, // C5
      { note: 587.33, dur: 0.2 }, // D5
      { note: 659.25, dur: 0.3 }, // E5
      { note: 587.33, dur: 0.2 }, // D5
      { note: 523.25, dur: 0.2 }, // C5
      { note: 440, dur: 0.4 }, // A4
      { note: 392, dur: 0.2 }, // G4
      { note: 440, dur: 0.2 }, // A4
      { note: 587.33, dur: 0.2 }, // D5
      { note: 523.25, dur: 0.3 }, // C5
      { note: 392, dur: 0.2 }, // G4
      { note: 440, dur: 0.5 }, // A4
    ];

    let noteIdx = 0;
    const beatLength = 240; // ms per step

    this.musicInterval = setInterval(() => {
      if (!this.musicPlaying || this.isMuted || !this.ctx) return;

      const current = melody[noteIdx % melody.length];
      const now = this.ctx.currentTime;

      // Lead note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(current.note, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + current.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + current.dur);

      // Bass note accompaniment every 4 beats
      if (noteIdx % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(110, now); // A2

        bassGain.gain.setValueAtTime(0.06, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
      }

      noteIdx++;
    }, beatLength);
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundEngine();
