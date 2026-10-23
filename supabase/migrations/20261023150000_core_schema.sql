-- ==============================================================================
-- AETHER CORE SCHEMA MIGRATION
-- Migration: 20261023150000_core_schema.sql
-- Checkpoint: 5.2 — Establish the Persistent Backend
-- Governing Document: docs/CORE_DATA_MODEL.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Generic updated_at timestamp refresher
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  timezone text not null default 'UTC',
  target_sleep_hours numeric(3,1) not null default 8.0 check (target_sleep_hours > 0 and target_sleep_hours <= 24),
  daily_focus_capacity_minutes integer not null default 240 check (daily_focus_capacity_minutes > 0 and daily_focus_capacity_minutes <= 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. LIFE AREAS
-- ------------------------------------------------------------------------------
create table public.life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  accent_color text not null,
  icon_name text not null,
  priority_weight integer not null default 1 check (priority_weight >= 1 and priority_weight <= 10),
  is_system_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_life_areas_user_slug_active 
  on public.life_areas (user_id, slug) 
  where archived_at is null;

create index idx_life_areas_user on public.life_areas (user_id);

create trigger trg_life_areas_updated_at
  before update on public.life_areas
  for each row execute function public.set_updated_at();

-- Automatic user onboarding trigger: creates profile + default life areas on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 1. Create Profile
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- 2. Seed Default Life Areas per DESIGN.md
  insert into public.life_areas (user_id, name, slug, accent_color, icon_name, priority_weight, is_system_default)
  values
    (new.id, 'Academics', 'academics', '#4A90E2', 'GraduationCap', 1, true),
    (new.id, 'Health & Fitness', 'health', '#4EAC7A', 'Activity', 2, true),
    (new.id, 'Skills & Career', 'skills', '#9B51E0', 'Briefcase', 3, true),
    (new.id, 'Sleep & Recovery', 'sleep', '#5C6BC0', 'Moon', 4, true),
    (new.id, 'Relationships', 'relationships', '#E05675', 'Users', 5, true),
    (new.id, 'Personal', 'personal', '#26A69A', 'Smile', 6, true)
  on conflict do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. GOALS
-- ------------------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  title text not null,
  description text,
  target_date date,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'paused', 'achieved', 'abandoned')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  measurement_type text not null default 'milestones' check (measurement_type in ('milestones', 'numeric_metric', 'habitual')),
  target_value numeric,
  unit text,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_goals_user_area on public.goals (user_id, life_area_id);
create index idx_goals_status on public.goals (user_id, status);

create trigger trg_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. MILESTONES
-- ------------------------------------------------------------------------------
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  sort_order integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_milestones_goal on public.milestones (goal_id, sort_order);
create index idx_milestones_user on public.milestones (user_id);

create trigger trg_milestones_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. TASKS (Canonical Shared Model)
-- ------------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  goal_id uuid references public.goals(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  scheduled_date date,
  estimated_duration_minutes integer check (estimated_duration_minutes is null or estimated_duration_minutes > 0),
  completed_at timestamptz,
  source_type text not null default 'manual' check (source_type in ('manual', 'routine', 'academic', 'quick_log')),
  source_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_user_scheduled on public.tasks (user_id, scheduled_date);
create index idx_tasks_user_due on public.tasks (user_id, due_date);
create index idx_tasks_user_status on public.tasks (user_id, status);
create index idx_tasks_life_area on public.tasks (life_area_id);
create index idx_tasks_goal on public.tasks (goal_id);
create index idx_tasks_milestone on public.tasks (milestone_id);

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 6. ROUTINES
-- ------------------------------------------------------------------------------
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  title text not null,
  description text,
  frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekdays', 'custom_days', 'interval_days')),
  schedule_rule jsonb not null default '{"days": [1, 2, 3, 4, 5, 6, 7]}'::jsonb,
  preferred_time_of_day text not null default 'anytime' check (preferred_time_of_day in ('morning', 'afternoon', 'evening', 'anytime')),
  target_duration_minutes integer check (target_duration_minutes is null or target_duration_minutes > 0),
  is_active boolean not null default true,
  streak_eligible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_routines_user_active on public.routines (user_id, is_active);
create index idx_routines_area on public.routines (life_area_id);

create trigger trg_routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 7. CALENDAR EVENTS
-- ------------------------------------------------------------------------------
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_all_day boolean not null default false,
  event_type text not null default 'personal' check (event_type in ('class_timetable', 'study_block', 'exam', 'personal', 'task_block')),
  location text,
  is_recurring boolean not null default false,
  recurrence_rule jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time >= start_time)
);

create index idx_calendar_events_user_time on public.calendar_events (user_id, start_time, end_time);
create index idx_calendar_events_task on public.calendar_events (task_id);

create trigger trg_calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 8. FOCUS SESSIONS
-- ------------------------------------------------------------------------------
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  task_id uuid references public.tasks(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  target_duration_seconds integer not null default 1500 check (target_duration_seconds > 0),
  active_duration_seconds integer not null default 0 check (active_duration_seconds >= 0),
  paused_duration_seconds integer not null default 0 check (paused_duration_seconds >= 0),
  pause_intervals jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'abandoned')),
  distraction_count integer not null default 0 check (distraction_count >= 0),
  reflection_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create index idx_focus_sessions_user_time on public.focus_sessions (user_id, started_at);
