-- Migration: Create Self-Help Resources Tables
-- Version: 007
-- Description: Creates all tables required for the self-help resources module
-- Author: ASTRAL Team
-- Date: 2025-09-17

BEGIN;

-- ============================================================================
-- MOOD TRACKING TABLES
-- ============================================================================

-- Main mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  emotions JSONB NOT NULL DEFAULT '[]',
  triggers JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  notes TEXT,
  location GEOGRAPHY(POINT),
  weather_data JSONB,
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  medication_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'guided', 'gratitude', 'reflection')),
  prompt TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score BETWEEN -1 AND 1),
  sentiment_data JSONB,
  ai_insights JSONB DEFAULT '[]',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- THERAPEUTIC TOOLS TABLES
-- ============================================================================

-- Exercise definitions table
CREATE TABLE IF NOT EXISTS therapeutic_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('breathing', 'meditation', 'grounding', 'movement', 'other')),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL DEFAULT '[]',
  duration_seconds INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  pattern_data JSONB, -- Breathing patterns, meditation scripts, etc.
  media_urls JSONB DEFAULT '{}',
  benefits TEXT[],
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  clinically_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise usage tracking
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES therapeutic_exercises(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 10),
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  notes TEXT,
  session_data JSONB DEFAULT '{}', -- Exercise-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAFETY PLANNING TABLES
-- ============================================================================

-- Safety plans table
CREATE TABLE IF NOT EXISTS safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  warning_signs JSONB DEFAULT '[]',
  coping_strategies JSONB DEFAULT '[]',
  distraction_contacts JSONB DEFAULT '[]',
  support_contacts JSONB DEFAULT '[]',
  professional_contacts JSONB DEFAULT '[]',
  safe_environment_steps JSONB DEFAULT '[]',
  reasons_to_live JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  share_with_therapist BOOLEAN DEFAULT false,
  shared_with_users UUID[] DEFAULT '{}',
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, version)
);

-- Hope box items table
CREATE TABLE IF NOT EXISTS hope_box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'photo', 'video', 'audio', 'text', 'quote', 'letter', 
    'achievement', 'memory', 'gratitude', 'affirmation', 'song', 'poem'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT, -- For text-based items
  media_url TEXT, -- For media items
  media_thumbnail_url TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  source TEXT, -- Who gave it or where it's from
  is_private BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  mood_when_added INTEGER CHECK (mood_when_added BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COPING STRATEGIES TABLES
-- ============================================================================

-- Global coping strategies library
CREATE TABLE IF NOT EXISTS coping_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) CHECK (category IN (
    'distraction', 'self-soothing', 'mindfulness', 'physical',
    'creative', 'social', 'cognitive', 'spiritual'
  )),
  description TEXT,
  instructions TEXT,
  preparation_steps TEXT[],
  requires_preparation BOOLEAN DEFAULT false,
  effectiveness_data JSONB DEFAULT '{}',
  evidence_base TEXT,
  related_tool_id UUID REFERENCES therapeutic_exercises(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-specific coping effectiveness tracking
CREATE TABLE IF NOT EXISTS user_coping_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES coping_strategies(id),
  usage_count INTEGER DEFAULT 0,
  total_effectiveness_score INTEGER DEFAULT 0,
  average_effectiveness DECIMAL(3,2),
  last_used TIMESTAMPTZ,
  notes TEXT,
  custom_modifications TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- ============================================================================
-- TRIGGER MANAGEMENT TABLES
-- ============================================================================

-- User triggers table
CREATE TABLE IF NOT EXISTS user_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('internal', 'external', 'situational')),
  category VARCHAR(50),
  description TEXT NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  frequency VARCHAR(20) CHECK (frequency IN ('never', 'rare', 'occasional', 'frequent', 'constant')),
  predictability VARCHAR(20) CHECK (predictability IN ('unpredictable', 'somewhat', 'predictable')),
  warning_time_minutes INTEGER,
  coping_strategy_ids UUID[] DEFAULT '{}',
  last_occurrence TIMESTAMPTZ,
  occurrence_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger patterns table
CREATE TABLE IF NOT EXISTS trigger_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  trigger_ids UUID[] NOT NULL,
  frequency DECIMAL(5,2),
  time_pattern VARCHAR(100),
  seasonal_pattern VARCHAR(100),
  confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  first_detected TIMESTAMPTZ DEFAULT NOW(),
  last_detected TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EDUCATIONAL CONTENT TABLES
-- ============================================================================

