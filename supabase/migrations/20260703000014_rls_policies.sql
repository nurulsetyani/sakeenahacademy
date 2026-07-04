-- Sakeenah Academy — Row Level Security Policies
-- Ref: docs/PRD.md §30 (matrix), updated for Q2 revisi (admin ≠ guru, hak terpisah tegas)

-- ---------------------------------------------------------------------------
-- course_categories — 7 kategori topik, publik untuk katalog, tulis admin saja
-- ---------------------------------------------------------------------------
alter table course_categories enable row level security;

create policy course_categories_public_read on course_categories
  for select using (true);

create policy course_categories_admin_write on course_categories
  for all to authenticated using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_self_read on profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_admin_read on profiles
  for select to authenticated using (is_admin());

-- Guru dapat melihat profil murid yang berbagi kelas aktif dengannya.
create policy profiles_teacher_read_students on profiles
  for select to authenticated using (
    is_active_guru() and exists (
      select 1 from enrollments e
      join courses c on c.id = e.course_id
      where e.student_id = profiles.id and c.teacher_id = auth.uid() and e.status = 'active'
    )
  );

create policy profiles_self_update on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_update on profiles
  for update to authenticated using (is_admin()) with check (is_admin());

-- RLS WITH CHECK can't cleanly compare old vs. new column values without a fragile
-- self-referencing subquery, so role/account_status integrity is enforced here instead:
-- only an admin (or the system, e.g. handle_new_user()) may change them.
create or replace function prevent_self_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.account_status is distinct from old.account_status)
     and not is_admin() then
    raise exception 'Hanya admin yang dapat mengubah role atau status akun';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_prevent_self_privilege_escalation
  before update of role, account_status on profiles
  for each row execute function prevent_self_privilege_escalation();

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
alter table courses enable row level security;

create policy courses_public_read on courses
  for select using (status = 'published' and deleted_at is null);

create policy courses_owner_admin_read on courses
  for select to authenticated using (
    deleted_at is null and (teacher_id = auth.uid() or is_admin())
  );

create policy courses_teacher_insert on courses
  for insert to authenticated with check (
    (is_active_guru() and teacher_id = auth.uid()) or is_admin()
  );

create policy courses_owner_admin_update on courses
  for update to authenticated using (
    (teacher_id = auth.uid() and is_active_guru()) or is_admin()
  );

-- ---------------------------------------------------------------------------
-- course_modules
-- ---------------------------------------------------------------------------
alter table course_modules enable row level security;

create policy course_modules_read on course_modules
  for select to authenticated using (
    owns_course(course_id) or is_admin() or is_enrolled(course_id)
  );

create policy course_modules_write on course_modules
  for all to authenticated
  using (owns_course(course_id) or is_admin())
  with check (owns_course(course_id) or is_admin());

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
alter table lessons enable row level security;

create policy lessons_enrolled_read on lessons
  for select to authenticated using (
    deleted_at is null and status = 'published' and is_enrolled(course_id)
  );

create policy lessons_owner_admin_read on lessons
  for select to authenticated using (
    deleted_at is null and (owns_course(course_id) or is_admin())
  );

create policy lessons_write on lessons
  for all to authenticated
  using (owns_course(course_id) or is_admin())
  with check (owns_course(course_id) or is_admin());

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------
alter table quizzes enable row level security;

create policy quizzes_enrolled_read on quizzes
  for select to authenticated using (
    deleted_at is null and status = 'published' and is_enrolled(course_id)
  );

create policy quizzes_owner_admin_read on quizzes
  for select to authenticated using (
    deleted_at is null and (owns_course(course_id) or is_admin())
  );

create policy quizzes_write on quizzes
  for all to authenticated
  using (owns_course(course_id) or is_admin())
  with check (owns_course(course_id) or is_admin());

-- ---------------------------------------------------------------------------
-- quiz_questions / quiz_options — owner/admin ONLY. Students must use the
-- get_quiz_for_attempt() RPC (migration 000012), which strips is_correct.
-- ---------------------------------------------------------------------------
alter table quiz_questions enable row level security;

create policy quiz_questions_owner_admin on quiz_questions
  for all to authenticated
  using (exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and (owns_course(q.course_id) or is_admin())))
  with check (exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and (owns_course(q.course_id) or is_admin())));

alter table quiz_options enable row level security;

create policy quiz_options_owner_admin on quiz_options
  for all to authenticated
  using (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and (owns_course(q.course_id) or is_admin())
  ))
  with check (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and (owns_course(q.course_id) or is_admin())
  ));

-- ---------------------------------------------------------------------------
-- quiz_attempt_grants
-- ---------------------------------------------------------------------------
alter table quiz_attempt_grants enable row level security;

