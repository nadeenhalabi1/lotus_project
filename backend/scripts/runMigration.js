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

-- 3) Content Studio — Overview
create table if not exists public.content_studio_overview_cache (
  snapshot_date date primary key,
  total_courses_published int,
  "AI_generated_content_count" int,
  trainer_generated_content_count int,
  mixed_or_collaborative_content_count int,
  most_used_creator_type text check (lower(most_used_creator_type) in ('trainer','ai','mixed')),
  ai_lessons_count int,
  trainer_lessons_count int,
  collaborative_lessons_count int,
  ingested_at timestamptz not null default now()
);

-- 3.2) Content Studio — Contents
create table if not exists public.content_studio_contents_cache (
  snapshot_date date not null,
  content_id text not null,
  course_id text,
  course_name text,
  content_name text not null,
  content_generator text check (lower(content_generator) in ('trainer','ai','mixed')),
  total_usage_count bigint,
  trainer_id text,
  content_type text,
  lesson_id text,
  lesson_name text,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, content_id)
);
create index if not exists idx_csc_cache_date on public.content_studio_contents_cache(snapshot_date);
create index if not exists idx_csc_cache_course on public.content_studio_contents_cache(course_id);

-- 4) Learning Analytics
create table if not exists public.learning_analytics_cache (
  snapshot_date date not null,
  period text not null check (period in ('daily','weekly','monthly')),
  start_date timestamptz not null,
  end_date   timestamptz not null,
  metrics jsonb not null,
  category_breakdowns jsonb not null,
  calculated_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  primary key (snapshot_date, period, start_date, end_date)
);
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
  delete from public.content_studio_overview_cache where snapshot_date < current_date - 60;
  delete from public.content_studio_contents_cache where snapshot_date < current_date - 60;
  delete from public.learning_analytics_cache      where snapshot_date < current_date - 60;
  delete from public.directory_cache               where snapshot_date < current_date - 60;
  delete from public.ai_chart_transcriptions      where expires_at < now();
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

