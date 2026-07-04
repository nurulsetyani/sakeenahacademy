-- Sakeenah Academy — RLS Helper Functions
-- Ref: docs/PRD.md §30
--
-- SECURITY DEFINER + fixed search_path so these can be called from policies on
-- `profiles` itself without triggering RLS recursion.

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$;

create or replace function is_active_guru()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'guru' and account_status = 'active'
  );
$$;

create or replace function owns_course(p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from courses where id = p_course_id and teacher_id = auth.uid()
  );
$$;

create or replace function is_enrolled(p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from enrollments
    where course_id = p_course_id and student_id = auth.uid() and status = 'active'
  );
$$;

-- Course visible in the public catalog: published, not soft-deleted, and (gratis OR berbayar —
-- access_type does not gate catalog visibility, only content access, per PRD §11.1 silabus publik).
create or replace function course_is_public(p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from courses where id = p_course_id and status = 'published' and deleted_at is null
  );
$$;

grant execute on function is_admin() to authenticated, anon;
grant execute on function is_active_guru() to authenticated;
grant execute on function owns_course(uuid) to authenticated;
grant execute on function is_enrolled(uuid) to authenticated;
grant execute on function course_is_public(uuid) to authenticated, anon;