create policy quiz_attempt_grants_read on quiz_attempt_grants
  for select to authenticated using (
    student_id = auth.uid() or
    exists (select 1 from quizzes q where q.id = quiz_attempt_grants.quiz_id and (owns_course(q.course_id) or is_admin()))
  );

create policy quiz_attempt_grants_teacher_write on quiz_attempt_grants
  for insert to authenticated with check (
    (granted_by = auth.uid() or is_admin()) and
    exists (select 1 from quizzes q where q.id = quiz_id and (owns_course(q.course_id) or is_admin()))
  );

create policy quiz_attempt_grants_teacher_delete on quiz_attempt_grants
  for delete to authenticated using (granted_by = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- quiz_attempts / quiz_attempt_answers
-- ---------------------------------------------------------------------------
alter table quiz_attempts enable row level security;

create policy quiz_attempts_read on quiz_attempts
  for select to authenticated using (
    student_id = auth.uid() or
    exists (select 1 from quizzes q where q.id = quiz_attempts.quiz_id and (owns_course(q.course_id) or is_admin()))
  );

create policy quiz_attempts_self_insert on quiz_attempts
  for insert to authenticated with check (student_id = auth.uid());

create policy quiz_attempts_self_update on quiz_attempts
  for update to authenticated using (student_id = auth.uid() and status = 'berjalan');

alter table quiz_attempt_answers enable row level security;

create policy quiz_attempt_answers_read on quiz_attempt_answers
  for select to authenticated using (
    exists (
      select 1 from quiz_attempts qa
      where qa.id = quiz_attempt_answers.attempt_id and (
        qa.student_id = auth.uid() or
        exists (select 1 from quizzes q where q.id = qa.quiz_id and (owns_course(q.course_id) or is_admin()))
      )
    )
  );

create policy quiz_attempt_answers_self_write on quiz_attempt_answers
  for insert to authenticated with check (
    exists (select 1 from quiz_attempts qa where qa.id = attempt_id and qa.student_id = auth.uid() and qa.status = 'berjalan')
  );

create policy quiz_attempt_answers_self_update on quiz_attempt_answers
  for update to authenticated using (
    exists (select 1 from quiz_attempts qa where qa.id = attempt_id and qa.student_id = auth.uid() and qa.status = 'berjalan')
  );

-- ---------------------------------------------------------------------------
-- enrollments — status hanya diubah sistem (trigger) atau admin, tidak pernah murid.
-- ---------------------------------------------------------------------------
alter table enrollments enable row level security;

create policy enrollments_read on enrollments
  for select to authenticated using (
    student_id = auth.uid() or owns_course(course_id) or is_admin()
  );

create policy enrollments_self_insert on enrollments
  for insert to authenticated with check (student_id = auth.uid());

create policy enrollments_admin_update on enrollments
  for update to authenticated using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------------
alter table lesson_progress enable row level security;

create policy lesson_progress_read on lesson_progress
  for select to authenticated using (
    exists (
      select 1 from enrollments e
      where e.id = lesson_progress.enrollment_id and (e.student_id = auth.uid() or owns_course(e.course_id) or is_admin())
    )
  );

create policy lesson_progress_self_write on lesson_progress
  for insert to authenticated with check (
    exists (select 1 from enrollments e where e.id = enrollment_id and e.student_id = auth.uid() and e.status = 'active')
  );

create policy lesson_progress_self_update on lesson_progress
  for update to authenticated using (
    exists (select 1 from enrollments e where e.id = lesson_progress.enrollment_id and e.student_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- live_sessions / live_session_attendance
-- ---------------------------------------------------------------------------
alter table live_sessions enable row level security;

create policy live_sessions_read on live_sessions
  for select to authenticated using (
    deleted_at is null and (is_enrolled(course_id) or owns_course(course_id) or is_admin())
  );

create policy live_sessions_write on live_sessions
  for all to authenticated
  using (owns_course(course_id) or is_admin())
  with check (owns_course(course_id) or is_admin());

alter table live_session_attendance enable row level security;

create policy live_session_attendance_read on live_session_attendance
  for select to authenticated using (
    student_id = auth.uid() or
    exists (select 1 from live_sessions ls where ls.id = live_session_attendance.session_id and (owns_course(ls.course_id) or is_admin()))
  );

-- Murid dapat self check-in "Hadir"; guru/admin dapat menandai manual.
create policy live_session_attendance_write on live_session_attendance
  for insert to authenticated with check (
    student_id = auth.uid() or
    exists (select 1 from live_sessions ls where ls.id = session_id and (owns_course(ls.course_id) or is_admin()))
  );

create policy live_session_attendance_update on live_session_attendance
  for update to authenticated using (
    exists (select 1 from live_sessions ls where ls.id = live_session_attendance.session_id and (owns_course(ls.course_id) or is_admin()))
  );

-- ---------------------------------------------------------------------------
-- tahsin_schedules / tahsin_attendance / tahsin_assessments
-- ---------------------------------------------------------------------------
alter table tahsin_schedules enable row level security;

create policy tahsin_schedules_read on tahsin_schedules
  for select to authenticated using (
    deleted_at is null and (is_enrolled(course_id) or owns_course(course_id) or is_admin())
  );

create policy tahsin_schedules_write on tahsin_schedules
  for all to authenticated
  using (owns_course(course_id) or is_admin())
  with check (owns_course(course_id) or is_admin());

alter table tahsin_attendance enable row level security;

create policy tahsin_attendance_read on tahsin_attendance
  for select to authenticated using (
    student_id = auth.uid() or
    exists (select 1 from tahsin_schedules ts where ts.id = tahsin_attendance.schedule_id and (owns_course(ts.course_id) or is_admin()))
  );

create policy tahsin_attendance_write on tahsin_attendance
  for all to authenticated
  using (exists (select 1 from tahsin_schedules ts where ts.id = tahsin_attendance.schedule_id and (owns_course(ts.course_id) or is_admin())))
  with check (exists (select 1 from tahsin_schedules ts where ts.id = schedule_id and (owns_course(ts.course_id) or is_admin())));

alter table tahsin_assessments enable row level security;

create policy tahsin_assessments_read on tahsin_assessments
  for select to authenticated using (
    student_id = auth.uid() or teacher_id = auth.uid() or
    exists (select 1 from tahsin_schedules ts where ts.id = tahsin_assessments.schedule_id and (owns_course(ts.course_id) or is_admin()))
  );

create policy tahsin_assessments_insert on tahsin_assessments
  for insert to authenticated with check (
    (teacher_id = auth.uid() or is_admin()) and
    exists (select 1 from tahsin_schedules ts where ts.id = schedule_id and (owns_course(ts.course_id) or is_admin()))
  );

create policy tahsin_assessments_update on tahsin_assessments
  for update to authenticated using (teacher_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- tahfidz_targets / tahfidz_setoran
-- ---------------------------------------------------------------------------
alter table tahfidz_targets enable row level security;

create policy tahfidz_targets_read on tahfidz_targets
  for select to authenticated using (student_id = auth.uid() or owns_course(course_id) or is_admin());

create policy tahfidz_targets_insert on tahfidz_targets
  for insert to authenticated with check (owns_course(course_id) or is_admin());

create policy tahfidz_targets_update on tahfidz_targets
  for update to authenticated using (assigned_by = auth.uid() or is_admin());

alter table tahfidz_setoran enable row level security;

create policy tahfidz_setoran_read on tahfidz_setoran
  for select to authenticated using (student_id = auth.uid() or owns_course(course_id) or is_admin());

create policy tahfidz_setoran_insert on tahfidz_setoran
  for insert to authenticated with check (owns_course(course_id) or is_admin());

create policy tahfidz_setoran_update on tahfidz_setoran
  for update to authenticated using (teacher_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- certificate_templates / certificates
-- ---------------------------------------------------------------------------
alter table certificate_templates enable row level security;

create policy certificate_templates_admin_only on certificate_templates
  for all to authenticated using (is_admin()) with check (is_admin());

alter table certificates enable row level security;

create policy certificates_read on certificates
  for select to authenticated using (student_id = auth.uid() or is_admin());

-- Tidak ada insert policy untuk client — hanya trigger issue_certificate_for_enrollment()
-- (SECURITY DEFINER, dijalankan sebagai pemilik tabel) yang boleh menulis. Verifikasi publik
-- lewat fungsi verify_certificate(), bukan select langsung (PRD §30 catatan kritikal).
create policy certificates_admin_update on certificates
  for update to authenticated using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- payment_channels / payments
-- ---------------------------------------------------------------------------
alter table payment_channels enable row level security;

create policy payment_channels_read on payment_channels
  for select to authenticated using (is_active = true or is_admin());

create policy payment_channels_admin_write on payment_channels
  for all to authenticated using (is_admin()) with check (is_admin());

alter table payments enable row level security;

create policy payments_read on payments
  for select to authenticated using (student_id = auth.uid() or is_admin());

create policy payments_self_insert on payments
  for insert to authenticated with check (student_id = auth.uid());

-- Murid boleh melengkapi bukti transfer selama belum ada keputusan final admin.
create policy payments_self_update on payments
  for update to authenticated using (
    (student_id = auth.uid() and status in ('pending', 'menunggu_verifikasi')) or is_admin()
  );

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
alter table notifications enable row level security;

create policy notifications_self_read on notifications
  for select to authenticated using (user_id = auth.uid());

create policy notifications_self_update on notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admin menulis notifikasi langsung dari lib/actions/admin.ts saat approve/reject guru &
-- pembayaran (aksi administratif, bukan proses sistem otomatis seperti trigger sertifikat).
create policy notifications_admin_insert on notifications
  for insert to authenticated with check (is_admin());
