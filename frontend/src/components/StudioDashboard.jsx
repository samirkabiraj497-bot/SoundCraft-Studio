import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import TransportBar from './TransportBar';
import LyricTeleprompter from './LyricTeleprompter';
import MultitrackTimeline from './MultitrackTimeline';
import PianoRollKeyboard from './PianoRollKeyboard';
import InstrumentVault from './InstrumentVault';
import DjTurntableDeck from './DjTurntableDeck';
import AiMusicianPanel from './AiMusicianPanel';
import AiLyricGenerator from './AiLyricGenerator';
import StemSplitterModal from './StemSplitterModal';
import ExportModal from './ExportModal';
import AuthModal from './AuthModal';
import CreateSongModal from './CreateSongModal';
import { INSTRUMENTS_DATA } from '../data/instrumentsData';
import { SONG_PRESETS } from '../data/songPresets';
import { audioEngine } from '../audio/synthEngine';
import { drumEngine } from '../audio/drumEngine';
import { recorderEngine } from '../audio/recorderEngine';

export default function StudioDashboard() {
  // Navigation View Tab: 'daw' | 'instruments' | 'dj' | 'ai'
  const [activeTab, setActiveTab] = useState('daw');

  // Active Song Preset (Defaults to "Perfect - Ed Sheeran")
  const [activeSong, setActiveSong] = useState(SONG_PRESETS[0]);

  // Master DAW Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(SONG_PRESETS[0].bpm);
  const [isLooping, setIsLooping] = useState(true);
  const totalSessionDuration = 48.0; // 48 seconds for complete verses & chorus

  // Dual Recording Mode State: null | 'instruments' | 'mic'
  const [recordingMode, setRecordingMode] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [lastRecordedInstrument, setLastRecordedInstrument] = useState(null);
  const recordingTimerRef = useRef(null);

  // Modals & Creation Notifications
  const [isCreateSongOpen, setIsCreateSongOpen] = useState(false);
  const [isStemSplitterOpen, setIsStemSplitterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);

  // User Profile
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('soundcraft_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Selected Virtual Instrument (Defaults to Acoustic Grand / Guitar)
  const [activeInstrument, setActiveInstrument] = useState(INSTRUMENTS_DATA[25] || INSTRUMENTS_DATA[0]);

  // Multitrack Channels State (Initialized with Ed Sheeran - Perfect tracks)
  const [tracks, setTracks] = useState(SONG_PRESETS[0].tracks);

  // Active Teleprompter Lyrics (Initialized with Ed Sheeran - Perfect lyrics)
  const [activeLyrics, setActiveLyrics] = useState(SONG_PRESETS[0].lyrics);

  // Master Clock & Web Audio Sync Refs
  const timerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const currentTimeRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Clean shutdown on component unmount
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Handle Play / Pause Toggle with true pause/resume and zero latency
  const handleTogglePlay = () => {
    if (isPlayingRef.current) {
      // 1. PAUSE PLAYBACK IMMEDIATELY
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioEngine.pausePlayback();
    } else {
      // 2. RESUME / START PLAYBACK FROM CURRENT TIME
      isPlayingRef.current = true;
      setIsPlaying(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Compute step index based on current playback seconds
      const tempo = bpm || activeSong.bpm || 120;
      const stepDurationSec = 60 / tempo;
      const startStep = Math.max(0, Math.floor(currentTimeRef.current / stepDurationSec));

      audioEngine.startSongPlayback({ ...activeSong, tracks }, drumEngine, null, startStep, currentTimeRef.current);

      const stepInterval = 50; // ms
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (stepInterval / 1000);
          currentTimeRef.current = next;

          if (next >= totalSessionDuration) {
            if (isLooping) {
              audioEngine.resetPlaybackStep();
              currentTimeRef.current = 0;
              return 0;
            }
            handleStop();
            return 0;
          }
          return next;
        });
      }, stepInterval);
    }
  };

  // Immediate Stop Action: Guaranteed 100% silence and reset to start
  const handleStop = () => {
    if (recordingMode) {
      handleStopRecording();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    audioEngine.stopAll();
    setCurrentTime(0);
    currentTimeRef.current = 0;
  };

  // Start recording either inbuilt instruments or microphone
  const handleStartRecording = async (mode) => {
    try {
      if (mode === 'instruments') {
        await recorderEngine.startInstrumentRecording(audioEngine);
      } else {
        await recorderEngine.startMicRecording(audioEngine);
      }
      setRecordingMode(mode);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Trigger notification toast
      const label = mode === 'mic' ? 'Microphone Singing' : `${activeInstrument?.name || 'Inbuilt Instruments'}`;
      setNotificationToast(`🔴 Recording Started: ${label}. Play notes or drum pads!`);
      setTimeout(() => setNotificationToast(null), 3500);
    } catch (err) {
      alert(`Recording Error: ${err.message}. If recording microphone, please check browser mic permissions.`);
    }
  };

  // Stop recording and save audio clip to multitrack DAW timeline
  const handleStopRecording = async () => {
    if (!recordingMode) return;
    const mode = recordingMode;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const result = await recorderEngine.stopRecording(audioEngine);
    setRecordingMode(null);
    setRecordingSeconds(0);

    if (result && result.audioUrl) {
      const isMic = mode === 'mic';
      const instName = activeInstrument?.name || 'Inbuilt Instrument';
      const trackName = isMic
        ? `🎙️ Recorded Vocals (${result.duration.toFixed(1)}s)`
        : `🎹 ${instName} (${result.duration.toFixed(1)}s)`;

      const newTrack = {
        id: `recorded-${Date.now()}`,
        name: trackName,
        type: isMic ? 'vocal' : 'synth',
        color: isMic ? '#f43f5e' : (activeInstrument?.category === 'Bass' ? '#a855f7' : '#06b6d4'),
        volume: 0.95,
        pan: 0,
        isMuted: false,
        isSolo: false,
        isArmed: false,
        waveform: result.waveform,
        audioUrl: result.audioUrl,
        audioBlob: result.blob,
        duration: result.duration,
      };

      if (!isMic) {
        setLastRecordedInstrument(newTrack);
      }

      setTracks((prev) => [newTrack, ...prev]);
      setActiveTab('daw');
      setNotificationToast(`🎉 Recorded ${isMic ? 'Singing Vocals' : instName} (${result.duration.toFixed(1)}s) Added to Main Track!`);
      setTimeout(() => setNotificationToast(null), 5000);
    }
  };

  // Add the active inbuilt instrument as an empty or ready channel on the main timeline
  const handleAddInstrumentTrack = (instrumentPreset = activeInstrument) => {
    const instName = instrumentPreset?.name || 'Inbuilt Instrument';
    const isBass = instrumentPreset?.category === 'Bass';
    const newTrack = {
      id: `track-${Date.now()}`,
      name: `🎹 ${instName}`,
      type: isBass ? 'bass' : 'keys',
      color: isBass ? '#a855f7' : '#06b6d4',
      volume: 0.85,
      pan: 0,
      isMuted: false,
      isSolo: false,
      isArmed: false,
      waveform: Array.from({ length: 64 }, () => Math.random() * 0.7 + 0.15),
    };
    setTracks((prev) => [newTrack, ...prev]);
    setActiveTab('daw');
    setNotificationToast(`✨ Added "${instName}" channel to main timeline!`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Add the recorded instrument clip to the main multitrack timeline
  const handleAddRecordedInstrumentToTimeline = (clip = lastRecordedInstrument) => {
    if (!clip) {
      // If none recorded yet, prompt recording
      handleStartRecording('instruments');
      return;
    }
    const trackToAdd = {
      ...clip,
      id: `recorded-${Date.now()}`,
    };
    setTracks((prev) => [trackToAdd, ...prev]);
    setActiveTab('daw');
    setNotificationToast(`🎉 Added "${clip.name}" clip to main timeline!`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Seek time
  const handleSeekTime = (time) => {
    setCurrentTime(time);
    currentTimeRef.current = time;
    audioEngine.seekToTime(time, { ...activeSong, tracks });
  };

  // Load a Song Template (e.g. Perfect - Ed Sheeran)
  const handleSelectSongPreset = (song) => {
    handleStop(); // Silence previous song immediately
    setActiveSong(song);
    setBpm(song.bpm);
    setTracks(song.tracks);
    setActiveLyrics(song.lyrics);
    setCurrentTime(0);
    currentTimeRef.current = 0;
  };

  // Handle creating a brand new custom song project
  const handleCreateCustomSong = (newProject) => {
    handleStop(); // Silence any audio immediately
    setActiveSong(newProject);
    setBpm(newProject.bpm);
    setTracks(newProject.tracks);
    setActiveLyrics(newProject.lyrics);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setActiveTab('daw'); // Jump directly to multitrack DAW timeline

    // Trigger confirmation notification toast
    setNotificationToast(`✨ New Song Created: "${newProject.title}" is ready for recording!`);
    setTimeout(() => {
      setNotificationToast(null), 4500;
    });
  };

  // Keyboard shortcut for Play/Pause (Spacebar)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        // Blur active focused element to prevent native button click replay
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeSong, bpm, isLooping]);

  // Import AI Arranger tracks into Multitrack Timeline
  const handleImportAiTracks = (newTracks) => {
    setTracks((prev) => [...prev, ...newTracks]);
    setActiveTab('daw');
  };

  // Import Separated Audio Stems into Timeline
  const handleImportStems = (stems) => {
    setTracks(stems);
    setActiveTab('daw');
  };

  // Sync AI Generated Lyrics to Teleprompter
  const handleSyncTeleprompter = (lyricsData) => {
    setActiveLyrics(lyricsData);
  };

  // Auth Handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('soundcraft_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('soundcraft_token');
    localStorage.removeItem('soundcraft_user');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-darkest text-studio-text font-sans select-none transition-colors relative">
      {/* Creation Notification Toast */}
      {notificationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-studio-card border border-cyan-500 shadow-2xl px-4 py-2.5 rounded-xl text-xs font-bold text-studio-text flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{notificationToast}</span>
          <button
            onClick={() => setNotificationToast(null)}
            className="ml-2 text-studio-textMuted hover:text-studio-text font-mono text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Global Navigation Bar with Song Presets & Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStemSplitter={() => setIsStemSplitterOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateSong={() => setIsCreateSongOpen(true)}
        user={user}
        onLogout={handleLogout}
        currentSongTitle={`${activeSong.title} - ${activeSong.artist}`}
        onSelectSongPreset={handleSelectSongPreset}
      />

      {/* 2. Master Audio Transport Controls Bar */}
      <TransportBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        bpm={bpm}
        setBpm={setBpm}
        isLooping={isLooping}
        setIsLooping={setIsLooping}
        recordingMode={recordingMode}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        recordingSeconds={recordingSeconds}
        currentTime={currentTime}
        onOpenExport={() => setIsExportOpen(true)}
        keySignature={activeSong.keySignature}
        timeSignature={activeSong.timeSignature || '4/4'}
      />

      {/* 3. Rolling Teleprompter synced above Timeline */}
      <LyricTeleprompter
        lyrics={activeLyrics}
        currentTime={currentTime}
        onSeekTime={handleSeekTime}
      />

      {/* 4. Dynamic Main Studio Workstation Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* VIEW 1: DAW Multitrack Timeline Mode */}
        {activeTab === 'daw' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <MultitrackTimeline
              tracks={tracks}
              setTracks={setTracks}
              currentTime={currentTime}
              onSeekTime={handleSeekTime}
              totalDuration={totalSessionDuration}
              isPlaying={isPlaying}
              recordingMode={recordingMode}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              recordingSeconds={recordingSeconds}
              lastRecordedInstrument={lastRecordedInstrument}
              onAddRecordedInstrument={handleAddRecordedInstrumentToTimeline}
              onAddInstrumentTrack={handleAddInstrumentTrack}
              activeInstrument={activeInstrument}
            />
            {/* Docked Keyboard & Drum Trigger Pads */}
            <PianoRollKeyboard
              activeInstrument={activeInstrument}
              recordingMode={recordingMode}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              recordingSeconds={recordingSeconds}
              lastRecordedInstrument={lastRecordedInstrument}
              onAddRecordedInstrument={handleAddRecordedInstrumentToTimeline}
              onAddInstrumentTrack={handleAddInstrumentTrack}
            />
          </div>
        )}

        {/* VIEW 2: Virtual Instrument Vault (105+ Instruments) */}
        {activeTab === 'instruments' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <InstrumentVault
                activeInstrument={activeInstrument}
                onSelectInstrument={(inst) => setActiveInstrument(inst)}
              />
            </div>
            {/* Docked live keyboard to audition selected vault instrument immediately */}
            <PianoRollKeyboard
              activeInstrument={activeInstrument}
              recordingMode={recordingMode}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              recordingSeconds={recordingSeconds}
              lastRecordedInstrument={lastRecordedInstrument}
              onAddRecordedInstrument={handleAddRecordedInstrumentToTimeline}
              onAddInstrumentTrack={handleAddInstrumentTrack}
            />
          </div>
        )}

        {/* VIEW 3: Virtual DJ Turntable Scratch Decks */}
        {activeTab === 'dj' && (
          <div className="flex-1 overflow-y-auto">
            <DjTurntableDeck />
          </div>
        )}

        {/* VIEW 4: AI Musician & Lyric Generator Studio Dock */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-studio-darkest transition-colors">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <AiMusicianPanel
                onImportTracks={handleImportAiTracks}
                currentBpm={bpm}
              />
              <AiLyricGenerator
                onSyncTeleprompter={handleSyncTeleprompter}
              />
            </div>
          </div>
        )}
      </main>

      {/* 5. Modals */}
      <StemSplitterModal
        isOpen={isStemSplitterOpen}
        onClose={() => setIsStemSplitterOpen(false)}
        onImportStems={handleImportStems}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectState={{
          bpm,
          tracks,
          currentTime,
          activeInstrument: activeInstrument?.name,
          lyrics: activeLyrics?.title,
          song: activeSong.title,
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CreateSongModal
        isOpen={isCreateSongOpen}
        onClose={() => setIsCreateSongOpen(false)}
        onCreateSong={handleCreateCustomSong}
        currentUser={user}
      />
    </div>
  );
}
