-- Sakeenah Academy — Extensions & Enums
-- Ref: docs/PRD.md §26 Enum Design

create extension if not exists pgcrypto;

create type user_role as enum ('murid', 'guru', 'admin');
create type account_status as enum ('pending', 'active', 'suspended');
create type gender_type as enum ('laki_laki', 'perempuan');
create type program_type as enum ('reguler', 'tahsin', 'tahfidz');
create type course_access_type as enum ('gratis', 'berbayar');
create type course_status as enum ('draft', 'published', 'archived');
create type course_level as enum ('pemula', 'menengah', 'lanjutan');
create type completion_rule as enum ('seluruh_materi', 'ujian_akhir', 'keduanya');
create type content_status as enum ('draft', 'published');
create type quiz_type as enum ('quiz_materi', 'ujian_akhir');
create type question_type as enum ('pilihan_tunggal', 'pilihan_ganda', 'benar_salah');
create type attempt_status as enum ('berjalan', 'lulus', 'tidak_lulus');
create type enrollment_status as enum ('pending_payment', 'active', 'completed', 'rejected', 'expired');
create type progress_status as enum ('belum_mulai', 'berjalan', 'selesai');
create type meeting_platform as enum ('zoom', 'google_meet');
create type session_status as enum ('terjadwal', 'berlangsung', 'selesai', 'dibatalkan');
create type attendance_status as enum ('hadir', 'tidak_hadir', 'izin', 'sakit');
create type target_status as enum ('belum_mulai', 'proses', 'selesai');
create type setoran_status as enum ('lancar', 'perlu_perbaikan', 'mengulang');
create type certificate_status as enum ('aktif', 'revoked');
create type payment_channel_type as enum ('transfer_bank', 'qris');
create type payment_status as enum ('pending', 'menunggu_verifikasi', 'approved', 'rejected');
create type notification_type as enum (
  'materi_baru', 'jadwal_kelas', 'reminder_kelas', 'reminder_quiz', 'reminder_ujian',
  'sertifikat_tersedia', 'reminder_pembayaran', 'payment_approved', 'payment_rejected',
  'guru_disetujui', 'guru_ditolak'
);
create type notification_channel as enum ('in_app', 'whatsapp');

-- Generic updated_at trigger, reused by every table below that has an updated_at column.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
