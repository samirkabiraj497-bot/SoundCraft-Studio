import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { audioEngine } from '../audio/synthEngine';
import { drumEngine } from '../audio/drumEngine';
import { Keyboard, Radio, Sparkles, Square, Plus, Play, Circle } from 'lucide-react';

const WHITE_KEYS = [
  { note: 'C', qwerty: 'A', qwerty2: 'K' },
  { note: 'D', qwerty: 'S', qwerty2: 'L' },
  { note: 'E', qwerty: 'D', qwerty2: ';' },
  { note: 'F', qwerty: 'F', qwerty2: "'" },
  { note: 'G', qwerty: 'G', qwerty2: 'M' },
  { note: 'A', qwerty: 'H', qwerty2: ',' },
  { note: 'B', qwerty: 'J', qwerty2: '/' },
];

const BLACK_KEYS = [
  { note: 'C#', qwerty: 'W', qwerty2: 'O', offset: 'left-[14%]' },
  { note: 'D#', qwerty: 'E', qwerty2: 'P', offset: 'left-[28%]' },
  { note: 'F#', qwerty: 'T', qwerty2: '[', offset: 'left-[57%]' },
  { note: 'G#', qwerty: 'Y', qwerty2: ']', offset: 'left-[71%]' },
  { note: 'A#', qwerty: 'U', qwerty2: '.', offset: 'left-[85%]' },
];

const DRUM_PADS = [
  { id: 'pad-0', label: '808 Kick', key: '1', color: '#06b6d4' },
  { id: 'pad-1', label: 'Snare Crack', key: '2', color: '#3b82f6' },
  { id: 'pad-2', label: 'Closed Hat', key: '3', color: '#10b981' },
  { id: 'pad-3', label: 'Stereo Clap', key: '4', color: '#a855f7' },
  { id: 'pad-4', label: 'Sub 808 Boom', key: '5', color: '#f59e0b' },
  { id: 'pad-5', label: 'Floor Tom', key: '6', color: '#ef4444' },
  { id: 'pad-6', label: 'Mid Tom', key: '7', color: '#ec4899' },
  { id: 'pad-7', label: 'Hi Tom', key: '8', color: '#8b5cf6' },
];

