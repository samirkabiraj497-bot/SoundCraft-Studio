import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { INSTRUMENT_CATEGORIES, INSTRUMENTS_DATA } from '../data/instrumentsData';
import { audioEngine } from '../audio/synthEngine';
import { Search, Play, CheckCircle2, Music } from 'lucide-react';

export default function InstrumentVault({ activeInstrument, onSelectInstrument }) {
  const { accent } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState(null);

  // Filter instruments based on category and search query
  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS_DATA.filter((inst) => {
      const matchCat = selectedCategory === 'all' || inst.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Preview an instrument with Web Audio
  const handlePreviewSound = (inst, e) => {
    e.stopPropagation();
    setPlayingId(inst.id);
    const testNote = inst.category === 'drums' ? 'C2' : 'C4';
    audioEngine.playNote(testNote, 0.5, inst);
    setTimeout(() => {
      setPlayingId(null);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-studio-darkest text-studio-text select-none overflow-hidden transition-colors">
      {/* Vault Header & Search Bar */}
      <div className="p-4 bg-studio-darker border-b border-studio-border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-studio-text flex items-center space-x-2">
              <span>Virtual Instrument Vault</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono text-slate-900 font-bold shadow-sm"
                style={{ background: accent.primary }}
              >
                105 Presets
              </span>
            </h2>
          </div>
          <p className="text-xs text-studio-textMuted mt-0.5">
            Searchable acoustic & synthesizer engine powered by Web Audio API.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-studio-textMuted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search instruments, tags (e.g. '808', 'guitar', 'piano')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-studio-card border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-studio-text placeholder-studio-textMuted focus:outline-none focus:border-cyan-500 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-studio-textMuted hover:text-studio-text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-4 py-2.5 bg-studio-darkest border-b border-studio-border flex items-center space-x-2 overflow-x-auto scrollbar-none transition-colors">
        {INSTRUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'text-white'
                : 'text-studio-textMuted bg-studio-card border border-studio-border hover:text-studio-text hover:bg-studio-cardHover'
            }`}
            style={selectedCategory === cat.id ? { background: accent.gradient } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Instruments Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredInstruments.map((inst) => {
            const isSelected = activeInstrument?.id === inst.id;
            const isPlaying = playingId === inst.id;

            return (
              <div
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.02] shadow-sm ${
                  isSelected
                    ? 'bg-studio-card border-cyan-500 ring-2 ring-cyan-500/40 shadow-md'
                    : 'bg-studio-card border-studio-border hover:border-cyan-500/60 hover:bg-studio-cardHover'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm"
                      style={{ background: isSelected ? accent.primary : '#64748b', color: '#ffffff' }}
                    >
                      <Music className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-xs font-bold text-studio-text truncate group-hover:text-cyan-500 transition-colors">
                        {inst.name}
                      </h4>
                      <span className="text-[10px] font-mono uppercase text-studio-textMuted tracking-wider">
                        {inst.category} • {inst.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-studio-textMuted mt-2 line-clamp-2 leading-relaxed">
                    {inst.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {inst.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-studio-darker text-studio-textMuted border border-studio-border font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions: Test Trigger and Synth Specs */}
                <div className="mt-3 pt-2.5 border-t border-studio-border flex items-center justify-between">
                  <span className="text-[9px] font-mono text-studio-textMuted">
                    Cutoff: {inst.cutoff}Hz
                  </span>

                  <button
                    onClick={(e) => handlePreviewSound(inst, e)}
                    className={`p-1.5 rounded-lg text-white transition-all shadow-sm ${
                      isPlaying
                        ? 'bg-emerald-500 scale-110 shadow-md'
                        : 'bg-studio-darker hover:bg-slate-600 text-studio-text'
                    }`}
                    title="Play Test Tone"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstruments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-studio-textMuted">
            <Search className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No instruments matched "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs text-cyan-500 underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
