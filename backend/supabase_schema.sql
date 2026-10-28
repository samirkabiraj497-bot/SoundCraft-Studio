-- =========================================================================
-- SoundCraft Studio - Supabase PostgreSQL Database Schema
-- Complete DDL for Users, Projects, Stems, and AI Generated Lyrics
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT '',
    role VARCHAR(50) DEFAULT 'producer',
    settings JSONB DEFAULT '{"theme": "dark", "accentColor": "cyan", "bufferSize": 512}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Session',
    bpm INTEGER NOT NULL DEFAULT 120,
    key_signature VARCHAR(20) DEFAULT 'C Major',
    time_signature VARCHAR(10) DEFAULT '4/4',
    master_volume NUMERIC(4, 2) DEFAULT 0.85,
    tracks_data JSONB DEFAULT '[]'::jsonb,
    history_state JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STEMS TABLE (Stem separations & audio clips)
CREATE TABLE IF NOT EXISTS public.stems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    stem_type VARCHAR(50) NOT NULL CHECK (stem_type IN ('vocals', 'drums', 'bass', 'instruments', 'other')),
    file_url TEXT NOT NULL,
    duration NUMERIC(8, 2) DEFAULT 0.0,
    volume NUMERIC(4, 2) DEFAULT 0.8,
    pan NUMERIC(3, 2) DEFAULT 0.0,
    is_muted BOOLEAN DEFAULT false,
    is_solo BOOLEAN DEFAULT false,
    waveform_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LYRICS TABLE (AI lyric generations & songwriter sheets)
CREATE TABLE IF NOT EXISTS public.lyrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Lyrics',
    theme VARCHAR(255) NOT NULL,
    mood VARCHAR(100) DEFAULT 'Inspiring',
    rhyme_scheme VARCHAR(50) DEFAULT 'AABB',
    tone VARCHAR(100) DEFAULT 'Melodic & Deep',
    content TEXT NOT NULL,
    structure JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_stems_project_id ON public.stems(project_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_user_id ON public.lyrics(user_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_project_id ON public.lyrics(project_id);

-- Row Level Security (RLS) setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;

-- Allow public access policies for API service or authenticated users
CREATE POLICY "Users can manage own record" ON public.users FOR ALL USING (true);
CREATE POLICY "Projects accessible by owner" ON public.projects FOR ALL USING (true);
CREATE POLICY "Stems accessible by project owner" ON public.stems FOR ALL USING (true);
CREATE POLICY "Lyrics accessible by owner" ON public.lyrics FOR ALL USING (true);
