-- Sakeenah Academy — Narrow Guru scope to tugas/quiz/ujian + menilai
-- Ref: product decision (grill-me session) — course/materi authoring, Live Class,
-- and Tahsin scheduling/attendance move entirely to Admin. Guru keeps: quiz/ujian
-- (unchanged, still teacher_id-owned), Tahsin assessment only, and Tahfidz
-- (unchanged). This migration only tightens WRITE-side policies; read policies and
-- Tahsin/Tahfidz assessment policies are untouched.

-- ---------------------------------------------------------------------------
-- courses — Admin-only create/update from now on
-- ---------------------------------------------------------------------------
drop policy if exists courses_teacher_insert on courses;
create policy courses_teacher_insert on courses
  for insert to authenticated with check (is_admin());

drop policy if exists courses_owner_admin_update on courses;
create policy courses_owner_admin_update on courses
  for update to authenticated using (is_admin());

-- ---------------------------------------------------------------------------
-- lessons — Admin-only write (guru keeps read access via lessons_owner_admin_read)
-- ---------------------------------------------------------------------------
drop policy if exists lessons_write on lessons;
create policy lessons_write on lessons
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- live_sessions / live_session_attendance — Live Class moves fully to Admin;
-- students keep self check-in.
-- ---------------------------------------------------------------------------
drop policy if exists live_sessions_read on live_sessions;
create policy live_sessions_read on live_sessions
  for select to authenticated using (
    deleted_at is null and (is_enrolled(course_id) or is_admin())
  );

drop policy if exists live_sessions_write on live_sessions;
create policy live_sessions_write on live_sessions
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists live_session_attendance_read on live_session_attendance;
create policy live_session_attendance_read on live_session_attendance
  for select to authenticated using (
    student_id = auth.uid() or is_admin()
  );

drop policy if exists live_session_attendance_write on live_session_attendance;
create policy live_session_attendance_write on live_session_attendance
  for insert to authenticated with check (
    student_id = auth.uid() or is_admin()
  );

drop policy if exists live_session_attendance_update on live_session_attendance;
create policy live_session_attendance_update on live_session_attendance
  for update to authenticated using (
    student_id = auth.uid() or is_admin()
  );

-- ---------------------------------------------------------------------------
-- tahsin_schedules / tahsin_attendance — schedule & attendance move to Admin.
-- tahsin_assessments (guru's actual "menilai" job) is untouched.
-- ---------------------------------------------------------------------------
drop policy if exists tahsin_schedules_write on tahsin_schedules;
create policy tahsin_schedules_write on tahsin_schedules
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists tahsin_attendance_write on tahsin_attendance;
create policy tahsin_attendance_write on tahsin_attendance
  for all to authenticated
  using (is_admin())
  with check (is_admin());
