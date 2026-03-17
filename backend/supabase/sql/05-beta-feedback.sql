-- Beta feedback capture (Landing Page -> Backend -> Supabase)
-- Run this in Supabase SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists public.beta_feedback (
  id uuid primary key default uuid_generate_v4(),
  firebase_uid text null,
  email text null,
  message text not null,
  page text null,
  user_agent text null,
  created_at timestamp default now()
);

alter table if exists public.beta_feedback enable row level security;

