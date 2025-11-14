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

-- 4) Learning Analytics
create table if not exists public.learning_analytics_cache (
  snapshot_date date not null,
  version text not null,
  period text not null check (period in ('daily','weekly','monthly')),
  start_date timestamptz not null,
  end_date   timestamptz not null,

  -- aggregated_statistics.metrics
  total_learners int,
  active_learners int,
  total_courses int,
  courses_completed int,
  average_completion_rate numeric(5,2),
  total_skills_acquired int,
  average_competency_level_progression numeric(5,2),
  engagement_score_average numeric(5,2),
  drop_off_rate numeric(5,2),
  total_topics int,
  average_topics_per_content numeric(5,2),
  average_lessons_per_course numeric(5,2),
  average_attempts_per_assessment numeric(5,2),
  total_assessments int,
  pass_rate numeric(5,2),
  total_unique_learning_paths int,
  average_skills_per_learning_path numeric(5,2),
  average_skills_per_competency numeric(5,2),

  -- platform_skill_demand (nested structure from metrics.platform_skill_demand)
  platform_skill_demand jsonb,

  -- category_breakdowns.by_competency_level
  beginner_count int,
  intermediate_count int,
  advanced_count int,
  expert_count int,

  -- category_breakdowns.by_content_format_usage
  video_usage_count int,
  text_usage_count int,
  code_usage_count int,
  presentation_usage_count int,
  mindmap_usage_count int,

  -- category_breakdowns.by_engagement_level
  high_engagement_count int,
  medium_engagement_count int,
  low_engagement_count int,

  calculated_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, period, start_date, end_date)
);

-- Migrate existing learning_analytics_cache table to new schema
do $$
begin
  -- Check if table exists and has old schema (has metrics column but not version)
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'learning_analytics_cache' 
    and column_name = 'metrics'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'learning_analytics_cache' 
    and column_name = 'version'
  ) then
    -- Add version column (first as nullable, then set values, then make NOT NULL)
    alter table public.learning_analytics_cache 
    add column if not exists version text;
    
    -- Set default value for existing rows
    update public.learning_analytics_cache 
    set version = '1.0' 
    where version is null;
    
    -- Now make it NOT NULL
    alter table public.learning_analytics_cache 
    alter column version set not null,
    alter column version set default '1.0';
    
    -- Add all new metric columns
    alter table public.learning_analytics_cache 
    add column if not exists total_learners int,
    add column if not exists active_learners int,
    add column if not exists total_courses int,
    add column if not exists courses_completed int,
    add column if not exists average_completion_rate numeric(5,2),
    add column if not exists total_skills_acquired int,
    add column if not exists average_competency_level_progression numeric(5,2),
    add column if not exists engagement_score_average numeric(5,2),
    add column if not exists drop_off_rate numeric(5,2),
    add column if not exists total_topics int,
    add column if not exists average_topics_per_content numeric(5,2),
    add column if not exists average_lessons_per_course numeric(5,2),
    add column if not exists average_attempts_per_assessment numeric(5,2),
    add column if not exists total_assessments int,
    add column if not exists pass_rate numeric(5,2),
    add column if not exists total_unique_learning_paths int,
    add column if not exists average_skills_per_learning_path numeric(5,2),
    add column if not exists average_skills_per_competency numeric(5,2);
    
    -- Add platform_skill_demand jsonb
    alter table public.learning_analytics_cache 
    add column if not exists platform_skill_demand jsonb;
    
    -- Add competency level breakdown columns
    alter table public.learning_analytics_cache 
    add column if not exists beginner_count int,
    add column if not exists intermediate_count int,
    add column if not exists advanced_count int,
    add column if not exists expert_count int;
    
    -- Add content format usage breakdown columns
    alter table public.learning_analytics_cache 
    add column if not exists video_usage_count int,
    add column if not exists text_usage_count int,
    add column if not exists code_usage_count int,
    add column if not exists presentation_usage_count int,
    add column if not exists mindmap_usage_count int;
    
    -- Add engagement level breakdown columns
    alter table public.learning_analytics_cache 
    add column if not exists high_engagement_count int,
    add column if not exists medium_engagement_count int,
    add column if not exists low_engagement_count int;
    
    -- Drop old columns (metrics and category_breakdowns) if they exist
    -- Note: This will lose data in those columns, but they're being replaced by the new structure
    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'learning_analytics_cache' 
      and column_name = 'metrics'
    ) then
      alter table public.learning_analytics_cache drop column metrics;
    end if;
    
    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'learning_analytics_cache' 
      and column_name = 'category_breakdowns'
    ) then
      alter table public.learning_analytics_cache drop column category_breakdowns;
    end if;
    
    raise notice '✅ Migrated learning_analytics_cache table to new schema';
  end if;
end $$;

create index if not exists idx_la_cache_date   on public.learning_analytics_cache(snapshot_date);
create index if not exists idx_la_cache_period on public.learning_analytics_cache(period, start_date, end_date);

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
  delete from public.learning_analytics_cache      where snapshot_date < current_date - 60;
  delete from public.directory_cache               where snapshot_date < current_date - 60;
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
  -- Add updated_at column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'ai_chart_transcriptions' 
    and column_name = 'updated_at'
  ) then
    alter table public.ai_chart_transcriptions 
    add column updated_at timestamptz not null default now();
  end if;
  
  -- Remove expires_at column if it exists (no longer needed)
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'ai_chart_transcriptions' 
    and column_name = 'expires_at'
  ) then
    alter table public.ai_chart_transcriptions 
    drop column expires_at;
  end if;
  
  -- Ensure UNIQUE constraint on chart_id
  if not exists (
    select 1 from pg_constraint 
    where conname = 'ai_chart_transcriptions_chart_id_key'
  ) then
    alter table public.ai_chart_transcriptions 
    add constraint ai_chart_transcriptions_chart_id_key unique (chart_id);
  end if;
end $$;

-- Unique index on chart_id (explicit index for performance)
CREATE UNIQUE INDEX IF NOT EXISTS ux_ai_chart_transcriptions_chart_id
ON public.ai_chart_transcriptions(chart_id);

-- Index on signature for lookups
create index if not exists idx_ai_chart_transcriptions_signature
  on public.ai_chart_transcriptions (chart_signature);

-- Trigger to update updated_at automatically
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_ai_chart_transcriptions_updated_at on public.ai_chart_transcriptions;
create trigger trg_ai_chart_transcriptions_updated_at
before update on public.ai_chart_transcriptions
for each row execute function set_updated_at();

-- Extend purge function (transcriptions no longer expire - overwritten on refresh)
create or replace function public.purge_cache_older_than_60_days()
returns void language plpgsql as $$
begin
  delete from public.course_builder_cache          where snapshot_date < current_date - 60;
  delete from public.assessments_cache             where snapshot_date < current_date - 60;
  delete from public.learning_analytics_cache      where snapshot_date < current_date - 60;
  delete from public.directory_cache               where snapshot_date < current_date - 60;
  -- Note: ai_chart_transcriptions are overwritten on refresh, no expiration needed
end $$;

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
