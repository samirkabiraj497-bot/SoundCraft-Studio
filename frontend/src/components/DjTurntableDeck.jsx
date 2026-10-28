import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { audioEngine } from '../audio/synthEngine';
import {
  Play,
  Pause,
  Disc3,
  Zap,
} from 'lucide-react';

export default function DjTurntableDeck() {
  const { accent, isDark } = useTheme();

  // Deck A State
  const [deckAPlaying, setDeckAPlaying] = useState(false);
  const [deckAPitch, setDeckAPitch] = useState(0); // +/- 16%
  const [deckABpm, setDeckABpm] = useState(124);
  const [deckARotation, setDeckARotation] = useState(0);

  // Deck B State
  const [deckBPlaying, setDeckBPlaying] = useState(false);
  const [deckBPitch, setDeckBPitch] = useState(0);
  const [deckBBpm, setDeckBBpm] = useState(128);
  const [deckBRotation, setDeckBRotation] = useState(0);

  // Crossfader: -1.0 (100% Deck A) to 0.0 (Equal Blend) to +1.0 (100% Deck B)
  const [crossfader, setCrossfader] = useState(0);

  // Vinyl Drag Scratch Refs
  const isDraggingA = useRef(false);
  const lastMouseYA = useRef(0);
  const isDraggingB = useRef(false);
  const lastMouseYB = useRef(0);

  // Turntable Motor Animation Loop
  useEffect(() => {
    let animId;
    const updateRotation = () => {
      if (deckAPlaying) {
        const speedA = 1.8 * (1 + deckAPitch / 100);
        setDeckARotation((prev) => (prev + speedA) % 360);
      }
      if (deckBPlaying) {
        const speedB = 1.8 * (1 + deckBPitch / 100);
        setDeckBRotation((prev) => (prev + speedB) % 360);
      }
      animId = requestAnimationFrame(updateRotation);
    };
    animId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animId);
  }, [deckAPlaying, deckAPitch, deckBPlaying, deckBPitch]);

  // Deck A Scratch Mouse Handlers
  const handleMouseDownA = (e) => {
    isDraggingA.current = true;
    lastMouseYA.current = e.clientY;
    audioEngine.playScratch(1, 0.8);
  };

  const handleMouseMoveA = (e) => {
    if (!isDraggingA.current) return;
    const deltaY = e.clientY - lastMouseYA.current;
    if (Math.abs(deltaY) > 4) {
      const dir = deltaY > 0 ? 1 : -1;
      setDeckARotation((prev) => prev + deltaY * 1.5);
      audioEngine.playScratch(dir, Math.min(1.5, Math.abs(deltaY) / 10));
      lastMouseYA.current = e.clientY;
    }
  };

  const handleMouseUpA = () => {
    isDraggingA.current = false;
  };

  // Deck B Scratch Mouse Handlers
  const handleMouseDownB = (e) => {
    isDraggingB.current = true;
    lastMouseYB.current = e.clientY;
    audioEngine.playScratch(1, 0.8);
  };

  const handleMouseMoveB = (e) => {
    if (!isDraggingB.current) return;
    const deltaY = e.clientY - lastMouseYB.current;
    if (Math.abs(deltaY) > 4) {
      const dir = deltaY > 0 ? 1 : -1;
      setDeckBRotation((prev) => prev + deltaY * 1.5);
      audioEngine.playScratch(dir, Math.min(1.5, Math.abs(deltaY) / 10));
      lastMouseYB.current = e.clientY;
    }
  };

  const handleMouseUpB = () => {
    isDraggingB.current = false;
  };

  // Tempo Sync Deck B to Deck A
  const handleSyncBtoA = () => {
    setDeckBBpm(deckABpm);
    setDeckBPitch(deckAPitch);
  };

  // Tempo Sync Deck A to Deck B
  const handleSyncAtoB = () => {
    setDeckABpm(deckBBpm);
    setDeckAPitch(deckBPitch);
  };

  return (
    <div
      onMouseUp={() => {
        handleMouseUpA();
        handleMouseUpB();
      }}
      className="p-4 bg-studio-darkest text-studio-text select-none overflow-y-auto transition-colors"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-studio-border">
        <div className="flex items-center space-x-2">
          <Disc3 className="w-5 h-5 text-cyan-500 animate-spin" />
          <h2 className="text-base font-bold text-studio-text tracking-wide">
            Dual Virtual DJ Turntable Decks
          </h2>
          <span className="text-[10px] font-mono uppercase bg-studio-card px-2 py-0.5 rounded border border-studio-border text-studio-textMuted font-semibold shadow-sm">
            Scratch & Live Mix Engine
          </span>
        </div>

        <div className="text-xs text-studio-textMuted font-mono hidden sm:block">
          Click & Drag Vinyl to Scratch Live
        </div>
      </div>

      {/* Main Dual Deck Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* ================= DECK A (LEFT) ================= */}
        <div className="lg:col-span-5 bg-studio-card border border-studio-border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-studio-text uppercase tracking-wider">Deck A: Master</span>
            </div>
            <div className="text-xs font-mono font-bold text-cyan-500">
              {Math.round(deckABpm * (1 + deckAPitch / 100))} BPM
            </div>
          </div>

          {/* Interactive Scratch Vinyl Platter */}
          <div className="flex justify-center items-center py-4 relative">
            <div
              onMouseDown={handleMouseDownA}
              onMouseMove={handleMouseMoveA}
              style={{ transform: `rotate(${deckARotation}deg)` }}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full vinyl-grooves relative cursor-grab active:cursor-grabbing border-4 border-slate-900 shadow-2xl flex items-center justify-center transition-transform duration-75"
            >
              {/* Center Vinyl Label */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-inner"
                style={{ background: accent.gradient }}
              >
                <span className="text-[9px] font-mono uppercase font-black text-slate-900 tracking-wider">
                  DECK A
                </span>
                <span className="text-[8px] font-mono text-slate-950 font-bold">SoundCraft</span>
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 mt-1" />
              </div>

              {/* White Turntable Marker Strobe */}
              <div className="absolute top-2 w-1.5 h-4 bg-white/90 rounded-sm" />
            </div>

            {/* Tonearm graphic overlay */}
            <div className="absolute right-4 top-2 pointer-events-none hidden sm:block">
              <div className="w-2 h-28 bg-slate-400 rotate-12 origin-top rounded shadow-md border border-slate-600" />
            </div>
          </div>

          {/* Deck A Pitch Fader & Controls */}
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-studio-textMuted">Pitch Fader</span>
              <span className="text-cyan-500 font-bold">
                {deckAPitch >= 0 ? `+${deckAPitch}%` : `${deckAPitch}%`}
              </span>
            </div>

            <input
              type="range"
              min="-16"
              max="16"
              step="0.5"
              value={deckAPitch}
              onChange={(e) => setDeckAPitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-studio-darkest rounded appearance-none cursor-pointer accent-cyan-500"
            />

            {/* Loop Pads */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {['1/4', '1/2', '1', '2', '4'].map((loop) => (
                <button
                  key={loop}
                  onClick={() => audioEngine.playScratch(1, 0.5)}
                  className="flex-1 py-1 rounded bg-studio-darkest hover:bg-studio-cardHover text-[10px] font-mono border border-studio-border text-studio-text font-semibold shadow-sm"
                >
                  {loop}
                </button>
              ))}
            </div>

            {/* Transport: Play, Cue, Sync */}
            <div className="flex items-center space-x-2 pt-2 border-t border-studio-border">
              <button
                onClick={() => setDeckAPlaying(!deckAPlaying)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102"
                style={{ background: accent.gradient }}
              >
                {deckAPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{deckAPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setDeckARotation(0);
                  audioEngine.playScratch(-1, 1.2);
                }}
                className="px-3 py-2 rounded-xl bg-studio-darkest hover:bg-studio-cardHover border border-studio-border text-xs font-bold text-studio-text"
              >
                Cue
              </button>

              <button
                onClick={handleSyncAtoB}
                className="px-3 py-2 rounded-xl bg-studio-darkest hover:bg-studio-cardHover border border-cyan-500/50 text-xs font-bold text-cyan-500 flex items-center space-x-1"
                title="Sync tempo with Deck B"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= CENTER MIXER & CROSSFADER ================= */}
        <div className="lg:col-span-2 flex flex-col items-center justify-between p-4 bg-studio-card border border-studio-border rounded-2xl h-full shadow-lg transition-colors">
          <span className="text-[10px] font-mono uppercase tracking-widest text-studio-textMuted font-bold">
            Studio Crossfader
          </span>

          {/* Dual VU Meter Visualizers */}
          <div className="flex space-x-4 my-6">
            {/* Left Deck Level */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[9px] font-mono text-cyan-500 font-bold">A</span>
              <div className="w-3 h-28 bg-studio-darkest rounded-full p-0.5 flex flex-col-reverse overflow-hidden border border-studio-border">
                <div
                  className="w-full rounded-full transition-all duration-75 bg-gradient-to-t from-cyan-500 via-emerald-400 to-amber-400"
                  style={{
                    height: deckAPlaying ? `${Math.max(15, (1 - crossfader) * 45)}%` : '8%',
                  }}
                />
              </div>
            </div>

            {/* Right Deck Level */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[9px] font-mono text-purple-500 font-bold">B</span>
              <div className="w-3 h-28 bg-studio-darkest rounded-full p-0.5 flex flex-col-reverse overflow-hidden border border-studio-border">
                <div
                  className="w-full rounded-full transition-all duration-75 bg-gradient-to-t from-purple-500 via-pink-400 to-rose-400"
                  style={{
                    height: deckBPlaying ? `${Math.max(15, (1 + crossfader) * 45)}%` : '8%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Master Crossfader Slider */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-studio-textMuted">
              <span className="font-bold text-cyan-500">Deck A</span>
              <span>Center</span>
              <span className="font-bold text-purple-500">Deck B</span>
            </div>

            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={crossfader}
              onChange={(e) => setCrossfader(parseFloat(e.target.value))}
              className="w-full h-2 bg-studio-darkest rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        {/* ================= DECK B (RIGHT) ================= */}
        <div className="lg:col-span-5 bg-studio-card border border-studio-border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold text-studio-text uppercase tracking-wider">Deck B: Live</span>
            </div>
            <div className="text-xs font-mono font-bold text-purple-500">
              {Math.round(deckBBpm * (1 + deckBPitch / 100))} BPM
            </div>
          </div>

          {/* Interactive Scratch Vinyl Platter */}
          <div className="flex justify-center items-center py-4 relative">
            <div
              onMouseDown={handleMouseDownB}
              onMouseMove={handleMouseMoveB}
              style={{ transform: `rotate(${deckBRotation}deg)` }}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full vinyl-grooves relative cursor-grab active:cursor-grabbing border-4 border-slate-900 shadow-2xl flex items-center justify-center transition-transform duration-75"
            >
              {/* Center Vinyl Label */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-inner"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <span className="text-[9px] font-mono uppercase font-black text-white tracking-wider">
                  DECK B
                </span>
                <span className="text-[8px] font-mono text-purple-200 font-bold">SoundCraft</span>
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 mt-1" />
              </div>

              {/* White Turntable Marker Strobe */}
              <div className="absolute top-2 w-1.5 h-4 bg-white/90 rounded-sm" />
            </div>

            {/* Tonearm graphic overlay */}
            <div className="absolute right-4 top-2 pointer-events-none hidden sm:block">
              <div className="w-2 h-28 bg-slate-400 rotate-12 origin-top rounded shadow-md border border-slate-600" />
            </div>
          </div>

          {/* Deck B Pitch Fader & Controls */}
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-studio-textMuted">Pitch Fader</span>
              <span className="text-purple-500 font-bold">
                {deckBPitch >= 0 ? `+${deckBPitch}%` : `${deckBPitch}%`}
              </span>
            </div>

            <input
              type="range"
              min="-16"
              max="16"
              step="0.5"
              value={deckBPitch}
              onChange={(e) => setDeckBPitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-studio-darkest rounded appearance-none cursor-pointer accent-purple-500"
            />

            {/* Loop Pads */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {['1/4', '1/2', '1', '2', '4'].map((loop) => (
                <button
                  key={loop}
                  onClick={() => audioEngine.playScratch(1, 0.5)}
                  className="flex-1 py-1 rounded bg-studio-darkest hover:bg-studio-cardHover text-[10px] font-mono border border-studio-border text-studio-text font-semibold shadow-sm"
                >
                  {loop}
                </button>
              ))}
            </div>

            {/* Transport: Play, Cue, Sync */}
            <div className="flex items-center space-x-2 pt-2 border-t border-studio-border">
              <button
                onClick={() => setDeckBPlaying(!deckBPlaying)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {deckBPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{deckBPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setDeckBRotation(0);
                  audioEngine.playScratch(-1, 1.2);
                }}
                className="px-3 py-2 rounded-xl bg-studio-darkest hover:bg-studio-cardHover border border-studio-border text-xs font-bold text-studio-text"
              >
                Cue
              </button>

              <button
                onClick={handleSyncBtoA}
                className="px-3 py-2 rounded-xl bg-studio-darkest hover:bg-studio-cardHover border border-purple-500/50 text-xs font-bold text-purple-500 flex items-center space-x-1"
                title="Sync tempo with Deck A"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
