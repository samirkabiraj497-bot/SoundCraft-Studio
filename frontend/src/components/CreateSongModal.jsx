import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  PlusCircle,
  Music,
  Sliders,
  Sparkles,
  Guitar,
  Radio,
  Disc,
  Layers,
  Wand2,
  Check,
} from 'lucide-react';

const GENRE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    icon: Layers,
    description: 'Clean slate with 0 tracks. Ready to add custom tracks or record live instruments and mic singing directly onto the multitrack timeline.',
    defaultBpm: 120,
    defaultKey: 'C Major',
    timeSignature: '4/4',
    badge: 'Clean Project',
    tracks: [],
    audioPattern: {
      chordProgressions: [],
      leadMelody: [],
      drumStyle: 'none',
    },
    starterLyrics: [],
  },
  {
    id: 'acoustic',
    name: 'Acoustic Songwriter',
    icon: Guitar,
    description: 'Warm fingerpicked guitars, intimate vocals, grand piano, and soft ballad drums.',
    defaultBpm: 65,
    defaultKey: 'G Major',
    timeSignature: '6/8',
    badge: 'Singer-Songwriter',
    tracks: [
      { id: 'track-acoustic-gtr', name: 'Acoustic Fingerpicking', type: 'guitar', color: '#f59e0b', volume: 0.9, pan: -0.15 },
      { id: 'track-intimate-vocal', name: 'Intimate Lead Vocals', type: 'vocal', color: '#f43f5e', volume: 0.95, pan: 0 },
      { id: 'track-grand-piano', name: 'Studio Grand Piano', type: 'keys', color: '#06b6d4', volume: 0.8, pan: 0.2 },
      { id: 'track-strings-swell', name: 'Symphonic Strings Swell', type: 'strings', color: '#a855f7', volume: 0.7, pan: 0 },
      { id: 'track-ballad-drums', name: 'Soft Ballad Kick & Rim', type: 'drums', color: '#10b981', volume: 0.75, pan: 0.05 },
    ],
    audioPattern: {
      chordProgressions: [
        { name: 'G Major', notes: ['G3', 'B3', 'D4', 'G4'], bass: 'G2', duration: 1.9 },
        { name: 'E Minor', notes: ['E3', 'G3', 'B3', 'E4'], bass: 'E2', duration: 1.9 },
        { name: 'C Major', notes: ['C3', 'E3', 'G3', 'C4'], bass: 'C2', duration: 1.9 },
        { name: 'D Major', notes: ['D3', 'F#3', 'A3', 'D4'], bass: 'D2', duration: 1.9 },
      ],
      leadMelody: ['D4', 'G4', 'B4', 'A4', 'G4', 'E4', 'G4', 'F#4'],
      drumStyle: 'ballad',
    },
    starterLyrics: [
      { text: '[0:00] (Acoustic Guitar Fingerpicking Intro)', timestamp: 0 },
      { text: '[0:06] Verse 1: I found a melody that whispered in the breeze', timestamp: 6 },
      { text: '[0:14] Verse 1: Strumming golden chords underneath the summer trees', timestamp: 14 },
      { text: '[0:22] Chorus: And every heartbeat sings your name out loud', timestamp: 22 },
      { text: '[0:30] Chorus: Dancing in the quiet, lost inside the sound', timestamp: 30 },
    ],
  },
  {
    id: 'synthwave',
    name: '80s Synthwave & Retro',
    icon: Radio,
    description: 'Analog sawtooth leads, neon polyphonic pads, driving bassline, and 808 gating.',
    defaultBpm: 118,
    defaultKey: 'A Minor',
    timeSignature: '4/4',
    badge: 'Retro Futurism',
    tracks: [
      { id: 'track-poly-synth', name: 'Neon Poly Lead Synth', type: 'synth', color: '#06b6d4', volume: 0.85, pan: -0.1 },
      { id: 'track-analog-bass', name: 'Pulsing Retrowave Bass', type: 'bass', color: '#a855f7', volume: 0.9, pan: 0 },
      { id: 'track-cyber-pad', name: 'Ambient Cyber Pad', type: 'pad', color: '#ec4899', volume: 0.7, pan: 0.2 },
      { id: 'track-linn-drums', name: 'Vintage 808 Beatbox', type: 'drums', color: '#f59e0b', volume: 0.85, pan: 0 },
    ],
    audioPattern: {
      chordProgressions: [
        { name: 'A Minor', notes: ['A3', 'C4', 'E4', 'A4'], bass: 'A2', duration: 1.5 },
        { name: 'F Major', notes: ['F3', 'A3', 'C4', 'F4'], bass: 'F2', duration: 1.5 },
        { name: 'C Major', notes: ['C3', 'E3', 'G3', 'C4'], bass: 'C2', duration: 1.5 },
        { name: 'G Major', notes: ['G3', 'B3', 'D4', 'G4'], bass: 'G2', duration: 1.5 },
      ],
      leadMelody: ['E4', 'A4', 'C5', 'B4', 'G4', 'A4', 'E4', 'D4'],
      drumStyle: 'synthwave',
    },
    starterLyrics: [
      { text: '[0:00] (Pulsing 80s Synthesizer Arpeggiation)', timestamp: 0 },
      { text: '[0:08] Verse 1: Driving down the neon highway in the dead of night', timestamp: 8 },
      { text: '[0:16] Verse 1: Chrome reflections glowing in the city light', timestamp: 16 },
      { text: '[0:24] Chorus: We are electric, burning through the dark', timestamp: 24 },
      { text: '[0:32] Chorus: Lighting up the skyline with a single spark', timestamp: 32 },
    ],
  },
  {
    id: 'trap',
    name: 'Modern Trap & Hip-Hop',
    icon: Disc,
    description: 'Booming 808 sub-bass, rapid hi-hat rolls, snappy clap/snare, and melodic dark plucks.',
    defaultBpm: 140,
    defaultKey: 'C Minor',
    timeSignature: '4/4',
    badge: 'Urban / Trap',
    tracks: [
      { id: 'track-808-sub', name: '808 Sub Boom Bass', type: 'bass', color: '#ef4444', volume: 0.95, pan: 0 },
      { id: 'track-trap-pluck', name: 'Dark Bell & Flute Pluck', type: 'lead', color: '#06b6d4', volume: 0.8, pan: -0.15 },
      { id: 'track-trap-vocal', name: 'Auto-Tuned Flow Vocals', type: 'vocal', color: '#a855f7', volume: 0.9, pan: 0 },
      { id: 'track-trap-drums', name: 'Rolling Hats & Snappy Snare', type: 'drums', color: '#f59e0b', volume: 0.9, pan: 0 },
    ],
    audioPattern: {
      chordProgressions: [
        { name: 'C Minor', notes: ['C3', 'D#3', 'G3', 'C4'], bass: 'C2', duration: 1.4 },
        { name: 'G# Major', notes: ['G#2', 'C3', 'D#3', 'G#3'], bass: 'G#1', duration: 1.4 },
        { name: 'D# Major', notes: ['D#3', 'G3', 'A#3', 'D#4'], bass: 'D#2', duration: 1.4 },
        { name: 'A# Major', notes: ['A#2', 'D3', 'F3', 'A#3'], bass: 'A#1', duration: 1.4 },
      ],
      leadMelody: ['G4', 'D#4', 'C4', 'D4', 'G4', 'F4', 'D#4', 'D4'],
      drumStyle: 'trap',
    },
    starterLyrics: [
      { text: '[0:00] (808 Sub-Bass & Trap Pluck Intro)', timestamp: 0 },
      { text: '[0:08] Verse 1: High rise penthouse looking at the view', timestamp: 8 },
      { text: '[0:16] Verse 1: Working round the clock, turning dreams to truth', timestamp: 16 },
      { text: '[0:24] Hook: 808 hitting hard shake the floor below', timestamp: 24 },
      { text: '[0:32] Hook: We never stop the grind, watch the kingdom grow', timestamp: 32 },
    ],
  },
];