create index idx_focus_sessions_task on public.focus_sessions (task_id);

create trigger trg_focus_sessions_updated_at
  before update on public.focus_sessions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 9. PROGRESS RECORDS
-- ------------------------------------------------------------------------------
create table public.progress_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid not null references public.life_areas(id) on delete restrict,
  goal_id uuid references public.goals(id) on delete set null,
  recorded_date date not null default current_date,
  metric_name text not null,
  numeric_value numeric not null,
  unit text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_progress_records_user_date on public.progress_records (user_id, recorded_date);
create index idx_progress_records_goal on public.progress_records (goal_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Mandatory strict tenant isolation: auth.uid() = user_id
-- Cross-table relationship attachment validation
-- ==============================================================================

-- Enable RLS on all 9 tables
alter table public.profiles enable row level security;
alter table public.life_areas enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.routines enable row level security;
alter table public.calendar_events enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.progress_records enable row level security;

-- ------------------------------------------------------------------------------
-- RLS: PROFILES
-- ------------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: LIFE AREAS
-- ------------------------------------------------------------------------------
create policy "life_areas_select_own"
  on public.life_areas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "life_areas_insert_own"
  on public.life_areas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "life_areas_update_own"
  on public.life_areas for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "life_areas_delete_own"
  on public.life_areas for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: GOALS (validates life_area ownership)
-- ------------------------------------------------------------------------------
create policy "goals_select_own"
  on public.goals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "goals_insert_own"
  on public.goals for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
  );

create policy "goals_update_own"
  on public.goals for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
  );

create policy "goals_delete_own"
  on public.goals for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: MILESTONES (validates goal ownership)
-- ------------------------------------------------------------------------------
create policy "milestones_select_own"
  on public.milestones for select
  to authenticated
  using (auth.uid() = user_id);

create policy "milestones_insert_own"
  on public.milestones for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = auth.uid()
    )
  );

create policy "milestones_update_own"
  on public.milestones for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = auth.uid()
    )
  );

create policy "milestones_delete_own"
  on public.milestones for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: TASKS (validates area, goal, milestone ownership)
-- ------------------------------------------------------------------------------
create policy "tasks_select_own"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      goal_id is null or exists (
        select 1 from public.goals g
        where g.id = goal_id and g.user_id = auth.uid()
      )
    )
    and (
      milestone_id is null or exists (
        select 1 from public.milestones m
        where m.id = milestone_id and m.user_id = auth.uid()
      )
    )
  );

create policy "tasks_update_own"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      goal_id is null or exists (
        select 1 from public.goals g
        where g.id = goal_id and g.user_id = auth.uid()
      )
    )
    and (
      milestone_id is null or exists (
        select 1 from public.milestones m
        where m.id = milestone_id and m.user_id = auth.uid()
      )
    )
  );

create policy "tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: ROUTINES (validates life_area ownership)
-- ------------------------------------------------------------------------------
create policy "routines_select_own"
  on public.routines for select
  to authenticated
  using (auth.uid() = user_id);

create policy "routines_insert_own"
  on public.routines for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
  );

create policy "routines_update_own"
  on public.routines for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
  );

create policy "routines_delete_own"
  on public.routines for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: CALENDAR EVENTS (validates life_area and optional task ownership)
-- ------------------------------------------------------------------------------
create policy "calendar_events_select_own"
  on public.calendar_events for select
  to authenticated
  using (auth.uid() = user_id);

create policy "calendar_events_insert_own"
  on public.calendar_events for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      task_id is null or exists (
        select 1 from public.tasks t
        where t.id = task_id and t.user_id = auth.uid()
      )
    )
  );

create policy "calendar_events_update_own"
  on public.calendar_events for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      task_id is null or exists (
        select 1 from public.tasks t
        where t.id = task_id and t.user_id = auth.uid()
      )
    )
  );

create policy "calendar_events_delete_own"
  on public.calendar_events for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: FOCUS SESSIONS (validates life_area and optional task ownership)
-- ------------------------------------------------------------------------------
create policy "focus_sessions_select_own"
  on public.focus_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "focus_sessions_insert_own"
  on public.focus_sessions for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      task_id is null or exists (
        select 1 from public.tasks t
        where t.id = task_id and t.user_id = auth.uid()
      )
    )
  );

create policy "focus_sessions_update_own"
  on public.focus_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      task_id is null or exists (
        select 1 from public.tasks t
        where t.id = task_id and t.user_id = auth.uid()
      )
    )
  );

create policy "focus_sessions_delete_own"
  on public.focus_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- RLS: PROGRESS RECORDS (validates life_area and optional goal ownership)
-- ------------------------------------------------------------------------------
create policy "progress_records_select_own"
  on public.progress_records for select
  to authenticated
  using (auth.uid() = user_id);

create policy "progress_records_insert_own"
  on public.progress_records for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      goal_id is null or exists (
        select 1 from public.goals g
        where g.id = goal_id and g.user_id = auth.uid()
      )
    )
  );

create policy "progress_records_update_own"
  on public.progress_records for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.life_areas la
      where la.id = life_area_id and la.user_id = auth.uid()
    )
    and (
      goal_id is null or exists (
        select 1 from public.goals g
        where g.id = goal_id and g.user_id = auth.uid()
      )
    )
  );

create policy "progress_records_delete_own"
  on public.progress_records for delete
  to authenticated
  using (auth.uid() = user_id);
