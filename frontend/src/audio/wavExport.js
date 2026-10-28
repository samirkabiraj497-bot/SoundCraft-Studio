// Offline Audio Rendering and WAV Exporter for SoundCraft Studio

/**
 * Encodes Float32Array PCM audio buffer to 16-bit PCM WAV Blob
 */
function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < len) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

/**
 * Render Project to Master WAV Audio file
 */
export async function renderProjectToWav({ bpm = 120, tracks = [], durationSeconds = 8.0 }) {
  const sampleRate = 44100;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtx(2, sampleRate * durationSeconds, sampleRate);

  const beatDuration = 60 / bpm;

  // Render kick / rhythm / synth notes into the offline context
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);
  masterGain.connect(offlineCtx.destination);

  // Synthesize 4 bars of rhythm + harmony
  const totalBeats = Math.floor(durationSeconds / beatDuration);

  for (let b = 0; b < totalBeats; b++) {
    const time = b * beatDuration;

    // Kick on beat 1, 3
    if (b % 2 === 0) {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + 0.35);
    }

    // Snare / clap on beat 2, 4
    if (b % 2 === 1) {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + 0.2);
    }

    // Melodic chord layer (A minor progression)
    const chordFrequencies = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [130.81, 164.81, 196.0], // C
      [196.0, 246.94, 293.66], // G
    ];
    const currentChord = chordFrequencies[Math.floor(b / 2) % chordFrequencies.length];

    currentChord.forEach((f) => {
      const chordOsc = offlineCtx.createOscillator();
      const chordGain = offlineCtx.createGain();
      chordOsc.type = 'sawtooth';
      chordOsc.frequency.setValueAtTime(f, time);
      chordGain.gain.setValueAtTime(0.12, time);
      chordGain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 0.9);
      chordOsc.connect(chordGain);
      chordGain.connect(masterGain);
      chordOsc.start(time);
      chordOsc.stop(time + beatDuration);
    });
  }

  // Render audio offline
  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
  return wavBlob;
}

/**
 * Trigger browser file download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export project state to JSON
 */
export function exportProjectJson(projectState, filename = 'soundcraft-session.soundcraft') {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projectState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
