-- Sakeenah Academy — Seed Reference Data
-- Ref: docs/PRD.md §14, §18
-- Idempotent (ON CONFLICT DO NOTHING) — safe to re-run, ships to every environment
-- since these are functional reference rows, not throwaway dev fixtures.

insert into course_categories (name, slug, description, icon) values
  ('Aqidah', 'aqidah', 'Kelas seputar dasar-dasar keimanan Islam', 'book-open'),
  ('Fiqih', 'fiqih', 'Kelas seputar hukum dan tata cara ibadah', 'scale'),
  ('Adab', 'adab', 'Kelas seputar akhlak dan adab keseharian', 'heart'),
  ('Kajian Islam', 'kajian-islam', 'Kajian umum keislaman', 'moon-star'),
  ('Bahasa Arab', 'bahasa-arab', 'Kelas bahasa Arab untuk memahami sumber asli', 'languages'),
  ('Kajian Kitab', 'kajian-kitab', 'Pembahasan kitab-kitab klasik', 'library'),
  ('Program Intensif', 'program-intensif', 'Program pembelajaran intensif terstruktur', 'zap')
on conflict (slug) do nothing;

-- Migrations only ever run once per environment (tracked in supabase_migrations.schema_migrations),
-- so a plain insert is safe here; no natural unique key exists on certificate_templates to key an
-- ON CONFLICT off. If you re-seed manually, delete the existing default template first.
insert into certificate_templates (name, category_id, design_config, is_active)
select 'Template Default', null, '{}'::jsonb, true
where not exists (select 1 from certificate_templates where category_id is null);
