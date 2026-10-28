import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { audioEngine } from '../audio/synthEngine';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Circle,
  Volume2,
  VolumeX,
  Download,
  Zap,
  Mic,
  Radio,
} from 'lucide-react';

export default function TransportBar({
  isPlaying,
  onTogglePlay,
  onStop,
  bpm,
  setBpm,
  isLooping,
  setIsLooping,
  recordingMode,
  onStartRecording,
  onStopRecording,
  recordingSeconds = 0,
  currentTime,
  onOpenExport,
  keySignature = 'G Major',
  timeSignature = '4/4',
}) {
  const { accent } = useTheme();
  const [masterVol, setMasterVol] = useState(85);
  const [tapTimes, setTapTimes] = useState([]);

  // Sync volume with Web Audio Master Gain
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setMasterVol(val);
    audioEngine.setMasterVolume(val / 100);
  };

  // BPM Tap Tempo logic
  const handleTapTempo = () => {
    const now = performance.now();
    const newTaps = [...tapTimes, now].filter((t) => now - t < 3000);
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Format timecode (00:00:00)
  const formatTimecode = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const currentBar = Math.floor((currentTime * (bpm / 60)) / 4) + 1;
  const currentBeat = Math.floor((currentTime * (bpm / 60)) % 4) + 1;

  return (
    <div className="h-16 bg-studio-darker border-b border-studio-border px-4 flex items-center justify-between text-studio-text select-none transition-colors">
      {/* Playback & Record Transport Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.currentTarget.blur();
            onTogglePlay();
          }}
          onKeyDown={(e) => {
            if (e.code === 'Space') {
              e.preventDefault();
            }
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: accent.gradient }}
          title={isPlaying ? 'Pause Playback (Space)' : 'Start Playback (Space)'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={(e) => {
            e.currentTarget.blur();
            onStop();
          }}
          onKeyDown={(e) => {
            if (e.code === 'Space') {
              e.preventDefault();
            }
          }}
          className="w-9 h-9 rounded-lg bg-studio-card border border-studio-border hover:bg-studio-cardHover flex items-center justify-center text-studio-text transition-colors shadow-sm"
          title="Stop All Audio (Immediate Silence)"
        >
          <Square className="w-4 h-4 fill-current text-rose-500" />
        </button>

        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`w-9 h-9 rounded-lg border transition-all flex items-center justify-center shadow-sm ${
            isLooping
              ? 'bg-studio-card text-cyan-500 border-cyan-500 shadow-sm'
              : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-studio-text'
          }`}
          title="Loop Playback (L)"
        >
          <Repeat className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-studio-border mx-1" />

        {/* RECORD OPTION 1: INBUILT INSTRUMENTS */}
        <button
          onClick={() => {
            if (recordingMode === 'instruments') {
              onStopRecording();
            } else {
              onStartRecording('instruments');
            }
          }}
          className={`h-9 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
            recordingMode === 'instruments'
              ? 'bg-rose-500/20 text-rose-500 border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
              : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-cyan-500 hover:border-cyan-500'
          }`}
          title="Record Inbuilt Instruments (Synths, Piano, Drum Pads, Scratch)"
        >
          <Radio className={`w-3.5 h-3.5 ${recordingMode === 'instruments' ? 'text-rose-500 animate-spin' : 'text-cyan-500'}`} />
          <span className="hidden sm:inline">
            {recordingMode === 'instruments' ? `REC Inst (${recordingSeconds}s)` : 'Rec Instruments'}
          </span>
          <span className="sm:hidden font-bold">Inst</span>
        </button>

        {/* RECORD OPTION 2: MICROPHONE / SINGING */}
        <button
          onClick={() => {
            if (recordingMode === 'mic') {
              onStopRecording();
            } else {
              onStartRecording('mic');
            }
          }}
          className={`h-9 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
            recordingMode === 'mic'
              ? 'bg-rose-500/20 text-rose-500 border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
              : 'bg-studio-card border-studio-border text-studio-textMuted hover:text-rose-500 hover:border-rose-500'
          }`}
          title="Record Live Singing / Vocals via Microphone"
        >
          <Mic className={`w-3.5 h-3.5 ${recordingMode === 'mic' ? 'text-rose-500 animate-bounce' : 'text-rose-500'}`} />
          <span className="hidden sm:inline">
            {recordingMode === 'mic' ? `REC Mic (${recordingSeconds}s)` : 'Rec Singing'}
          </span>
          <span className="sm:hidden font-bold">Mic</span>
        </button>
      </div>

      {/* Center Displays: Bar/Beat, Timecode, BPM, Key */}
      <div className="flex items-center space-x-4 bg-studio-card px-4 py-1.5 rounded-xl border border-studio-border shadow-sm transition-colors">
        {/* Bars and Beats */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono tracking-widest text-studio-textMuted font-semibold">Position</span>
          <div className="text-sm font-mono font-bold text-studio-text tracking-wider">
            {String(currentBar).padStart(2, '0')}.{String(currentBeat).padStart(2, '0')}
          </div>
        </div>

        <div className="h-6 w-px bg-studio-border" />

        {/* Timecode */}
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-[9px] uppercase font-mono tracking-widest text-studio-textMuted font-semibold">Timecode</span>
          <div className="text-xs font-mono text-cyan-500 font-bold">
            {formatTimecode(currentTime)}
          </div>
        </div>

        <div className="h-6 w-px bg-studio-border" />

        {/* BPM Tempo & Tap */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-mono tracking-widest text-studio-textMuted font-semibold">BPM</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-14 bg-studio-darkest border border-studio-border rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-studio-text focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={handleTapTempo}
            className="text-[10px] font-mono px-2 py-1 rounded bg-studio-darkest hover:bg-studio-cardHover border border-studio-border text-studio-text transition-colors uppercase font-semibold tracking-wider flex items-center space-x-1"
            title="Tap repeatedly to set tempo"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Tap</span>
          </button>
        </div>

        <div className="hidden lg:block h-6 w-px bg-studio-border" />

        {/* Time Signature & Key */}
        <div className="hidden lg:flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono tracking-widest text-studio-textMuted font-semibold">Key / Sig</span>
          <div className="text-xs font-mono text-studio-text font-medium">{keySignature} • {timeSignature}</div>
        </div>
      </div>

      {/* Right Controls: Master Volume, Stereo VU Meter, Export Action */}
      <div className="flex items-center space-x-4">
        {/* Master Output Volume & Stereo VU Meter */}
        <div className="flex items-center space-x-2">
          {masterVol === 0 ? (
            <VolumeX className="w-4 h-4 text-studio-textMuted" />
          ) : (
            <Volume2 className="w-4 h-4 text-studio-textMuted" />
          )}

          <input
            type="range"
            min="0"
            max="100"
            value={masterVol}
            onChange={handleVolumeChange}
            className="w-20 md:w-24 h-1.5 bg-studio-darkest rounded-lg appearance-none cursor-pointer accent-cyan-500"
            title={`Master Volume: ${masterVol}%`}
          />

          {/* Stereo VU Visualizer Meter */}
          <div className="flex space-x-0.5 h-6 items-end p-0.5 bg-black/40 rounded border border-studio-border">
            <div
              className={`w-1 rounded-sm transition-all duration-75 ${isPlaying ? 'bg-gradient-to-t from-emerald-500 via-yellow-400 to-rose-500' : 'bg-slate-500'}`}
              style={{ height: isPlaying ? `${Math.min(100, masterVol * 0.9)}%` : '15%' }}
            />
            <div
              className={`w-1 rounded-sm transition-all duration-75 ${isPlaying ? 'bg-gradient-to-t from-emerald-500 via-yellow-400 to-rose-500' : 'bg-slate-500'}`}
              style={{ height: isPlaying ? `${Math.min(100, masterVol * 0.85)}%` : '15%' }}
            />
          </div>
        </div>

        {/* One-Click Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: accent.gradient }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Audio</span>
        </button>
      </div>
    </div>
  );
}
