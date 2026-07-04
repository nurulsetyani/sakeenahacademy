-- Sakeenah Academy — Notifications
-- Ref: docs/PRD.md §19, §19.1, §25.24, §26
-- Hanya tipe 'reminder_pembayaran' yang juga dikirim via WhatsApp (channel='whatsapp'),
-- 8 tipe lain in-app saja (hasil review PRD v1.1, Q8/Q9).

create table notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  type         notification_type not null,
  title        text not null,
  body         text,
  link_url     text,
  is_read      boolean not null default false,
  sent_at      timestamptz not null default now(),
  channel      notification_channel not null default 'in_app',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_notifications_updated_at
  before update on notifications
  for each row execute function set_updated_at();

create index idx_notifications_user_unread on notifications (user_id, is_read);
