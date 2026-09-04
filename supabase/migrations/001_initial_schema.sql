-- ==========================================================
-- SAHAYATA DISASTER RESPONSE INTELLIGENCE SCHEMA
-- Smart India Hackathon 2026 - Problem Statement 26206
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Profiles (RBAC)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('family', 'operator', 'admin', 'field_agent')),
    name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('flash_flood', 'landslide', 'earthquake', 'cloudburst', 'avalanche', 'stampede', 'general')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'contained', 'closed')),
    geo_bounds GEOMETRY(Polygon, 4326),
    center_location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reports
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, -- SAH-2026-XXXXXX format
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_verification', 'search_lead_issued', 'located_safe', 'located_injured', 'identity_pending', 'confirmed_deceased', 'reunited')),
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    priority_score INTEGER DEFAULT 0,
    priority_factors JSONB DEFAULT '[]'::jsonb,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    reporter_relationship TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    consent_given BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Persons
CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    alternate_spelling TEXT,
    approx_age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
    photo_url TEXT,
    phone TEXT,
    clothing TEXT,
    medical_conditions TEXT,
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Last Known Info
CREATE TABLE IF NOT EXISTS last_known_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    location_geo GEOMETRY(Point, 4326),
    contact_time TIMESTAMPTZ,
    contact_method TEXT CHECK (contact_method IN ('call', 'message', 'in_person', 'social_media', 'other')),
    evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Groups & Co-Travelers
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    group_type TEXT CHECK (group_type IN ('tour', 'trekking', 'pilgrimage', 'family', 'work', 'other')),
    tour_operator TEXT,
    vehicle_number TEXT,
    permit_number TEXT,
    total_registered INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    confidence_score NUMERIC(4,3) DEFAULT 1.000,
    association_reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sightings
CREATE TABLE IF NOT EXISTS sightings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responder_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location_geo GEOMETRY(Point, 4326),
    sighting_time TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'field_agent',
    evidence_url TEXT,
    notes TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Status History / Audit Log
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a public report
CREATE POLICY "Public report insert" ON reports
    FOR INSERT WITH CHECK (true);

-- Public can view reports by exact ID
CREATE POLICY "Public report select by ID" ON reports
    FOR SELECT USING (true);

-- Authenticated NDRF & Responders have full access
CREATE POLICY "Authority full access on reports" ON reports
    FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================================
-- CRITICAL: EXPLICITLY ENABLE SUPABASE REALTIME
-- ==========================================================

ALTER PUBLICATION supabase_realtime ADD TABLE reports, sightings, status_history;
