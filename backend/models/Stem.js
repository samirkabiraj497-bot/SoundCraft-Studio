const { supabase, isSupabaseConnected } = require('../config/supabase');
const crypto = require('crypto');

const inMemoryStems = [];

class Stem {
  /**
   * Register a stem separation track for a project
   */
  static async create({ projectId, name, stemType, fileUrl, duration = 0, volume = 0.8, pan = 0, waveform = [] }) {
    const stem = {
      id: crypto.randomUUID(),
      project_id: projectId,
      name,
      stem_type: stemType,
      file_url: fileUrl,
      duration: Number(duration) || 0,
      volume: Number(volume) || 0.8,
      pan: Number(pan) || 0,
      is_muted: false,
      is_solo: false,
      waveform_data: waveform,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('stems')
        .insert([stem])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    inMemoryStems.push(stem);
    return stem;
  }

  /**
   * Find all stems for a specific project
   */
  static async findByProjectId(projectId) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('stems')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    }

    return inMemoryStems.filter((s) => s.project_id === projectId);
  }

  /**
   * Update stem mixer controls (volume, pan, mute, solo)
   */
  static async update(id, updates) {
    if (isSupabaseConnected()) {
      const { data, error } = await supabase
        .from('stems')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const index = inMemoryStems.findIndex((s) => s.id === id);
    if (index !== -1) {
      inMemoryStems[index] = { ...inMemoryStems[index], ...updates };
      return inMemoryStems[index];
    }
    return null;
  }

  /**
   * Delete a stem track
   */
  static async delete(id) {
    if (isSupabaseConnected()) {
      const { error } = await supabase.from('stems').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const index = inMemoryStems.findIndex((s) => s.id === id);
    if (index !== -1) {
      inMemoryStems.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Stem;
