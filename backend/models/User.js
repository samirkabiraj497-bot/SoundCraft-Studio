const { supabase, isSupabaseConnected } = require('../config/supabase');
const crypto = require('crypto');

// In-memory fallback repository
const inMemoryUsers = [];

class User {
  /**
   * Find a user by email address
   */
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn(`[Supabase Fallback] findByEmail: ${err.message}. Using local store.`);
      }
    }

    return inMemoryUsers.find((u) => u.email === normalizedEmail) || null;
  }

  /**
   * Find a user by ID
   */
  static async findById(id) {
    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, username, avatar_url, role, settings, created_at')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn(`[Supabase Fallback] findById: ${err.message}. Using local store.`);
      }
    }

    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Create a new user record with hashed password
   */
  static async create({ email, password_hash, username, avatar_url = '', role = 'producer' }) {
    const normalizedEmail = email.toLowerCase().trim();
    const newUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password_hash,
      username: username.trim(),
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      role,
      settings: { theme: 'dark', accentColor: 'cyan', bufferSize: 512 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn(`[Supabase Fallback] create: ${err.message}. Saving to local store.`);
      }
    }

    inMemoryUsers.push(newUser);
    return newUser;
  }

  /**
   * Update user settings (e.g. theme preference, accent)
   */
  static async updateSettings(id, settings) {
    if (isSupabaseConnected()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ settings, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn(`[Supabase Fallback] updateSettings: ${err.message}.`);
      }
    }

    const userIndex = inMemoryUsers.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      inMemoryUsers[userIndex].settings = { ...inMemoryUsers[userIndex].settings, ...settings };
      return inMemoryUsers[userIndex];
    }
    return null;
  }
}

module.exports = User;
