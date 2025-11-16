import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fallback SQL (embedded) – used if the migration.sql file is not available in the container
const MIGRATION_SQL_FALLBACK = `
create extension if not exists pg_cron;

-- 1) Course Builder
create table if not exists public.course_builder_cache (
  snapshot_date date not null,
  course_id text not null,
  course_name text not null,
  "totalEnrollments" int,
  "activeEnrollment" int,
  "completionRate" numeric(5,2),
  "averageRating"  numeric(3,2),
  "createdAt" timestamptz,
  feedback text,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, course_id)
);
create index if not exists idx_cb_cache_date on public.course_builder_cache(snapshot_date);

-- 2) Assessments
create table if not exists public.assessments_cache (
  snapshot_date date not null,
  user_id  text not null,
  course_id text not null,
  exam_type text not null check (exam_type in ('precourse','midcourse','postcourse')),
  attempt_no int not null,
  passing_grade int,
  final_grade int,
  passed boolean,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, user_id, course_id, exam_type, attempt_no)
);
create index if not exists idx_asmt_cache_date on public.assessments_cache(snapshot_date);

-- 3) Content Studio — Cleanup old cache tables
DROP INDEX IF EXISTS idx_csc_cache_date;
DROP INDEX IF EXISTS idx_csc_cache_course;
DROP TABLE IF EXISTS public.content_studio_contents_cache;
DROP TABLE IF EXISTS public.content_studio_overview_cache;

-- 4) Learning Analytics - Normalized Schema
-- Drop old table and indexes
DROP INDEX IF EXISTS idx_la_cache_date;
DROP INDEX IF EXISTS idx_la_cache_period;
DROP TABLE IF EXISTS public.learning_analytics_cache;

-- 4.1) Snapshot table (main anchor table)
CREATE TABLE IF NOT EXISTS public.learning_analytics_snapshot (
  id              BIGSERIAL PRIMARY KEY,
  snapshot_date   date NOT NULL,
  period          text NOT NULL,
  start_date      timestamp with time zone NOT NULL,
  end_date        timestamp with time zone NOT NULL,
  calculated_at   timestamp with time zone NOT NULL,
  ingested_at     timestamp with time zone NOT NULL DEFAULT now(),
  version         text NOT NULL DEFAULT '1.0',
  raw_payload     jsonb
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'learning_analytics_snapshot_period_check'
  ) THEN
    ALTER TABLE public.learning_analytics_snapshot
      ADD CONSTRAINT learning_analytics_snapshot_period_check
      CHECK (period = ANY (ARRAY['daily', 'weekly', 'monthly']));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_la_snapshot_date
  ON public.learning_analytics_snapshot (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_la_snapshot_period
  ON public.learning_analytics_snapshot (period, start_date, end_date);

-- 4.2) Metrics tables (one-to-one with snapshot)
-- Learners
CREATE TABLE IF NOT EXISTS public.learning_analytics_learners (
  snapshot_id         bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  total_learners      integer NOT NULL,
  active_learners     integer NOT NULL,
  total_organizations integer NOT NULL
);

-- Courses
CREATE TABLE IF NOT EXISTS public.learning_analytics_courses (
  snapshot_id                    bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  total_courses                  integer NOT NULL,
  courses_completed              integer NOT NULL,
  average_completion_rate        numeric(5, 2) NOT NULL,
  total_enrollments              integer NOT NULL,
  active_enrollments             integer NOT NULL,
  average_course_duration_hours  numeric(6, 2) NOT NULL,
  average_lessons_per_course     numeric(6, 2) NOT NULL
);

-- Content
CREATE TABLE IF NOT EXISTS public.learning_analytics_content (
  snapshot_id                bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  total_topics               integer NOT NULL,
  average_topics_per_content numeric(6, 2) NOT NULL
);

-- Skills / Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_analytics_skills (
  snapshot_id                      bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  total_skills_acquired            integer NOT NULL,
  average_skills_per_competency    numeric(6, 2) NOT NULL,
  total_unique_learning_paths      integer NOT NULL,
  average_skills_per_learning_path numeric(6, 2) NOT NULL
);

-- Assessments
CREATE TABLE IF NOT EXISTS public.learning_analytics_assessments (
  snapshot_id                   bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  total_assessments             integer NOT NULL,
  total_distinct_assessments    integer NOT NULL,
  average_attempts_per_assessment numeric(6, 2) NOT NULL,
  pass_rate                     numeric(5, 2) NOT NULL,
  average_final_grade           numeric(5, 2) NOT NULL,
  average_passing_grade         numeric(5, 2) NOT NULL
);

-- Engagement
CREATE TABLE IF NOT EXISTS public.learning_analytics_engagement (
  snapshot_id                 bigint PRIMARY KEY
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  average_feedback_rating     numeric(3, 2) NOT NULL,
  total_feedback_submissions  integer NOT NULL,
  total_competitions          integer NOT NULL,
  average_competition_score   numeric(5, 2) NOT NULL
);

-- 4.3) Category breakdown tables
-- By competency level
CREATE TABLE IF NOT EXISTS public.learning_analytics_competency_level_breakdown (
  id            bigserial PRIMARY KEY,
  snapshot_id   bigint NOT NULL
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  level         text NOT NULL,
  learner_count integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_la_competency_level_snapshot
  ON public.learning_analytics_competency_level_breakdown (snapshot_id);

-- By feedback rating
CREATE TABLE IF NOT EXISTS public.learning_analytics_feedback_rating_breakdown (
  id          bigserial PRIMARY KEY,
  snapshot_id bigint NOT NULL
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  rating      integer NOT NULL,
  count       integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_la_feedback_rating_snapshot
  ON public.learning_analytics_feedback_rating_breakdown (snapshot_id);

-- By course status
CREATE TABLE IF NOT EXISTS public.learning_analytics_course_status_breakdown (
  id          bigserial PRIMARY KEY,
  snapshot_id bigint NOT NULL
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  status      text NOT NULL,
  count       integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_la_course_status_snapshot
  ON public.learning_analytics_course_status_breakdown (snapshot_id);

-- 4.4) Most demanded skills table
CREATE TABLE IF NOT EXISTS public.learning_analytics_skill_demand (
  id            bigserial PRIMARY KEY,
  snapshot_id   bigint NOT NULL
    REFERENCES public.learning_analytics_snapshot(id) ON DELETE CASCADE,
  skill_id      text NOT NULL,
  skill_name    text NOT NULL,
  demand_count  integer NOT NULL,
  rank_position integer
);

CREATE INDEX IF NOT EXISTS idx_la_skill_demand_snapshot
  ON public.learning_analytics_skill_demand (snapshot_id);

-- 5) Directory
create table if not exists public.directory_cache (
  snapshot_date date not null,
  company_id text not null,
  company_name text,
  industry text,
  company_size text,
  date_registered timestamptz,
  primary_hr_contact text,
  approval_policy text,
  decision_maker text,
  kpis jsonb,
  max_test_attempts int,
  website_url text,
  verification_status text,
  hierarchy jsonb,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, company_id)
);
create index if not exists idx_dir_cache_date on public.directory_cache(snapshot_date);

-- 6) TTL: Purge after 60 days (daily at 03:00)
create or replace function public.purge_cache_older_than_60_days()
returns void language plpgsql as $$
begin
  delete from public.course_builder_cache          where snapshot_date < current_date - 60;
  delete from public.assessments_cache             where snapshot_date < current_date - 60;
  delete from public.learning_analytics_snapshot   where snapshot_date < current_date - 60;
  delete from public.directory_cache               where snapshot_date < current_date - 60;
  -- Note: ai_chart_transcriptions are overwritten on refresh, no expiration needed
end $$;

select cron.schedule(
  job_name := 'purge_cache_daily_60d',
  schedule := '0 3 * * *',
  command := $$call public.purge_cache_older_than_60_days();$$
);

-- 7) AI Chart Transcriptions Cache (DB-first flow)
-- One row per chart, overwritten on refresh
create table if not exists public.ai_chart_transcriptions (
  id bigserial primary key,
  chart_id varchar(128) not null unique,
  chart_signature varchar(64) not null,
  model varchar(32) not null default 'gpt-4o',
  transcription_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate existing table: remove expires_at, add UNIQUE constraint
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'ai_chart_transcriptions' and column_name = 'updated_at'
  ) then
    alter table public.ai_chart_transcriptions add column updated_at timestamptz not null default now();
  end if;
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'ai_chart_transcriptions' and column_name = 'expires_at'
  ) then
    alter table public.ai_chart_transcriptions drop column expires_at;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'ai_chart_transcriptions_chart_id_key'
  ) then
    alter table public.ai_chart_transcriptions add constraint ai_chart_transcriptions_chart_id_key unique (chart_id);
  end if;
end $$;

create index if not exists idx_ai_chart_transcriptions_signature on public.ai_chart_transcriptions (chart_signature);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_ai_chart_transcriptions_updated_at on public.ai_chart_transcriptions;
create trigger trg_ai_chart_transcriptions_updated_at
before update on public.ai_chart_transcriptions
for each row execute function set_updated_at();

CREATE TABLE IF NOT EXISTS ai_report_conclusions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Report identifier
    report_id   UUID,
    report_name TEXT NOT NULL,

    -- Full JSON response from OpenAI
    conclusions JSONB NOT NULL,

    -- Timestamp fields
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Expiration timestamp: 60 days (set via trigger)
    expires_at   TIMESTAMPTZ
);

-- Trigger function to set expires_at automatically
CREATE OR REPLACE FUNCTION set_ai_report_conclusions_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NEW.created_at + INTERVAL '60 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set expires_at on insert
DROP TRIGGER IF EXISTS trg_ai_report_conclusions_expires_at ON ai_report_conclusions;
CREATE TRIGGER trg_ai_report_conclusions_expires_at
    BEFORE INSERT ON ai_report_conclusions
    FOR EACH ROW
    EXECUTE FUNCTION set_ai_report_conclusions_expires_at();

CREATE INDEX IF NOT EXISTS idx_ai_conclusions_generated_at
    ON ai_report_conclusions (generated_at);

CREATE INDEX IF NOT EXISTS idx_ai_conclusions_report_name
    ON ai_report_conclusions (report_name);

-- ====================================================
-- Courses / Topics / Contents normalized schema
-- ====================================================

-- Status enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
        CREATE TYPE course_status AS ENUM ('active', 'archived', 'deleted');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'topic_status') THEN
        CREATE TYPE topic_status AS ENUM ('active', 'archived', 'deleted');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('avatar_video', 'text_audio', 'mind_map', 'presentation', 'code');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'generation_method') THEN
        CREATE TYPE generation_method AS ENUM ('manual', 'ai_assisted', 'mixed', 'full_ai');
    END IF;
END$$;

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    course_id        TEXT PRIMARY KEY,                -- e.g. "COURSE-001"
    course_name      TEXT NOT NULL,
    course_language  TEXT,
    trainer_id       TEXT,
    trainer_name     TEXT,
    permission_scope TEXT NOT NULL DEFAULT 'all',     -- 'all' or 'orgs'
    total_usage_count INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL,
    status            course_status NOT NULL DEFAULT 'active'
);

-- Course permissions: which orgs can access a course
CREATE TABLE IF NOT EXISTS public.course_org_permissions (
    course_id TEXT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    org_uuid  UUID NOT NULL,
    PRIMARY KEY (course_id, org_uuid)
);

-- Topics: can be used inside courses or stand-alone
CREATE TABLE IF NOT EXISTS public.topics (
    topic_id        TEXT PRIMARY KEY,                -- e.g. "T-101"
    topic_name      TEXT NOT NULL,
    topic_language  TEXT,
    total_usage_count INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL,
    status            topic_status NOT NULL DEFAULT 'active'
);

-- Relationship: which topics belong to which course
CREATE TABLE IF NOT EXISTS public.course_topics (
    course_id  TEXT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    topic_id   TEXT NOT NULL REFERENCES public.topics(topic_id)   ON DELETE CASCADE,
    sort_order INTEGER,
    PRIMARY KEY (course_id, topic_id)
);

-- Skills per topic
CREATE TABLE IF NOT EXISTS public.topic_skills (
    topic_id   TEXT NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
    skill_code TEXT NOT NULL,
    PRIMARY KEY (topic_id, skill_code)
);

-- Contents per topic
CREATE TABLE IF NOT EXISTS public.contents (
    content_id           TEXT PRIMARY KEY,                                   -- e.g. "C-001"
    topic_id             TEXT NOT NULL REFERENCES public.topics(topic_id) ON DELETE CASCADE,
    content_type         content_type NOT NULL,
    content_data         JSONB NOT NULL,
    generation_method    generation_method NOT NULL,
    generation_method_id UUID
);
`;

async function runMigration() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.log("⚠️  DATABASE_URL not set, skipping migration");
    return;
  }

  try {
    // Read migration file from DB folder (inside backend after copy)
    // Try both locations: inside backend/DB (after GitHub Actions copy) or ../DB (local development)
    let migrationPath = resolve(__dirname, "../DB/migration.sql");
    let sql;
    try {
      sql = readFileSync(migrationPath, "utf8");
    } catch (e) {
      // If not found, try parent directory (local development)
      migrationPath = resolve(__dirname, "../../DB/migration.sql");
      try {
        sql = readFileSync(migrationPath, "utf8");
      } catch {
        console.log("ℹ️  migration.sql not found, using embedded SQL fallback");
        sql = MIGRATION_SQL_FALLBACK;
      }
    }

    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false } // required for Supabase
    });

    await client.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("✅ Migration applied successfully to Supabase");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("❌ Migration failed:", e.message);
      // Don't throw - allow server to start even if migration fails
    } finally {
      await client.end();
    }
  } catch (e) {
    console.error("❌ Error running migration:", e.message);
    // Don't throw - allow server to start even if migration fails
  }
}

export default runMigration;

