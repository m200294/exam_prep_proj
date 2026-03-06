-- ═══════════════════════════════════════════════════════
-- EXAM STUDY SYSTEM — Supabase Schema
-- Run this in your Supabase SQL Editor (one time setup)
--
-- Customize: Change the subject CHECK constraint and
-- seed data to match your own exams.
-- ═══════════════════════════════════════════════════════

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL DEFAULT 'exam_practice' CHECK (type IN ('exam_practice', 'deep_encoding')),
  topics JSONB DEFAULT '[]',
  topic TEXT,
  attempted INT DEFAULT 0,
  correct INT DEFAULT 0,
  partial INT DEFAULT 0,
  wrong INT DEFAULT 0,
  estimated_marks TEXT,
  topic_breakdown JSONB,
  duration_mins INT,
  bloom_level_reached INT,
  layers_covered JSONB,
  concepts_encoded JSONB,
  weak_areas JSONB DEFAULT '[]',
  next_session TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_subject ON sessions(subject);
CREATE INDEX idx_sessions_timestamp ON sessions(timestamp DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════
-- EXAMPLE SEED DATA (optional — delete or replace)
-- ═══════════════════════════════════════════════════════

INSERT INTO sessions (id, subject, timestamp, type, topics, attempted, correct, partial, wrong, estimated_marks, topic_breakdown, weak_areas, next_session)
VALUES (
  'math-example-001',
  'MATH',
  '2026-01-15T10:00:00.000Z',
  'exam_practice',
  '["Calculus", "Linear Algebra"]',
  10, 7, 2, 1,
  '28/40',
  '{"Calculus": {"attempted": 6, "correct": 5, "partial": 1, "wrong": 0}, "Linear Algebra": {"attempted": 4, "correct": 2, "partial": 1, "wrong": 1}}',
  '["Integration by parts", "Eigenvalue computation"]',
  'Focus on Linear Algebra eigenvalues'
);
