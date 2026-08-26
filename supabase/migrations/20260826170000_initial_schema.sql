-- YKS Master: user-isolated study data. Run in Supabase SQL Editor or CLI.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  target_department text,
  target_university text,
  target_rank integer check (target_rank > 0),
  exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2), exam_type text not null check (exam_type in ('TYT','AYT','Other')),
  accent text, position integer not null default 0, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.topics (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade, name text not null, status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  question_target integer check (question_target >= 0), question_count integer not null default 0 check (question_count >= 0), correct_count integer not null default 0 check (correct_count >= 0), wrong_count integer not null default 0 check (wrong_count >= 0), blank_count integer not null default 0 check (blank_count >= 0), target_date date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null, topic_id uuid references public.topics(id) on delete set null,
  title text not null, description text, planned_questions integer check (planned_questions >= 0), planned_minutes integer check (planned_minutes >= 0), status text not null default 'pending' check (status in ('pending','active','completed')), priority text check (priority in ('low','medium','high')), date date not null default current_date, "order" integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null, topic_id uuid references public.topics(id) on delete set null,
  total_questions integer not null check (total_questions >= 0), correct integer not null default 0 check (correct >= 0), wrong integer not null default 0 check (wrong >= 0), blank integer not null default 0 check (blank >= 0), duration_minutes integer not null check (duration_minutes > 0), note text, studied_at date not null default current_date, created_at timestamptz not null default now(), check (correct + wrong + blank <= total_questions)
);
create table public.exams (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null check (exam_type in ('TYT','AYT')), name text not null, exam_date date not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.exam_results (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade, section text not null, correct integer not null default 0 check (correct >= 0), wrong integer not null default 0 check (wrong >= 0), blank integer not null default 0 check (blank >= 0), created_at timestamptz not null default now()
);
create table public.mistakes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null, topic_id uuid references public.topics(id) on delete set null,
  reason text not null check (reason in ('concept','attention','calculation','time','other')), note text, review_date date, reviewed boolean not null default false, created_at timestamptz not null default now()
);
create table public.user_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  weekly_minutes integer check (weekly_minutes >= 0), weekly_questions integer check (weekly_questions >= 0), target_net numeric(5,2), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ai_plan_history (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  input_context jsonb not null default '{}'::jsonb, plan jsonb not null, approved_at timestamptz, created_at timestamptz not null default now()
);
create index subjects_user_id_idx on public.subjects(user_id); create index topics_user_id_idx on public.topics(user_id); create index daily_tasks_user_date_idx on public.daily_tasks(user_id,date); create index study_sessions_user_date_idx on public.study_sessions(user_id,studied_at); create index exams_user_date_idx on public.exams(user_id,exam_date); create index mistakes_user_review_idx on public.mistakes(user_id,review_date);
alter table public.profiles enable row level security; alter table public.subjects enable row level security; alter table public.topics enable row level security; alter table public.daily_tasks enable row level security; alter table public.study_sessions enable row level security; alter table public.exams enable row level security; alter table public.exam_results enable row level security; alter table public.mistakes enable row level security; alter table public.user_goals enable row level security; alter table public.ai_plan_history enable row level security;
create policy "users manage own profiles" on public.profiles for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own subjects" on public.subjects for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own topics" on public.topics for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own daily tasks" on public.daily_tasks for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own study sessions" on public.study_sessions for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own exams" on public.exams for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own exam results" on public.exam_results for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own mistakes" on public.mistakes for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own goals" on public.user_goals for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own ai plan history" on public.ai_plan_history for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.profiles (id, user_id, display_name) values (new.id, new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Öğrenci')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at(); create trigger subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at(); create trigger topics_updated_at before update on public.topics for each row execute function public.set_updated_at(); create trigger daily_tasks_updated_at before update on public.daily_tasks for each row execute function public.set_updated_at(); create trigger exams_updated_at before update on public.exams for each row execute function public.set_updated_at(); create trigger user_goals_updated_at before update on public.user_goals for each row execute function public.set_updated_at();
