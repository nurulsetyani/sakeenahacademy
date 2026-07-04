-- Sakeenah Academy — Storage Buckets
-- Ref: docs/PRD.md §27
--
-- Path convention (application must upload using these prefixes for RLS to work):
--   avatars/{user_id}/...
--   course-covers/{course_id}/...
--   lesson-materials/{course_id}/...
--   payment-proofs/{student_id}/...
--   certificates/{certificate_id}/...            (service role writes only)
--   certificate-templates/{template_id}/...       (admin only)
--   qris-assets/{channel_id}/...

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('course-covers', 'course-covers', true),
  ('lesson-materials', 'lesson-materials', false),
  ('payment-proofs', 'payment-proofs', false),
  ('certificates', 'certificates', true),
  ('certificate-templates', 'certificate-templates', false),
  ('qris-assets', 'qris-assets', true)
on conflict (id) do nothing;

-- avatars: owner read/write, public read
create policy avatars_public_read on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_owner_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- course-covers: public read, teacher-of-course or admin write
create policy course_covers_public_read on storage.objects for select
  using (bucket_id = 'course-covers');

create policy course_covers_teacher_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'course-covers' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid())
    )
  );

create policy course_covers_teacher_update on storage.objects for update to authenticated
  using (
    bucket_id = 'course-covers' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid())
    )
  );

create policy course_covers_teacher_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'course-covers' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid())
    )
  );

-- lesson-materials: private, readable by enrolled students / owning teacher / admin
create policy lesson_materials_read on storage.objects for select to authenticated
  using (
    bucket_id = 'lesson-materials' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid()) or
      exists (
        select 1 from enrollments e
        where e.course_id::text = (storage.foldername(name))[1] and e.student_id = auth.uid() and e.status = 'active'
      )
    )
  );

create policy lesson_materials_teacher_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'lesson-materials' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid())
    )
  );

create policy lesson_materials_teacher_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'lesson-materials' and (
      is_admin() or
      exists (select 1 from courses c where c.id::text = (storage.foldername(name))[1] and c.teacher_id = auth.uid())
    )
  );

-- payment-proofs: private, create-only by the owning student, readable by owner + admin
create policy payment_proofs_owner_read on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs' and (
      is_admin() or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy payment_proofs_owner_write on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- certificates: public read; writes only via service role (no policy = no client access)
create policy certificates_public_read on storage.objects for select
  using (bucket_id = 'certificates');

-- certificate-templates: admin only
create policy certificate_templates_admin_all on storage.objects for all to authenticated
  using (bucket_id = 'certificate-templates' and is_admin())
  with check (bucket_id = 'certificate-templates' and is_admin());

-- qris-assets: public read, admin write
create policy qris_assets_public_read on storage.objects for select
  using (bucket_id = 'qris-assets');

create policy qris_assets_admin_write on storage.objects for insert to authenticated
  with check (bucket_id = 'qris-assets' and is_admin());

create policy qris_assets_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'qris-assets' and is_admin());

create policy qris_assets_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'qris-assets' and is_admin());
