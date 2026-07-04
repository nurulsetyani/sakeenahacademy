-- Sakeenah Academy — Course Catalog
-- Ref: docs/PRD.md §14, §25.2-25.5
-- Kategori (topik) dan program_type (reguler/tahsin/tahfidz) adalah dua sumbu independen — lihat §14.

create table course_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  icon         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table course_categories is '7 kategori topik konten (Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif). Tahsin & Tahfidz BUKAN kategori — keduanya nilai courses.program_type.';

create trigger trg_course_categories_updated_at
  before update on course_categories
  for each row execute function set_updated_at();

create table courses (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  description       text,
  cover_image_url   text,
  category_id       uuid references course_categories (id),
  teacher_id        uuid not null references profiles (id),
  program_type      program_type not null default 'reguler',
  access_type       course_access_type not null default 'gratis',
  price             numeric(12, 2) not null default 0 check (price >= 0),
  status            course_status not null default 'draft',
  passing_grade     integer check (passing_grade between 0 and 100),
  completion_rule   completion_rule not null default 'seluruh_materi',
  level             course_level not null default 'pemula',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references profiles (id),
  updated_by        uuid references profiles (id),
  deleted_at        timestamptz,
  constraint courses_paid_has_price check (access_type = 'gratis' or price > 0)
);

create trigger trg_courses_updated_at
  before update on courses
  for each row execute function set_updated_at();

create index idx_courses_status_category on courses (status, category_id) where deleted_at is null;
create index idx_courses_teacher on courses (teacher_id) where deleted_at is null;

-- teacher_id must belong to a 'guru' account. Admin manages courses administratively
-- (see RLS §30) but is never recorded as the owning teacher_id (PRD §3 Q2 revisi).
create or replace function check_course_teacher_role()
returns trigger
language plpgsql
as $$
begin
  perform assert_profile_role(new.teacher_id, 'guru');
  return new;
end;
$$;

create trigger trg_courses_teacher_role
  before insert or update of teacher_id on courses
  for each row execute function check_course_teacher_role();

create table course_modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references courses (id) on delete cascade,
  title        text not null,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_course_modules_updated_at
  before update on course_modules
  for each row execute function set_updated_at();

create index idx_course_modules_course on course_modules (course_id, order_index);

create table lessons (
  id                           uuid primary key default gen_random_uuid(),
  course_id                    uuid not null references courses (id) on delete cascade,
  module_id                    uuid references course_modules (id) on delete set null,
  title                        text not null,
  youtube_url                  text,
  pdf_url                      text,
  summary_content              text,
  order_index                  integer not null default 0,
  status                       content_status not null default 'draft',
  estimated_duration_minutes   integer,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),
  created_by                   uuid references profiles (id),
  updated_by                   uuid references profiles (id),
  deleted_at                   timestamptz
);

create trigger trg_lessons_updated_at
  before update on lessons
  for each row execute function set_updated_at();

create index idx_lessons_course_order on lessons (course_id, order_index) where deleted_at is null;
