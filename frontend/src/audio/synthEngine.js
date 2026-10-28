// Web Audio API Synthesizer, Scratch Engine, and Song Playback Controller

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.activeVoices = new Set();
    this.activeTimeouts = new Set();
    this.playbackInterval = null;
    this.isPlaying = false;
    this.currentStep = 0;
    this.masterVolumeLevel = 0.85;
    this.drumEngineRef = null;
    this.activeAudio = null;
    this.trackAudioMap = new Map();
    this.activeAudioElements = new Map();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolumeLevel, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterVolumeLevel, this.ctx.currentTime);
    }

    return this.ctx;
  }

  // Safe timeout helper that tracks IDs so pause/stop can cancel them immediately
  safeTimeout(fn, delayMs) {
    const id = setTimeout(() => {
      this.activeTimeouts.delete(id);
      fn();
    }, delayMs);
    this.activeTimeouts.add(id);
    return id;
  }

  // Frequency mapping for note names (C1 to B6)
  noteToFreq(note) {
    if (!note) return 440;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /^([A-G]#?)([0-8])$/;
    const match = note.match(regex);
    if (!match) return 440;

    const noteName = match[1];
    const octave = parseInt(match[2], 10);
    const semitone = notes.indexOf(noteName);
    // C4 is midi note 60, A4 is 69 = 440Hz
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play a synth note with instrument preset parameters
   */
  triggerNoteOn(noteName, preset = {}) {
    this.init();
    if (!this.ctx) return null;

    // Wake up AudioContext on live note interaction
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Ensure master gain is audible
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterVolumeLevel, this.ctx.currentTime);
    }

    const freq = typeof noteName === 'number' ? noteName : this.noteToFreq(noteName);
    const now = this.ctx.currentTime;

    const oscType = preset.type || 'sawtooth';
    const filterCutoff = preset.cutoff || 2500;
    const attack = preset.attack || 0.02;
    const decay = preset.decay || 0.2;
    const sustain = preset.sustain !== undefined ? preset.sustain : 0.6;
    const release = preset.release || 0.25;

    // Release any previous active voice on the exact same note name
    this.activeVoices.forEach((voice) => {
      if (voice.noteName === noteName) {
        this.stopVoice(voice, 0.04);
      }
    });

    // Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, now);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, now);
    filter.Q.setValueAtTime(preset.resonance || 2, now);

    // Envelope Gain
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.exponentialRampToValueAtTime(0.35, now + attack);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.35 * sustain), now + attack + decay);

    // Pan
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(preset.pan || 0, now);

    // Connect node chain
    osc.connect(filter);
    filter.connect(voiceGain);
    if (panner) {
      voiceGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      voiceGain.connect(this.masterGain);
    }

    osc.start(now);

    const voice = {
      osc,
      voiceGain,
      filter,
      panner,
      noteName,
      startTime: now,
      release,
      stop: () => {
        try {
          voiceGain.gain.cancelScheduledValues(0);
          voiceGain.gain.setValueAtTime(0.00001, 0);
          osc.stop(0);
          osc.disconnect();
          voiceGain.disconnect();
        } catch {
          // Already stopped
        }
      },
    };

    this.activeVoices.add(voice);
    return voice;
  }

  /**
   * Stop an individual voice cleanly
   */
  stopVoice(voice, customRelease) {
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    const rel = customRelease !== undefined ? customRelease : voice.release;

    try {
      voice.voiceGain.gain.cancelScheduledValues(now);
      voice.voiceGain.gain.setValueAtTime(Math.max(0.0001, voice.voiceGain.gain.value), now);
      voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + rel);
      voice.osc.stop(now + rel + 0.02);
    } catch {
      // Voice may have stopped
    }

    this.safeTimeout(() => {
      try {
        voice.osc.disconnect();
        voice.voiceGain.disconnect();
      } catch {
        // Disconnected
      }
      this.activeVoices.delete(voice);
    }, (rel + 0.05) * 1000);
  }

  /**
   * Release synth note smoothly by name
   */
  triggerNoteOff(noteName) {
    if (!this.ctx) return;
    this.activeVoices.forEach((voice) => {
      if (voice.noteName === noteName) {
        this.stopVoice(voice);
      }
    });
  }

  /**
   * Quick trigger note (plays full envelope)
   */
  playNote(noteName, duration = 0.4, preset = {}) {
    const voice = this.triggerNoteOn(noteName, preset);
    if (!voice) return null;

    this.safeTimeout(() => {
      if (this.activeVoices.has(voice)) {
        this.stopVoice(voice);
      }
    }, duration * 1000);

    return voice;
  }

  /**
   * PAUSE PLAYBACK: Instantly silences all audio, freezes hardware rendering thread, keeps step
   */
  pausePlayback() {
    this.isPlaying = false;

    // 0. Pause active audio file element if playing
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
      } catch {}
    }

    // 1. Clear playback interval
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }

    // 2. Clear all scheduled note-off timers
    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts.clear();

    // 3. Immediately silence and disconnect all voices
    this.activeVoices.forEach((voice) => {
      if (voice && typeof voice.stop === 'function') {
        voice.stop();
      }
    });
    this.activeVoices.clear();

    // 4. Immediately silence drums
    if (this.drumEngineRef && typeof this.drumEngineRef.stopAllDrums === 'function') {
      this.drumEngineRef.stopAllDrums();
    }

    // 5. Pause all audio elements
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try { audio.pause(); } catch {}
      });
    }
    if (this.activeAudio) {
      try { this.activeAudio.pause(); } catch {}
    }

    // 6. Zero out master gain (DO NOT unmute)
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.00001, now);
    }

    // 7. Suspend AudioContext to stop hardware clock completely
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  /**
   * STOP ALL: Guaranteed 100% immediate silence, resets playback step to 0
   */
  stopAll() {
    this.currentStep = 0;
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      });
      this.activeAudioElements.clear();
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
      this.activeAudioUrl = null;
    }
    this.pausePlayback();
  }

  /**
   * Real Turntable Vinyl Scratch sound simulation
   */
  playScratch(direction = 1, intensity = 1.0) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterVolumeLevel, this.ctx.currentTime);
    }
    const now = this.ctx.currentTime;

    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const scratchGain = this.ctx.createGain();

    const baseFreq = direction > 0 ? 220 : 440;
    const endFreq = direction > 0 ? 550 * intensity : 120;

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(baseFreq, now);
    carrier.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), now + 0.12);

    mod.type = 'triangle';
    mod.frequency.setValueAtTime(80, now);
    modGain.gain.setValueAtTime(200, now);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(4.5, now);

    scratchGain.gain.setValueAtTime(0.001, now);
    scratchGain.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.02);
    scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    carrier.connect(filter);
    filter.connect(scratchGain);
    scratchGain.connect(this.masterGain);

    carrier.start(now);
    mod.start(now);

    carrier.stop(now + 0.15);
    mod.stop(now + 0.15);
  }

  /**
   * Set master studio volume
   */
  setMasterVolume(val) {
    this.masterVolumeLevel = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.ctx.state === 'running') {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.masterVolumeLevel, this.ctx.currentTime, 0.02);
    }
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try { audio.volume = this.masterVolumeLevel; } catch {}
      });
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.volume = this.masterVolumeLevel;
      } catch {}
    }
  }

  /**
   * Seek playback to a specific time
   */
  seekToTime(seconds, songPreset) {
    const bpm = songPreset?.bpm || 120;
    const stepDurationSec = 60 / bpm;
    this.currentStep = Math.max(0, Math.floor(seconds / stepDurationSec));
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try { audio.currentTime = Math.max(0, seconds); } catch {}
      });
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.currentTime = Math.max(0, seconds);
      } catch {}
    }
  }

  /**
   * Reset playback step (e.g. for looping)
   */
  resetPlaybackStep() {
    this.currentStep = 0;
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try { audio.currentTime = 0; } catch {}
      });
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.currentTime = 0;
      } catch {}
    }
  }

  /**
   * Start or Resume Playing a Song Sequence (either real Audio File or Synth Preset)
   */
  startSongPlayback(songPreset, drumEngineInstance, onTick, fromStep = 0, fromSeconds = 0) {
    // 1. Clear any running playback
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts.clear();

    // 2. Wake up audio context & restore master gain
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterVolumeLevel, this.ctx.currentTime);
    }

    this.drumEngineRef = drumEngineInstance;
    this.isPlaying = true;
    this.currentStep = fromStep;

    // Check if songPreset or tracks has real audio files / recorded clips
    const allTracks = songPreset?.tracks || [];
    const hasSolo = allTracks.some((t) => t.isSolo);
    const playableAudioTracks = allTracks.filter(
      (t) => t.audioUrl && (hasSolo ? t.isSolo : !t.isMuted)
    );
    const hasAudioTracks = playableAudioTracks.length > 0 || !!songPreset?.audioUrl;

    if (hasAudioTracks) {
      // Clean up previous voice synthesis completely
      this.activeVoices.forEach((voice) => {
        if (voice && typeof voice.stop === 'function') {
          voice.stop();
        }
      });
      this.activeVoices.clear();
      if (drumEngineInstance && typeof drumEngineInstance.stopAllDrums === 'function') {
        drumEngineInstance.stopAllDrums();
      }

      const targetTracks = [...playableAudioTracks];
      if (songPreset?.audioUrl && !targetTracks.some((t) => t.audioUrl === songPreset.audioUrl)) {
        targetTracks.push({
          id: '__main_preset_audio__',
          audioUrl: songPreset.audioUrl,
          volume: 1.0,
        });
      }

      // Stop audio tracks that are no longer part of active playback
      this.activeAudioElements.forEach((audio, trackId) => {
        if (!targetTracks.some((t) => t.id === trackId)) {
          try { audio.pause(); } catch {}
          this.activeAudioElements.delete(trackId);
        }
      });

      // Play each active audio track synchronized to playhead
      targetTracks.forEach((track) => {
        let audio = this.activeAudioElements.get(track.id);
        if (!audio || audio.src !== track.audioUrl) {
          if (audio) {
            try { audio.pause(); } catch {}
          }
          audio = new Audio(track.audioUrl);
          this.activeAudioElements.set(track.id, audio);
        }
        audio.currentTime = Math.max(0, fromSeconds || 0);
        const trackVol = track.volume !== undefined ? track.volume : 0.85;
        audio.volume = Math.max(0, Math.min(1, trackVol * this.masterVolumeLevel));
        audio.play().catch((err) => console.warn('Audio track play error:', err));
      });

      // DO NOT trigger synthetic chord/melody loop if audio tracks are playing!
      return;
    }

    // If switching from an audio file back to synthetic preset, pause and clear the audio files
    if (this.activeAudioElements) {
      this.activeAudioElements.forEach((audio) => {
        try { audio.pause(); } catch {}
      });
      this.activeAudioElements.clear();
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
      this.activeAudioUrl = null;
    }

    const pattern = songPreset?.audioPattern || {};
    const chords = pattern.chordProgressions || [];
    const melody = pattern.leadMelody || [];
    const bpm = songPreset?.bpm || 120;

    // Beat step duration in milliseconds
    const stepDurationMs = (60 / bpm) * 1000;

    // If blank project with zero chords, tick silently to advance playhead
    if (chords.length === 0) {
      const tick = () => {
        if (!this.isPlaying) return;
        if (onTick) onTick(this.currentStep);
        this.currentStep++;
      };
      tick();
      this.playbackInterval = setInterval(tick, stepDurationMs);
      return;
    }

    const tick = () => {
      if (!this.isPlaying) return;

      const chordIdx = Math.floor(this.currentStep / 2) % (chords.length || 1);
      const activeChord = chords[chordIdx];

      if (activeChord) {
        // 1. Play Chord on beat 1 of measure
        if (this.currentStep % 2 === 0) {
          activeChord.notes.forEach((note) => {
            this.playNote(note, (stepDurationMs * 1.8) / 1000, {
              type: songPreset.genre.includes('Acoustic') ? 'triangle' : 'sawtooth',
              cutoff: 2800,
              attack: 0.03,
              decay: 0.3,
              sustain: 0.6,
            });
          });

          // Play Bass root note
          if (activeChord.bass) {
            this.playNote(activeChord.bass, (stepDurationMs * 1.8) / 1000, {
              type: 'sine',
              cutoff: 500,
              attack: 0.02,
              decay: 0.4,
              sustain: 0.8,
            });
          }
        }

        // 2. Play Melody note
        if (melody.length > 0) {
          const melodyNote = melody[this.currentStep % melody.length];
          if (melodyNote) {
            this.playNote(melodyNote, (stepDurationMs * 0.9) / 1000, {
              type: 'sawtooth',
              cutoff: 3500,
              attack: 0.01,
              decay: 0.2,
              sustain: 0.5,
            });
          }
        }

        // 3. Drums
        if (drumEngineInstance) {
          if (this.currentStep % 2 === 0) {
            drumEngineInstance.playKick(0.7);
          } else {
            drumEngineInstance.playSnare(0.6);
          }
          drumEngineInstance.playHiHat(0.4);
        }
      }

      if (onTick) {
        onTick(this.currentStep);
      }

      this.currentStep++;
    };

    // First beat immediately
    tick();
    this.playbackInterval = setInterval(tick, stepDurationMs);
  }
}

export const audioEngine = new AudioEngine();
