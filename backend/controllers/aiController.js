const Lyric = require('../models/Lyric');

// Pre-engineered musical vocabulary & harmonic structures for AI Musician
const GENRE_PROFILES = {
  synthwave: {
    bpm: 118,
    key: 'D Minor',
    scaleNotes: ['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4'],
    chordProgressions: [
      { name: 'Dm - Bb - C - Am', chords: [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['C3', 'E3', 'G3'], ['A2', 'C3', 'E3']] },
      { name: 'Dm - F - C - G', chords: [['D3', 'F3', 'A3'], ['F3', 'A3', 'C4'], ['C3', 'E3', 'G3'], ['G2', 'B2', 'D3']] },
    ],
    bassPattern: ['D2', 'D2', 'D2', 'F2', 'A#1', 'A#1', 'C2', 'C2'],
    drumGrid: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
  },
  trap: {
    bpm: 140,
    key: 'C Minor',
    scaleNotes: ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4'],
    chordProgressions: [
      { name: 'Cm - Ab - Fm - G', chords: [['C3', 'D#3', 'G3'], ['G#2', 'C3', 'D#3'], ['F2', 'G#2', 'C3'], ['G2', 'B2', 'D3']] },
      { name: 'Cm - Bb - Ab - Bb', chords: [['C3', 'D#3', 'G3'], ['A#2', 'D3', 'F3'], ['G#2', 'C3', 'D#3'], ['A#2', 'D3', 'F3']] },
    ],
    bassPattern: ['C1', null, null, 'C1', null, 'D#1', null, 'G#0'],
    drumGrid: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  lofi: {
    bpm: 85,
    key: 'F Major / D Minor',
    scaleNotes: ['F3', 'G3', 'A3', 'A#3', 'C4', 'D4', 'E4'],
    chordProgressions: [
      { name: 'Fmaj7 - Dm7 - Gm7 - C7', chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['G2', 'A#2', 'D3', 'F3'], ['C3', 'E3', 'G3', 'A#3']] },
      { name: 'Bbmaj7 - Am7 - Gm7 - Fmaj7', chords: [['A#2', 'D3', 'F3', 'A3'], ['A2', 'C3', 'E3', 'G3'], ['G2', 'A#2', 'D3', 'F3'], ['F2', 'A2', 'C3', 'E3']] },
    ],
    bassPattern: ['F2', null, 'D2', null, 'G2', null, 'C2', null],
    drumGrid: {
      kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  deephouse: {
    bpm: 124,
    key: 'G Minor',
    scaleNotes: ['G3', 'A#3', 'C4', 'D4', 'F4', 'G4'],
    chordProgressions: [
      { name: 'Gm7 - Ebmaj7 - F7 - Dm7', chords: [['G2', 'A#2', 'D3', 'F3'], ['D#2', 'G2', 'A#2', 'D3'], ['F2', 'A2', 'C3', 'D#3'], ['D2', 'F2', 'A2', 'C3']] },
    ],
    bassPattern: ['G1', 'G1', null, 'G1', 'D#1', 'D#1', null, 'F1'],
    drumGrid: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
  },
  orchestral: {
    bpm: 100,
    key: 'A Minor',
    scaleNotes: ['A2', 'C3', 'E3', 'F3', 'G3', 'A3', 'B3'],
    chordProgressions: [
      { name: 'Am - F - C - G (Epic)', chords: [['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3'], ['G2', 'B2', 'D3']] },
    ],
    bassPattern: ['A1', 'A1', 'F1', 'F1', 'C2', 'C2', 'G1', 'G1'],
    drumGrid: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
};

/**
 * @desc    Generate AI backing track arrangements (chords, bassline, drum loop)
 * @route   POST /api/ai/arranger
 * @access  Public / Optional Auth
 */
const generateArrangement = async (req, res, next) => {
  try {
    const { genre = 'synthwave', mood = 'Energetic', concept = '', userBpm } = req.body;

    const normalizedGenre = (genre || '').toLowerCase().replace(/[^a-z]/g, '');
    const profile = GENRE_PROFILES[normalizedGenre] || GENRE_PROFILES.synthwave;

    const targetBpm = Number(userBpm) || profile.bpm;
    const selectedProgression = profile.chordProgressions[Math.floor(Math.random() * profile.chordProgressions.length)];

    // Construct arrangement clips ready for timeline injection
    const arrangement = {
      genre: genre,
      mood: mood,
      concept: concept || `AI Studio Arrangement for ${genre} vibe`,
      bpm: targetBpm,
      keySignature: profile.key,
      progressionName: selectedProgression.name,
      chordProgression: selectedProgression.chords,
      basslineNotes: profile.bassPattern,
      drumGrid: profile.drumGrid,
      generatedTracks: [
        {
          id: `track-drums-${Date.now()}`,
          name: `${genre.toUpperCase()} Rhythm Foundation`,
          type: 'drum',
          color: '#06b6d4', // cyan
          volume: 0.85,
          pan: 0,
          pattern: profile.drumGrid,
        },
        {
          id: `track-chords-${Date.now()}`,
          name: `${selectedProgression.name} Poly Chords`,
          type: 'synth',
          color: '#a855f7', // purple
          volume: 0.75,
          pan: -0.15,
          chords: selectedProgression.chords,
        },
        {
          id: `track-bass-${Date.now()}`,
          name: 'Sub/Analog Bass Groove',
          type: 'bass',
          color: '#f59e0b', // amber
          volume: 0.9,
          pan: 0,
          notes: profile.bassPattern,
        },
      ],
      suggestedEffects: {
        reverb: mood.toLowerCase().includes('chill') ? 0.6 : 0.3,
        delay: 0.25,
        distortion: genre === 'trap' ? 0.2 : 0.05,
      },
    };

    return res.status(200).json({
      success: true,
      arrangement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate structured song lyrics with teleprompter timing
 * @route   POST /api/ai/lyrics
 * @access  Public / Optional Auth
 */
const generateLyrics = async (req, res, next) => {
  try {
    const { theme = 'Midnight in Tokyo', mood = 'Moody & Electric', rhymeScheme = 'AABB', tone = 'Melodic' } = req.body;

    // Structured lyric generation engine
    const lyricThemeMap = {
      night: [
        { section: 'Verse 1', lines: ['Neon reflections glowing on the wet asphalt', 'Chasing the shadows where the city lines halt', 'Digital heartbeat racing in my chest', 'Underneath the skyscrapers we find no rest'] },
        { section: 'Chorus', lines: ['Caught in the wave, electric and wild', 'Lost in the sound like a runaway child', 'Turn the frequencies up till the speakers ignite', 'We are the architects of the velvet night'] },
        { section: 'Verse 2', lines: ['Analog memories fading in the smoke', 'Echoes of words that were never quite spoke', 'Frequencies modulate, drifting out of phase', 'Wandering forever through this neon maze'] },
        { section: 'Bridge', lines: ['Strip away the silence, crank the master gain', 'Wash away the static in the synthesizer rain', 'Hold the final resonance until we break free', 'Dancing on the edge of infinity'] },
        { section: 'Outro', lines: ['Velvet night... fading to black', 'No turning back... no looking back', 'SoundCraft studio... keep it on repeat.'] },
      ],
      heartbreak: [
        { section: 'Verse 1', lines: ['Empty coffee cups and a quiet room', 'Piano chords drifting through the afternoon gloom', 'I play your favorite song just to feel the sting', 'Wondering what tomorrow’s melody might bring'] },
        { section: 'Chorus', lines: ['Every note you left behind still lingers in the air', 'I look across the studio but you’re not standing there', 'Turn up the reverb, drown out what we broke', 'Watching our promises vanish in the smoke'] },
        { section: 'Verse 2', lines: ['Found your guitar pick resting on the shelf', 'Tryna write an anthem just to heal myself', 'The metronome ticks steady, but my mind is gone', 'Counting down the measures till the rising dawn'] },
        { section: 'Bridge', lines: ['Could we modulate the key, start this song anew?', 'Or is the final chord the one that parts with you?', 'Let the feedback cry, let the bass drop low', 'Sometimes the hardest part is letting go'] },
        { section: 'Outro', lines: ['Fading out... track by track.', 'Silence takes the lead.', 'Let the music breathe.'] },
      ],
      cyberpunk: [
        { section: 'Verse 1', lines: ['Chrome and synthetic wires feeding into the grid', 'Buried all the secrets that the corporations hid', 'Sub-bass vibrating right through the concrete floor', 'Locked into the matrix behind the cyber door'] },
        { section: 'Chorus', lines: ['We are the renegades breaking through the firewall', 'Watching the ivory silicon towers fall', 'Synthesize the revolution, dial in the scream', 'Waking up inside an artificial dream'] },
        { section: 'Verse 2', lines: ['Laser optic visions pulsing in the rain', 'Zero-day exploits running through the mainframe', 'High-voltage pulses surging down the spine', 'Redefining humanity across the digital line'] },
        { section: 'Bridge', lines: ['Overclock the CPU, let the processors burn', 'To the world of analog we can never return', 'Bitcrush the signal, overdrive the amp', 'Living by the flicker of a broken neon lamp'] },
        { section: 'Outro', lines: ['Signal lost... rebooting sequence.', 'SoundCraft operational.', 'Session active.'] },
      ],
    };

    // Pick matching or synthesize dynamic theme
    const themeKey = theme.toLowerCase().includes('heart') || theme.toLowerCase().includes('love')
      ? 'heartbreak'
      : theme.toLowerCase().includes('cyber') || theme.toLowerCase().includes('digital') || theme.toLowerCase().includes('future')
      ? 'cyberpunk'
      : 'night';

    const baseSections = lyricThemeMap[themeKey];

    // Compute teleprompter sync timestamps based on average line delivery (3.2s per line)
    let currentSeconds = 0;
    const structureWithTimings = baseSections.map((sec) => {
      const timedLines = sec.lines.map((line) => {
        const timeFormatted = `${Math.floor(currentSeconds / 60)}:${String(Math.floor(currentSeconds % 60)).padStart(2, '0')}`;
        const item = {
          text: line,
          timestamp: currentSeconds,
          timeFormatted,
        };
        currentSeconds += 3.5;
        return item;
      });
      return {
        section: sec.section,
        lines: timedLines,
      };
    });

    const fullText = structureWithTimings
      .map((s) => `[${s.section}]\n` + s.lines.map((l) => l.text).join('\n'))
      .join('\n\n');

    // If authenticated user, optionally persist to Supabase
    let savedRecord = null;
    if (req.user && req.user.id) {
      try {
        savedRecord = await Lyric.create({
          userId: req.user.id,
          title: `${theme} (${mood})`,
          theme,
          mood,
          rhymeScheme,
          tone,
          content: fullText,
          structure: structureWithTimings,
        });
      } catch (err) {
        console.warn('Could not save lyric to database:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      lyrics: {
        id: savedRecord ? savedRecord.id : `lyric-${Date.now()}`,
        title: `${theme} - ${tone}`,
        theme,
        mood,
        rhymeScheme,
        tone,
        rawText: fullText,
        structure: structureWithTimings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get saved lyrics for user
 * @route   GET /api/ai/lyrics
 * @access  Private
 */
const getUserLyrics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lyrics = await Lyric.findByUser(userId);
    return res.status(200).json({
      success: true,
      lyrics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateArrangement,
  generateLyrics,
  getUserLyrics,
};