-- Educational content library
CREATE TABLE IF NOT EXISTS educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('article', 'video', 'podcast', 'infographic', 'course')),
  category VARCHAR(100) NOT NULL,
  subcategories TEXT[] DEFAULT '{}',
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT, -- For articles and text content
  media_url TEXT, -- For videos, podcasts, etc.
  thumbnail_url TEXT,
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(255),
  author_credentials TEXT,
  reviewed_by JSONB DEFAULT '[]', -- Clinical reviewers
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  reading_time_minutes INTEGER,
  duration_seconds INTEGER, -- For videos/audio
  tags TEXT[] DEFAULT '{}',
  related_content_ids UUID[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  clinically_validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMPTZ,
  user_rating DECIMAL(2,1) CHECK (user_rating BETWEEN 0 AND 5),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User content progress tracking
CREATE TABLE IF NOT EXISTS user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES educational_content(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  time_spent_seconds INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- ============================================================================
-- GOALS AND PROGRESS TRACKING TABLES
-- ============================================================================

-- User goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  type VARCHAR(20) CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit VARCHAR(50),
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  related_strategy_ids UUID[] DEFAULT '{}',
  reminders_enabled BOOLEAN DEFAULT false,
  reminder_frequency VARCHAR(20),
  completion_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal progress tracking
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  progress_value DECIMAL NOT NULL,
  notes TEXT,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS AND INSIGHTS TABLES
-- ============================================================================

-- User insights table (AI-generated insights)
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pattern', 'correlation', 'improvement', 'warning', 'achievement')),
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  importance VARCHAR(10) CHECK (importance IN ('low', 'medium', 'high')),
  actionable BOOLEAN DEFAULT false,
  actions_suggested JSONB DEFAULT '[]',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements/milestones
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  category VARCHAR(50),
  points INTEGER DEFAULT 0,
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Mood tracking indexes
CREATE INDEX idx_mood_entries_user_timestamp ON mood_entries(user_id, timestamp DESC);
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, (timestamp::date) DESC);
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_fulltext ON journal_entries USING gin(to_tsvector('english', content));

-- Exercise and session indexes
CREATE INDEX idx_exercise_sessions_user_completed ON exercise_sessions(user_id, completed_at DESC);
CREATE INDEX idx_exercise_sessions_exercise ON exercise_sessions(exercise_id, created_at DESC);
CREATE INDEX idx_therapeutic_exercises_type ON therapeutic_exercises(type) WHERE is_active = true;

-- Safety planning indexes
CREATE INDEX idx_safety_plans_user_active ON safety_plans(user_id, is_active);
CREATE INDEX idx_hope_box_user_category ON hope_box_items(user_id, category);
CREATE INDEX idx_hope_box_user_favorite ON hope_box_items(user_id) WHERE is_favorite = true;

-- Coping and triggers indexes
CREATE INDEX idx_user_coping_effectiveness_user ON user_coping_effectiveness(user_id);
CREATE INDEX idx_user_triggers_user_frequency ON user_triggers(user_id, frequency);
CREATE INDEX idx_trigger_patterns_user ON trigger_patterns(user_id);

-- Content indexes
CREATE INDEX idx_educational_content_category ON educational_content(category) WHERE is_published = true;
CREATE INDEX idx_educational_content_fulltext ON educational_content 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_user_content_progress_user ON user_content_progress(user_id, completed_at DESC);

-- Goals and progress indexes
CREATE INDEX idx_user_goals_user_status ON user_goals(user_id, status);
CREATE INDEX idx_goal_progress_goal_recorded ON goal_progress(goal_id, recorded_at DESC);

-- Analytics indexes
CREATE INDEX idx_user_insights_user_importance ON user_insights(user_id, importance, created_at DESC);
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_plans_updated_at BEFORE UPDATE ON safety_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hope_box_items_updated_at BEFORE UPDATE ON hope_box_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate average coping effectiveness
CREATE OR REPLACE FUNCTION calculate_average_effectiveness()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.usage_count > 0 THEN
    NEW.average_effectiveness = NEW.total_effectiveness_score::DECIMAL / NEW.usage_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_coping_effectiveness BEFORE INSERT OR UPDATE ON user_coping_effectiveness
  FOR EACH ROW EXECUTE FUNCTION calculate_average_effectiveness();

-- Function to increment hope box item access count
CREATE OR REPLACE FUNCTION increment_hope_box_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hope_box_items 
  SET access_count = access_count + 1,
      last_accessed = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTITION TABLES FOR SCALABILITY
-- ============================================================================

-- Create partitioned mood_entries table for better performance at scale
CREATE TABLE IF NOT EXISTS mood_entries_partitioned (
  LIKE mood_entries INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create initial partitions (example for 2025)
CREATE TABLE IF NOT EXISTS mood_entries_2025_q1 PARTITION OF mood_entries_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS mood_entries_2025_q2 PARTITION OF mood_entries_partitioned
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS mood_entries_2025_q3 PARTITION OF mood_entries_partitioned
  FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS mood_entries_2025_q4 PARTITION OF mood_entries_partitioned
  FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- User mood trends materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_mood_trends AS
SELECT 
  user_id,
  date_trunc('day', timestamp) as day,
  AVG(mood_score) as avg_mood,
  AVG(energy_level) as avg_energy,
  AVG(anxiety_level) as avg_anxiety,
  AVG(stress_level) as avg_stress,
  COUNT(*) as entry_count,
  array_agg(DISTINCT emotions) as all_emotions
FROM mood_entries
WHERE timestamp >= CURRENT_DATE - interval '90 days'
GROUP BY user_id, date_trunc('day', timestamp);

CREATE INDEX idx_mood_trends_user_day ON user_mood_trends(user_id, day DESC);

-- Weekly exercise effectiveness view
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_exercise_effectiveness AS
SELECT 
  e.user_id,
  e.exercise_id,
  te.name as exercise_name,
  te.type as exercise_type,
  date_trunc('week', e.started_at) as week,
  COUNT(*) as session_count,
  AVG(e.effectiveness_rating) as avg_effectiveness,
  AVG(e.mood_after - e.mood_before) as avg_mood_improvement,
  SUM(e.duration_seconds) as total_duration_seconds
FROM exercise_sessions e
JOIN therapeutic_exercises te ON e.exercise_id = te.id
WHERE e.completed = true 
  AND e.started_at >= CURRENT_DATE - interval '12 weeks'
GROUP BY e.user_id, e.exercise_id, te.name, te.type, date_trunc('week', e.started_at);

CREATE INDEX idx_weekly_exercise_user_week ON weekly_exercise_effectiveness(user_id, week DESC);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant appropriate permissions to application role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO astral_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO astral_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO astral_app;

-- ============================================================================
-- SEED DATA FOR COPING STRATEGIES (Optional, but recommended)
-- ============================================================================

INSERT INTO coping_strategies (name, slug, category, description, instructions, evidence_base) VALUES
  ('Deep Breathing', 'deep-breathing', 'mindfulness', 
   'Slow, controlled breathing to activate the parasympathetic nervous system',
   'Breathe in slowly for 4 counts, hold for 4, exhale for 6. Repeat 5-10 times.',
   'Proven effective for anxiety reduction (Zaccaro et al., 2018)'),
  
  ('Progressive Muscle Relaxation', 'pmr', 'physical',
   'Systematic tensing and releasing of muscle groups',
   'Starting with your toes, tense each muscle group for 5 seconds then release. Work up to your head.',
   'Effective for stress and anxiety (Manzoni et al., 2008)'),
  
  ('5-4-3-2-1 Grounding', '54321-grounding', 'mindfulness',
   'Sensory grounding technique to manage dissociation and anxiety',
   'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.',
   'Widely used in trauma therapy (SAMHSA, 2014)'),
  
  ('Distraction Through Activity', 'activity-distraction', 'distraction',
   'Engaging in absorbing activities to redirect focus',
   'Choose an activity that requires focus: puzzles, reading, crafts, exercise.',
   'Effective for managing urges and intrusive thoughts')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (Save separately)
-- ============================================================================
/*
BEGIN;
DROP MATERIALIZED VIEW IF EXISTS weekly_exercise_effectiveness CASCADE;
DROP MATERIALIZED VIEW IF EXISTS user_mood_trends CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_insights CASCADE;
DROP TABLE IF EXISTS goal_progress CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS user_content_progress CASCADE;
DROP TABLE IF EXISTS educational_content CASCADE;
DROP TABLE IF EXISTS trigger_patterns CASCADE;
DROP TABLE IF EXISTS user_triggers CASCADE;
DROP TABLE IF EXISTS user_coping_effectiveness CASCADE;
DROP TABLE IF EXISTS coping_strategies CASCADE;
DROP TABLE IF EXISTS hope_box_items CASCADE;
DROP TABLE IF EXISTS safety_plans CASCADE;
DROP TABLE IF EXISTS exercise_sessions CASCADE;
DROP TABLE IF EXISTS therapeutic_exercises CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS mood_entries_partitioned CASCADE;
DROP TABLE IF EXISTS mood_entries CASCADE;
DROP FUNCTION IF EXISTS increment_hope_box_access() CASCADE;
DROP FUNCTION IF EXISTS calculate_average_effectiveness() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
COMMIT;
*/