-- Sakeenah Academy — Profiles
-- Ref: docs/PRD.md §25.1, §3 (role terpisah tegas — admin tidak implisit guru)

create table profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  full_name        text not null,
  role             user_role not null default 'murid',
  phone            text not null,
  avatar_url       text,
  gender           gender_type,
  date_of_birth    date,
  address          text,
  account_status   account_status not null default 'active',
  bio              text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid references profiles (id),
  updated_by       uuid references profiles (id),
  deleted_at       timestamptz,
  constraint profiles_phone_format check (phone ~ '^62[0-9]{8,13}$')
);

comment on column profiles.phone is 'Wajib diisi saat registrasi, format E.164 Indonesia (628xxxxxxxxxx) — tujuan pengiriman WhatsApp Reminder Pembayaran (PRD §19.1)';
comment on column profiles.role is 'Role tunggal, tidak ada hak gabungan antar-role. Admin tidak otomatis punya hak kelola kelas guru (PRD §3).';

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create index idx_profiles_role on profiles (role) where deleted_at is null;

-- Role-integrity guards, reused by courses.teacher_id and enrollments.student_id triggers
-- in later migrations to stop a course being "taught" by a murid/admin, or an enrollment
-- being created for a guru/admin account.
create or replace function assert_profile_role(p_profile_id uuid, p_expected_role user_role)
returns void
language plpgsql
stable
as $$
declare
  v_role user_role;
begin
  select role into v_role from profiles where id = p_profile_id;
  if v_role is null then
    raise exception 'Profil % tidak ditemukan', p_profile_id;
  end if;
  if v_role <> p_expected_role then
    raise exception 'Profil % memiliki role %, diharapkan %', p_profile_id, v_role, p_expected_role;
  end if;
end;
$$;

-- Auto-create a profile row when a new Supabase Auth user signs up.
-- Expects full_name / phone / role to be passed via auth.signUp's `options.data`.
-- Only 'murid' and 'guru' are honoured from client-supplied metadata — 'admin' can
-- never be self-registered this way, preventing privilege escalation via signup payload.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text;
  v_requested_role text;
  v_role user_role;
  v_status account_status;
begin
  v_phone := new.raw_user_meta_data ->> 'phone';
  if v_phone is null or v_phone = '' then
    raise exception 'Nomor HP wajib diisi saat registrasi';
  end if;

  v_requested_role := new.raw_user_meta_data ->> 'role';
  if v_requested_role = 'guru' then
    v_role := 'guru';
    v_status := 'pending'; -- guru butuh approval admin, PRD §13.1
  else
    v_role := 'murid';
    v_status := 'active';
  end if;

  insert into profiles (id, full_name, role, phone, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_role,
    v_phone,
    v_status
  );

  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
