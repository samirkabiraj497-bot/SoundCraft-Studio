const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// API Routes Wiring
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audio', audioRoutes);

// Catch-all 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `SoundCraft Studio API route ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Startup
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🎵 SoundCraft Studio - Production Audio Backend`);
  console.log(`  🚀 Server listening on: http://localhost:${PORT}`);
  console.log(`  🎛️  Environment: ${process.env.NODE_ENV || 'development'}`);
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
