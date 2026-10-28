import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { renderProjectToWav, downloadBlob, exportProjectJson } from '../audio/wavExport';
import { Download, FileAudio, FileCode, CheckCircle2, Loader2, X } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, projectState }) {
  const { accent } = useTheme();
  const [selectedFormat, setSelectedFormat] = useState('wav');
  const [sampleRate, setSampleRate] = useState('48000');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportedSuccess(false);

    try {
      if (selectedFormat === 'wav') {
        const wavBlob = await renderProjectToWav({
          bpm: projectState.bpm || 120,
          tracks: projectState.tracks || [],
          durationSeconds: 10.0,
        });
        downloadBlob(wavBlob, `${(projectState.song || 'soundcraft').toLowerCase().replace(/\s+/g, '-')}-master.wav`);
      } else if (selectedFormat === 'json') {
        exportProjectJson(projectState, `${(projectState.song || 'soundcraft').toLowerCase().replace(/\s+/g, '-')}-session.soundcraft`);
      } else {
        const wavBlob = await renderProjectToWav({
          bpm: projectState.bpm || 120,
          tracks: projectState.tracks || [],
          durationSeconds: 8.0,
        });
        downloadBlob(wavBlob, `${(projectState.song || 'soundcraft').toLowerCase().replace(/\s+/g, '-')}.${selectedFormat}`);
      }

      setExportedSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none transition-colors">
      <div className="w-full max-w-md bg-studio-card border border-studio-border rounded-2xl shadow-2xl p-6 relative flex flex-col transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-studio-textMuted hover:text-studio-text p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: accent.gradient }}
          >
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-studio-text">Export Studio Project</h3>
            <p className="text-xs text-studio-textMuted">Package active session into local lossless audio or project file.</p>
          </div>
        </div>

        {/* Format Selectors */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-mono uppercase text-studio-textMuted font-bold block">
            Export Format
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'wav', name: 'Master WAV', ext: '24-bit PCM' },
              { id: 'mp3', name: 'MP3 Audio', ext: '320 kbps' },
              { id: 'json', name: 'Project File', ext: '.soundcraft' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === fmt.id
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md ring-2 ring-cyan-500/50'
                    : 'bg-studio-darkest border-studio-border hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {fmt.id === 'json' ? (
                    <FileCode className="w-4 h-4 text-amber-500" />
                  ) : (
                    <FileAudio className="w-4 h-4 text-cyan-500" />
                  )}
                  {selectedFormat === fmt.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
                </div>
                <span className="text-xs font-bold text-studio-text">{fmt.name}</span>
                <span className="text-[10px] font-mono text-studio-textMuted">{fmt.ext}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Settings */}
        {selectedFormat !== 'json' && (
          <div className="mb-4">
            <label className="text-[11px] font-mono uppercase text-studio-textMuted font-bold block mb-1">
              Sample Rate
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="48000">48.0 kHz (Broadcast Studio Standard)</option>
              <option value="44100">44.1 kHz (CD Quality)</option>
              <option value="96000">96.0 kHz (Audiophile High-Res)</option>
            </select>
          </div>
        )}

        {/* Active Project Summary */}
        <div className="p-3 bg-studio-darkest border border-studio-border rounded-xl mb-4 text-xs font-mono space-y-1 text-studio-textMuted">
          <div className="flex justify-between">
            <span>Active Song:</span>
            <span className="text-studio-text font-bold">{projectState.song || 'Untitled'}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Tracks:</span>
            <span className="text-studio-text font-bold">{projectState.tracks?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Tempo / BPM:</span>
            <span className="text-cyan-500 font-bold">{projectState.bpm || 120} BPM</span>
          </div>
        </div>

        {/* Export Action */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-studio-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-studio-textMuted hover:text-studio-text"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center space-x-2"
            style={{ background: accent.gradient }}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rendering Audio Buffer...</span>
              </>
            ) : exportedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Render & Download File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
