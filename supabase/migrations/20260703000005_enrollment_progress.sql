-- Sakeenah Academy — Enrollment & Progress
-- Ref: docs/PRD.md §23 (enrollment sebagai gerbang akses), §25.9-25.10

create table enrollments (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references profiles (id),
  course_id             uuid not null references courses (id),
  status                enrollment_status not null default 'pending_payment',
  enrolled_at           timestamptz,
  completed_at          timestamptz,
  progress_percentage   integer not null default 0 check (progress_percentage between 0 and 100),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references profiles (id),
  updated_by            uuid references profiles (id),
  deleted_at            timestamptz,
  unique (student_id, course_id)
);

create trigger trg_enrollments_updated_at
  before update on enrollments
  for each row execute function set_updated_at();

create index idx_enrollments_course_status on enrollments (course_id, status) where deleted_at is null;

create or replace function check_enrollment_student_role()
returns trigger
language plpgsql
as $$
begin
  perform assert_profile_role(new.student_id, 'murid');
  return new;
end;
$$;

create trigger trg_enrollments_student_role
  before insert on enrollments
  for each row execute function check_enrollment_student_role();

create table lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references enrollments (id) on delete cascade,
  lesson_id       uuid not null references lessons (id),
  status          progress_status not null default 'belum_mulai',
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

create trigger trg_lesson_progress_updated_at
  before update on lesson_progress
  for each row execute function set_updated_at();

create index idx_lesson_progress_enrollment on lesson_progress (enrollment_id);
