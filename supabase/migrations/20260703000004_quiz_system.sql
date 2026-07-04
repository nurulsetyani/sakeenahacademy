-- Sakeenah Academy — Quiz & Exam System
-- Ref: docs/PRD.md §16, §25.6-25.8, §25.11-25.12, §25.25

create table quizzes (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references courses (id) on delete cascade,
  lesson_id           uuid references lessons (id) on delete cascade,
  title               text not null,
  quiz_type           quiz_type not null,
  passing_grade       integer not null default 70 check (passing_grade between 0 and 100),
  time_limit_minutes  integer check (time_limit_minutes > 0),
  max_attempts        integer not null default 1 check (max_attempts > 0),
  status              content_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references profiles (id),
  updated_by          uuid references profiles (id),
  deleted_at          timestamptz,
  constraint quizzes_type_lesson_consistency check (
    (quiz_type = 'quiz_materi' and lesson_id is not null) or
    (quiz_type = 'ujian_akhir' and lesson_id is null)
  )
);

create trigger trg_quizzes_updated_at
  before update on quizzes
  for each row execute function set_updated_at();

-- One quiz per lesson (quiz_materi); course-level ujian_akhir quizzes are unrestricted in count.
create unique index uq_quizzes_lesson on quizzes (lesson_id) where lesson_id is not null and deleted_at is null;
create index idx_quizzes_course on quizzes (course_id) where deleted_at is null;

create table quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references quizzes (id) on delete cascade,
  question_text  text not null,
  question_type  question_type not null,
  points         integer not null default 1 check (points > 0),
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_quiz_questions_updated_at
  before update on quiz_questions
  for each row execute function set_updated_at();

create index idx_quiz_questions_quiz on quiz_questions (quiz_id, order_index);

create table quiz_options (
  id             uuid primary key default gen_random_uuid(),
  question_id    uuid not null references quiz_questions (id) on delete cascade,
  option_text    text not null,
  is_correct     boolean not null default false,
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_quiz_options_updated_at
  before update on quiz_options
  for each row execute function set_updated_at();

create index idx_quiz_options_question on quiz_options (question_id, order_index);

comment on column quiz_options.is_correct is 'Jangan expose kolom ini ke murid lewat select langsung — gunakan RPC get_quiz_for_attempt() (§12 migration functions) yang menyaring jawaban benar. RLS tidak bisa menyembunyikan kolom, hanya baris (PRD §30 catatan implementasi kritikal).';

create table quiz_attempt_grants (
  id               uuid primary key default gen_random_uuid(),
  quiz_id          uuid not null references quizzes (id) on delete cascade,
  student_id       uuid not null references profiles (id),
  granted_by       uuid not null references profiles (id),
  extra_attempts   integer not null default 1 check (extra_attempts > 0),
  reason           text,
  created_at       timestamptz not null default now()
);

create index idx_quiz_attempt_grants_quiz_student on quiz_attempt_grants (quiz_id, student_id);

create table quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  quiz_id          uuid not null references quizzes (id),
  student_id       uuid not null references profiles (id),
  attempt_number   integer not null,
  score            numeric(5, 2),
  status           attempt_status not null default 'berjalan',
  started_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (quiz_id, student_id, attempt_number)
);

create trigger trg_quiz_attempts_updated_at
  before update on quiz_attempts
  for each row execute function set_updated_at();

create index idx_quiz_attempts_student_quiz on quiz_attempts (student_id, quiz_id);

-- Auto-assigns attempt_number and enforces max_attempts + any quiz_attempt_grants
-- extra attempts granted by the teacher (PRD §7 FR-4.6, §16, §25.25).
create or replace function enforce_quiz_attempt_limit()
returns trigger
language plpgsql
as $$
declare
  v_base_max integer;
  v_extra integer;
  v_used integer;
begin
  select max_attempts into v_base_max from quizzes where id = new.quiz_id;

  select coalesce(sum(extra_attempts), 0) into v_extra
  from quiz_attempt_grants
  where quiz_id = new.quiz_id and student_id = new.student_id;

  select count(*) into v_used
  from quiz_attempts
  where quiz_id = new.quiz_id and student_id = new.student_id;

  if v_used >= (v_base_max + v_extra) then
    raise exception 'Batas percobaan quiz tercapai. Minta guru memberi kesempatan tambahan.';
  end if;

  new.attempt_number := v_used + 1;
  return new;
end;
$$;

create trigger trg_quiz_attempts_limit
  before insert on quiz_attempts
  for each row execute function enforce_quiz_attempt_limit();

create table quiz_attempt_answers (
  id                   uuid primary key default gen_random_uuid(),
  attempt_id           uuid not null references quiz_attempts (id) on delete cascade,
  question_id          uuid not null references quiz_questions (id),
  selected_option_id   uuid references quiz_options (id),
  is_correct           boolean,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create trigger trg_quiz_attempt_answers_updated_at
  before update on quiz_attempt_answers
  for each row execute function set_updated_at();

create index idx_quiz_attempt_answers_attempt on quiz_attempt_answers (attempt_id);
