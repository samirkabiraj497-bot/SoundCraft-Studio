const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let isConnected = false;

// Check if production-valid URL and key are provided
const isConfigured =
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('mock') &&
  !supabaseUrl.includes('your-project') &&
  supabaseKey &&
  !supabaseKey.includes('placeholder') &&
  !supabaseKey.includes('mock');

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    isConnected = true;
    console.log('✅ Supabase client initialized successfully at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Supabase initialization error, falling back to local memory store:', err.message);
  }
} else {
  console.log('ℹ️ Running in Local High-Performance Store mode. Supabase cloud sync will automatically activate when production credentials are configured.');
}

module.exports = {
  supabase,
  isSupabaseConnected: () => isConnected,
};
