-- Sakeenah Academy — Cross-cutting Business Logic
-- Ref: docs/PRD.md §16, §18, §20, §23, §30

-- ---------------------------------------------------------------------------
-- Quiz grading
-- ---------------------------------------------------------------------------

-- Server always recomputes is_correct from the current answer key — never trust
-- a client-supplied value on quiz_attempt_answers (PRD §30 catatan kritikal).
create or replace function compute_answer_correctness()
returns trigger
language plpgsql
as $$
begin
  if new.selected_option_id is null then
    new.is_correct := false;
  else
    select is_correct into new.is_correct
    from quiz_options
    where id = new.selected_option_id;
  end if;
  return new;
end;
$$;

create trigger trg_quiz_attempt_answers_correctness
  before insert or update of selected_option_id on quiz_attempt_answers
  for each row execute function compute_answer_correctness();

-- Callable by the owning student via supabase.rpc('submit_quiz_attempt', {p_attempt_id}).
-- Grades from quiz_attempt_answers, sets score/status/submitted_at, and — for ujian_akhir
-- attempts that pass — triggers enrollment completion re-evaluation.
create or replace function submit_quiz_attempt(p_attempt_id uuid)
returns quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt quiz_attempts;
  v_quiz quizzes;
  v_total_points numeric;
  v_earned_points numeric;
  v_score numeric;
  v_status attempt_status;
  v_enrollment_id uuid;
begin
  select * into v_attempt from quiz_attempts where id = p_attempt_id for update;
  if v_attempt is null then
    raise exception 'Percobaan quiz tidak ditemukan';
  end if;
  if v_attempt.student_id <> auth.uid() then
    raise exception 'Tidak diizinkan mengubah percobaan quiz murid lain';
  end if;
  if v_attempt.status <> 'berjalan' then
    raise exception 'Percobaan quiz sudah disubmit';
  end if;

  select * into v_quiz from quizzes where id = v_attempt.quiz_id;

  select coalesce(sum(points), 0) into v_total_points
  from quiz_questions where quiz_id = v_quiz.id;

  select coalesce(sum(qq.points), 0) into v_earned_points
  from quiz_attempt_answers qaa
  join quiz_questions qq on qq.id = qaa.question_id
  where qaa.attempt_id = p_attempt_id and qaa.is_correct = true;

  v_score := case when v_total_points = 0 then 0
                   else round(v_earned_points * 100.0 / v_total_points, 2) end;
  v_status := case when v_score >= v_quiz.passing_grade then 'lulus' else 'tidak_lulus' end;

  update quiz_attempts
  set score = v_score, status = v_status, submitted_at = now()
  where id = p_attempt_id
  returning * into v_attempt;

  if v_quiz.quiz_type = 'ujian_akhir' and v_status = 'lulus' then
    select id into v_enrollment_id
    from enrollments
    where student_id = v_attempt.student_id and course_id = v_quiz.course_id;

    if v_enrollment_id is not null then
      perform refresh_enrollment_completion(v_enrollment_id);
    end if;
  end if;

  return v_attempt;
end;
$$;

