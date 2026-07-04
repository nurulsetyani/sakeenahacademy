# Sakeenah Academy — Supabase Migrations

Skema database lengkap hasil implementasi `docs/PRD.md` (v1.1). 16 file migration di `migrations/`, dijalankan berurutan berdasarkan prefix timestamp.

## Urutan & Isi

| File | Isi |
|---|---|
| `000001_extensions_and_enums.sql` | Extension `pgcrypto`, seluruh custom enum, fungsi `set_updated_at()` |
| `000002_profiles.sql` | Tabel `profiles`, trigger `handle_new_user()` (auto-create profil dari `auth.users`) |
| `000003_course_catalog.sql` | `course_categories`, `courses`, `course_modules`, `lessons` |
| `000004_quiz_system.sql` | `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_attempt_answers`, `quiz_attempt_grants` |
| `000005_enrollment_progress.sql` | `enrollments`, `lesson_progress` |
| `000006_live_class.sql` | `live_sessions`, `live_session_attendance` |
| `000007_tahsin.sql` | `tahsin_schedules`, `tahsin_attendance`, `tahsin_assessments` |
| `000008_tahfidz.sql` | `tahfidz_targets`, `tahfidz_setoran` |
| `000009_certificates.sql` | `certificate_templates`, `certificates`, generator nomor sertifikat |
| `000010_payments.sql` | `payment_channels`, `payments` (model 1—N ke enrollment), trigger approve→aktivasi |
| `000011_notifications.sql` | `notifications` |
| `000012_business_logic_functions.sql` | Grading quiz (`submit_quiz_attempt`), penyembunyian kunci jawaban (`get_quiz_for_attempt`), kelulusan & auto-terbit sertifikat, `verify_certificate()` publik |
| `000013_rls_helper_functions.sql` | `is_admin()`, `is_active_guru()`, `owns_course()`, `is_enrolled()` |
| `000014_rls_policies.sql` | RLS untuk seluruh tabel |
| `000015_storage_buckets.sql` | 7 storage bucket + RLS `storage.objects` |
| `000016_seed_reference_data.sql` | 7 kategori topik + template sertifikat default |

## Menjalankan

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Untuk pengembangan lokal: `supabase start` lalu `supabase db reset` (menjalankan seluruh migration dari awal pada database lokal).

## Hal yang harus disiapkan di sisi aplikasi (Next.js)

1. **Registrasi wajib kirim metadata** — `supabase.auth.signUp()` harus menyertakan `options.data = { full_name, phone, role }` (`phone` wajib format `628xxxxxxxxxx`, `role` hanya `'murid'` atau `'guru'` yang dihormati trigger; `'admin'` tidak bisa self-register — assign manual via SQL/dashboard Supabase setelah akun dibuat).
2. **Submit quiz** — panggil RPC `supabase.rpc('submit_quiz_attempt', { p_attempt_id })`, jangan hitung skor di client.
3. **Ambil soal quiz untuk murid** — panggil RPC `supabase.rpc('get_quiz_for_attempt', { p_quiz_id })`, jangan `select * from quiz_options` langsung (RLS sengaja memblokir akses murid ke tabel itu — lihat komentar di `000004`).
4. **Verifikasi sertifikat publik** — panggil RPC `supabase.rpc('verify_certificate', { p_identifier })` dari halaman `/verifikasi-sertifikat/[nomor]`, bukan query tabel `certificates` langsung.
5. **Upload storage** — ikuti konvensi path di komentar header `000015_storage_buckets.sql` (mis. `payment-proofs/{student_id}/...`) — RLS storage bergantung pada struktur folder ini.
6. **Reminder Pembayaran via WhatsApp** — belum diimplementasikan di migration ini (di luar cakupan SQL); perlu Supabase Edge Function terjadwal (cron) yang memindai `payments` pending > X hari, memanggil API provider pihak ketiga (mis. Fonnte), lalu menulis baris `notifications` dengan `channel = 'whatsapp'`.
7. **Generate PDF sertifikat** — trigger `issue_certificate_for_enrollment()` hanya membuat baris `certificates` (nomor, qr_token); rendering PDF & upload ke bucket `certificates` perlu dilakukan di Edge Function terpisah yang didengarkan lewat Supabase Realtime/Webhook saat baris baru masuk.

## Belum termasuk (di luar cakupan "SQL migration")

- TypeScript types (`supabase gen types typescript`)
- Seed data pengguna dummy untuk development (perlu Supabase Auth Admin API, tidak bisa lewat SQL biasa karena `auth.users` butuh password ter-hash oleh GoTrue)
- Edge Functions (WhatsApp reminder, PDF sertifikat)
