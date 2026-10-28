import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { audioEngine } from '../audio/synthEngine';
import { drumEngine } from '../audio/drumEngine';
import { Sparkles, Play, Square, Plus, Loader2, Disc } from 'lucide-react';

export default function AiMusicianPanel({ onImportTracks, currentBpm }) {
  const { accent } = useTheme();
  const [genre, setGenre] = useState('synthwave');
  const [mood, setMood] = useState('Moody Cyberpunk');
  const [concept, setConcept] = useState('Driving 80s bassline with lush poly synth chords');
  const [loading, setLoading] = useState(false);
  const [generatedArrangement, setGeneratedArrangement] = useState(null);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);
  const auditionTimerRef = useRef(null);

  // Stop audition safely
  const stopAudition = () => {
    if (auditionTimerRef.current) {
      clearInterval(auditionTimerRef.current);
      auditionTimerRef.current = null;
    }
    audioEngine.stopAll();
    setIsPlayingAudition(false);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAudition();
    };
  }, []);

  // Trigger AI Arranger generation
  const handleGenerate = async () => {
    stopAudition();
    setLoading(true);
    try {
      const res = await api.generateArrangement({
        genre,
        mood,
        concept,
        userBpm: currentBpm,
      });
      if (res.success) {
        setGeneratedArrangement(res.arrangement);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Audition generated arrangement toggle (Play / Stop)
  const handleAuditionToggle = () => {
    if (!generatedArrangement) return;

    if (isPlayingAudition) {
      stopAudition();
      return;
    }

    setIsPlayingAudition(true);
    audioEngine.stopAll();

    // Play chord progression notes
    const chords = generatedArrangement.chordProgression || [];
    let step = 0;

    const playStep = () => {
      if (step < chords.length) {
        const chord = chords[step];
        chord.forEach((note) => audioEngine.playNote(note, 0.55, { type: 'sawtooth', cutoff: 2400 }));
        drumEngine.playKick(0.7);
        drumEngine.playHiHat(0.4);
        step++;
      } else {
        // Loop or finish
        step = 0;
      }
    };

    playStep();
    auditionTimerRef.current = setInterval(playStep, 700);
  };

  // Send tracks directly to Multitrack DAW
  const handleSendToDAW = () => {
    stopAudition();
    if (!generatedArrangement) return;
    onImportTracks(generatedArrangement.generatedTracks);
  };

  return (
    <div className="bg-studio-card border border-studio-border rounded-2xl p-5 flex flex-col justify-between select-none shadow-xl transition-colors">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ background: accent.gradient }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-studio-text">AI Session Musician & Arranger</h3>
            <p className="text-[11px] text-studio-textMuted">Generate backing drums, bass grooves & poly chord progressions.</p>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="mb-3">
          <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Target Genre</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {['synthwave', 'trap', 'lofi', 'deephouse', 'orchestral'].map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  genre === g
                    ? 'border-cyan-500 text-white shadow-sm'
                    : 'bg-studio-darkest/70 border-studio-border text-studio-textMuted hover:text-studio-text'
                }`}
                style={genre === g ? { background: accent.gradient } : {}}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Mood & Story Prompt */}
        <div className="mb-3">
          <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Mood / Atmosphere</label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. Euphoric late night drive, melancholic lo-fi..."
          />
        </div>

        {/* Concept description */}
        <div className="mb-4">
          <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Arrangement Prompt Concept</label>
          <textarea
            rows="2"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 resize-none transition-colors"
            placeholder="Describe your desired bassline, chord progression, or drum vibe..."
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 hover:opacity-95 active:scale-98 disabled:opacity-50"
          style={{ background: accent.gradient }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Harmony & Rhythm Grid...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Compose AI Backing Arrangement</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Arrangement Preview Card */}
      {generatedArrangement && (
        <div className="mt-4 p-3.5 bg-studio-darkest/90 border border-studio-border rounded-xl animate-in fade-in transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-studio-text flex items-center space-x-1.5">
              <Disc className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>{generatedArrangement.progressionName}</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-800/40">
              {generatedArrangement.keySignature} • {generatedArrangement.bpm} BPM
            </span>
          </div>

          <p className="text-[11px] text-studio-textMuted mb-3">
            Generated 3 multitrack stems: Poly Chords, 808 Bassline, and 16-step Drum Matrix.
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAuditionToggle}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                isPlayingAudition
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse'
                  : 'bg-studio-card border-studio-border hover:bg-studio-cardHover text-studio-text'
              }`}
            >
              {isPlayingAudition ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>Audition Groove</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendToDAW}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102"
              style={{ background: accent.gradient }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Load Into DAW</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