-- Student-safe question/option reader — never returns quiz_options.is_correct.
-- Restricted to: the enrolled student themselves (active enrollment), the course's
-- teacher, or an admin.
create or replace function get_quiz_for_attempt(p_quiz_id uuid)
returns table (
  question_id     uuid,
  question_text   text,
  question_type   question_type,
  points          integer,
  question_order  integer,
  option_id       uuid,
  option_text     text,
  option_order    integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_course_id uuid;
begin
  select course_id into v_course_id from quizzes where id = p_quiz_id;

  if not (
    exists (
      select 1 from enrollments e
      where e.course_id = v_course_id and e.student_id = auth.uid() and e.status = 'active'
    )
    or exists (
      select 1 from courses c where c.id = v_course_id and c.teacher_id = auth.uid()
    )
    or exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) then
    raise exception 'Tidak diizinkan mengakses quiz ini';
  end if;

  return query
  select qq.id, qq.question_text, qq.question_type, qq.points, qq.order_index,
         qo.id, qo.option_text, qo.order_index
  from quiz_questions qq
  left join quiz_options qo on qo.question_id = qq.id
  where qq.quiz_id = p_quiz_id
  order by qq.order_index, qo.order_index;
end;
$$;

-- ---------------------------------------------------------------------------
-- Enrollment completion + automatic certificate issuance (PRD §18: "otomatis penuh")
-- ---------------------------------------------------------------------------

create or replace function refresh_enrollment_completion(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment enrollments;
  v_course courses;
  v_total_lessons integer;
  v_completed_lessons integer;
  v_progress integer;
  v_materi_done boolean;
  v_ujian_required boolean;
  v_ujian_done boolean;
  v_should_complete boolean;
begin
  select * into v_enrollment from enrollments where id = p_enrollment_id;
  if v_enrollment is null or v_enrollment.status = 'completed' then
    return;
  end if;

  select * into v_course from courses where id = v_enrollment.course_id;

  select count(*) into v_total_lessons
  from lessons
  where course_id = v_course.id and status = 'published' and deleted_at is null;

  select count(*) into v_completed_lessons
  from lesson_progress
  where enrollment_id = p_enrollment_id and status = 'selesai';

  v_progress := case when v_total_lessons = 0 then 0
                      else round(v_completed_lessons * 100.0 / v_total_lessons) end;

  update enrollments set progress_percentage = v_progress where id = p_enrollment_id;

  v_materi_done := v_total_lessons > 0 and v_completed_lessons >= v_total_lessons;

  select exists (
    select 1 from quizzes
    where course_id = v_course.id and quiz_type = 'ujian_akhir'
      and status = 'published' and deleted_at is null
  ) into v_ujian_required;

  if v_ujian_required then
    select exists (
      select 1 from quiz_attempts qa
      join quizzes q on q.id = qa.quiz_id
      where q.course_id = v_course.id and q.quiz_type = 'ujian_akhir'
        and qa.student_id = v_enrollment.student_id and qa.status = 'lulus'
    ) into v_ujian_done;
  else
    v_ujian_done := true;
  end if;

  v_should_complete := case v_course.completion_rule
    when 'seluruh_materi' then v_materi_done
    when 'ujian_akhir' then v_ujian_done
    when 'keduanya' then v_materi_done and v_ujian_done
    else false
  end;

  if v_should_complete then
    update enrollments set status = 'completed', completed_at = now() where id = p_enrollment_id;
  end if;
end;
$$;

create or replace function trg_lesson_progress_refresh_completion()
returns trigger
language plpgsql
as $$
begin
  perform refresh_enrollment_completion(new.enrollment_id);
  return new;
end;
$$;

create trigger trg_lesson_progress_completion
  after insert or update of status on lesson_progress
  for each row execute function trg_lesson_progress_refresh_completion();

create or replace function issue_certificate_for_enrollment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_template_id uuid;
  v_category_id uuid;
  v_certificate_id uuid;
begin
  select category_id into v_category_id from courses where id = new.course_id;

  select id into v_template_id from certificate_templates
  where category_id = v_category_id and is_active = true
  limit 1;

  if v_template_id is null then
    select id into v_template_id from certificate_templates
    where category_id is null and is_active = true
    limit 1;
  end if;

  if v_template_id is null then
    -- No template configured yet — skip issuance rather than fail the enrollment update.
    return new;
  end if;

  insert into certificates (certificate_number, enrollment_id, student_id, course_id, template_id, qr_token)
  values (generate_certificate_number(), new.id, new.student_id, new.course_id, v_template_id, gen_random_uuid())
  on conflict (enrollment_id) do nothing
  returning id into v_certificate_id;

  if v_certificate_id is not null then
    insert into notifications (user_id, type, title, body, link_url)
    values (
      new.student_id, 'sertifikat_tersedia', 'Sertifikat tersedia',
      'Sertifikat kelulusan Anda telah terbit dan siap diunduh.',
      '/murid/sertifikat'
    );
  end if;

  return new;
end;
$$;

create trigger trg_enrollments_issue_certificate
  after update of status on enrollments
  for each row
  when (new.status = 'completed' and old.status is distinct from 'completed')
  execute function issue_certificate_for_enrollment();

-- ---------------------------------------------------------------------------
-- Public certificate verification (PRD §18, §30 — never expose the base table to anon)
-- ---------------------------------------------------------------------------

create or replace function verify_certificate(p_identifier text)
returns table (
  certificate_number   text,
  student_name         text,
  course_title         text,
  issued_at            timestamptz,
  status               certificate_status
)
language sql
security definer
set search_path = public
stable
as $$
  select c.certificate_number, p.full_name, co.title, c.issued_at, c.status
  from certificates c
  join profiles p on p.id = c.student_id
  join courses co on co.id = c.course_id
  where c.certificate_number = p_identifier or c.qr_token::text = p_identifier;
$$;

grant execute on function verify_certificate(text) to anon, authenticated;
grant execute on function get_quiz_for_attempt(uuid) to authenticated;
grant execute on function submit_quiz_attempt(uuid) to authenticated;
