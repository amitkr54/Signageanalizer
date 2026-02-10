-- Fire Safety Signage Analyzer - Database Schema
-- Run this in Supabase SQL Editor

-- ====================================
-- 1. REGULATIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  placement_rules JSONB NOT NULL,
  quantity_formula TEXT,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 2. ANALYSIS SESSIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'processing',
  floor_data JSONB,
  total_area FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ====================================
-- 3. DETECTED ELEMENTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS detected_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  confidence FLOAT,
  bbox JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 4. SIGNAGE REQUIREMENTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES regulations(id),
  signage_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  locations JSONB,
  specifications JSONB,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 5. GENERATED REPORTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- SEED: Fire Safety Regulations (NBC India)
-- ====================================
INSERT INTO regulations (code, name, category, placement_rules, specifications) VALUES
  (
    'NBC-7.9',
    'Emergency Exit Signs',
    'exit_signage',
    '{"location": "above_exit", "height": "max_6_inches_below_ceiling", "visibility": "100_feet"}',
    '{"size": "12x6 inches", "type": "LED illuminated", "power": "backup_battery_required", "color": "green_background_white_text"}'
  ),
  (
    'NBC-7.10.1',
    'Fire Extinguisher Location Signs',
    'fire_equipment',
    '{"location": "above_extinguisher", "height": "5-6_feet", "spacing": "max_75_feet_travel_distance"}',
    '{"size": "8x10 inches", "color": "red_background_white_text", "symbol": "fire_extinguisher_pictogram"}'
  ),
  (
    'NBC-3.2.4.19',
    'Fire Alarm Pull Station Sign',
    'alarm_system',
    '{"location": "near_exits_and_corridors", "height": "3.5-4_feet"}',
    '{"size": "6x6 inches", "color": "red", "text": "FIRE_ALARM"}'
  ),
  (
    'NBC-7.11',
    'Directional Exit Signs',
    'exit_signage',
    '{"location": "corridors_leading_to_exits", "spacing": "every_30_feet"}',
    '{"size": "10x8 inches", "type": "LED_with_arrow", "color": "green"}'
  ),
  (
    'NBC-ASSEMBLY',
    'Assembly Point Sign',
    'evacuation',
    '{"location": "outside_building", "visibility": "clear_from_multiple_exits"}',
    '{"size": "18x12 inches", "mounting": "post_mounted", "color": "green_background_white_symbol"}'
  ),
  (
    'NBC-NO-SMOKING',
    'No Smoking Signs',
    'general_safety',
    '{"location": "all_indoor_areas", "spacing": "visible_at_entry_points"}',
    '{"size": "6x6 inches", "symbol": "no_smoking_pictogram"}'
  )
ON CONFLICT (code) DO NOTHING;

-- ====================================
-- CREATE INDEXES
-- ====================================
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elements_session ON detected_elements(session_id);
CREATE INDEX IF NOT EXISTS idx_requirements_session ON requirements(session_id);
CREATE INDEX IF NOT EXISTS idx_regulations_category ON regulations(category);

-- ====================================
-- STORAGE BUCKET FOR FLOOR PLANS
-- ====================================
-- Run this separately or ensure storage is enabled
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', false)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- SUCCESS MESSAGE
-- ====================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '✅ Fire safety regulations seeded!';
  RAISE NOTICE '✅ Indexes created!';
  RAISE NOTICE '✅ Storage bucket configured!';
END $$;
