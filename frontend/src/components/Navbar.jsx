import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SONG_PRESETS } from '../data/songPresets';
import {
  Music,
  Moon,
  Sun,
  Palette,
  User,
  Sliders,
  Sparkles,
  Scissors,
  Check,
  ChevronDown,
  PlusCircle,
  UploadCloud,
  Headphones,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenStemSplitter,
  onInsertAudioClick,
  onOpenAuth,
  onOpenCreateSong,
  user,
  onLogout,
  currentSongTitle,
  isAudioFile = false,
  onSelectSongPreset,
}) {
  const { theme, toggleTheme, accent, setAccentColor, presets, isDark } = useTheme();
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);

  return (
    <header className="h-14 border-b border-studio-border bg-studio-darker/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none text-studio-text transition-colors">
      {/* Brand & Project Template Selector */}
      <div className="flex items-center space-x-3">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setActiveTab('daw')}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: accent.gradient }}
          >
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              SoundCraft
            </span>
            <span
              className="ml-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-widest text-slate-900 font-mono"
              style={{ background: accent.primary }}
            >
              STUDIO
            </span>
          </div>
        </div>

        {/* CREATE SONG BUTTON */}
        <button
          onClick={onOpenCreateSong}
          className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ background: accent.gradient }}
          title="Create a New Song Project from Scratch"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Song</span>
        </button>

        {/* SONG TEMPLATES DROPDOWN (Featuring Ed Sheeran Perfect & More) */}
        <div className="relative pl-2 border-l border-studio-border">
          <button
            onClick={() => setShowSongPicker(!showSongPicker)}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-studio-card border hover:border-cyan-500 text-studio-text shadow-sm transition-all ${
              isAudioFile ? 'border-cyan-500/60 ring-1 ring-cyan-500/20' : 'border-studio-border'
            }`}
            title="Load Hit Song Templates or Inserted Audio"
          >
            {isAudioFile ? (
              <Headphones className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            )}
            <span className="max-w-[130px] md:max-w-[180px] truncate">
              {currentSongTitle || 'Load Song Preset'}
            </span>
            {isAudioFile && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold">
                AUDIO
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-studio-textMuted" />
          </button>

          {showSongPicker && (
            <div className="absolute left-0 mt-2 p-2 w-72 bg-studio-card border border-studio-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-1.5 px-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-studio-textMuted font-bold">
                  Song Templates & Files
                </span>
                <button
                  onClick={() => {
                    setShowSongPicker(false);
                    onOpenCreateSong();
                  }}
                  className="text-[10px] font-mono text-cyan-500 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ New</span>
                </button>
              </div>

              {/* Quick Insert Audio File Entry */}
              <button
                onClick={() => {
                  setShowSongPicker(false);
                  onInsertAudioClick();
                }}
                className="w-full mb-1.5 p-2 rounded-lg text-left bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/30 hover:border-emerald-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white bg-emerald-500">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-studio-text group-hover:text-emerald-400 transition-colors">
                      📁 Insert Audio File
                    </div>
                    <div className="text-[9px] font-mono text-studio-textMuted">
                      Upload MP3, WAV, OGG, M4A
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold">
                  Browse
                </span>
              </button>

              {/* Quick Create Custom Song Entry */}
              <button
                onClick={() => {
                  setShowSongPicker(false);
                  onOpenCreateSong();
                }}
                className="w-full mb-1.5 p-2 rounded-lg text-left bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 hover:border-cyan-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                    style={{ background: accent.gradient }}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-studio-text group-hover:text-cyan-500 transition-colors">
                      + Create Blank Project
                    </div>
                    <div className="text-[9px] font-mono text-studio-textMuted">
                      Custom BPM, Key & Channels
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500 text-white font-bold">
                  Create
                </span>
              </button>

              <div className="h-px bg-studio-border my-1" />

              <div className="space-y-1">
                {SONG_PRESETS.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      onSelectSongPreset(song);
                      setShowSongPicker(false);
                    }}
                    className="w-full p-2 rounded-lg text-left hover:bg-studio-cardHover transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-studio-text group-hover:text-cyan-500 transition-colors">
                        {song.title} - {song.artist}
                      </div>
                      <div className="text-[10px] font-mono text-studio-textMuted">
                        {song.keySignature} • {song.bpm} BPM • {song.genre}
                      </div>
                    </div>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white font-bold"
                      style={{ background: accent.primary }}
                    >
                      Load
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Studio Navigation Modes */}
      <nav className="hidden md:flex items-center bg-studio-darkest p-1 rounded-xl border border-studio-border">
        <button
          onClick={() => setActiveTab('daw')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'daw'
              ? 'text-white shadow-md'
              : 'text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover'
          }`}
          style={activeTab === 'daw' ? { background: accent.gradient } : {}}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>DAW Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('instruments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'instruments'
              ? 'text-white shadow-md'
              : 'text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover'
          }`}
          style={activeTab === 'instruments' ? { background: accent.gradient } : {}}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Vault (105+)</span>
        </button>

        <button
          onClick={() => setActiveTab('dj')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'dj'
              ? 'text-white shadow-md'
              : 'text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover'
          }`}
          style={activeTab === 'dj' ? { background: accent.gradient } : {}}
        >
          <span className="w-2 h-2 rounded-full animate-ping mr-0.5" style={{ background: accent.primary }} />
          <span>DJ Decks</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'ai'
              ? 'text-white shadow-md'
              : 'text-studio-textMuted hover:text-studio-text hover:bg-studio-cardHover'
          }`}
          style={activeTab === 'ai' ? { background: accent.gradient } : {}}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Musician & Lyrics</span>
        </button>
      </nav>

      {/* Right Controls: Insert Audio, Stem Splitter, Theme, Accent, Account */}
      <div className="flex items-center space-x-2">
        {/* Insert Audio File Action */}
        <button
          onClick={onInsertAudioClick}
          className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-studio-card border border-studio-border hover:border-cyan-500 text-studio-text transition-all hover:scale-105 shadow-sm"
          title="Insert any Audio File (.mp3, .wav, .m4a, .ogg) into DAW"
        >
          <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Insert Audio</span>
        </button>

        {/* Stem Splitter Action */}
        <button
          onClick={onOpenStemSplitter}
          className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-studio-card border border-studio-border hover:border-cyan-500 text-studio-text transition-all hover:scale-105"
        >
          <Scissors className="w-3.5 h-3.5 text-pink-500" />
          <span>Split Stems</span>
        </button>

        {/* Accent Palette Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAccentPicker(!showAccentPicker)}
            title="Custom Accent Color"
            className="p-2 rounded-lg bg-studio-card border border-studio-border hover:bg-studio-cardHover text-studio-text transition-colors flex items-center justify-center shadow-sm"
          >
            <div
              className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
              style={{ background: accent.primary }}
            />
          </button>

          {showAccentPicker && (
            <div className="absolute right-0 mt-2 p-2 w-48 bg-studio-card border border-studio-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-mono uppercase tracking-wider text-studio-textMuted mb-1.5 px-1 font-bold">
                Studio Accent Color
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setAccentColor(preset.id);
                      setShowAccentPicker(false);
                    }}
                    className={`flex items-center justify-center h-8 rounded-lg transition-transform hover:scale-110 relative ${
                      accent.id === preset.id ? 'ring-2 ring-white shadow-md' : ''
                    }`}
                    style={{ background: preset.gradient }}
                    title={preset.name}
                  >
                    {accent.id === preset.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'OLED Dark'} Mode`}
          className="p-2 rounded-lg bg-studio-card border border-studio-border hover:bg-studio-cardHover text-studio-text transition-colors flex items-center space-x-1 shadow-sm"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono hidden xl:inline font-bold">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-cyan-600" />
              <span className="text-[10px] font-mono hidden xl:inline font-bold">Dark</span>
            </>
          )}
        </button>

        {/* Producer Profile / Auth Button */}
        {user ? (
          <div className="flex items-center space-x-2 pl-1">
            <button
              onClick={onLogout}
              title={`Logged in as ${user.username} (Click to Logout)`}
              className="flex items-center space-x-1.5 text-xs bg-studio-card border border-studio-border px-2.5 py-1.5 rounded-lg hover:border-red-500/50 hover:bg-red-950/20 transition-all text-studio-text"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900"
                style={{ background: accent.primary }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-medium max-w-[80px] truncate">{user.username}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white shadow-md transition-all hover:opacity-90 hover:scale-105"
            style={{ background: accent.gradient }}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
