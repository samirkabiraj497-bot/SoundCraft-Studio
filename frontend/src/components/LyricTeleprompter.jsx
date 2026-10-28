import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mic2, ChevronUp, ChevronDown } from 'lucide-react';

export default function LyricTeleprompter({ lyrics, currentTime, onSeekTime }) {
  const { accent, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef(null);

  // Flatten all lines with global timestamps
  const allLines = React.useMemo(() => {
    if (!lyrics || !lyrics.structure) return [];
    const list = [];
    lyrics.structure.forEach((section) => {
      section.lines.forEach((line) => {
        list.push({
          ...line,
          sectionName: section.section,
        });
      });
    });
    return list;
  }, [lyrics]);

  // Find active line index based on current playback time
  const activeLineIndex = allLines.findIndex((line, idx) => {
    const nextLine = allLines[idx + 1];
    if (!nextLine) return currentTime >= line.timestamp;
    return currentTime >= line.timestamp && currentTime < nextLine.timestamp;
  });

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeLineIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeLineIndex]);

  if (!lyrics || allLines.length === 0) {
    return (
      <div className="h-10 bg-studio-darker border-b border-studio-border px-4 flex items-center justify-between text-studio-textMuted text-xs font-mono select-none transition-colors">
        <div className="flex items-center space-x-2">
          <Mic2 className="w-3.5 h-3.5 opacity-50" />
          <span>Teleprompter Standby • Load a song template or generate lyrics above</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-studio-darker border-b border-studio-border select-none transition-colors">
      {/* Teleprompter Top Ribbon */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-studio-border/50 text-xs">
        <div className="flex items-center space-x-2">
          <Mic2 className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-bold text-studio-text text-xs">Teleprompter:</span>
          <span className="text-studio-text font-mono text-[11px] bg-studio-card px-2 py-0.5 rounded border border-studio-border font-semibold shadow-sm">
            {lyrics.title}
          </span>
          <span className="text-[10px] text-studio-textMuted font-mono hidden sm:inline">
            (Synced to Timeline Clock)
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-studio-textMuted hover:text-studio-text flex items-center space-x-1 text-xs transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Prompter'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Rolling Prompter Viewport */}
      {isExpanded && (
        <div
          ref={containerRef}
          className="h-20 overflow-y-auto px-6 py-2 space-y-1 text-center scrollbar-none relative transition-colors"
        >
          {allLines.map((line, idx) => {
            const isActive = idx === activeLineIndex;

            return (
              <div
                key={idx}
                onClick={() => onSeekTime && onSeekTime(line.timestamp)}
                className={`cursor-pointer transition-all duration-300 py-0.5 rounded ${
                  isActive
                    ? 'text-sm sm:text-base font-extrabold scale-105 drop-shadow'
                    : 'text-xs text-studio-textMuted hover:text-studio-text'
                }`}
                style={isActive ? { color: accent.primary } : {}}
              >
                <span className="text-[9px] font-mono opacity-60 mr-2">[{line.timeFormatted}]</span>
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-75 mr-2">
                  {line.sectionName}:
                </span>
                <span>{line.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
