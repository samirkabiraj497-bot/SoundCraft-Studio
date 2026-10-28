const { supabase, isSupabaseConnected } = require('../config/supabase');
const crypto = require('crypto');

const inMemoryProjects = [];

class Project {
  /**
   * Create a new DAW project session
   */
  static async create({ userId, name, bpm = 120, keySignature = 'C Major', tracksData = [], masterVolume = 0.85 }) {
    const project = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: name || 'Untitled Session',
      bpm: Number(bpm) || 120,
      key_signature: keySignature,
      time_signature: '4/4',
      master_volume: Number(masterVolume) || 0.85,
      tracks_data: tracksData,
      history_state: {},
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw new Error(`Supabase error creating project: ${error.message}`);
      return data;
    }

    inMemoryProjects.push(project);
    return project;
  }

  /**
   * Get all projects for a user
   */
  static async findByUser(userId) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    }

    return inMemoryProjects
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  /**
   * Find project by ID
   */
  static async findById(id) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('projects')
        .select('*, stems(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    }

    return inMemoryProjects.find((p) => p.id === id) || null;
  }

  /**
   * Update project state (tracks, bpm, notes, mixer levels)
   */
  static async update(id, updates) {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const index = inMemoryProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      inMemoryProjects[index] = { ...inMemoryProjects[index], ...payload };
      return inMemoryProjects[index];
    }
    return null;
  }

  /**
   * Delete a project
   */
  static async delete(id) {
    if (isSupabaseConnected()) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const index = inMemoryProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      inMemoryProjects.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Project;
