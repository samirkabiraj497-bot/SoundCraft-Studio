const Stem = require('../models/Stem');

/**
 * Helper to generate synthetic waveform peak data (0.0 to 1.0)
 */
const generateWaveformData = (type, points = 64) => {
  const peaks = [];
  for (let i = 0; i < points; i++) {
    let val = 0.1;
    if (type === 'drums') {
      // Periodic transients on quarter/eighth notes
      val = (i % 8 === 0) ? 0.95 : (i % 4 === 0) ? 0.75 : 0.2 + Math.random() * 0.3;
    } else if (type === 'bass') {
      // Smooth sustained sinusoidal energy
      val = 0.4 + 0.45 * Math.sin((i / points) * Math.PI * 4);
    } else if (type === 'vocals') {
      // Natural speech-like burst clusters with breath pauses
      const isSpeechBurst = (i > 10 && i < 28) || (i > 36 && i < 54);
      val = isSpeechBurst ? 0.35 + Math.random() * 0.6 : 0.05 + Math.random() * 0.1;
    } else {
      // Other / synth pads: ambient wide swell
      val = 0.3 + 0.3 * Math.cos((i / points) * Math.PI * 2) + Math.random() * 0.2;
    }
    peaks.push(Number(Math.max(0.05, Math.min(1.0, val)).toFixed(3)));
  }
  return peaks;
};

/**
 * @desc    Simulate AI Stem Separation (Vocals, Drums, Bass, Other)
 * @route   POST /api/audio/split-stems
 * @access  Public / Optional Auth
 */
const splitStems = async (req, res, next) => {
  try {
    const { fileName = 'MasterTrack.mp3', duration = 30.0, projectId } = req.body;

    const baseName = fileName.replace(/\.[^/.]+$/, '');

    const stemCategories = [
      {
        name: `${baseName} - Vocals (Acapella)`,
        stemType: 'vocals',
        freqRange: '300 Hz - 3.4 kHz',
        color: '#f43f5e', // rose
        volume: 0.85,
        pan: 0,
        waveform: generateWaveformData('vocals'),
      },
      {
        name: `${baseName} - Drums & Percussion`,
        stemType: 'drums',
        freqRange: 'Transient 40 Hz - 18 kHz',
        color: '#06b6d4', // cyan
        volume: 0.9,
        pan: 0,
        waveform: generateWaveformData('drums'),
      },
      {
        name: `${baseName} - Bass & Sub-808`,
        stemType: 'bass',
        freqRange: '20 Hz - 250 Hz',
        color: '#f59e0b', // amber
        volume: 0.8,
        pan: 0,
        waveform: generateWaveformData('bass'),
      },
      {
        name: `${baseName} - Instruments & Synths`,
        stemType: 'other',
        freqRange: '250 Hz - 12 kHz (Stereo Width)',
        color: '#a855f7', // purple
        volume: 0.75,
        pan: 0,
        waveform: generateWaveformData('other'),
      },
    ];

    // If projectId provided, persist to Supabase
    const registeredStems = [];
    for (const item of stemCategories) {
      if (projectId) {
        try {
          const stemDoc = await Stem.create({
            projectId,
            name: item.name,
            stemType: item.stemType,
            fileUrl: `https://soundcraft-stems.internal/audio/${item.stemType}.wav`,
            duration,
            volume: item.volume,
            pan: item.pan,
            waveform: item.waveform,
          });
          registeredStems.push(stemDoc);
          continue;
        } catch (e) {
          console.warn('Stem database write notice:', e.message);
        }
      }

      registeredStems.push({
        id: `stem-${item.stemType}-${Date.now()}`,
        name: item.name,
        stemType: item.stemType,
        freqRange: item.freqRange,
        fileUrl: `https://soundcraft-stems.internal/audio/${item.stemType}.wav`,
        duration,
        volume: item.volume,
        pan: item.pan,
        waveform: item.waveform,
        isMuted: false,
        isSolo: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Stem separation algorithm completed with 4 isolated multitrack channels.',
      sourceFile: fileName,
      duration,
      stems: registeredStems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export DAW project bundle or render configuration
 * @route   POST /api/audio/export
 * @access  Public / Optional Auth
 */
const exportProject = async (req, res, next) => {
  try {
    const { format = 'wav', sampleRate = 48000, bitDepth = 24, projectState } = req.body;

    const exportMeta = {
      format: format.toUpperCase(),
      sampleRate,
      bitDepth,
      channelCount: 2, // Stereo
      exportId: `export-${Date.now()}`,
      timestamp: new Date().toISOString(),
      activeTracks: projectState ? projectState.tracks?.length || 0 : 0,
      bpm: projectState ? projectState.bpm || 120 : 120,
      downloadUrl: `/api/audio/download/soundcraft-session.${format}`,
    };

    return res.status(200).json({
      success: true,
      message: `Project render prepared for ${format.toUpperCase()} (${sampleRate}Hz / ${bitDepth}-bit)`,
      exportMeta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  splitStems,
  exportProject,
};
