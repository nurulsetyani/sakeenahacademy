-- Sakeenah Academy — Certificates
-- Ref: docs/PRD.md §18, §25.20-25.21

create table certificate_templates (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category_id    uuid references course_categories (id),
  design_config  jsonb not null default '{}'::jsonb,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on column certificate_templates.category_id is 'NULL = template default umum, dipakai bila tidak ada template spesifik untuk kategori kelas.';

create trigger trg_certificate_templates_updated_at
  before update on certificate_templates
  for each row execute function set_updated_at();

create sequence certificate_number_seq;

create table certificates (
  id                    uuid primary key default gen_random_uuid(),
  certificate_number    text not null unique,
  enrollment_id         uuid not null unique references enrollments (id),
  student_id            uuid not null references profiles (id),
  course_id             uuid not null references courses (id),
  template_id           uuid not null references certificate_templates (id),
  issued_at             timestamptz not null default now(),
  qr_token              uuid not null default gen_random_uuid() unique,
  pdf_url               text,
  status                certificate_status not null default 'aktif',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_certificates_updated_at
  before update on certificates
  for each row execute function set_updated_at();

create index idx_certificates_student on certificates (student_id);

-- Format: SA/{tahun}/{bulan}/{running-number global, 6 digit}. Ref PRD §18.
create or replace function generate_certificate_number()
returns text
language sql
as $$
  select 'SA/' || to_char(now(), 'YYYY') || '/' || to_char(now(), 'MM') || '/' ||
         lpad(nextval('certificate_number_seq')::text, 6, '0');
$$;
