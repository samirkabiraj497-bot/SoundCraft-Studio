import { audioEngine } from './synthEngine';

class DrumEngine {
  constructor() {
    this.activeNodes = new Set();
  }

  init() {
    const ctx = audioEngine.init();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (audioEngine.masterGain && ctx) {
      audioEngine.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      audioEngine.masterGain.gain.setValueAtTime(audioEngine.masterVolumeLevel, ctx.currentTime);
    }
    return ctx;
  }

  // Register node so stopAllDrums can cleanly kill it immediately
  registerNode(node) {
    if (!node) return;
    this.activeNodes.add(node);
    try {
      node.onended = () => {
        this.activeNodes.delete(node);
      };
    } catch {
      // Ignore if onended not supported
    }
  }

  // Immediately silence all active drum sounds
  stopAllDrums() {
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === 'function') {
          node.stop(0);
        }
        if (typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch {
        // Node was already stopped
      }
    });
    this.activeNodes.clear();
  }

  // Synthesize punchy 808 Kick
  playKick(gainLevel = 0.9) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioEngine.masterGain);

    this.registerNode(osc);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Synthesize Snare Drum (Tone + White Noise)
  playSnare(gainLevel = 0.75) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    oscGain.gain.setValueAtTime(0.5 * gainLevel, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(oscGain);
    oscGain.connect(audioEngine.masterGain);

    // Snare wires (Noise)
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(gainLevel, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioEngine.masterGain);

    this.registerNode(osc);
    this.registerNode(noise);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.2);
    noise.stop(now + 0.2);
  }

  // Synthesize Closed Hi-Hat
  playHiHat(gainLevel = 0.6) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(8000, now);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioEngine.masterGain);

    this.registerNode(noise);
    noise.start(now);
    noise.stop(now + 0.07);
  }

  // Synthesize Hand Clap with micro-transients
  playClap(gainLevel = 0.7) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainLevel * 0.8, now);
    gain.gain.setValueAtTime(gainLevel * 0.2, now + 0.015);
    gain.gain.setValueAtTime(gainLevel * 0.9, now + 0.03);
    gain.gain.setValueAtTime(gainLevel * 0.3, now + 0.045);
    gain.gain.setValueAtTime(gainLevel, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioEngine.masterGain);

    this.registerNode(noise);
    noise.start(now);
    noise.stop(now + 0.26);
  }

  // Synthesize 808 Sub-Bass Note
  playSub808(noteName = 'C1', duration = 0.8) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = audioEngine.noteToFreq(noteName);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioEngine.masterGain);

    this.registerNode(osc);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Synthesize Percussion Tom
  playTom(freq = 110) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.12);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(audioEngine.masterGain);

    this.registerNode(osc);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Universal trigger method for pads
  triggerPad(padId) {
    switch (padId) {
      case 'kick':
      case 'pad-0':
        this.playKick();
        break;
      case 'snare':
      case 'pad-1':
        this.playSnare();
        break;
      case 'hihat':
      case 'pad-2':
        this.playHiHat();
        break;
      case 'clap':
      case 'pad-3':
        this.playClap();
        break;
      case '808':
      case 'pad-4':
        this.playSub808('C1');
        break;
      case 'tom-low':
      case 'pad-5':
        this.playTom(90);
        break;
      case 'tom-mid':
      case 'pad-6':
        this.playTom(130);
        break;
      case 'tom-hi':
      case 'pad-7':
        this.playTom(170);
        break;
      default:
        this.playKick();
    }
  }
}

export const drumEngine = new DrumEngine();
