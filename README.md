# 🎵 SoundCraft Studio - Web-Based Music Production Studio

SoundCraft Studio is a production-grade, full-stack Digital Audio Workstation (DAW) and intelligent music production studio built as a monorepo with a Node.js/Express MVC backend and a React/Vite/Tailwind CSS frontend.

---

## 📁 Monorepo Directory Tree

```
SoundCraft Studio/
├── backend/
│   ├── .env.example              # Server environment template
│   ├── .env                      # Active development environment
│   ├── package.json              # Backend dependencies (Express, bcryptjs, JWT, Supabase)
│   ├── supabase_schema.sql       # PostgreSQL DDL with RLS, tables, and indexes
│   ├── server.js                 # Express application & middleware wiring
│   ├── config/
│   │   └── supabase.js           # Supabase client initializer with fallback store
│   ├── models/
│   │   ├── User.js               # User authentication & settings data access
│   │   ├── Project.js            # DAW session persistence model
│   │   ├── Stem.js               # Multitrack audio stems model
│   │   └── Lyric.js              # AI generated lyrics sheet model
│   ├── controllers/
│   │   ├── authController.js     # bcrypt salting/hashing & JWT issuing
│   │   ├── projectController.js  # Project session CRUD
│   │   ├── aiController.js       # AI Musician arrangement & lyric generator
│   │   └── audioController.js    # Stem splitting simulator & export packager
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── projectRoutes.js      # /api/projects endpoints
│   │   ├── aiRoutes.js           # /api/ai endpoints
│   │   └── audioRoutes.js        # /api/audio endpoints
│   └── middleware/
│       ├── authMiddleware.js     # JWT verification & role authorization
│       └── errorHandler.js       # Centralized error handler
│
├── frontend/
│   ├── .env.example              # Frontend environment template
│   ├── .env                      # Active development environment
│   ├── package.json              # React 19, Vite, Tailwind CSS, Lucide icons
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # OLED dark mode & custom studio palette
│   ├── postcss.config.js         # PostCSS plugins
│   ├── index.html                # App entry with Inter & JetBrains Mono fonts
│   └── src/
│       ├── main.jsx              # React DOM mounting
│       ├── App.jsx               # Application root with ThemeProvider
│       ├── index.css             # Tailwind base & vinyl groove styling
│       ├── context/
│       │   └── ThemeContext.jsx  # OLED Dark/Light mode & 6 accent presets
│       ├── audio/
│       │   ├── synthEngine.js    # Web Audio polyphonic synthesizer & scratch engine
│       │   ├── drumEngine.js     # Web Audio 808 kick, snare, hi-hat & clap synthesis
│       │   └── wavExport.js      # OfflineAudioContext lossless WAV file renderer
│       ├── data/
│       │   └── instrumentsData.js # 105+ categorized virtual instruments
│       ├── services/
│       │   └── api.js            # Backend API client with offline fallback
│       └── components/
│           ├── Navbar.jsx            # Studio header with navigation & profile
│           ├── TransportBar.jsx      # Master Play/Stop/Rec, BPM tap, VU meter
│           ├── StudioDashboard.jsx   # Main DAW workspace incorporating all engines
│           ├── InstrumentVault.jsx   # Searchable 105+ instrument grid
│           ├── PianoRollKeyboard.jsx # QWERTY/MIDI keyboard & 16-pad drum triggers
│           ├── AiMusicianPanel.jsx   # AI Arranger prompt & groove generator
│           ├── AiLyricGenerator.jsx  # AI Songwriter with rhyme schemes & tones
│           ├── LyricTeleprompter.jsx # Rolling teleprompter synced above timeline
│           ├── StemSplitterModal.jsx # Drag-and-drop audio stem separator
│           ├── MultitrackTimeline.jsx# Non-destructive DAW timeline & mixer
│           ├── DjTurntableDeck.jsx   # Dual interactive vinyl scratch decks
│           ├── ExportModal.jsx       # 1-click lossless WAV/MP3/Project exporter
│           └── AuthModal.jsx         # Producer sign in & registration modal
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`/backend/.env`)
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=soundcraft_studio_ultra_secret_key_987654321_jwt
JWT_EXPIRES_IN=7d

# Supabase Credentials (Optional for live cloud sync)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (`/frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Quickstart Guide

### 1. Start the Backend API
```bash
cd backend
npm install
node server.js
```
The server will boot on `http://localhost:5000` with active REST endpoints.

### 2. Start the Frontend Single Page Application
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🎛️ Key Architectural Features

1. **Global Theme Engine**:
   - Deep OLED **Dark Mode** optimized for low-light studio sessions.
   - Clean **Light Mode** for daytime clarity.
   - 6 Instant Accent Color Palettes: *Cyber Cyan, Electric Purple, Sunset Amber, Matrix Emerald, Neon Rose, Hyper Blue*.

2. **Virtual Instrument Vault (100+ Presets)**:
   - 105 meticulously categorized instruments (Synths, Keys, Strings, Drums, Ethnic/World).
   - Real-time search by name, genre, and acoustic tags.
   - Interactive on-screen trigger pads and QWERTY/MIDI keyboard mapping for instant note playing via Web Audio API.

3. **AI Session Musician & Arranger**:
   - Generates chord progressions, 16-step drum loops, and 808/analog basslines based on genre (Synthwave, Trap, Lo-Fi, Deep House, Orchestral) and custom prompts.
   - Audition preview with one-click injection into the DAW Multitrack Timeline.

4. **AI Lyric Generator & Synced Teleprompter**:
   - Prompt-based songwriter with configurable rhyme schemes (AABB, ABAB, AAAA, Free Verse) and emotional tones.
   - Rolling teleprompter docked directly above the timeline with real-time playhead synchronization and auto-scrolling.

5. **Audio Stem Splitter & Multitrack Timeline**:
   - Drag-and-drop file uploader with simulated 4-stem decomposition (Vocals, Drums, Bass, Other).
   - Non-destructive multitrack timeline with Solo (`S`), Mute (`M`), Record Arm (`R`), Volume faders, and animated waveform visualizers.

6. **Virtual DJ Turntable Decks**:
   - Dual rotating vinyl decks with realistic mouse-drag vinyl scratching audio physics.
   - Pitch fader sliders (+/- 16%), loop pads, tempo sync lock, and smooth crossfader.

7. **One-Click Audio Export**:
   - Direct browser-side rendering using `OfflineAudioContext` to export real Master WAV (24-bit PCM), MP3, or `.soundcraft` project state files.
