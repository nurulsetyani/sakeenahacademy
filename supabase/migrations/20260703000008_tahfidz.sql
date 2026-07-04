-- Sakeenah Academy — Tahfidz Module
-- Ref: docs/PRD.md §22, §25.18-25.19

create table tahfidz_targets (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses (id) on delete cascade,
  student_id    uuid not null references profiles (id),
  assigned_by   uuid not null references profiles (id),
  surah         text not null,
  ayat_start    integer not null check (ayat_start > 0),
  ayat_end      integer not null check (ayat_end >= ayat_start),
  target_date   date,
  status        target_status not null default 'belum_mulai',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references profiles (id),
  updated_by    uuid references profiles (id),
  deleted_at    timestamptz
);

create trigger trg_tahfidz_targets_updated_at
  before update on tahfidz_targets
  for each row execute function set_updated_at();

create index idx_tahfidz_targets_student_course on tahfidz_targets (student_id, course_id) where deleted_at is null;

create table tahfidz_setoran (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses (id) on delete cascade,
  student_id      uuid not null references profiles (id),
  teacher_id      uuid not null references profiles (id),
  target_id       uuid references tahfidz_targets (id) on delete set null,
  surah           text not null,
  ayat_start      integer not null check (ayat_start > 0),
  ayat_end        integer not null check (ayat_end >= ayat_start),
  setoran_date    date not null default current_date,
  status          setoran_status not null default 'lancar',
  score           integer check (score between 0 and 100),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references profiles (id),
  updated_by      uuid references profiles (id),
  deleted_at      timestamptz
);

create trigger trg_tahfidz_setoran_updated_at
  before update on tahfidz_setoran
  for each row execute function set_updated_at();

create index idx_tahfidz_setoran_student_course_date on tahfidz_setoran (student_id, course_id, setoran_date) where deleted_at is null;
