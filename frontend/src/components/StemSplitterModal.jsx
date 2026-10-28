import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  UploadCloud,
  Scissors,
  Loader2,
  CheckCircle2,
  Mic,
  Disc,
  Activity,
  X,
  Plus,
} from 'lucide-react';

export default function StemSplitterModal({ isOpen, onClose, onImportStems }) {
  const { accent } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResult, setSplitResult] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartSplit = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(15);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const res = await api.splitStems({
        fileName: selectedFile.name,
        duration: 32.0,
      });

      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setSplitResult(res.stems);
      }, 400);
    } catch (err) {
      clearInterval(timer);
      setIsProcessing(false);
      console.error(err);
    }
  };

  const handleImportToDAW = () => {
    if (!splitResult) return;
    const mappedTracks = splitResult.map((stem) => ({
      id: `stem-${stem.stemType}-${Date.now()}`,
      name: stem.name,
      type: stem.stemType,
      color:
        stem.stemType === 'vocals'
          ? '#f43f5e'
          : stem.stemType === 'drums'
            ? '#06b6d4'
            : stem.stemType === 'bass'
              ? '#f59e0b'
              : '#a855f7',
      volume: stem.volume || 0.8,
      pan: 0,
      isMuted: false,
      isSolo: false,
      isArmed: false,
      waveform: stem.waveform || Array.from({ length: 64 }, () => Math.random() * 0.7 + 0.2),
    }));

    onImportStems(mappedTracks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none transition-colors">
      <div className="w-full max-w-xl bg-studio-card border border-studio-border rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-studio-textMuted hover:text-studio-text p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: accent.gradient }}
          >
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-studio-text">AI Audio Stem Splitter</h3>
            <p className="text-xs text-studio-textMuted">
              Isolate Vocals, Drums, Bass, and Instruments using spectral audio decomposition.
            </p>
          </div>
        </div>

        {/* Upload Drop Zone */}
        {!splitResult && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
                ? 'border-cyan-500 bg-cyan-950/20'
                : 'border-studio-border bg-studio-darkest/60 hover:border-cyan-500/60'
              }`}
          >
            <UploadCloud className="w-10 h-10 text-cyan-500 mx-auto mb-3 animate-bounce" />
            <p className="text-xs font-semibold text-studio-text">
              {selectedFile ? selectedFile.name : 'Drag & drop master audio file (MP3, WAV, FLAC)'}
            </p>
            <p className="text-[11px] text-studio-textMuted mt-1">or browse from your system disk</p>

            <label className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold text-studio-text bg-studio-card hover:bg-studio-cardHover border border-studio-border cursor-pointer transition-colors shadow-sm">
              <span>Choose Audio File</span>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.flac"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="my-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-studio-text flex items-center space-x-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span>Separating 4 Multitrack Stems...</span>
              </span>
              <span className="text-cyan-500 font-bold">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-studio-darkest rounded-full overflow-hidden border border-studio-border">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${progress}%`, background: accent.gradient }}
              />
            </div>
          </div>
        )}

        {/* Separation Result Stems List */}
        {splitResult && (
          <div className="space-y-2.5 my-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-studio-textMuted font-bold block">
              Separated 4-Channel Stems (Ready for DAW)
            </span>

            {splitResult.map((stem) => (
              <div
                key={stem.id}
                className="p-3 bg-studio-darkest border border-studio-border rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ background: stem.color }}
                  >
                    {stem.stemType === 'vocals' ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : stem.stemType === 'drums' ? (
                      <Disc className="w-3.5 h-3.5" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-studio-text">{stem.name}</h5>
                    <span className="text-[10px] font-mono text-studio-textMuted">{stem.freqRange}</span>
                  </div>
                </div>

                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-studio-border flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-studio-textMuted hover:text-studio-text"
          >
            Cancel
          </button>

          {!splitResult ? (
            <button
              onClick={handleStartSplit}
              disabled={!selectedFile || isProcessing}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: accent.gradient }}
            >
              Start Stem Separation
            </button>
          ) : (
            <button
              onClick={handleImportToDAW}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105"
              style={{ background: accent.gradient }}
            >
              <Plus className="w-4 h-4" />
              <span>Import Stems Into DAW</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
