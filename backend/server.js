const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import database initialization
const { isSupabaseConnected } = require('./config/supabase');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const aiRoutes = require('./routes/aiRoutes');
const audioRoutes = require('./routes/audioRoutes');

// Import error handler middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(
  cors({
    origin: '*', // Allows Vite frontend and cross-origin studio requests
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request Logging Middleware in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] 🎚️ ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Static Frontend Serving (SoundCraft Studio Web Application)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Health Check & Studio Diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'SoundCraft Studio DAW Engine API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isSupabaseConnected() ? 'Supabase Connected' : 'In-Memory / Local Mode Active',
  });
});

// Root Route: Serves the full Studio Web App or JSON status
app.get('/', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath) && (!req.headers.accept || req.accepts('html'))) {
    return res.sendFile(indexPath);
  }
  res.status(200).json({
    status: 'online',
    service: 'SoundCraft Studio DAW Engine API',
    version: '1.0.0',
    studioApp: 'http://localhost:5173',
    database: isSupabaseConnected() ? 'Supabase Connected' : 'In-Memory / Local Mode Active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      ai: '/api/ai',
      audio: '/api/audio',
    },
  });
});

// API Routes Wiring
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audio', audioRoutes);

// SPA Client-Side Routing Fallback (for non-API GET requests)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Catch-all 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `SoundCraft Studio API route ${req.originalUrl} not found. Launch studio at http://localhost:5173 or http://localhost:${PORT}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Startup
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🎵 SoundCraft Studio - Production Audio Suite`);
  console.log(`  🚀 Studio Web App:  http://localhost:${PORT}`);
  console.log(`  ⚡ Vite Dev Server: http://localhost:5173`);
  console.log(`  🎛️  Environment:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📦 Supabase Status: ${isSupabaseConnected() ? 'Active Cloud Client' : 'Active Local Store'}`);
  console.log(`=======================================================`);
});

// Graceful process shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
