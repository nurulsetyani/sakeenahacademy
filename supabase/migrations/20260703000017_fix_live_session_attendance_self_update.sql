-- Sakeenah Academy — Fix live_session_attendance self-update
-- Ref: code review finding — self check-in (selfCheckIn action) upserts on
-- (session_id, student_id), which routes to UPDATE when a teacher already
-- recorded attendance for that student. The original update policy only
-- allowed owns_course()/is_admin(), so a student's own check-in was
-- silently rejected by RLS whenever a teacher had marked them first.
-- Student self-insert already permits any status value, so allowing
-- self-update is no wider than the trust already granted at insert time.

drop policy if exists live_session_attendance_update on live_session_attendance;

create policy live_session_attendance_update on live_session_attendance
  for update to authenticated using (
    student_id = auth.uid() or
    exists (select 1 from live_sessions ls where ls.id = live_session_attendance.session_id and (owns_course(ls.course_id) or is_admin()))
  );
