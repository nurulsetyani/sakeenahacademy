-- Sakeenah Academy — Live Class
-- Ref: docs/PRD.md §17, §25.13-25.14

create table live_sessions (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references courses (id) on delete cascade,
  title               text not null,
  platform            meeting_platform not null,
  meeting_link        text,
  scheduled_at        timestamptz not null,
  duration_minutes    integer not null default 60 check (duration_minutes > 0),
  recording_url       text,
  status              session_status not null default 'terjadwal',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references profiles (id),
  updated_by          uuid references profiles (id),
  deleted_at          timestamptz
);

create trigger trg_live_sessions_updated_at
  before update on live_sessions
  for each row execute function set_updated_at();

create index idx_live_sessions_course_scheduled on live_sessions (course_id, scheduled_at) where deleted_at is null;

create table live_session_attendance (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references live_sessions (id) on delete cascade,
  student_id      uuid not null references profiles (id),
  status          attendance_status not null default 'tidak_hadir',
  checked_in_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (session_id, student_id)
);

create trigger trg_live_session_attendance_updated_at
  before update on live_session_attendance
  for each row execute function set_updated_at();

create index idx_live_session_attendance_student on live_session_attendance (student_id);
