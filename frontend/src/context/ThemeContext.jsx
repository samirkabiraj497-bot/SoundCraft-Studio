import React, { createContext, useContext, useState, useEffect } from 'react';

export const ACCENT_PRESETS = [
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    secondary: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.45)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    twText: 'text-cyan-400',
    twBg: 'bg-cyan-500',
    twBorder: 'border-cyan-500',
    twRing: 'ring-cyan-500',
  },
  {
    id: 'purple',
    name: 'Electric Purple',
    primary: '#a855f7',
    secondary: '#9333ea',
    glow: 'rgba(168, 85, 247, 0.45)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    twText: 'text-purple-400',
    twBg: 'bg-purple-500',
    twBorder: 'border-purple-500',
    twRing: 'ring-purple-500',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#f59e0b',
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.45)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    twText: 'text-amber-400',
    twBg: 'bg-amber-500',
    twBorder: 'border-amber-500',
    twRing: 'ring-amber-500',
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    primary: '#10b981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.45)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    twText: 'text-emerald-400',
    twBg: 'bg-emerald-500',
    twBorder: 'border-emerald-500',
    twRing: 'ring-emerald-500',
  },
  {
    id: 'rose',
    name: 'Neon Rose',
    primary: '#f43f5e',
    secondary: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.45)',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)',
    twText: 'text-rose-400',
    twBg: 'bg-rose-500',
    twBorder: 'border-rose-500',
    twRing: 'ring-rose-500',
  },
  {
    id: 'blue',
    name: 'Hyper Blue',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.45)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    twText: 'text-blue-400',
    twBg: 'bg-blue-500',
    twBorder: 'border-blue-500',
    twRing: 'ring-blue-500',
  },
];

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  accent: ACCENT_PRESETS[0],
  setAccentColor: () => {},
  presets: ACCENT_PRESETS,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('soundcraft_theme') || 'dark';
  });

  const [accentId, setAccentId] = useState(() => {
    return localStorage.getItem('soundcraft_accent') || 'cyan';
  });

  const activeAccent = ACCENT_PRESETS.find((a) => a.id === accentId) || ACCENT_PRESETS[0];

  // Apply dark mode class to html document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('soundcraft_theme', theme);
  }, [theme]);

  // Apply CSS custom properties dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', activeAccent.primary);
    root.style.setProperty('--accent-secondary', activeAccent.secondary);
    root.style.setProperty('--accent-glow', activeAccent.glow);
    root.style.setProperty('--accent-gradient', activeAccent.gradient);
    localStorage.setItem('soundcraft_accent', activeAccent.id);
  }, [activeAccent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setAccentColor = (id) => {
    setAccentId(id);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        accent: activeAccent,
        setAccentColor,
        presets: ACCENT_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
