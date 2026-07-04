-- Sakeenah Academy — Payments
-- Ref: docs/PRD.md §20, §25.22-25.23
-- enrollment <-> payments = 1—N: setiap penolakan menghasilkan row baru, riwayat percobaan
-- tidak pernah ditimpa (hasil review PRD v1.1, Q5).

create table payment_channels (
  id                uuid primary key default gen_random_uuid(),
  type              payment_channel_type not null,
  bank_name         text,
  account_number    text,
  account_holder    text,
  qris_image_url    text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_payment_channels_updated_at
  before update on payment_channels
  for each row execute function set_updated_at();

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  enrollment_id       uuid not null references enrollments (id) on delete cascade,
  student_id          uuid not null references profiles (id),
  course_id           uuid not null references courses (id),
  attempt_number      integer not null,
  amount              numeric(12, 2) not null check (amount >= 0),
  channel_id          uuid references payment_channels (id),
  proof_image_url     text,
  status              payment_status not null default 'pending',
  submitted_at        timestamptz,
  reviewed_by         uuid references profiles (id),
  reviewed_at         timestamptz,
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (enrollment_id, attempt_number)
);

create trigger trg_payments_updated_at
  before update on payments
  for each row execute function set_updated_at();

create index idx_payments_status on payments (status);
create index idx_payments_student on payments (student_id);
create index idx_payments_enrollment_attempt on payments (enrollment_id, attempt_number desc);

create or replace function assign_payment_attempt_number()
returns trigger
language plpgsql
as $$
declare
  v_next integer;
begin
  select coalesce(max(attempt_number), 0) + 1 into v_next
  from payments
  where enrollment_id = new.enrollment_id;

  new.attempt_number := v_next;
  return new;
end;
$$;

create trigger trg_payments_attempt_number
  before insert on payments
  for each row execute function assign_payment_attempt_number();

-- Approve payment -> activate enrollment. Deliberately DB-level (not client-writable)
-- so a student can never flip their own enrollment to 'active' (PRD §30 catatan kritikal).
create or replace function apply_payment_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    update enrollments
    set status = 'active', enrolled_at = now()
    where id = new.enrollment_id;
  end if;
  return new;
end;
$$;

create trigger trg_payments_approval
  after update of status on payments
  for each row execute function apply_payment_approval();
