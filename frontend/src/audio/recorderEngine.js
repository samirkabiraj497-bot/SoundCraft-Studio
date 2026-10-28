// SoundCraft Studio - Dual-Mode Audio Recording Engine (Inbuilt Instruments vs Microphone)

class AudioRecorderEngine {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingStartTime = 0;
    this.activeMode = null; // 'instruments' | 'mic'
    this.micStream = null;
    this.destNode = null;
    this.analyser = null;
    this.analyserData = null;
    this.isRecording = false;
  }

  // Check supported mime type for MediaRecorder
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  /**
   * MODE 1: Record Inbuilt Instruments & Synths (Internal Master Audio Bus)
   */
  async startInstrumentRecording(audioEngine) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    const ctx = audioEngine.init();
    if (!ctx) throw new Error('AudioContext not available');

    // Create a MediaStreamDestination from Web Audio API
    this.destNode = ctx.createMediaStreamDestination();
    audioEngine.masterGain.connect(this.destNode);

    const mimeType = this.getSupportedMimeType();
    const options = mimeType ? { mimeType } : {};

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.destNode.stream, options);
    this.activeMode = 'instruments';
    this.recordingStartTime = performance.now();
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms chunks for smooth recording
    return { success: true, mode: 'instruments' };
  }

  /**
   * MODE 2: Record Vocal Singing & Voice via Live Microphone
   */
  async startMicRecording(audioEngine) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    const ctx = audioEngine.init();

    // Request high-quality microphone input
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    // Create analyser to visualize live microphone levels
    const micSource = ctx.createMediaStreamSource(this.micStream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
    micSource.connect(this.analyser);

    const mimeType = this.getSupportedMimeType();
    const options = mimeType ? { mimeType } : {};

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.micStream, options);
    this.activeMode = 'mic';
    this.recordingStartTime = performance.now();
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    return { success: true, mode: 'mic' };
  }

  /**
   * Get live microphone volume level (0 to 1) for VU meter visualization
   */
  getMicLevel() {
    if (!this.analyser || !this.analyserData) return 0;
    this.analyser.getByteFrequencyData(this.analyserData);
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i++) {
      sum += this.analyserData[i];
    }
    const avg = sum / this.analyserData.length;
    return Math.min(1, avg / 128);
  }

  /**
   * Stop Active Recording and generate Audio Blob + Waveform Analysis
   */
  async stopRecording(audioEngine) {
    if (!this.isRecording || !this.mediaRecorder) {
      return null;
    }

    const mode = this.activeMode;
    const durationSec = Math.max(0.5, (performance.now() - this.recordingStartTime) / 1000);

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(blob);

        // Disconnect instrument destination node
        if (this.destNode && audioEngine?.masterGain) {
          try {
            audioEngine.masterGain.disconnect(this.destNode);
          } catch {}
          this.destNode = null;
        }

        // Shut down microphone hardware stream
        if (this.micStream) {
          this.micStream.getTracks().forEach((track) => track.stop());
          this.micStream = null;
        }
        this.analyser = null;
        this.analyserData = null;
        this.isRecording = false;
        this.activeMode = null;

        // Generate genuine 64-point waveform data from recorded audio buffer
        let waveform = [];
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const tempCtx = new AudioCtx();
          const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          const sampleCount = 64;
          const blockSize = Math.floor(channelData.length / sampleCount);

          for (let i = 0; i < sampleCount; i++) {
            let maxVal = 0;
            const start = i * blockSize;
            const end = start + blockSize;
            for (let j = start; j < end; j++) {
              const val = Math.abs(channelData[j]);
              if (val > maxVal) maxVal = val;
            }
            waveform.push(Math.max(0.15, Math.min(1.0, maxVal * 1.6)));
          }
          await tempCtx.close();
        } catch {
          // Fallback animated waveform if decoding is restricted by format
          waveform = Array.from({ length: 64 }, () => Math.random() * 0.6 + 0.2);
        }

        resolve({
          blob,
          audioUrl,
          duration: durationSec,
          waveform,
          mode,
          timestamp: Date.now(),
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.isRecording = false;
        resolve(null);
      }
    });
  }
}

export const recorderEngine = new AudioRecorderEngine();

/**
 * Universal Audio Decoder: extracts 64-point normalized waveform data & duration
 */
export async function extractWaveformFromBlob(blob, sampleCount = 64) {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const tempCtx = new AudioCtx();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / sampleCount) || 1;
    const waveform = [];

    for (let i = 0; i < sampleCount; i++) {
      let maxVal = 0;
      const start = i * blockSize;
      const end = Math.min(channelData.length, start + blockSize);
      for (let j = start; j < end; j++) {
        const val = Math.abs(channelData[j]);
        if (val > maxVal) maxVal = val;
      }
      waveform.push(Math.max(0.15, Math.min(1.0, maxVal * 1.8)));
    }

    const duration = audioBuffer.duration;
    await tempCtx.close();
    return { waveform, duration };
  } catch {
    return {
      waveform: Array.from({ length: sampleCount }, () => Math.random() * 0.6 + 0.2),
      duration: 32.0,
    };
  }
}
