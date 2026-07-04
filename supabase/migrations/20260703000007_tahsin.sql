-- Sakeenah Academy — Tahsin Module
-- Ref: docs/PRD.md §21, §25.15-25.17

create table tahsin_schedules (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references courses (id) on delete cascade,
  teacher_id          uuid not null references profiles (id),
  session_date        date not null,
  start_time          time not null,
  end_time            time not null,
  location_or_link    text,
  status              session_status not null default 'terjadwal',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references profiles (id),
  updated_by          uuid references profiles (id),
  deleted_at          timestamptz,
  constraint tahsin_schedules_time_order check (end_time > start_time)
);

create trigger trg_tahsin_schedules_updated_at
  before update on tahsin_schedules
  for each row execute function set_updated_at();

create index idx_tahsin_schedules_course_date on tahsin_schedules (course_id, session_date) where deleted_at is null;

create table tahsin_attendance (
  id            uuid primary key default gen_random_uuid(),
  schedule_id   uuid not null references tahsin_schedules (id) on delete cascade,
  student_id    uuid not null references profiles (id),
  status        attendance_status not null default 'tidak_hadir',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (schedule_id, student_id)
);

create trigger trg_tahsin_attendance_updated_at
  before update on tahsin_attendance
  for each row execute function set_updated_at();

create table tahsin_assessments (
  id                  uuid primary key default gen_random_uuid(),
  schedule_id         uuid not null references tahsin_schedules (id) on delete cascade,
  student_id          uuid not null references profiles (id),
  teacher_id          uuid not null references profiles (id),
  makhraj_score       integer check (makhraj_score between 0 and 100),
  tajwid_score        integer check (tajwid_score between 0 and 100),
  kelancaran_score    integer check (kelancaran_score between 0 and 100),
  overall_grade       text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references profiles (id),
  updated_by          uuid references profiles (id),
  deleted_at          timestamptz,
  unique (schedule_id, student_id)
);

create trigger trg_tahsin_assessments_updated_at
  before update on tahsin_assessments
  for each row execute function set_updated_at();

create index idx_tahsin_assessments_student on tahsin_assessments (student_id) where deleted_at is null;
