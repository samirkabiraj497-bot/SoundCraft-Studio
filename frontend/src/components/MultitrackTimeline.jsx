import React, { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Volume2,
  VolumeX,
  Mic,
  Disc,
  Music,
  Plus,
  Trash2,
  Sliders,
  Layers,
  Play,
  Pause,
  Download,
  Radio,
  Square,
  Circle,
} from 'lucide-react';

export default function MultitrackTimeline({
  tracks = [],
  setTracks,
  currentTime,
  onSeekTime,
  totalDuration = 32, // seconds
  isPlaying,
  recordingMode,
  onStartRecording,
  onStopRecording,
  recordingSeconds = 0,
  lastRecordedInstrument,
  onAddRecordedInstrument,
  onAddInstrumentTrack,
  activeInstrument,
}) {
  const { accent, isDark } = useTheme();
  const timelineRef = useRef(null);
  const [activePreviewId, setActivePreviewId] = React.useState(null);
  const audioElementsRef = useRef(new Map());

  // Playhead scrubber position (percentage 0 to 100%)
  const playheadPercent = Math.min(100, (currentTime / totalDuration) * 100);

  // Timeline click to seek
  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = clickRatio * totalDuration;
    onSeekTime(targetSeconds);
  };

  // Toggle Mute
  const handleToggleMute = (trackId) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t))
    );
  };

  // Toggle Solo
  const handleToggleSolo = (trackId) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isSolo: !t.isSolo } : t))
    );
  };

  // Toggle Arm Record
  const handleToggleArm = (trackId) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isArmed: !t.isArmed } : t))
    );
  };

  // Change Volume
  const handleVolumeChange = (trackId, val) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume: val } : t))
    );
  };

  // Delete Track
  const handleDeleteTrack = (trackId) => {
    // Stop audio if previewing
    const el = audioElementsRef.current.get(trackId);
    if (el) {
      try {
        el.pause();
      } catch { }
      audioElementsRef.current.delete(trackId);
    }
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Toggle preview / audition of a recorded audio track clip
  const handleTogglePreviewAudio = (trackId, audioUrl) => {
    if (activePreviewId === trackId) {
      const el = audioElementsRef.current.get(trackId);
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
      setActivePreviewId(null);
    } else {
      audioElementsRef.current.forEach((el) => {
        try {
          el.pause();
          el.currentTime = 0;
        } catch { }
      });

      let el = audioElementsRef.current.get(trackId);
      if (!el) {
        el = new Audio(audioUrl);
        el.onended = () => setActivePreviewId(null);
        audioElementsRef.current.set(trackId, el);
      }
      el.play().catch(() => { });
      setActivePreviewId(trackId);
    }
  };

  // Add Empty Track
  const handleAddTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      name: `Instrument Clip #${tracks.length + 1}`,
      type: 'synth',
      color: accent.primary,
      volume: 0.8,
      pan: 0,
      isMuted: false,
      isSolo: false,
      isArmed: false,
      waveform: Array.from({ length: 64 }, () => Math.random() * 0.7 + 0.15),
    };
    setTracks((prev) => [...prev, newTrack]);
  };

  // Measure markers generation (Bar 1 to 8)
  const barMarkers = [];
  const totalBars = 8;
  for (let b = 1; b <= totalBars; b++) {
    barMarkers.push({
      bar: b,
      percent: ((b - 1) / totalBars) * 100,
    });
  }

  return (
    <div className="flex flex-col flex-1 bg-studio-darkest text-studio-text select-none overflow-hidden transition-colors">
      {/* Timeline Controls & Add Track Bar */}
      <div className="h-9 bg-studio-darker border-b border-studio-border px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-bold text-studio-text uppercase text-[11px] tracking-wider">
            Multitrack Timeline ({tracks.length} {tracks.length === 1 ? 'Channel' : 'Channels'})
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* Record Inbuilt Instrument Button */}
          {recordingMode === 'instruments' ? (
            <button
              onClick={onStopRecording}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md ring-2 ring-rose-400/50 animate-pulse transition-all"
              title="Stop recording and add clip to main timeline"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop & Add ({recordingSeconds}s)</span>
            </button>
          ) : (
            <button
              onClick={() => onStartRecording && onStartRecording('instruments')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-studio-card hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 border border-rose-500/40 hover:border-rose-500 text-xs font-medium transition-colors shadow-sm"
              title="Record what you play on the inbuilt instrument into the main timeline"
            >
              <Circle className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              <span className="hidden sm:inline">Record Inbuilt Inst</span>
              <span className="sm:hidden">Rec Inst</span>
            </button>
          )}

          {/* Add Last Recorded Instrument Clip */}
          {lastRecordedInstrument && (
            <button
              onClick={() => onAddRecordedInstrument && onAddRecordedInstrument(lastRecordedInstrument)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition-transform hover:scale-105 active:scale-95"
              title={`Add "${lastRecordedInstrument.name}" to main timeline`}
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add Recorded Inst</span>
              <span className="sm:hidden">+ Inst</span>
            </button>
          )}

          {/* Add Inbuilt Instrument Channel */}
          <button
            onClick={() => onAddInstrumentTrack && onAddInstrumentTrack(activeInstrument)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text text-xs font-medium transition-colors shadow-sm"
            title="Add this virtual instrument as a new channel on the main timeline"
          >
            <Plus className="w-3 h-3 text-cyan-500" />
            <span className="hidden md:inline">Add Instrument Track</span>
            <span className="md:hidden">Add Inst</span>
          </button>

          {/* Standard Add Blank Track Button */}
          <button
            onClick={handleAddTrack}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text text-xs font-medium transition-colors shadow-sm"
            title="Add a custom blank track"
          >
            <Plus className="w-3 h-3 text-cyan-500" />
            <span>Add Track</span>
          </button>
        </div>
      </div>

      {/* Main Multitrack Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Track Mixer Control Headers */}
        <div className="w-64 sm:w-72 bg-studio-darker border-r border-studio-border flex flex-col overflow-y-auto transition-colors">
          {/* Header spacer to match ruler */}
          <div className="h-8 border-b border-studio-border bg-studio-card px-3 flex items-center text-[10px] font-mono uppercase tracking-wider text-studio-textMuted font-bold">
            Track Controls & Levels
          </div>

          {tracks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-studio-textMuted select-none">
              <Layers className="w-8 h-8 opacity-30 mb-2 text-cyan-500" />
              <span className="text-xs font-mono font-bold text-studio-text">0 Channels Loaded</span>
              <span className="text-[10px] mt-1 text-studio-textMuted">Clean Blank Canvas</span>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-studio-border/60">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-20 p-2.5 flex flex-col justify-between bg-studio-card/80 hover:bg-studio-card transition-colors"
                >
                {/* Track Title & Color Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: track.color || accent.primary }}
                    />
                    <span className="text-xs font-bold text-studio-text truncate max-w-[140px]">
                      {track.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {track.audioUrl && (
                      <a
                        href={track.audioUrl}
                        download={`${track.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.webm`}
                        className="text-cyan-500 hover:text-cyan-400 p-1 rounded hover:bg-studio-cardHover transition-colors"
                        title="Download Recorded Audio Clip (WAV/WebM)"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="text-studio-textMuted hover:text-rose-500 p-1 rounded transition-colors"
                      title="Remove Track"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Track Buttons & Fader */}
                <div className="flex items-center justify-between space-x-2 mt-1">
                  {/* Solo / Mute / Arm Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleSolo(track.id)}
                      className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors shadow-sm ${track.isSolo
                          ? 'bg-amber-500 text-slate-900 shadow-sm'
                          : 'bg-studio-darkest text-studio-textMuted hover:text-studio-text border border-studio-border'
                        }`}
                      title="Solo Track"
                    >
                      S
                    </button>

                    <button
                      onClick={() => handleToggleMute(track.id)}
                      className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors shadow-sm ${track.isMuted
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-studio-darkest text-studio-textMuted hover:text-studio-text border border-studio-border'
                        }`}
                      title="Mute Track"
                    >
                      M
                    </button>

                    <button
                      onClick={() => handleToggleArm(track.id)}
                      className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors shadow-sm ${track.isArmed
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-studio-darkest text-studio-textMuted hover:text-rose-500 border border-studio-border'
                        }`}
                      title="Arm for Recording"
                    >
                      R
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex-1 flex items-center space-x-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={track.volume ?? 0.8}
                      onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-studio-darkest rounded appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-[9px] font-mono text-studio-textMuted w-6 text-right">
                      {Math.round((track.volume ?? 0.8) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Right: Waveform Timeline Grid with Animated Playhead */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 relative bg-studio-darkest overflow-y-auto cursor-pointer transition-colors"
        >
          {/* Measure Ruler Header */}
          <div className="h-8 border-b border-studio-border bg-studio-card sticky top-0 z-20 flex items-center">
            {barMarkers.map((b) => (
              <div
                key={b.bar}
                className="absolute text-[10px] font-mono font-bold text-studio-textMuted pl-1 border-l border-studio-border h-full flex items-center"
                style={{ left: `${b.percent}%` }}
              >
                {b.bar}.1
              </div>
            ))}
          </div>

          {/* Animated Red Playhead Scrubber */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-75"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-rose-500 -ml-[5px]" />
            <div className="w-px h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
          </div>

          {/* Track Clips Canvas Rows or Empty Canvas */}
          {tracks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 shadow-lg">
                <Music className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-studio-text mb-1">Blank Canvas Project</h4>
              <p className="text-xs text-studio-textMuted max-w-md mb-4 leading-relaxed">
                Your multitrack timeline is completely clean with 0 tracks. Play or record the inbuilt instrument below, or lay down vocals to begin your song!
              </p>
              <div className="flex items-center space-x-2.5 flex-wrap justify-center gap-2">
                {recordingMode === 'instruments' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStopRecording();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop & Add to Main Track ({recordingSeconds}s)</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRecording && onStartRecording('instruments');
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Record Inbuilt Instrument</span>
                  </button>
                )}

                {lastRecordedInstrument && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddRecordedInstrument && onAddRecordedInstrument(lastRecordedInstrument);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Recorded Inst ({lastRecordedInstrument.name})</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddInstrumentTrack && onAddInstrumentTrack(activeInstrument);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4 text-cyan-500" />
                  <span>Add {activeInstrument?.name || 'Inbuilt Instrument'} Track</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTrack();
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-studio-darkest hover:bg-studio-card border border-studio-border text-studio-textMuted hover:text-studio-text text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Blank Channel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-studio-border/60">
              {tracks.map((track) => {
                const waveform = track.waveform || Array.from({ length: 64 }, () => 0.5);

                return (
                  <div
                    key={track.id}
                    className="h-20 p-2 relative flex items-center bg-studio-card/30 group hover:bg-studio-card/60 transition-colors"
                  >
                  {/* Audio Clip Block */}
                  <div
                    className={`h-full w-full rounded-xl border p-2 flex items-center relative overflow-hidden transition-all ${track.isMuted
                        ? 'opacity-35 grayscale'
                        : 'shadow-md group-hover:scale-[1.002]'
                      }`}
                    style={{
                      borderColor: `${track.color || accent.primary}60`,
                      background: isDark
                        ? `linear-gradient(135deg, ${track.color || accent.primary}18 0%, rgba(10, 13, 20, 0.95) 100%)`
                        : `linear-gradient(135deg, ${track.color || accent.primary}25 0%, rgba(255, 255, 255, 0.95) 100%)`,
                    }}
                  >
                    {/* Render Waveform Peak Bars */}
                    <div className="w-full h-full flex items-center justify-between gap-0.5">
                      {waveform.map((peak, idx) => (
                        <div
                          key={idx}
                          className="w-1 rounded-full transition-all duration-150"
                          style={{
                            height: `${Math.max(10, peak * 85)}%`,
                            backgroundColor: track.color || accent.primary,
                            opacity: isPlaying && (idx / waveform.length) * 100 <= playheadPercent ? 1.0 : 0.65,
                          }}
                        />
                      ))}
                    </div>

                    {/* Clip Info Tag & Inline Audition Preview */}
                    <div className="absolute bottom-1.5 left-2.5 flex items-center space-x-1.5 z-10">
                      <span className="text-[10px] font-mono text-studio-text font-bold drop-shadow bg-studio-card/90 px-1.5 py-0.5 rounded border border-studio-border/60">
                        {track.name}
                      </span>

                      {track.audioUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreviewAudio(track.id, track.audioUrl);
                          }}
                          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-md transition-transform hover:scale-105 active:scale-95 ${activePreviewId === track.id
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                            }`}
                          title="Listen to this recorded audio clip"
                        >
                          {activePreviewId === track.id ? (
                            <>
                              <Pause className="w-2.5 h-2.5 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Audition Clip</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
