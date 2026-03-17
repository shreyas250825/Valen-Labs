-- Backend-only storage for Job Fit + Aptitude results (compact, 1 row per user).
-- Run in Supabase SQL editor.

create table if not exists public.job_fit_results (
  firebase_uid text primary key,
  role text,
  overall_fit_score int,
  skill_match_percentage int,
  experience_match_percentage int,
  matched_skills text[],
  missing_skills text[],
  recommendation text,
  next_steps text[],
  full_result jsonb,
  updated_at timestamp default now()
);

create table if not exists public.aptitude_results (
  firebase_uid text primary key,
  overall_score int,
  correct_answers int,
  total_questions int,
  duration_seconds int,
  results jsonb,
  updated_at timestamp default now()
);

alter table if exists public.job_fit_results enable row level security;
alter table if exists public.aptitude_results enable row level security;

