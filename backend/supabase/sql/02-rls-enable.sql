-- Enable RLS for all app tables.
-- With this approach, your Render backend uses the Supabase service role key,
-- so it can read/write regardless of RLS; clients cannot.

alter table if exists public.users enable row level security;
alter table if exists public.resumes enable row level security;
alter table if exists public.resume_parsed_data enable row level security;
alter table if exists public.interview_sessions enable row level security;
alter table if exists public.interview_questions enable row level security;
alter table if exists public.interview_reports enable row level security;
alter table if exists public.skill_analysis enable row level security;

