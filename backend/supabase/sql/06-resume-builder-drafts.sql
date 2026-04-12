-- =============================================================================
-- COPY EVERYTHING BELOW INTO SUPABASE → SQL EDITOR → RUN
-- Resume builder: one JSON draft per Firebase user (backend uses service role).
-- =============================================================================

create table if not exists public.resume_builder_drafts (
  firebase_uid text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists resume_builder_drafts_updated_at_idx
  on public.resume_builder_drafts (updated_at desc);

alter table if exists public.resume_builder_drafts enable row level security;

comment on table public.resume_builder_drafts is 'Structured resume builder form JSON; written by Valen API (service role).';
