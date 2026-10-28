/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          darkest: 'rgb(var(--bg-studio-darkest) / <alpha-value>)',
          darker: 'rgb(var(--bg-studio-darker) / <alpha-value>)',
          card: 'rgb(var(--bg-studio-card) / <alpha-value>)',
          cardHover: 'rgb(var(--bg-studio-card-hover) / <alpha-value>)',
          border: 'rgb(var(--border-studio) / <alpha-value>)',
          text: 'rgb(var(--text-studio-primary) / <alpha-value>)',
          textMuted: 'rgb(var(--text-studio-muted) / <alpha-value>)',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