export default function PianoRollKeyboard({
  activeInstrument,
  recordingMode,
  onStartRecording,
  onStopRecording,
  recordingSeconds = 0,
  lastRecordedInstrument,
  onAddRecordedInstrument,
  onAddInstrumentTrack,
}) {
  const { accent, isDark } = useTheme();
  const [octave, setOctave] = useState(4);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [activePads, setActivePads] = useState(new Set());
  const [midiStatus, setMidiStatus] = useState('Checking MIDI...');
  const [viewMode, setViewMode] = useState('keys');

  // Ref to track keys currently held down to prevent duplicate keydown triggers
  const activeKeysRef = useRef(new Set());

  // Trigger Note On
  const handleNoteOn = useCallback(
    (noteWithOctave) => {
      setActiveNotes((prev) => new Set(prev).add(noteWithOctave));
      audioEngine.triggerNoteOn(noteWithOctave, activeInstrument);
    },
    [activeInstrument]
  );

  // Trigger Note Off
  const handleNoteOff = useCallback((noteWithOctave) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(noteWithOctave);
      return next;
    });
    audioEngine.triggerNoteOff(noteWithOctave);
  }, []);

  // Trigger Drum Pad
  const handlePadTrigger = useCallback((padId) => {
    setActivePads((prev) => new Set(prev).add(padId));
    drumEngine.triggerPad(padId);
    setTimeout(() => {
      setActivePads((prev) => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 150);
  }, []);

  // Web MIDI API connection
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((midiAccess) => {
          let inputsCount = 0;
          for (const input of midiAccess.inputs.values()) {
            inputsCount++;
            input.onmidimessage = (msg) => {
              const [status, noteNumber, velocity] = msg.data;
              const command = status >> 4;
              const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              const noteName = notes[noteNumber % 12];
              const noteOctave = Math.floor(noteNumber / 12) - 1;
              const fullNote = `${noteName}${noteOctave}`;

              if (command === 9 && velocity > 0) {
                handleNoteOn(fullNote);
              } else if (command === 8 || (command === 9 && velocity === 0)) {
                handleNoteOff(fullNote);
              }
            };
          }
          setMidiStatus(inputsCount > 0 ? `MIDI Active (${inputsCount} dev)` : 'No MIDI Controller detected');
        })
        .catch(() => {
          setMidiStatus('MIDI not supported');
        });
    } else {
      setMidiStatus('MIDI API not available');
    }
  }, [handleNoteOn, handleNoteOff]);

  // Global QWERTY Physical Keyboard Listener
  useEffect(() => {
    const keyToNoteMap = {
      // Octave 1
      a: `C${octave}`,
      w: `C#${octave}`,
      s: `D${octave}`,
      e: `D#${octave}`,
      d: `E${octave}`,
      f: `F${octave}`,
      t: `F#${octave}`,
      g: `G${octave}`,
      y: `G#${octave}`,
      h: `A${octave}`,
      u: `A#${octave}`,
      j: `B${octave}`,

      // Octave 2
      k: `C${octave + 1}`,
      o: `C#${octave + 1}`,
      l: `D${octave + 1}`,
      p: `D#${octave + 1}`,
      ';': `E${octave + 1}`,
      "'": `F${octave + 1}`,
      '[': `F#${octave + 1}`,
      ']': `G#${octave + 1}`,
      m: `G${octave + 1}`,
      ',': `A${octave + 1}`,
      '.': `A#${octave + 1}`,
      '/': `B${octave + 1}`,
    };

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input field or text area
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      const key = e.key.toLowerCase();

      // Octave shift hotkeys: Z (down), X (up)
      if (key === 'z') {
        e.preventDefault();
        setOctave((o) => Math.max(1, o - 1));
        return;
      }
      if (key === 'x') {
        e.preventDefault();
        setOctave((o) => Math.min(7, o + 1));
        return;
      }

      // Drum pads 1-8
      if (key >= '1' && key <= '8') {
        e.preventDefault();
        const padIndex = parseInt(key, 10) - 1;
        handlePadTrigger(`pad-${padIndex}`);
        return;
      }

      const note = keyToNoteMap[key];
      if (note) {
        e.preventDefault();
        if (!activeKeysRef.current.has(key)) {
          activeKeysRef.current.add(key);
          handleNoteOn(note);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      const key = e.key.toLowerCase();
      const note = keyToNoteMap[key];
      if (note) {
        activeKeysRef.current.delete(key);
        handleNoteOff(note);
      }
    };

    const handleWindowBlur = () => {
      activeKeysRef.current.forEach((k) => {
        const note = keyToNoteMap[k];
        if (note) handleNoteOff(note);
      });
      activeKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [octave, handleNoteOn, handleNoteOff, handlePadTrigger]);

  return (
    <div className="bg-studio-darker border-t border-studio-border p-3 flex flex-col select-none text-studio-text transition-colors">
      {/* Keyboard Header Controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-studio-border flex-wrap gap-2">
        <div className="flex items-center space-x-3 flex-wrap gap-1.5">
          <div className="flex items-center space-x-1.5">
            <Keyboard className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-xs font-bold text-studio-text">Live Input Engine</span>
          </div>

          {/* Active Instrument Display */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-studio-card border border-studio-border text-xs shadow-sm">
            <span className="text-studio-textMuted">Target:</span>
            <span className="font-semibold text-studio-text">{activeInstrument?.name || 'Grand Piano'}</span>
          </div>

          {/* Live Keyboard Hotkeys Guide Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            <span>Keyboard Active: [A-J] Keys • [Z/X: Octave] • [1-8: Drums]</span>
          </div>

          {/* Web MIDI Status */}
          <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-studio-textMuted">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>{midiStatus}</span>
          </div>
        </div>

        {/* Record Inbuilt Instrument & Add to Main Track Action Bar */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          {/* 1. Record / Stop Recording Inbuilt Instrument */}
          {recordingMode === 'instruments' ? (
            <button
              onClick={onStopRecording}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-md ring-2 ring-rose-400/50 animate-pulse transition-all"
              title="Stop recording and immediately add recorded instrument clip into main multitrack timeline"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop & Add to Main Track ({recordingSeconds}s)</span>
            </button>
          ) : (
            <button
              onClick={() => onStartRecording && onStartRecording('instruments')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-studio-card hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500 text-xs font-mono font-bold shadow-sm transition-all"
              title="Record what you play on this instrument directly into the main track"
            >
              <Circle className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>Record Instrument</span>
            </button>
          )}

          {/* 2. Add Last Recorded Instrument Clip to Main Track */}
          {lastRecordedInstrument && (
            <button
              onClick={() => onAddRecordedInstrument && onAddRecordedInstrument(lastRecordedInstrument)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-sm transition-transform hover:scale-105 active:scale-95"
              title={`Add "${lastRecordedInstrument.name}" to main multitrack timeline`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recorded Inst to Main Track</span>
            </button>
          )}

          {/* 3. Add Inbuilt Instrument Channel to Main Track */}
          <button
            onClick={() => onAddInstrumentTrack && onAddInstrumentTrack(activeInstrument)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text text-xs font-medium shadow-sm transition-colors"
            title="Add this virtual instrument as a new channel on the main multitrack timeline"
          >
            <Plus className="w-3 h-3 text-cyan-500" />
            <span className="hidden sm:inline">Add Instrument to Main Track</span>
            <span className="sm:hidden">Add Track</span>
          </button>
        </div>

        {/* Octave & View Mode Controls */}
        <div className="flex items-center space-x-2">
          {/* Octave Shifter */}
          <div className="flex items-center space-x-1 bg-studio-card border border-studio-border rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setOctave((o) => Math.max(1, o - 1))}
              className="px-2 py-0.5 text-xs font-bold hover:bg-studio-cardHover rounded text-studio-text"
              title="Lower Octave (Hotkey: Z)"
            >
              -
            </button>
            <span className="px-2 text-xs font-mono font-bold text-cyan-500">OCT {octave}</span>
            <button
              onClick={() => setOctave((o) => Math.min(7, o + 1))}
              className="px-2 py-0.5 text-xs font-bold hover:bg-studio-cardHover rounded text-studio-text"
              title="Higher Octave (Hotkey: X)"
            >
              +
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center space-x-1 bg-studio-card border border-studio-border rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('keys')}
              className={`px-2 py-1 rounded text-xs transition-colors font-bold ${
                viewMode === 'keys' ? 'bg-cyan-500 text-white shadow-sm' : 'text-studio-textMuted hover:text-studio-text'
              }`}
            >
              Keys
            </button>
            <button
              onClick={() => setViewMode('pads')}
              className={`px-2 py-1 rounded text-xs transition-colors font-bold ${
                viewMode === 'pads' ? 'bg-cyan-500 text-white shadow-sm' : 'text-studio-textMuted hover:text-studio-text'
              }`}
            >
              Pads
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`hidden sm:block px-2 py-1 rounded text-xs transition-colors font-bold ${
                viewMode === 'both' ? 'bg-cyan-500 text-white shadow-sm' : 'text-studio-textMuted hover:text-studio-text'
              }`}
            >
              Split View
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-center">
        {/* DRUM TRIGGER PADS */}
        {(viewMode === 'pads' || viewMode === 'both') && (
          <div className="flex-1 max-w-xl grid grid-cols-4 gap-2">
            {DRUM_PADS.map((pad) => {
              const isTriggered = activePads.has(pad.id);
              return (
                <button
                  key={pad.id}
                  onMouseDown={() => handlePadTrigger(pad.id)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePadTrigger(pad.id);
                  }}
                  className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition-all active:scale-95 shadow-md ${
                    isTriggered
                      ? 'scale-95 brightness-150 ring-2 ring-white shadow-lg'
                      : 'bg-studio-card border-studio-border hover:border-cyan-500/60'
                  }`}
                  style={{
                    backgroundColor: isTriggered ? pad.color : undefined,
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-mono px-1 rounded bg-black/30 text-white font-bold">
                      [{pad.key}]
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: pad.color }} />
                  </div>
                  <span className={`text-xs font-bold text-left truncate w-full ${isTriggered ? 'text-white' : 'text-studio-text'}`}>
                    {pad.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* PIANO KEYBOARD */}
        {(viewMode === 'keys' || viewMode === 'both') && (
          <div className="flex-1 flex justify-center overflow-x-auto py-1">
            <div className="flex relative select-none">
              {[octave, octave + 1].map((currOct, octIdx) => (
                <div key={currOct} className="flex relative">
                  {/* 7 White Keys */}
                  {WHITE_KEYS.map((k) => {
                    const fullNote = `${k.note}${currOct}`;
                    const isPressed = activeNotes.has(fullNote);
                    const qwertyLabel = octIdx === 0 ? k.qwerty : k.qwerty2;

                    return (
                      <div
                        key={fullNote}
                        onMouseDown={() => handleNoteOn(fullNote)}
                        onMouseUp={() => handleNoteOff(fullNote)}
                        onMouseLeave={() => isPressed && handleNoteOff(fullNote)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleNoteOn(fullNote);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleNoteOff(fullNote);
                        }}
                        className={`w-10 sm:w-12 h-36 border border-slate-400 rounded-b-md cursor-pointer transition-all flex flex-col justify-end items-center pb-2 z-0 relative shadow-sm ${
                          isPressed
                            ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/50 translate-y-0.5'
                            : 'bg-white hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold font-mono">{k.note}</span>
                        {qwertyLabel && (
                          <span className="text-[9px] text-slate-500 font-mono font-bold">[{qwertyLabel}]</span>
                        )}
                      </div>
                    );
                  })}

                  {/* 5 Black Keys */}
                  {BLACK_KEYS.map((k) => {
                    const fullNote = `${k.note}${currOct}`;
                    const isPressed = activeNotes.has(fullNote);
                    const qwertyLabel = octIdx === 0 ? k.qwerty : k.qwerty2;

                    return (
                      <div
                        key={fullNote}
                        onMouseDown={() => handleNoteOn(fullNote)}
                        onMouseUp={() => handleNoteOff(fullNote)}
                        onMouseLeave={() => isPressed && handleNoteOff(fullNote)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleNoteOn(fullNote);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleNoteOff(fullNote);
                        }}
                        className={`absolute top-0 w-6 sm:w-7 h-24 rounded-b-md z-10 cursor-pointer transition-all flex flex-col justify-end items-center pb-1.5 -ml-3 ${k.offset} ${
                          isPressed
                            ? 'bg-cyan-500 text-white shadow-md ring-2 ring-white translate-y-0.5'
                            : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-cyan-400 font-bold">{k.note}</span>
                        {qwertyLabel && (
                          <span className="text-[8px] text-slate-400 font-mono font-bold">[{qwertyLabel}]</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