const RANDOM_TITLES = [
  'Midnight Odyssey',
  'Golden Hour Echoes',
  'Electric Pulse',
  'Velvet Horizons',
  'Neon Reverie',
  'Starlight Symphony',
  'Summer Groove',
  'Lost in Tokyo',
  'Ocean Breeze',
  'Chasing Shadows',
];

const KEY_OPTIONS = [
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major',
  'F Major',
  'A Minor',
  'E Minor',
  'B Minor',
  'D Minor',
  'C Minor',
  'F# Minor',
];

export default function CreateSongModal({ isOpen, onClose, onCreateSong, currentUser }) {
  const { accent, isDark } = useTheme();

  const [selectedTemplate, setSelectedTemplate] = useState(GENRE_TEMPLATES[0]);
  const [songTitle, setSongTitle] = useState('New Project');
  const [artistName, setArtistName] = useState(currentUser?.username || 'Studio Producer');
  const [bpm, setBpm] = useState(120);
  const [keySignature, setKeySignature] = useState('C Major');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [includeStarterLyrics, setIncludeStarterLyrics] = useState(true);

  if (!isOpen) return null;

  // Handle template selection & sync default tempo/key
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setBpm(template.defaultBpm);
    setKeySignature(template.defaultKey);
    setTimeSignature(template.timeSignature);
  };

  // Generate a random song title
  const handleRandomizeTitle = () => {
    const pick = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
    setSongTitle(pick);
  };

  // Submit and create the new project
  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate waveforms for each track
    const tracksWithWaveforms = selectedTemplate.tracks.map((t) => ({
      ...t,
      isMuted: false,
      isSolo: false,
      isArmed: false,
      waveform: Array.from({ length: 64 }, () => Math.random() * 0.7 + 0.15),
    }));

    // Generate lyrical structure
    const hasStarterLyrics = includeStarterLyrics && selectedTemplate.starterLyrics && selectedTemplate.starterLyrics.length > 0;
    const lyricsData = {
      title: songTitle.trim() || 'Untitled Project',
      artist: artistName.trim() || 'Producer',
      genre: selectedTemplate.name,
      structure: [
        {
          section: 'Verse 1',
          lines: hasStarterLyrics ? selectedTemplate.starterLyrics.slice(0, 3) : [
            { text: '[0:00] (Start composing your song here)', timestamp: 0 },
            { text: '[0:08] Write verse lyrics...', timestamp: 8 },
          ],
        },
        {
          section: 'Chorus',
          lines: hasStarterLyrics ? selectedTemplate.starterLyrics.slice(3) : [
            { text: '[0:16] Write chorus hook...', timestamp: 16 },
            { text: '[0:24] Peak melodic hook...', timestamp: 24 },
          ],
        },
      ],
    };

    const newProject = {
      id: `project-${Date.now()}`,
      title: songTitle.trim() || 'Untitled Project',
      artist: artistName.trim() || 'Producer',
      badge: selectedTemplate.badge,
      bpm: Number(bpm) || 120,
      keySignature,
      timeSignature,
      genre: selectedTemplate.name,
      description: selectedTemplate.description,
      audioPattern: selectedTemplate.audioPattern,
      tracks: tracksWithWaveforms,
      lyrics: lyricsData,
    };

    onCreateSong(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none transition-colors">
      <div className="w-full max-w-2xl bg-studio-card border border-studio-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-studio-border flex items-center justify-between bg-studio-darker">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: accent.gradient }}
            >
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-studio-text flex items-center space-x-1.5">
                <span>Create New Song Project</span>
                <span
                  className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded text-white font-bold tracking-wider"
                  style={{ background: accent.primary }}
                >
                  DAW Studio
                </span>
              </h2>
              <p className="text-xs text-studio-textMuted">
                Configure your song tempo, scale, channel racks, and starting template
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Song Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-studio-text">
                  Song Title
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeTitle}
                  className="text-[10px] font-mono text-cyan-500 hover:underline flex items-center space-x-1"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="e.g. Neon Horizon"
                className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3.5 py-2 text-sm text-studio-text font-medium focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold tracking-wider text-studio-text mb-1.5">
                Artist / Producer
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Producer Name"
                className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3.5 py-2 text-sm text-studio-text font-medium focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* 2. Choose Starting Genre / Template */}
          <div>
            <label className="block text-xs font-mono uppercase font-bold tracking-wider text-studio-text mb-2">
              Select Starting Production Template ({GENRE_TEMPLATES.length} Styles)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GENRE_TEMPLATES.map((tpl) => {
                const IconComponent = tpl.icon;
                const isSelected = selectedTemplate.id === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-studio-darker shadow-md ring-2 ring-cyan-500/30'
                        : 'border-studio-border bg-studio-darkest hover:bg-studio-cardHover'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                          style={{
                            background: isSelected ? accent.gradient : 'rgba(100, 116, 139, 0.4)',
                          }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-studio-text">{tpl.name}</div>
                          <span className="text-[9px] font-mono text-cyan-500 font-semibold">
                            {tpl.tracks.length === 0 ? '0 Channels (Empty)' : `${tpl.tracks.length} Channels`} • {tpl.defaultBpm} BPM
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                          style={{ background: accent.primary }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-studio-textMuted mt-2 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tempo, Key Signature, & Time Signature */}
          <div className="bg-studio-darker p-3.5 rounded-xl border border-studio-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tempo BPM */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono uppercase font-bold text-studio-text">Tempo (BPM)</span>
                  <span className="text-xs font-mono font-bold text-cyan-500">{bpm}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="190"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-1.5 bg-studio-darkest rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-2"
                />
                {/* Quick BPM buttons */}
                <div className="flex space-x-1">
                  {[65, 80, 110, 124, 140].map((quickBpm) => (
                    <button
                      key={quickBpm}
                      type="button"
                      onClick={() => setBpm(quickBpm)}
                      className={`flex-1 py-0.5 rounded text-[9px] font-mono font-semibold transition-colors border ${
                        bpm === quickBpm
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-studio-text'
                      }`}
                    >
                      {quickBpm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Signature */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-studio-text mb-1">
                  Key Signature
                </label>
                <select
                  value={keySignature}
                  onChange={(e) => setKeySignature(e.target.value)}
                  className="w-full bg-studio-darkest border border-studio-border rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-studio-text focus:outline-none focus:border-cyan-500"
                >
                  {KEY_OPTIONS.map((key) => (
                    <option key={key} value={key} className="bg-slate-900 text-white">
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Signature */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-studio-text mb-1">
                  Time Signature
                </label>
                <select
                  value={timeSignature}
                  onChange={(e) => setTimeSignature(e.target.value)}
                  className="w-full bg-studio-darkest border border-studio-border rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-studio-text focus:outline-none focus:border-cyan-500"
                >
                  <option value="4/4" className="bg-slate-900 text-white">4/4 (Common)</option>
                  <option value="3/4" className="bg-slate-900 text-white">3/4 (Waltz)</option>
                  <option value="6/8" className="bg-slate-900 text-white">6/8 (Ballad)</option>
                </select>
              </div>
            </div>

            {/* Starter Lyrics Option */}
            <div className="pt-2 border-t border-studio-border flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStarterLyrics}
                  onChange={(e) => setIncludeStarterLyrics(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 border-studio-border"
                />
                <span className="text-xs text-studio-text font-medium">
                  Initialize Teleprompter with songwriting lyric cues
                </span>
              </label>
              <span className="text-[10px] font-mono text-cyan-500 font-bold">Auto-Synced</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover transition-colors border border-studio-border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ background: accent.gradient }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create & Launch Studio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
