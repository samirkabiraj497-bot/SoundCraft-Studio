import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Feather, Sparkles, Send, Copy, Check, Loader2 } from 'lucide-react';

export default function AiLyricGenerator({ onSyncTeleprompter }) {
  const { accent } = useTheme();
  const [themePrompt, setThemePrompt] = useState('Dancing barefoot in the dark under summer stars');
  const [mood, setMood] = useState('Romantic & Melodic');
  const [rhymeScheme, setRhymeScheme] = useState('AABB');
  const [tone, setTone] = useState('Melodic & Deep');
  const [loading, setLoading] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateLyrics({
        theme: themePrompt,
        mood,
        rhymeScheme,
        tone,
      });
      if (res.success) {
        setGeneratedLyrics(res.lyrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLyrics) return;
    const text = generatedLyrics.rawText || generatedLyrics.structure.map((s) => `[${s.section}]\n` + s.lines.map((l) => l.text).join('\n')).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-studio-card border border-studio-border rounded-2xl p-5 flex flex-col justify-between select-none shadow-xl transition-colors">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ background: accent.gradient }}
          >
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-studio-text">AI Lyric Generator & Songwriter</h3>
            <p className="text-[11px] text-studio-textMuted">Generate rhymed verses, choruses & teleprompter cues.</p>
          </div>
        </div>

        {/* Theme Prompt Input */}
        <div className="mb-3">
          <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Song Story / Theme</label>
          <input
            type="text"
            value={themePrompt}
            onChange={(e) => setThemePrompt(e.target.value)}
            className="w-full bg-studio-darkest border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. Late night train ride, romantic slow dance, overcoming hardship..."
          />
        </div>

        {/* Rhyme Scheme & Tone Selectors */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Rhyme Scheme</label>
            <select
              value={rhymeScheme}
              onChange={(e) => setRhymeScheme(e.target.value)}
              className="w-full bg-studio-darkest border border-studio-border rounded-xl px-2.5 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="AABB">AABB (Classic Couplets)</option>
              <option value="ABAB">ABAB (Alternating)</option>
              <option value="AAAA">AAAA (Mono-rhyme / Trap)</option>
              <option value="Free">Free Verse / Poetic</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Vocal Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-studio-darkest border border-studio-border rounded-xl px-2.5 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="Melodic & Deep">Melodic & Deep</option>
              <option value="Aggressive Rap">Aggressive Rap</option>
              <option value="Indie Poetic">Indie Poetic</option>
              <option value="Ambient R&B">Ambient R&B</option>
            </select>
          </div>
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
              <span>Drafting Verses & Rhyme Patterns...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Structured Lyrics</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Lyrics Card */}
      {generatedLyrics && (
        <div className="mt-4 p-3.5 bg-studio-darkest border border-studio-border rounded-xl flex flex-col max-h-56 overflow-y-auto transition-colors">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-studio-border">
            <span className="text-xs font-bold text-studio-text truncate max-w-[180px]">{generatedLyrics.title}</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleCopy}
                className="p-1 rounded bg-studio-card hover:bg-studio-cardHover text-studio-text text-xs flex items-center space-x-1 shadow-sm"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>

              <button
                onClick={() => onSyncTeleprompter(generatedLyrics)}
                className="px-2 py-0.5 rounded text-[11px] font-bold text-white flex items-center space-x-1 transition-transform hover:scale-105"
                style={{ background: accent.gradient }}
              >
                <Send className="w-3 h-3" />
                <span>Sync to Prompter</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {generatedLyrics.structure.map((sec, idx) => (
              <div key={idx}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-bold block mb-1">
                  [{sec.section}]
                </span>
                {sec.lines.map((l, lIdx) => (
                  <p key={lIdx} className="text-studio-text font-sans pl-2 border-l border-studio-border my-0.5">
                    {l.text}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
