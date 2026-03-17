-- Valen AI Supabase schema (Postgres)
-- Run in Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- 1) Users (Firebase-authenticated)
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  firebase_uid text unique not null,
  email text,
  name text,
  created_at timestamp default now()
);

-- 2) Resumes
create table if not exists public.resumes (
  id uuid default uuid_generate_v4() primary key,
  firebase_uid text,
  resume_name text,
  uploaded_at timestamp default now(),
  parsed boolean default false
);

-- 3) Resume Parsed Data
create table if not exists public.resume_parsed_data (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes(id),
  full_name text,
  skills text[],
  education text,
  experience text,
  projects text[],
  certifications text[],
  parsed_at timestamp default now()
);

-- 4) Interview Sessions
create table if not exists public.interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  firebase_uid text,
  resume_id uuid,
  job_role text,
  difficulty text,
  started_at timestamp default now(),
  completed boolean default false,
  -- optional, for correlating with your backend's interview session id
  external_session_id text
);

-- 5) Interview Questions
create table if not exists public.interview_questions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id),
  question text,
  user_answer text,
  ai_feedback text,
  score int,
  created_at timestamp default now()
);

-- 6) Interview Reports
create table if not exists public.interview_reports (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id),
  overall_score int,
  strengths text[],
  weaknesses text[],
  improvement_suggestions text,
  report_generated_at timestamp default now()
);

-- 7) Skill Analytics (optional)
create table if not exists public.skill_analysis (
  id uuid default uuid_generate_v4() primary key,
  firebase_uid text,
  skill text,
  proficiency_score int,
  last_updated timestamp default now()
);

