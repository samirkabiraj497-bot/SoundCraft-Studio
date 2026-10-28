const { supabase, isSupabaseConnected } = require('../config/supabase');
const crypto = require('crypto');

const inMemoryLyrics = [];

class Lyric {
  /**
   * Create and store a lyric generation sheet
   */
  static async create({ userId, projectId = null, title, theme, mood, rhymeScheme, tone, content, structure = [] }) {
    const lyric = {
      id: crypto.randomUUID(),
      user_id: userId,
      project_id: projectId,
      title: title || 'Untitled Lyrics',
      theme,
      mood: mood || 'Inspiring',
      rhyme_scheme: rhymeScheme || 'AABB',
      tone: tone || 'Melodic',
      content,
      structure,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('lyrics')
        .insert([lyric])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    inMemoryLyrics.push(lyric);
    return lyric;
  }

  /**
   * Find lyrics saved by a user
   */
  static async findByUser(userId) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    }

    return inMemoryLyrics
      .filter((l) => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Find lyric by ID
   */
  static async findById(id) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('lyrics')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    return inMemoryLyrics.find((l) => l.id === id) || null;
  }

  /**
   * Update lyric content
   */
  static async update(id, updates) {
    const payload = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('lyrics')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const index = inMemoryLyrics.findIndex((l) => l.id === id);
    if (index !== -1) {
      inMemoryLyrics[index] = { ...inMemoryLyrics[index], ...payload };
      return inMemoryLyrics[index];
    }
    return null;
  }
}

module.exports = Lyric;
