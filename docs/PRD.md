# Product Requirements Document (PRD)
# Sakeenah Academy — Platform Pembelajaran Islam

| | |
|---|---|
| **Versi Dokumen** | 1.1 |
| **Tanggal** | 3 Juli 2026 |
| **Status** | Draft untuk Pengembangan MVP (pasca sesi review keputusan arsitektur) |
| **Disusun sebagai** | Senior Product Manager, Senior System Architect, Senior LMS Architect, Senior Supabase Architect |
| **Target Stack** | Next.js App Router + TypeScript + Tailwind CSS, Supabase (Auth, Database, Storage, Realtime), Vercel |

---

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 3 Juli 2026 | Draft awal PRD lengkap |
| 1.1 | 3 Juli 2026 | Hasil sesi review: (1) Role admin & guru dipisah tegas — tidak ada hak implisit; (2) Tahsin/Tahfidz dipisah dari `course_categories`, murni jadi `program_type`; (3) Resubmit pembayaran ditolak membuat row `payments` baru (riwayat percobaan utuh); (4) Guru dapat tombol reset percobaan quiz/ujian; (5) Notifikasi "Reminder Pembayaran" dikirim via WhatsApp (provider pihak ketiga) selain in-app, 8 tipe lain in-app saja; (6) Nomor HP wajib diisi saat registrasi (format E.164) |

---

## Daftar Isi

1. Product Vision
2. Product Goals
3. User Roles
4. User Personas
5. User Stories
6. Functional Requirements
7. Non-Functional Requirements
8. Information Architecture
9. Navigation Structure
10. Sitemap
11. User Flow — Murid
12. User Flow — Guru
13. User Flow — Admin
14. Course Architecture
15. Lesson Architecture
16. Quiz & Exam Architecture
17. Live Class Architecture
18. Certificate Architecture
19. Notification Architecture
20. Payment Verification Flow
21. Tahsin Module
22. Tahfidz Module
23. Database Design (Overview & Prinsip)
24. ERD (Entity Relationship Description)
25. Supabase Schema (Tabel & Kolom)
26. Enum Design
27. Storage Bucket Design
28. Recommended Indexes
29. Audit Fields
30. Row Level Security (RLS) Strategy
31. MVP Scope
32. Phase 2 Roadmap
33. Phase 3 Roadmap

---

## 1. Product Vision

Sakeenah Academy adalah platform pembelajaran Islam berbasis web yang menjadi rumah digital bagi lembaga pendidikan Islam untuk menyelenggarakan kelas gratis (ala HSI), kelas berbayar, kelas online live, Tahsin, dan Tahfidz dalam satu ekosistem yang terpadu, sederhana, dan mudah diakses oleh santri dari berbagai usia dan latar belakang teknis.

Visi jangka panjang: menjadi Learning Management System (LMS) rujukan bagi lembaga-lembaga dakwah dan pendidikan Islam di Indonesia yang ingin mendigitalisasi proses belajar-mengajar tanpa kompleksitas teknis yang tinggi, dengan pengalaman yang setara antara guru non-teknis, santri lintas usia, dan pengelola lembaga.

**Prinsip inti produk:**
- Mobile First — mayoritas santri mengakses dari smartphone.
- Simple UX — antarmuka minim gesekan, minim langkah.
- Minimal Learning Curve — guru non-teknis dan santri lansia/anak-anak harus bisa menggunakannya tanpa pelatihan panjang.
- Cepat diluncurkan sebagai MVP — fokus pada nilai inti, hindari fitur yang menunda peluncuran.

---

## 2. Product Goals

### Goals Bisnis
- G1. Menyediakan satu platform terpadu untuk mengelola kelas gratis, kelas berbayar, kelas live, Tahsin, dan Tahfidz — menggantikan kombinasi WhatsApp Group + Google Form + Excel yang umum dipakai lembaga saat ini.
- G2. Memungkinkan lembaga memonetisasi kelas premium (Bahasa Arab, Kajian Kitab, Program Intensif) dengan alur pembayaran manual yang dapat diverifikasi admin.
- G3. Meningkatkan kredibilitas lembaga melalui sertifikat digital terverifikasi (QR Code).
- G4. Memberikan visibilitas progres belajar (Tahsin & Tahfidz) yang selama ini sulit dilacak secara manual.

### Goals Produk
- G5. Waktu murid untuk menemukan dan mulai belajar suatu materi ≤ 3 tap dari halaman utama.
- G6. Guru non-teknis dapat membuat kelas dan mengunggah materi tanpa bantuan admin/developer.
- G7. Admin dapat memverifikasi satu pembayaran dalam < 1 menit (lihat bukti, approve/reject).
- G8. Sistem notifikasi mengurangi ketergantungan pada pengingat manual via WhatsApp.

### Goals Teknis
- G9. Arsitektur berbasis Supabase RLS agar keamanan data berjalan di level database, bukan hanya di aplikasi.
- G10. Struktur data yang dapat berkembang ke Phase 2/3 (gamifikasi, payment gateway, multi-tenant) tanpa migrasi besar-besaran.

---

## 3. User Roles

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Murid** | Peserta didik/santri, pengguna akhir platform | Belanja/enroll kelas, belajar, quiz/ujian, live class, presensi, sertifikat, progress Tahsin/Tahfidz, pembayaran |
| **Guru** | Pengajar/asatidz yang mengelola kelas dan menilai murid | Kelola kelas & materi miliknya, kelola quiz, presensi live class & Tahsin, penilaian Tahsin, input setoran Tahfidz |
| **Admin** | Pengelola lembaga/operator platform | Kelola seluruh pengguna, kelola seluruh kelas, verifikasi pembayaran, kelola sertifikat, statistik & laporan lembaga |

**Catatan desain peran:**
- Satu akun memiliki tepat satu `role` utama pada MVP (tidak ada multi-role, tidak ada hak akses gabungan antar-role).
- **Role terpisah tegas**: Admin **tidak** otomatis memiliki hak kelola kelas (membuat/mengelola materi, quiz, presensi, penilaian) seperti Guru. Hak administratif Admin (lihat semua kelas, publish/unpublish, hapus, verifikasi pembayaran, dst.) bersifat administratif-lintas-kelas, bukan kepemilikan pengajaran (`teacher_id`). Jika satu orang merangkap sebagai admin sekaligus pengajar, ia memerlukan **dua akun terpisah** (satu akun admin, satu akun guru) — bukan satu akun dengan privilese gabungan.
- Role ditetapkan oleh Admin saat registrasi guru/admin disetujui; murid dapat mendaftar mandiri (self-service).

---

## 4. User Personas

### Persona 1 — Murid: "Ustadzah Fatimah, 34 tahun, Ibu Rumah Tangga"
- Mengikuti kelas Aqidah gratis dan kelas Bahasa Arab berbayar.
- Mengakses platform dari HP di sela mengurus rumah tangga, koneksi internet tidak selalu stabil.
- Tidak terbiasa dengan aplikasi kompleks; butuh alur yang linear dan jelas.
- Kebutuhan: pengingat jadwal kelas live, progress belajar yang terlihat jelas, sertifikat sebagai bukti telah menyelesaikan kelas.

### Persona 2 — Murid: "Ahmad, 12 tahun, Santri Tahfidz"
- Mengikuti program Tahfidz dan Tahsin di bawah bimbingan orang tua.
- Perlu antarmuka sederhana untuk melihat target hafalan dan progress setoran.
- Orang tua turut memantau, sehingga tampilan progress harus mudah dipahami non-santri juga.

### Persona 3 — Guru: "Ustadz Yusuf, 45 tahun, Pengajar Kajian Kitab"
- Tidak terlalu melek teknologi, terbiasa mengajar dengan mengandalkan WhatsApp dan PDF.
- Perlu proses upload materi dan pembuatan quiz yang sangat sederhana (drag file, isi form singkat).
- Mengelola presensi Tahsin/live class secara rutin setiap pekan.

### Persona 4 — Admin: "Bu Aisyah, 29 tahun, Operator Lembaga"
- Bertanggung jawab memverifikasi puluhan bukti transfer per pekan.
- Butuh dashboard ringkas: siapa yang perlu diverifikasi, statistik pendaftaran, laporan kelas aktif.
- Mengelola akun guru baru dan memastikan data murid rapi.

---

## 5. User Stories

### Murid
- Sebagai murid, saya ingin mendaftar akun dengan email agar dapat mengakses kelas.
- Sebagai murid, saya ingin melihat daftar kelas gratis dan berbayar agar dapat memilih kelas yang sesuai.
- Sebagai murid, saya ingin mengikuti kelas gratis langsung tanpa proses pembayaran.
- Sebagai murid, saya ingin mengunggah bukti transfer setelah memilih kelas berbayar agar akses kelas saya diproses.
- Sebagai murid, saya ingin menonton video materi, membaca ringkasan, dan mengunduh PDF dalam satu halaman materi.
- Sebagai murid, saya ingin mengerjakan quiz setelah menyelesaikan materi agar pemahaman saya terukur.
- Sebagai murid, saya ingin mengikuti ujian akhir dan mengetahui status kelulusan saya secara otomatis.
- Sebagai murid, saya ingin melihat jadwal kelas live dan mendapat link Zoom/Google Meet tepat waktu.
- Sebagai murid, saya ingin menonton rekaman kelas jika saya tidak bisa hadir live.
- Sebagai murid, saya ingin melihat jadwal, presensi, dan penilaian Tahsin saya.
- Sebagai murid, saya ingin melihat target hafalan dan progres setoran Tahfidz saya.
- Sebagai murid, saya ingin mengunduh sertifikat setelah lulus kelas.
- Sebagai murid, saya ingin menerima notifikasi pengingat sebelum kelas/ujian dimulai.

### Guru
- Sebagai guru, saya ingin membuat kelas baru dan menentukan apakah gratis atau berbayar.
- Sebagai guru, saya ingin menambahkan materi berupa video YouTube, PDF, dan ringkasan dengan mudah.
- Sebagai guru, saya ingin membuat quiz dengan beberapa pertanyaan pilihan ganda dan menentukan passing grade.
- Sebagai guru, saya ingin menjadwalkan kelas live dan memasukkan link Zoom/Google Meet.
- Sebagai guru, saya ingin mencatat presensi murid pada kelas live maupun Tahsin.
- Sebagai guru, saya ingin memberikan penilaian Tahsin (makhraj, tajwid, kelancaran) per pertemuan.
- Sebagai guru, saya ingin mencatat setoran hafalan murid Tahfidz beserta status dan catatan.
- Sebagai guru, saya ingin melihat progres hafalan tiap murid binaan saya.
- Sebagai guru, saya ingin mempublikasikan atau menyimpan kelas sebagai draft.

### Admin
- Sebagai admin, saya ingin melihat daftar seluruh pengguna dan mengelola statusnya.
- Sebagai admin, saya ingin menyetujui akun guru baru sebelum mereka dapat mengelola kelas.
- Sebagai admin, saya ingin melihat daftar bukti pembayaran yang menunggu verifikasi.
- Sebagai admin, saya ingin menyetujui atau menolak pembayaran beserta alasan penolakan.
- Sebagai admin, saya ingin akses kelas murid otomatis aktif setelah pembayaran disetujui.
- Sebagai admin, saya ingin mengelola template sertifikat dan memverifikasi sertifikat yang terbit.
- Sebagai admin, saya ingin melihat statistik jumlah murid, kelas aktif, dan pendapatan.
- Sebagai admin, saya ingin mengelola kategori dan seluruh kelas di platform, bukan hanya milik satu guru.

---

## 6. Functional Requirements

### FR-1 Authentication & Profil
- FR-1.1 Registrasi murid mandiri (email + password + **nomor HP wajib**, format tervalidasi ke E.164/`628xxxxxxxxxx`) via Supabase Auth.
- FR-1.2 Registrasi guru dilakukan melalui pengajuan yang disetujui Admin (status `pending` → `active`), nomor HP wajib sama seperti murid.
- FR-1.3 Login, logout, lupa password (reset via email).
- FR-1.4 Manajemen profil: nama lengkap, foto, no. HP (wajib terisi, dapat diperbarui), tanggal lahir, alamat.

### FR-2 Course Management
- FR-2.1 Guru dapat membuat, mengedit, menghapus (soft delete) kelas miliknya sendiri; Admin dapat melakukan hal yang sama untuk kelas manapun sebagai fungsi administratif (bukan sebagai pemilik/`teacher_id`).
- FR-2.2 Kelas memiliki kategori topik (Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif) — independen dari `program_type` (lihat FR-2.6).
- FR-2.3 Kelas memiliki tipe akses: Gratis atau Berbayar (dengan harga) — independen dari kategori (kombinasi kategori × tipe akses bebas ditentukan guru).
- FR-2.4 Kelas memiliki status: Draft atau Published.
- FR-2.5 Admin dapat mengelola seluruh kelas lintas guru secara administratif; guru hanya mengelola kelas miliknya sendiri.
- FR-2.6 Kelas memiliki `program_type`: Reguler, Tahsin, atau Tahfidz — menentukan modul tambahan yang aktif (lihat §21, §22). Tahsin/Tahfidz **bukan** kategori topik, murni tipe program.

### FR-3 Lesson Management
- FR-3.1 Materi dapat berisi kombinasi: video YouTube embed, file PDF, ringkasan teks, dan quiz.
- FR-3.2 Materi memiliki urutan tampil (order) dalam suatu kelas.
- FR-3.3 Materi dapat berstatus draft/published.

### FR-4 Quiz & Ujian
- FR-4.1 Quiz dapat dilekatkan ke materi tertentu (quiz per materi) atau ke kelas (ujian akhir).
- FR-4.2 Pertanyaan bertipe pilihan tunggal/pilihan ganda/benar-salah.
- FR-4.3 Sistem menghitung nilai otomatis berdasarkan passing grade yang ditentukan guru.
- FR-4.4 Status kelulusan (Lulus/Tidak Lulus) ditentukan otomatis setelah submit.
- FR-4.5 Batas maksimal percobaan (max attempts) dapat dikonfigurasi per quiz.
- FR-4.6 Guru dapat memberikan kesempatan percobaan tambahan ("Beri Kesempatan Tambahan") kepada murid tertentu yang telah menghabiskan max attempts, tanpa perlu intervensi admin/developer.

### FR-5 Live Class
- FR-5.1 Guru/Admin menjadwalkan sesi live dengan tanggal, waktu, platform (Zoom/Google Meet), dan link.
- FR-5.2 Murid melihat jadwal live class pada dashboard dan menerima notifikasi pengingat.
- FR-5.3 Presensi dicatat oleh guru atau melalui tombol "Hadir" oleh murid dalam rentang waktu sesi berlangsung.
- FR-5.4 Rekaman kelas dapat diunggah/ditautkan setelah sesi selesai.

### FR-6 Sertifikat
- FR-6.1 Sertifikat digenerate otomatis setelah murid memenuhi syarat kelulusan kelas.
- FR-6.2 Setiap sertifikat memiliki nomor unik dan kode QR verifikasi publik.
- FR-6.3 Murid dapat mengunduh sertifikat dalam format PDF.
- FR-6.4 Pihak ketiga dapat memverifikasi keaslian sertifikat melalui halaman publik via QR/nomor.

### FR-7 Notifikasi
- FR-7.1 Sistem mengirim notifikasi in-app untuk seluruh tipe pada §19 (materi baru, jadwal kelas, pengingat kelas, pengingat quiz, pengingat ujian, sertifikat tersedia, reminder pembayaran, status verifikasi pembayaran, persetujuan akun guru).
- FR-7.2 Khusus tipe **Reminder Pembayaran**, sistem juga mengirim pesan WhatsApp (via provider pihak ketiga) ke nomor HP murid, selain notifikasi in-app — karena murid yang belum menyelesaikan pembayaran cenderung jarang membuka aplikasi.
- FR-7.3 Murid dapat melihat daftar notifikasi in-app dan menandainya sudah dibaca.

### FR-8 Pembayaran
- FR-8.1 Murid memilih metode pembayaran (Transfer Bank Manual atau QRIS Statis) saat enroll kelas berbayar.
- FR-8.2 Murid mengunggah bukti transfer (gambar/PDF).
- FR-8.3 Admin melihat antrian verifikasi dan melakukan approve/reject dengan catatan.
- FR-8.4 Akses kelas otomatis aktif (enrollment status → `active`) setelah pembayaran disetujui.
- FR-8.5 Murid menerima notifikasi hasil verifikasi.

### FR-9 Tahsin
- FR-9.1 Guru menjadwalkan sesi Tahsin (rutin mingguan atau tanggal spesifik).
- FR-9.2 Guru mencatat presensi per sesi.
- FR-9.3 Guru memberikan penilaian per sesi (makhraj, tajwid, kelancaran, catatan).
- FR-9.4 Murid melihat riwayat presensi dan penilaian.

### FR-10 Tahfidz
- FR-10.1 Guru/Admin menetapkan target hafalan (surah, ayat) per murid.
- FR-10.2 Guru mencatat setoran hafalan (surah, ayat, tanggal, status, nilai, catatan).
- FR-10.3 Sistem menghitung dan menampilkan progres hafalan murid (dibanding target).

### FR-11 Dashboard & Statistik
- FR-11.1 Dashboard Murid: Kelas Saya, Jadwal, Progress Belajar, Quiz & Ujian, Sertifikat, Pembayaran.
- FR-11.2 Dashboard Guru: Kelola Kelas, Kelola Materi, Kelola Quiz, Presensi, Penilaian, Progress Tahfidz.
- FR-11.3 Dashboard Admin: Kelola Pengguna, Kelola Kelas, Kelola Pembayaran, Kelola Sertifikat, Statistik & Laporan.

---

## 7. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Usability** | Mobile-first, maksimal 3 tap ke konten inti, bahasa Indonesia sederhana, ukuran font & tombol ramah untuk pengguna lansia/anak-anak |
| **Performance** | First Contentful Paint < 2.5s pada koneksi 4G, pagination/lazy-load pada daftar kelas & materi |
| **Availability** | Target uptime 99.5% (bergantung pada SLA Supabase & Vercel) |
| **Security** | Password hashing via Supabase Auth, RLS aktif di semua tabel sensitif, upload file divalidasi tipe & ukuran, signed URL untuk bukti pembayaran & sertifikat privat |
| **Scalability** | Skema database dirancang agar dapat menambah tenant/kolom baru tanpa breaking change pada Phase 2/3 |
| **Accessibility** | Kontras warna memadai, ukuran tap target ≥ 44px, label form yang jelas |
| **Data Privacy** | Data pribadi murid (nama, no. HP, alamat) hanya dapat diakses oleh pemilik data, guru terkait, dan admin |
| **Auditability** | Seluruh entitas penting memiliki audit trail (created_at, updated_at, created_by) |
| **Third-Party Dependency** | Integrasi WhatsApp (Reminder Pembayaran) bergantung pada uptime provider pihak ketiga (mis. Fonnte) — kegagalan pengiriman WhatsApp tidak boleh memblokir alur pembayaran/enrollment inti; notifikasi in-app tetap menjadi sumber kebenaran utama |
| **Browser Support** | Chrome, Safari, Edge versi 2 tahun terakhir; utamakan mobile browser (Chrome Android, Safari iOS) |
| **Localization** | Bahasa Indonesia sebagai default; struktur konten mendukung istilah Arab (nama surah, dsb.) |

---

## 8. Information Architecture

```
Sakeenah Academy
├── Publik (Guest)
│   ├── Beranda
│   ├── Katalog Kelas (Gratis & Berbayar)
│   ├── Detail Kelas
│   ├── Tentang Lembaga
│   ├── Verifikasi Sertifikat
│   └── Login / Registrasi
│
├── Area Murid (Authenticated)
│   ├── Dashboard
│   ├── Kelas Saya (Self-paced, Live, Tahsin, Tahfidz)
│   ├── Detail Kelas & Materi
│   ├── Quiz & Ujian
│   ├── Jadwal (Live Class + Tahsin)
│   ├── Progress Belajar (umum, Tahsin, Tahfidz)
│   ├── Sertifikat Saya
│   ├── Pembayaran Saya
│   ├── Notifikasi
│   └── Profil
│
├── Area Guru (Authenticated)
│   ├── Dashboard
│   ├── Kelola Kelas (milik sendiri)
│   ├── Kelola Materi
│   ├── Kelola Quiz/Ujian
│   ├── Jadwal Live Class & Tahsin
│   ├── Presensi
│   ├── Penilaian (Tahsin)
│   ├── Setoran & Progress Tahfidz
│   ├── Notifikasi
│   └── Profil
│
└── Area Admin (Authenticated)
    ├── Dashboard & Statistik
    ├── Kelola Pengguna (Murid/Guru/Admin)
    ├── Kelola Kelas (seluruh)
    ├── Kelola Kategori
    ├── Kelola Pembayaran (verifikasi)
    ├── Kelola Sertifikat & Template
    ├── Kelola Notifikasi (broadcast)
    ├── Laporan
    └── Pengaturan Lembaga (rekening, QRIS)
```

---

## 9. Navigation Structure

**Bottom Navigation (Mobile — Murid):** Beranda, Kelas Saya, Jadwal, Notifikasi, Profil

**Bottom Navigation (Mobile — Guru):** Beranda, Kelas, Presensi, Notifikasi, Profil

**Sidebar (Desktop — semua role):** Menu vertikal sesuai dashboard masing-masing role, dengan header berisi logo, notifikasi, dan avatar profil.

**Top Bar (Publik):** Logo, Katalog Kelas, Tentang, Login/Daftar (CTA menonjol).

**Prinsip navigasi:**
- Maksimal 5 item utama pada bottom nav agar tidak padat di layar kecil.
- Role menentukan set menu yang tampil — tidak ada menu yang perlu disembunyikan/dinonaktifkan secara manual (role-based rendering).
- Breadcrumb sederhana pada halaman dalam (mis. Kelas Saya > Bahasa Arab Dasar > Materi 3).

---

## 10. Sitemap

```
/                                   Beranda publik
/kelas                              Katalog kelas
/kelas/[slug]                       Detail kelas (publik, CTA daftar/beli)
/verifikasi-sertifikat              Cek keaslian sertifikat (publik)
/verifikasi-sertifikat/[nomor]      Hasil verifikasi

/login
/register
/lupa-password
/reset-password

/dashboard                          Redirect sesuai role

/murid/dashboard
/murid/kelas-saya
/murid/kelas-saya/[courseId]
/murid/kelas-saya/[courseId]/materi/[lessonId]
/murid/kelas-saya/[courseId]/quiz/[quizId]
/murid/kelas-saya/[courseId]/ujian
/murid/jadwal
/murid/tahsin
/murid/tahfidz
/murid/sertifikat
/murid/pembayaran
/murid/pembayaran/[paymentId]/upload-bukti
/murid/notifikasi
/murid/profil

/guru/dashboard
/guru/kelas
/guru/kelas/baru
/guru/kelas/[courseId]/edit
/guru/kelas/[courseId]/materi
/guru/kelas/[courseId]/materi/[lessonId]/edit
/guru/kelas/[courseId]/quiz/[quizId]/edit
/guru/kelas/[courseId]/live-class
/guru/presensi
/guru/tahsin
/guru/tahsin/[scheduleId]/penilaian
/guru/tahfidz
/guru/tahfidz/[studentId]/setoran
/guru/notifikasi
/guru/profil

/admin/dashboard
/admin/pengguna
/admin/pengguna/[userId]
/admin/kelas
/admin/kategori
/admin/pembayaran
/admin/pembayaran/[paymentId]
/admin/sertifikat
/admin/sertifikat/template
/admin/laporan
/admin/pengaturan
```

---

## 11. User Flow — Murid

**11.1 Onboarding & Enroll Kelas Gratis**
1. Buka Beranda → pilih "Katalog Kelas" → filter kategori gratis.
2. Pilih kelas → halaman detail kelas menampilkan silabus & guru.
3. Klik "Ikuti Kelas Gratis" → jika belum login, diarahkan ke Login/Registrasi → kembali otomatis ke halaman kelas.
4. Enrollment status langsung `active` → murid masuk ke halaman materi pertama.

**11.2 Enroll Kelas Berbayar**
1. Pilih kelas berbayar → klik "Daftar Kelas Ini".
2. Sistem membuat record `payment` berstatus `pending` (`attempt_number = 1`) dan `enrollment` berstatus `pending_payment`.
3. Murid memilih metode pembayaran (Transfer Bank/QRIS) → sistem menampilkan detail rekening/QRIS.
4. Murid mengunggah bukti transfer → status payment menjadi `menunggu_verifikasi`.
5. Murid menerima notifikasi "Pembayaran sedang diverifikasi".
6. Admin approve → enrollment `active`, notifikasi "Akses kelas aktif" terkirim, sertifikat template ter-assign.
   Admin reject → notifikasi alasan penolakan → murid mengunggah ulang bukti, sistem membuat **record `payment` baru** (percobaan ke-2, dst.) sementara record yang ditolak tetap tersimpan sebagai riwayat.
7. Jika murid belum juga menyelesaikan pembayaran setelah beberapa hari, sistem mengirim **pengingat via WhatsApp** ke nomor HP terdaftar, selain notifikasi in-app.

**11.3 Belajar & Quiz**
1. Masuk ke Kelas Saya → pilih kelas → daftar materi berurutan.
2. Buka materi → tonton video/baca ringkasan/unduh PDF → tandai selesai (otomatis saat quiz materi disubmit atau manual "Tandai Selesai" jika tanpa quiz).
3. Jika materi memiliki quiz → kerjakan → submit → nilai & status tampil instan.
4. Setelah seluruh materi selesai dan syarat lulus tercapai → ujian akhir (jika ada) → lulus → sertifikat digenerate otomatis.

**11.4 Live Class**
1. Notifikasi H-1 dan H-1 jam sebelum sesi.
2. Buka Jadwal → klik "Gabung" → membuka link Zoom/Google Meet di tab baru.
3. Presensi tercatat otomatis saat klik "Gabung" dalam rentang waktu sesi, atau dicatat manual guru.
4. Jika tidak hadir → rekaman tersedia di halaman sesi setelah guru mengunggah link rekaman.

**11.5 Tahsin**
1. Buka menu Tahsin → lihat jadwal pertemuan berikutnya.
2. Setelah sesi berlangsung, murid dapat melihat status presensi dan penilaian (makhraj/tajwid/kelancaran) begitu guru menginput.

**11.6 Tahfidz**
1. Buka menu Tahfidz → lihat target hafalan aktif (surah & ayat).
2. Lihat riwayat setoran & status (lancar/perlu perbaikan/mengulang) yang diinput guru.
3. Lihat progres keseluruhan (persentase target tercapai).

**11.7 Sertifikat**
1. Buka menu Sertifikat → daftar sertifikat yang dimiliki.
2. Unduh PDF atau bagikan link verifikasi publik (berisi QR).

---

## 12. User Flow — Guru

**12.1 Membuat Kelas**
1. Dashboard Guru → "Kelola Kelas" → "Buat Kelas Baru".
2. Isi judul, kategori, deskripsi, thumbnail, tipe (gratis/berbayar + harga jika berbayar), program type (reguler/Tahsin/Tahfidz).
3. Simpan sebagai Draft atau langsung Publish.

**12.2 Mengelola Materi**
1. Buka kelas → tab "Materi" → "Tambah Materi".
2. Isi judul, tempel link YouTube, unggah PDF (opsional), tulis ringkasan (opsional).
3. Tambahkan quiz pada materi (opsional) → isi pertanyaan & jawaban benar.
4. Atur urutan materi (drag/urutkan) → publish materi.

**12.3 Live Class**
1. Buka kelas → tab "Live Class" → "Jadwalkan Sesi".
2. Isi tanggal, waktu, platform, link meeting.
3. Setelah sesi selesai → unggah/tautkan link rekaman → tandai sesi "Selesai".
4. Buka tab "Presensi" sesi tersebut → tandai hadir/tidak hadir/izin per murid.

**12.4 Tahsin**
1. Buka menu Tahsin → jadwalkan sesi rutin/khusus.
2. Setelah sesi → input presensi.
3. Input penilaian per murid (skor makhraj, tajwid, kelancaran + catatan).

**12.5 Tahfidz**
1. Buka menu Tahfidz → pilih murid binaan → tetapkan/perbarui target hafalan.
2. Setelah setoran murid → input catatan setoran (surah, ayat, status, nilai, catatan).
3. Sistem otomatis memperbarui progres murid terhadap target.

**12.6 Penilaian & Ujian**
1. Buka kelas → tab "Quiz/Ujian" → buat/edit soal, tentukan passing grade, max attempt.
2. Lihat rekap nilai seluruh murid pada kelas tersebut.
3. Untuk murid yang telah menghabiskan max attempts namun belum lulus, guru dapat klik "Beri Kesempatan Tambahan" pada baris murid tersebut untuk memberikan satu percobaan ekstra tanpa perlu bantuan admin/developer.

---

## 13. User Flow — Admin

**13.1 Persetujuan Guru Baru**
1. Guru mendaftar → status akun `pending`.
2. Admin buka "Kelola Pengguna" → tab "Menunggu Persetujuan" → review data → Approve/Reject.
3. Approve → akun aktif, notifikasi email/in-app terkirim ke calon guru.

**13.2 Verifikasi Pembayaran**
1. Admin buka "Kelola Pembayaran" → daftar diurutkan berdasarkan yang menunggu verifikasi terlama.
2. Klik satu entri → lihat bukti transfer, nominal, kelas yang dipilih, data murid.
3. Approve → enrollment aktif otomatis, notifikasi terkirim.
   Reject → wajib isi alasan → notifikasi terkirim ke murid.

**13.3 Kelola Kelas Lintas Guru**
1. Admin dapat melihat, mengedit, mem-publish/unpublish, atau menghapus (soft delete) kelas dari guru manapun.
2. Admin mengelola master data Kategori Kelas.

**13.4 Sertifikat**
1. Admin mengelola template sertifikat (desain, kop lembaga, elemen dinamis: nama, nomor, tanggal, QR).
2. Admin dapat melihat seluruh sertifikat yang terbit dan melakukan revoke bila diperlukan (kondisi khusus, mis. kecurangan).

**13.5 Statistik & Laporan**
1. Dashboard menampilkan: total murid aktif, kelas aktif per kategori, pendapatan bulanan (kelas berbayar), tingkat kelulusan, jumlah sertifikat terbit, antrian verifikasi pembayaran.
2. Admin dapat mengekspor laporan (mis. daftar pembayaran periode tertentu) — lihat Phase 2 untuk ekspor lanjutan.

---

## 14. Course Architecture

Sebuah **Kelas (Course)** adalah unit pembelajaran tertinggi. Setiap kelas memiliki:

- **Identitas**: judul, slug, deskripsi, thumbnail, guru pengampu.
- **Klasifikasi topik**: kategori (Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif) — 7 kategori, murni untuk keperluan katalog/filter.
- **Tipe akses**: Gratis / Berbayar (dengan harga bila berbayar) — sumbu independen dari kategori topik; guru bebas mengombinasikan kategori apa pun dengan tipe akses apa pun.
- **Program type**: `reguler` (materi + quiz standar, opsional live session), `tahsin` (jadwal + presensi + penilaian), `tahfidz` (target + setoran + progress). Program type menentukan modul tambahan mana yang aktif pada kelas tersebut — kelas `reguler` tetap dapat memiliki sesi live class.
- **Status siklus hidup**: Draft → Published → (Archived).
- **Struktur konten**: kumpulan Materi (Lesson) yang tersusun berurutan, opsional dikelompokkan dalam Modul (Section) untuk kelas dengan banyak materi.
- **Kelulusan**: syarat lulus kelas dapat berupa "seluruh materi selesai" dan/atau "ujian akhir dengan nilai ≥ passing grade" — dikonfigurasi per kelas.

**Catatan desain — kategori vs program type**: Tahsin dan Tahfidz **bukan** kategori topik, melainkan nilai `program_type`. Ini sengaja dipisah dari kategori topik agar tidak ada dua kolom database yang saling tumpang tindih mendefinisikan hal yang sama (mis. kelas berkategori "Tahsin" tapi tanpa modul jadwal/presensi aktif). Kategori menjawab "kelas ini tentang apa" (untuk katalog), sedangkan `program_type` menjawab "struktur/modul apa yang aktif di kelas ini" (untuk UI & fungsi sistem) — keduanya independen dan tidak saling menggantikan.

Relasi kepemilikan: satu kelas dimiliki oleh satu Guru (`teacher_id`). Admin memiliki hak kelola penuh atas seluruh kelas sebagai fungsi **administratif** (lihat semua, edit, publish/unpublish, hapus) — bukan sebagai kepemilikan pengajaran; kelas tidak pernah tercatat memiliki Admin sebagai `teacher_id`.

---

## 15. Lesson Architecture

Sebuah **Materi (Lesson)** adalah unit konten di dalam kelas, dengan struktur fleksibel:

| Komponen | Sifat | Keterangan |
|---|---|---|
| Video YouTube Embed | Opsional | Disimpan sebagai URL/ID video YouTube, dirender via iframe embed |
| PDF Materi | Opsional | File diunggah ke Storage bucket materi, diakses murid yang ter-enroll |
| Ringkasan Materi | Opsional | Rich text/markdown singkat sebagai pelengkap/pengganti video |
| Quiz | Opsional | Terhubung sebagai satu quiz per materi (relasi 1:0..1) |

Sebuah materi dianggap valid untuk dipublish jika minimal memiliki satu dari keempat komponen di atas. Materi memiliki `order_index` untuk menentukan urutan tampil dan status `draft`/`published`. Progres murid terhadap suatu materi dicatat terpisah pada `lesson_progress` (status: belum mulai/sedang berjalan/selesai), yang menjadi basis perhitungan Progress Belajar pada dashboard murid.

---

## 16. Quiz & Exam Architecture

Sistem quiz mendukung dua konteks penggunaan dengan struktur data yang sama:

- **Quiz per Materi**: terhubung ke satu `lesson_id`, biasanya singkat (3-10 soal), berfungsi sebagai cek pemahaman.
- **Ujian Akhir**: terhubung ke `course_id` (bukan materi spesifik), menjadi syarat kelulusan kelas.

**Struktur:**
- Quiz memiliki: judul, tipe (`quiz`/`ujian_akhir`), passing grade (persentase), batas waktu pengerjaan (opsional), jumlah percobaan maksimal.
- Setiap Quiz memiliki banyak Pertanyaan (`quiz_questions`), masing-masing bertipe pilihan tunggal, pilihan ganda, atau benar/salah, dengan bobot poin.
- Setiap Pertanyaan memiliki beberapa Opsi Jawaban (`quiz_options`) dengan penanda opsi benar.
- Saat murid mengerjakan, sistem membuat `quiz_attempt` (percobaan) berisi jawaban per pertanyaan (`quiz_attempt_answers`).
- Penilaian otomatis: skor dihitung dari total poin jawaban benar / total poin maksimal × 100, dibandingkan dengan passing grade untuk menentukan status Lulus/Tidak Lulus.
- Jika `max_attempts` tercapai dan murid belum lulus, sistem menampilkan status terkunci pada sisi murid.
- **Reset attempt oleh guru**: guru dapat memberikan kesempatan tambahan langsung dari dashboard-nya (§12.6) tanpa perlu bantuan admin/developer. Setiap pemberian kesempatan dicatat pada tabel `quiz_attempt_grants` (§25.25) — jumlah percobaan yang diizinkan bagi seorang murid untuk suatu quiz dihitung sebagai `quiz.max_attempts + SUM(quiz_attempt_grants.extra_attempts)` milik murid tersebut.

---

## 17. Live Class Architecture

Live Class dimodelkan sebagai **sesi (`live_sessions`)** yang menempel pada sebuah kelas, sehingga satu kelas dapat memiliki banyak sesi live sepanjang periode berjalan (mis. kelas mingguan selama 8 pekan).

**Atribut kunci:**
- Platform: Zoom atau Google Meet (enum, menentukan ikon & label saja — tidak ada integrasi API pada MVP, link dimasukkan manual oleh guru).
- Waktu: tanggal, jam mulai, estimasi durasi.
- Status sesi: `terjadwal` → `berlangsung` → `selesai` (atau `dibatalkan`).
- Link rekaman: diisi guru setelah sesi selesai (link YouTube unlisted/Google Drive, disimpan sebagai URL — bukan hosting video internal).

**Presensi:**
- Presensi (`live_session_attendance`) dicatat per murid per sesi dengan status: hadir / tidak hadir / izin.
- Mode pencatatan: (a) murid menekan tombol "Hadir" yang aktif hanya dalam rentang waktu sesi berlangsung ± toleransi, atau (b) guru menandai manual dari daftar peserta kelas.
- Data presensi menjadi salah satu input laporan Admin dan dapat menjadi syarat kelulusan (Phase 2).

---

## 18. Certificate Architecture

**Pemicu penerbitan**: otomatis saat `enrollment.status` berubah menjadi `completed` (syarat lulus terpenuhi sesuai konfigurasi kelas §14).

**Struktur:**
- `certificate_templates`: desain dasar (tata letak, kop lembaga, warna) yang dapat dikaitkan ke kategori kelas tertentu atau digunakan sebagai default.
- `certificates`: record per penerbitan — nomor sertifikat unik (format terstruktur, mis. `SA/2026/07/000123`), `student_id`, `course_id`, `enrollment_id`, tanggal terbit, `qr_token` unik, referensi template, dan URL file PDF hasil generate.
- **Nomor unik**: dijamin unik melalui constraint database + sequence/format berbasis tahun-bulan-running number.
- **QR Verification**: QR code mengarah ke halaman publik `/verifikasi-sertifikat/[nomor-atau-token]` yang menampilkan status valid, nama murid, kelas, dan tanggal kelulusan tanpa memerlukan login — memungkinkan pihak ketiga (mis. calon pemberi kerja/lembaga lain) memverifikasi keaslian.
- **PDF Generation**: dilakukan sisi server (Next.js API route/Edge Function) menggabungkan data murid ke template, hasil disimpan ke Storage bucket `certificates` dan URL-nya dicatat di record sertifikat.
- **Revoke**: Admin dapat menandai sertifikat sebagai `revoked` (bukan hapus) — halaman verifikasi publik akan menampilkan status ini bila terjadi.

---

## 19. Notification Architecture

Notifikasi bersifat **in-app (wajib, untuk seluruh tipe)**. Satu tipe — **Reminder Pembayaran** — juga dikirim via **WhatsApp** karena sifatnya paling time-sensitive dan menyasar murid yang cenderung tidak aktif membuka aplikasi (itulah sebabnya pembayarannya tertunda). Delapan tipe lainnya cukup in-app.

**Tipe notifikasi, pemicu, dan channel:**

| Tipe | Pemicu | Penerima | Channel |
|---|---|---|---|
| Materi Baru | Guru mempublish materi baru pada kelas yang diikuti | Murid ter-enroll | In-app |
| Jadwal Kelas | Sesi live/Tahsin baru dijadwalkan | Murid ter-enroll | In-app |
| Pengingat Kelas | H-1 hari & H-1 jam sebelum sesi live/Tahsin | Murid ter-enroll | In-app |
| Pengingat Quiz | Materi dengan quiz belum dikerjakan setelah X hari (Phase 2: konfigurasi) | Murid terkait | In-app |
| Pengingat Ujian | Ujian akhir tersedia tapi belum dikerjakan | Murid terkait | In-app |
| Sertifikat Tersedia | Sertifikat baru diterbitkan | Murid terkait | In-app |
| **Reminder Pembayaran** | Payment berstatus pending > X hari (belum upload bukti/belum diselesaikan) | Murid terkait | **In-app + WhatsApp** |
| Status Verifikasi Pembayaran | Admin approve/reject pembayaran | Murid terkait | In-app |
| Persetujuan Akun Guru | Admin approve/reject registrasi guru | Guru terkait | In-app |

**Model data**: satu tabel `notifications` generik (`user_id`, `type`, `title`, `body`, `link_url`, `is_read`, `created_at`) dibaca real-time melalui Supabase Realtime subscription pada dashboard, dengan badge counter notifikasi belum dibaca. Ini tetap menjadi sumber kebenaran (source of truth) untuk semua tipe, termasuk Reminder Pembayaran.

**Delivery pengingat terjadwal** (H-1 hari/jam, reminder pembayaran) dijalankan melalui scheduled job (Supabase Cron/Edge Function terjadwal) yang memindai kondisi dan menulis baris `notifications` baru.

### 19.1 Integrasi WhatsApp — Reminder Pembayaran

- **Cakupan**: hanya tipe **Reminder Pembayaran**. Tidak ada tipe notifikasi lain yang dikirim via WhatsApp pada MVP.
- **Provider**: pihak ketiga lokal (mis. Fonnte) — dipilih ketimbang WhatsApp Cloud API resmi Meta karena setup jauh lebih cepat (hitungan jam, tanpa proses approval template Meta yang bisa memakan waktu berhari-hari) dan lebih sesuai prinsip "cepat diluncurkan sebagai MVP". Migrasi ke API resmi dipertimbangkan di Phase 2 jika volume/SLA membutuhkan.
- **Prasyarat**: nomor HP murid **wajib** diisi saat registrasi (§6 FR-1.1), divalidasi ke format E.164 (`628xxxxxxxxxx`) — tanpa ini pesan tidak dapat dikirim.
- **Trigger**: scheduled job yang sama dengan pengingat terjadwal lainnya memindai `payments` berstatus belum final selama > X hari, memanggil API provider WhatsApp untuk mengirim pesan ke `profiles.phone`, dan mencatat baris `notifications` (type=`reminder_pembayaran`) sebagai log terlepas dari hasil pengiriman WhatsApp.
- **Kegagalan terisolasi**: jika pengiriman WhatsApp gagal (API down, nomor invalid), notifikasi in-app tetap tercatat dan alur pembayaran/enrollment tidak terpengaruh — WhatsApp murni saluran tambahan, bukan dependency kritikal alur inti (lihat NFR §7 "Third-Party Dependency").

---

## 20. Payment Verification Flow

**Aktor**: Murid, Admin. **Metode**: Transfer Bank Manual, QRIS Statis (kedua metode ditampilkan sebagai instruksi statis milik lembaga, dikelola Admin di Pengaturan).

**Alur end-to-end:**

1. **Pilih Kelas** — Murid memilih kelas berbayar → sistem membuat `enrollment` (`pending_payment`) dan `payment` (`pending`) dengan nominal sesuai harga kelas saat itu (harga di-snapshot ke record payment agar tidak berubah jika harga kelas kemudian diedit).
2. **Instruksi Pembayaran** — Sistem menampilkan detail rekening bank aktif atau gambar QRIS statis milik lembaga.
3. **Upload Bukti** — Murid mengunggah foto/PDF bukti transfer ke Storage bucket privat `payment-proofs`; `payment.status` → `menunggu_verifikasi`; `payment.submitted_at` tercatat.
4. **Notifikasi ke Admin** — (opsional Phase 1.1) Admin melihat item baru pada antrian "Kelola Pembayaran" tanpa perlu notifikasi eksplisit pada MVP awal, cukup badge counter di dashboard admin.
5. **Review Admin** — Admin membuka detail: bukti transfer, nominal seharusnya, data murid & kelas.
6. **Keputusan**:
   - **Approve** → `payment.status = approved`, `reviewed_by`, `reviewed_at` tercatat → trigger otomatis mengubah `enrollment.status = active`, `enrollment.enrolled_at = now()` → notifikasi "Pembayaran disetujui, akses kelas aktif" ke murid.
   - **Reject** → `payment.status = rejected`, wajib isi `rejection_reason` → `enrollment.status` tetap `pending_payment` → notifikasi ke murid berisi alasan → murid mengunggah ulang bukti, sistem membuat **row `payments` baru** (`attempt_number` bertambah) yang menunjuk ke `enrollment_id` yang sama; row yang ditolak tetap tersimpan utuh sebagai riwayat, tidak ditimpa.
7. **Akses Kelas** — RLS pada tabel materi/quiz memvalidasi keberadaan `enrollment` aktif sebelum mengizinkan akses konten kelas berbayar (lihat §30). Enrollment dianggap aktif begitu **salah satu** dari kemungkinan banyak `payments` miliknya berstatus `approved`.
8. **Reminder Pembayaran** — jika payment masih menunggu (belum diupload/belum direview) lebih dari X hari, sistem mengirim pengingat in-app + WhatsApp ke murid (lihat §19.1).

**Prinsip desain**: status pembayaran dan status enrollment dipisah secara eksplisit agar riwayat transaksi tetap auditable meski satu murid mengulang pembayaran beberapa kali (setiap percobaan = row baru, bukan overwrite), dan agar Phase 2 (payment gateway otomatis) dapat menggantikan mekanisme verifikasi manual tanpa mengubah model `enrollment`. Relasi `enrollments` ↔ `payments` bersifat **1—N**, bukan 1—1 (lihat §24, §25.23).

---

## 21. Tahsin Module

Modul Tahsin ditujukan untuk kelas dengan `program_type = tahsin`, berfokus pada pembelajaran tatap muka/live yang terjadwal rutin dengan penilaian bacaan.

**Komponen:**
- **Jadwal Kelas (`tahsin_schedules`)**: guru menentukan pola pertemuan (mis. tiap Selasa & Kamis, atau tanggal spesifik), waktu, dan platform/lokasi (dapat memanfaatkan struktur `live_sessions` yang sama dengan Live Class, atau sesi tatap muka tanpa link).
- **Presensi (`tahsin_attendance`)**: dicatat guru per murid per pertemuan dengan status hadir/tidak hadir/izin/sakit.
- **Penilaian Guru (`tahsin_assessments`)**: per pertemuan atau per periode, guru menginput skor kualitatif untuk tiga aspek utama bacaan Al-Qur'an:
  - Makhraj (ketepatan pengucapan huruf)
  - Tajwid (kaidah bacaan)
  - Kelancaran
  - Ditambah catatan bebas guru dan nilai/predikat keseluruhan.
- **Riwayat Murid**: murid melihat rekap presensi dan tren penilaian dari waktu ke waktu pada dashboard-nya, membantu memantau perkembangan bacaan.

**Relasi**: Tahsin memanfaatkan struktur `enrollment` yang sama seperti kelas lain (murid harus ter-enroll ke kelas Tahsin untuk muncul di jadwal & presensi guru).

---

## 22. Tahfidz Module

Modul Tahfidz ditujukan untuk kelas dengan `program_type = tahfidz`, berfokus pada pelacakan target dan capaian hafalan Al-Qur'an per murid.

**Komponen:**
- **Target Hafalan (`tahfidz_targets`)**: guru/admin menetapkan target berupa surah dan rentang ayat, beserta target tanggal penyelesaian, dengan status (belum mulai/proses/selesai).
- **Setoran Hafalan (`tahfidz_setoran`)**: dicatat guru setiap kali murid menyetorkan hafalan — surah, rentang ayat, tanggal setoran, status hasil (lancar/perlu perbaikan/mengulang), nilai, dan catatan guru.
- **Progress Hafalan**: dihitung agregat dari data setoran terhadap target aktif — ditampilkan sebagai persentase capaian, jumlah ayat/surah yang telah dikuasai, dan riwayat setoran terbaru. Pada MVP, agregasi ini dihitung on-the-fly (query/view), bukan tabel tersendiri, untuk menghindari duplikasi data yang perlu disinkronkan.

**Relasi**: sama seperti Tahsin, murid harus ter-enroll ke kelas bertipe Tahfidz agar guru dapat mengelola target dan setoran mereka. Satu murid dapat memiliki lebih dari satu target aktif (mis. hafalan baru + murojaah), sehingga `tahfidz_targets` bersifat one-to-many terhadap murid dalam satu kelas.

---

## 23. Database Design (Overview & Prinsip)

**Prinsip desain:**
1. **Single source of truth**: `auth.users` (Supabase Auth) sebagai identitas login; tabel `profiles` menyimpan data domain (nama, role, kontak) dengan `id` yang sama persis dengan `auth.users.id` (relasi 1:1).
2. **Role-driven access**: kolom `role` pada `profiles` menjadi basis utama RLS di seluruh sistem.
3. **Enrollment sebagai gerbang akses**: hampir seluruh akses murid terhadap konten kelas (materi, quiz, live session, Tahsin, Tahfidz) divalidasi melalui keberadaan baris `enrollments` berstatus `active`, bukan pengecekan pembayaran langsung — payment hanya mengubah status enrollment.
4. **Soft delete**: entitas inti (courses, lessons, profiles) menggunakan `deleted_at` alih-alih hard delete, untuk menjaga integritas riwayat (nilai, sertifikat, presensi) yang mereferensikannya.
5. **Snapshot harga**: `payments.amount` disalin dari `courses.price` saat transaksi dibuat, tidak mengacu langsung ke harga kelas terkini.
6. **Extensibility by design**: `program_type` pada `courses` memungkinkan penambahan tipe program baru (Phase 2/3) tanpa mengubah struktur tabel inti.
7. **Normalisasi terukur**: struktur dinormalisasi hingga 3NF untuk data transaksional (payments, attempts, attendance), namun konten deskriptif (ringkasan materi, catatan guru) disimpan sebagai teks/JSON untuk fleksibilitas tanpa over-normalisasi.

---

## 24. ERD (Entity Relationship Description)

Berikut deskripsi relasi antar entitas utama (notasi: `1—N` satu ke banyak, `1—1` satu ke satu, `N—N` banyak ke banyak).

**Identitas & Peran**
- `profiles` 1—1 `auth.users`
- `profiles` (role=guru) 1—N `courses` (sebagai teacher_id)

**Struktur Kelas**
- `course_categories` 1—N `courses`
- `courses` 1—N `course_modules` (opsional pengelompokan)
- `course_modules` 1—N `lessons` ; `courses` 1—N `lessons` langsung (bila tanpa modul)
- `lessons` 1—0..1 `quizzes` (quiz per materi)
- `courses` 1—0..N `quizzes` (ujian akhir, `lesson_id` null)
- `quizzes` 1—N `quiz_questions` 1—N `quiz_options`

**Enrollment & Progress**
- `profiles` (murid) N—N `courses` melalui `enrollments`
- `enrollments` 1—N `lesson_progress` (per materi)
- `enrollments` 1—N `quiz_attempts` (melalui `profiles`+`quizzes`, direferensikan `student_id`+`quiz_id`)
- `quiz_attempts` 1—N `quiz_attempt_answers`
- `quizzes` 1—N `quiz_attempt_grants` N—1 `profiles` (murid penerima), N—1 `profiles` (guru pemberi)

**Live Class**
- `courses` 1—N `live_sessions`
- `live_sessions` 1—N `live_session_attendance` N—1 `profiles` (murid)

**Tahsin**
- `courses` (program_type=tahsin) 1—N `tahsin_schedules`
- `tahsin_schedules` 1—N `tahsin_attendance` N—1 `profiles`
- `tahsin_schedules` 1—N `tahsin_assessments` N—1 `profiles`

**Tahfidz**
- `courses` (program_type=tahfidz) 1—N `tahfidz_targets` N—1 `profiles`
- `courses` 1—N `tahfidz_setoran` N—1 `profiles`, N—1 `profiles` (guru penilai)

**Sertifikat**
- `enrollments` 1—0..1 `certificates`
- `certificate_templates` 1—N `certificates`

**Pembayaran**
- `enrollments` 1—N `payments` (satu enrollment dapat memiliki banyak percobaan pembayaran; enrollment aktif begitu salah satu payment `approved`)
- `profiles` (admin) 1—N `payments` (sebagai reviewer)
- `payment_channels` — master data, tidak berelasi langsung ke transaksi (referensi tampilan saja)

**Notifikasi**
- `profiles` 1—N `notifications`

---

## 25. Supabase Schema (Tabel & Kolom)

> Disajikan sebagai struktur tabel (bukan DDL) untuk menjadi acuan implementasi. Seluruh tabel menggunakan `id UUID` sebagai primary key (`default gen_random_uuid()`) kecuali dinyatakan lain, dan menyertakan Audit Fields standar (lihat §29) yang tidak diulang di setiap tabel demi keringkasan.

### 25.1 `profiles`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK, FK → auth.users.id) | Sama dengan Supabase Auth user id |
| full_name | text | Nama lengkap |
| role | enum `user_role` | murid / guru / admin — role tunggal, tidak ada hak gabungan antar-role |
| phone | text **NOT NULL** | Nomor HP, wajib diisi saat registrasi, format E.164 (`628xxxxxxxxxx`) — jadi tujuan pengiriman WhatsApp Reminder Pembayaran |
| avatar_url | text | URL foto profil (Storage) |
| gender | enum `gender_type` | laki_laki / perempuan |
| date_of_birth | date | Tanggal lahir |
| address | text | Alamat |
| account_status | enum `account_status` | pending / active / suspended (guru butuh approval) |
| bio | text | Deskripsi singkat (khusus guru, ditampilkan di halaman kelas) |

### 25.2 `course_categories`
Berisi 7 kategori topik konten (Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif). Tahsin & Tahfidz **tidak** ada di sini — keduanya adalah nilai `courses.program_type`, bukan kategori (lihat §14).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif |
| slug | text unique | |
| description | text | |
| icon | text | Nama ikon untuk UI |

### 25.3 `courses`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| slug | text unique | |
| description | text | |
| cover_image_url | text | |
| category_id | uuid (FK → course_categories) | |
| teacher_id | uuid (FK → profiles) | |
| program_type | enum `program_type` | reguler / tahsin / tahfidz |
| access_type | enum `course_access_type` | gratis / berbayar |
| price | numeric | 0 jika gratis |
| status | enum `course_status` | draft / published / archived |
| passing_grade | integer | Nilai minimal lulus ujian akhir (nullable) |
| completion_rule | enum `completion_rule` | seluruh_materi / ujian_akhir / keduanya |
| level | enum `course_level` | pemula / menengah / lanjutan |

### 25.4 `course_modules`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| title | text | |
| order_index | integer | |

### 25.5 `lessons`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| module_id | uuid (FK → course_modules, nullable) | |
| title | text | |
| youtube_url | text (nullable) | |
| pdf_url | text (nullable) | |
| summary_content | text (nullable) | Rich text/markdown |
| order_index | integer | |
| status | enum `content_status` | draft / published |
| estimated_duration_minutes | integer | |

### 25.6 `quizzes`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| lesson_id | uuid (FK → lessons, nullable) | null = ujian akhir |
| title | text | |
| quiz_type | enum `quiz_type` | quiz_materi / ujian_akhir |
| passing_grade | integer | Persentase |
| time_limit_minutes | integer (nullable) | |
| max_attempts | integer | Default 1 untuk ujian akhir |
| status | enum `content_status` | draft / published |

### 25.7 `quiz_questions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| quiz_id | uuid (FK → quizzes) | |
| question_text | text | |
| question_type | enum `question_type` | pilihan_tunggal / pilihan_ganda / benar_salah |
| points | integer | |
| order_index | integer | |

### 25.8 `quiz_options`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| question_id | uuid (FK → quiz_questions) | |
| option_text | text | |
| is_correct | boolean | |
| order_index | integer | |

### 25.9 `enrollments`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| student_id | uuid (FK → profiles) | |
| course_id | uuid (FK → courses) | |
| status | enum `enrollment_status` | pending_payment / active / completed / rejected / expired |
| enrolled_at | timestamptz (nullable) | Diisi saat status active |
| completed_at | timestamptz (nullable) | |
| progress_percentage | integer | Cache hasil kalkulasi lesson_progress |
| Unique constraint | (student_id, course_id) | Mencegah duplikasi enroll |

### 25.10 `lesson_progress`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| enrollment_id | uuid (FK → enrollments) | |
| lesson_id | uuid (FK → lessons) | |
| status | enum `progress_status` | belum_mulai / berjalan / selesai |
| completed_at | timestamptz (nullable) | |
| Unique constraint | (enrollment_id, lesson_id) | |

### 25.11 `quiz_attempts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| quiz_id | uuid (FK → quizzes) | |
| student_id | uuid (FK → profiles) | |
| attempt_number | integer | |
| score | numeric (nullable) | |
| status | enum `attempt_status` | berjalan / lulus / tidak_lulus |
| started_at | timestamptz | |
| submitted_at | timestamptz (nullable) | |

### 25.12 `quiz_attempt_answers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| attempt_id | uuid (FK → quiz_attempts) | |
| question_id | uuid (FK → quiz_questions) | |
| selected_option_id | uuid (FK → quiz_options, nullable) | |
| is_correct | boolean | |

### 25.13 `live_sessions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| title | text | |
| platform | enum `meeting_platform` | zoom / google_meet |
| meeting_link | text | |
| scheduled_at | timestamptz | |
| duration_minutes | integer | |
| recording_url | text (nullable) | |
| status | enum `session_status` | terjadwal / berlangsung / selesai / dibatalkan |

### 25.14 `live_session_attendance`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| session_id | uuid (FK → live_sessions) | |
| student_id | uuid (FK → profiles) | |
| status | enum `attendance_status` | hadir / tidak_hadir / izin / sakit |
| checked_in_at | timestamptz (nullable) | |
| Unique constraint | (session_id, student_id) | |

### 25.15 `tahsin_schedules`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| teacher_id | uuid (FK → profiles) | |
| session_date | date | |
| start_time | time | |
| end_time | time | |
| location_or_link | text | |
| status | enum `session_status` | terjadwal / berlangsung / selesai / dibatalkan |

### 25.16 `tahsin_attendance`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| schedule_id | uuid (FK → tahsin_schedules) | |
| student_id | uuid (FK → profiles) | |
| status | enum `attendance_status` | hadir / tidak_hadir / izin / sakit |
| Unique constraint | (schedule_id, student_id) | |

### 25.17 `tahsin_assessments`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| schedule_id | uuid (FK → tahsin_schedules) | |
| student_id | uuid (FK → profiles) | |
| teacher_id | uuid (FK → profiles) | |
| makhraj_score | integer | Skala 1-100 |
| tajwid_score | integer | Skala 1-100 |
| kelancaran_score | integer | Skala 1-100 |
| overall_grade | text | Predikat (mis. A/B/C atau label kualitatif) |
| notes | text | |

### 25.18 `tahfidz_targets`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| student_id | uuid (FK → profiles) | |
| assigned_by | uuid (FK → profiles) | |
| surah | text | |
| ayat_start | integer | |
| ayat_end | integer | |
| target_date | date (nullable) | |
| status | enum `target_status` | belum_mulai / proses / selesai |

### 25.19 `tahfidz_setoran`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| course_id | uuid (FK → courses) | |
| student_id | uuid (FK → profiles) | |
| teacher_id | uuid (FK → profiles) | |
| target_id | uuid (FK → tahfidz_targets, nullable) | |
| surah | text | |
| ayat_start | integer | |
| ayat_end | integer | |
| setoran_date | date | |
| status | enum `setoran_status` | lancar / perlu_perbaikan / mengulang |
| score | integer (nullable) | |
| notes | text | |

### 25.20 `certificate_templates`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| name | text | |
| category_id | uuid (FK → course_categories, nullable) | null = default umum |
| design_config | jsonb | Konfigurasi elemen tata letak |
| is_active | boolean | |

### 25.21 `certificates`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| certificate_number | text unique | Format terstruktur, mis. SA/2026/07/000123 |
| enrollment_id | uuid (FK → enrollments) unique | |
| student_id | uuid (FK → profiles) | |
| course_id | uuid (FK → courses) | |
| template_id | uuid (FK → certificate_templates) | |
| issued_at | timestamptz | |
| qr_token | text unique | Token acak untuk URL verifikasi |
| pdf_url | text | |
| status | enum `certificate_status` | aktif / revoked |

### 25.22 `payment_channels`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| type | enum `payment_channel_type` | transfer_bank / qris |
| bank_name | text (nullable) | |
| account_number | text (nullable) | |
| account_holder | text (nullable) | |
| qris_image_url | text (nullable) | |
| is_active | boolean | |

### 25.23 `payments`
Relasi ke `enrollments` bersifat **1—N**: satu enrollment dapat memiliki banyak row payment (satu per percobaan). Percobaan yang ditolak tetap tersimpan utuh sebagai riwayat, tidak pernah ditimpa/di-update menjadi percobaan baru.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| enrollment_id | uuid (FK → enrollments) | Tanpa unique constraint — mendukung banyak percobaan |
| student_id | uuid (FK → profiles) | |
| course_id | uuid (FK → courses) | |
| attempt_number | integer | Urutan percobaan ke berapa untuk enrollment ini (1, 2, 3, ...) |
| amount | numeric | Snapshot harga saat transaksi |
| channel_id | uuid (FK → payment_channels) | |
| proof_image_url | text (nullable) | Diisi saat murid upload |
| status | enum `payment_status` | pending / menunggu_verifikasi / approved / rejected |
| submitted_at | timestamptz (nullable) | |
| reviewed_by | uuid (FK → profiles, nullable) | Admin |
| reviewed_at | timestamptz (nullable) | |
| rejection_reason | text (nullable) | |

### 25.24 `notifications`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| type | enum `notification_type` | Lihat §19 |
| title | text | |
| body | text | |
| link_url | text (nullable) | |
| is_read | boolean | default false |
| sent_at | timestamptz | |
| channel | enum `notification_channel` | in_app / whatsapp — default `in_app`; baris kedua dengan channel=`whatsapp` ditulis khusus untuk tipe `reminder_pembayaran` yang berhasil terkirim via provider |

### 25.25 `quiz_attempt_grants`
Mencatat pemberian kesempatan percobaan tambahan oleh guru kepada murid tertentu setelah `max_attempts` habis (§16, FR-4.6). Total percobaan yang diizinkan = `quiz.max_attempts + SUM(extra_attempts)` milik murid tersebut pada quiz ini.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (PK) | |
| quiz_id | uuid (FK → quizzes) | |
| student_id | uuid (FK → profiles) | Murid penerima |
| granted_by | uuid (FK → profiles) | Guru pemberi (harus `teacher_id` pemilik course terkait, atau Admin) |
| extra_attempts | integer | Default 1 |
| reason | text (nullable) | Catatan opsional guru |

---

## 26. Enum Design

| Enum | Nilai |
|---|---|
| `user_role` | murid, guru, admin |
| `account_status` | pending, active, suspended |
| `gender_type` | laki_laki, perempuan |
| `program_type` | reguler, tahsin, tahfidz |
| `course_access_type` | gratis, berbayar |
| `course_status` | draft, published, archived |
| `course_level` | pemula, menengah, lanjutan |
| `completion_rule` | seluruh_materi, ujian_akhir, keduanya |
| `content_status` | draft, published |
| `quiz_type` | quiz_materi, ujian_akhir |
| `question_type` | pilihan_tunggal, pilihan_ganda, benar_salah |
| `attempt_status` | berjalan, lulus, tidak_lulus |
| `enrollment_status` | pending_payment, active, completed, rejected, expired |
| `progress_status` | belum_mulai, berjalan, selesai |
| `meeting_platform` | zoom, google_meet |
| `session_status` | terjadwal, berlangsung, selesai, dibatalkan |
| `attendance_status` | hadir, tidak_hadir, izin, sakit |
| `target_status` | belum_mulai, proses, selesai |
| `setoran_status` | lancar, perlu_perbaikan, mengulang |
| `certificate_status` | aktif, revoked |
| `payment_channel_type` | transfer_bank, qris |
| `payment_status` | pending, menunggu_verifikasi, approved, rejected |
| `notification_type` | materi_baru, jadwal_kelas, reminder_kelas, reminder_quiz, reminder_ujian, sertifikat_tersedia, reminder_pembayaran, payment_approved, payment_rejected, guru_disetujui, guru_ditolak |
| `notification_channel` | in_app, whatsapp |

---

## 27. Storage Bucket Design

| Bucket | Visibilitas | Isi | Aturan Akses |
|---|---|---|---|
| `avatars` | Public read | Foto profil pengguna | Write: pemilik akun saja |
| `course-covers` | Public read | Thumbnail kelas | Write: guru pemilik kelas / admin |
| `lesson-materials` | Private (signed URL) | File PDF materi | Read: murid dengan enrollment aktif pada kelas terkait, guru pemilik, admin |
| `payment-proofs` | Private (signed URL) | Bukti transfer | Read: pemilik pembayaran, admin. Write: pemilik pembayaran (create only) |
| `certificates` | Public read (link tersamarkan via token) | PDF sertifikat hasil generate | Write: hanya melalui server-side function (service role) |
| `certificate-templates` | Private | Aset desain template | Read/write: admin saja |
| `qris-assets` | Public read | Gambar QRIS statis lembaga | Write: admin saja |

**Prinsip**: bucket berisi data finansial/pribadi (`payment-proofs`) selalu privat dan diakses via signed URL berumur pendek; aset yang memang untuk ditampilkan publik (avatar, cover kelas, sertifikat terbit) dapat memakai public bucket agar rendering lebih ringan.

---

## 28. Recommended Indexes

| Tabel | Index | Alasan |
|---|---|---|
| `enrollments` | unique (student_id, course_id) | Cegah duplikasi enroll, lookup cepat status akses |
| `enrollments` | (course_id, status) | Rekap peserta aktif per kelas |
| `courses` | (status, category_id) | Query katalog publik per kategori |
| `courses` | (teacher_id) | Dashboard "Kelola Kelas" guru |
| `lessons` | (course_id, order_index) | Render urutan materi |
| `lesson_progress` | unique (enrollment_id, lesson_id) | Cegah duplikasi progres, hitung persentase cepat |
| `quiz_attempts` | (student_id, quiz_id) | Cek jumlah percobaan & riwayat |
| `payments` | (status) | Antrian verifikasi admin |
| `payments` | (student_id) | Riwayat pembayaran murid |
| `payments` | (enrollment_id, attempt_number) | Lookup percobaan terbaru per enrollment (relasi 1—N) |
| `quiz_attempt_grants` | (quiz_id, student_id) | Hitung total extra_attempts murid pada suatu quiz |
| `notifications` | (user_id, is_read) | Badge & daftar notifikasi belum dibaca |
| `certificates` | unique (certificate_number) | Lookup verifikasi publik |
| `certificates` | unique (qr_token) | Lookup verifikasi via QR |
| `live_session_attendance` | unique (session_id, student_id) | Cegah duplikasi presensi |
| `tahsin_attendance` | unique (schedule_id, student_id) | Cegah duplikasi presensi |
| `tahfidz_setoran` | (student_id, course_id, setoran_date) | Riwayat & progres per murid |

---

## 29. Audit Fields

Diterapkan secara konsisten pada seluruh tabel transaksional/inti (courses, lessons, quizzes, enrollments, payments, certificates, tahsin_*, tahfidz_*, live_sessions, profiles):

| Kolom | Tipe | Keterangan |
|---|---|---|
| `created_at` | timestamptz | default now(), diisi otomatis saat insert |
| `updated_at` | timestamptz | diperbarui otomatis melalui trigger setiap update |
| `created_by` | uuid (FK → profiles, nullable) | Pengguna yang membuat record (null bila sistem) |
| `updated_by` | uuid (FK → profiles, nullable) | Pengguna yang terakhir mengubah record |
| `deleted_at` | timestamptz (nullable) | Soft delete — record tidak ditampilkan di query normal namun tetap ada untuk integritas riwayat |

Tabel log murni (mis. `quiz_attempt_answers`, `lesson_progress`, `notifications`) cukup menggunakan `created_at`/`updated_at` tanpa soft delete, karena sifatnya append-only atau siklus hidupnya pendek.

---

## 30. Row Level Security (RLS) Strategy

**Prinsip umum**: RLS diaktifkan pada seluruh tabel yang menyimpan data milik pengguna. Kebijakan dibangun di atas dua fungsi bantu konseptual: `current_role()` (membaca `role` dari `profiles` berdasar `auth.uid()`) dan `is_enrolled(course_id)` (mengecek keberadaan `enrollments` aktif milik `auth.uid()`).

| Tabel | Select | Insert | Update | Delete |
|---|---|---|---|---|
| `profiles` | Diri sendiri; Admin semua; Guru dapat melihat murid pada kelas yang sama (join enrollments) | Sistem (via trigger saat signup) | Diri sendiri (field terbatas); Admin semua | Admin (soft delete) |
| `courses` | Published: publik. Draft: pemilik (guru) & admin | Guru (role=guru, teacher_id=diri sendiri), Admin | Pemilik guru & Admin | Pemilik guru & Admin (soft delete) |
| `lessons` / `course_modules` | Published & course terkait dapat diakses (publik untuk gratis; murid ter-enroll untuk berbayar); pemilik guru & admin selalu | Guru pemilik course & Admin | Guru pemilik course & Admin | Guru pemilik course & Admin |
| `quizzes`, `quiz_questions`, `quiz_options` | Murid ter-enroll (opsi jawaban benar disembunyikan dari murid via view/kolom terpisah bila perlu); guru pemilik & admin penuh | Guru pemilik course & Admin | Guru pemilik course & Admin | Guru pemilik course & Admin |
| `enrollments` | Diri sendiri (murid); guru untuk course miliknya; Admin semua | Murid untuk diri sendiri (create enrollment) | Sistem/Admin (perubahan status); murid tidak dapat mengubah status sendiri | Admin |
| `lesson_progress` | Diri sendiri (murid); guru course terkait; Admin | Diri sendiri (murid, melalui aksi belajar) | Diri sendiri; sistem | — |
| `quiz_attempts` / `quiz_attempt_answers` | Diri sendiri (murid); guru course terkait; Admin | Diri sendiri (murid), tunduk pada batas `max_attempts + extra_attempts` dari `quiz_attempt_grants` | Diri sendiri selama `berjalan`; sistem mengunci setelah submit | — |
| `quiz_attempt_grants` | Diri sendiri (murid, read only); guru course terkait; Admin | Guru pemilik course terkait & Admin | — | Guru pemberi & Admin |
| `live_sessions`, `tahsin_schedules` | Murid ter-enroll pada course terkait; guru pemilik; Admin | Guru pemilik course & Admin | Guru pemilik course & Admin | Guru pemilik course & Admin |
| `live_session_attendance`, `tahsin_attendance` | Diri sendiri (murid); guru course terkait; Admin | Guru course terkait (& murid untuk self check-in "Hadir" pada live session); Admin | Guru course terkait; Admin | Guru course terkait; Admin |
| `tahsin_assessments` | Diri sendiri (murid, read only); guru penilai & course terkait; Admin | Guru course terkait & Admin | Guru pembuat & Admin | Admin |
| `tahfidz_targets`, `tahfidz_setoran` | Diri sendiri (murid, read only); guru course terkait; Admin | Guru course terkait & Admin | Guru pembuat & Admin | Admin |
| `certificates`, `certificate_templates` | Sertifikat: diri sendiri, publik terbatas (via fungsi verifikasi khusus, bukan select langsung), Admin. Template: Admin only | Sistem (service role) untuk certificates; Admin untuk templates | Admin (revoke) | Admin |
| `payments`, `payment_channels` | Diri sendiri (murid); Admin semua. Channels: publik (untuk instruksi pembayaran) | Murid untuk diri sendiri (create payment baru per percobaan, termasuk saat resubmit setelah reject); Admin untuk channels | Murid (upload bukti) sebelum status final; Admin (approve/reject) | Admin |
| `notifications` | Diri sendiri saja | Sistem (service role) | Diri sendiri (mark as read) | Diri sendiri |

**Catatan implementasi kritikal:**
- Akses ke jawaban benar (`quiz_options.is_correct`) sebaiknya tidak diserahkan ke RLS row-level saja, melainkan disaring di level API/view agar murid tidak bisa membaca kunci jawaban melalui client langsung meski row policy mengizinkan select pertanyaan.
- Verifikasi sertifikat publik (§18) sebaiknya melalui Postgres Function `SECURITY DEFINER` yang mengembalikan subset data terbatas (nama, kelas, tanggal, status), bukan membuka akses select langsung ke tabel `certificates` untuk anon.
- Perubahan `enrollments.status` menjadi `active` akibat approve payment sebaiknya terjadi melalui trigger/Function di sisi database (dipicu oleh update `payments.status`), bukan ditulis langsung oleh client, untuk mencegah murid memanipulasi status aksesnya sendiri.

---

## 31. MVP Scope

**Termasuk dalam MVP:**
- Authentication lengkap (registrasi murid dengan nomor HP wajib, approval guru, login, lupa password, profil).
- Course Management: 7 kategori topik tetap (Aqidah, Fiqih, Adab, Kajian Islam, Bahasa Arab, Kajian Kitab, Program Intensif — independen dari tipe akses), tipe gratis/berbayar, draft/publish, `program_type` reguler/tahsin/tahfidz (independen dari kategori).
- Lesson Management: video YouTube, PDF, ringkasan, urutan materi.
- Quiz & Ujian: pilihan tunggal/ganda/benar-salah, nilai otomatis, passing grade, max attempts, guru dapat memberi kesempatan tambahan.
- Live Class: jadwal, link Zoom/Google Meet manual, presensi, rekaman (link).
- Tahsin: jadwal, presensi, penilaian 3 aspek.
- Tahfidz: target hafalan, setoran, progress agregat.
- Sertifikat otomatis dengan nomor unik & QR verification publik.
- Notifikasi in-app untuk seluruh 9 tipe pada §19; khusus **Reminder Pembayaran** juga dikirim via **WhatsApp** (provider pihak ketiga, mis. Fonnte).
- Pembayaran manual: transfer bank & QRIS statis, upload bukti, verifikasi admin, resubmit membuat percobaan baru (riwayat utuh).
- Tiga dashboard role (Murid, Guru, Admin) sesuai §11-13 — role Admin dan Guru terpisah tegas, tanpa hak gabungan.
- Statistik dasar admin (jumlah murid, kelas aktif, pendapatan, antrian verifikasi).

**Eksplisit di luar MVP** (sesuai batasan yang ditetapkan): AI Tutor, Gamifikasi, Marketplace, Multi-Tenant, Aplikasi Mobile Native, Payment Gateway otomatis, Internal Video Hosting.

---

## 32. Phase 2 Roadmap

- **Payment Gateway Otomatis** — integrasi Midtrans/Xendit untuk mempercepat verifikasi, mengurangi beban admin.
- **Ekspor Laporan** — ekspor Excel/PDF untuk laporan pembayaran, kehadiran, dan nilai.
- **Perluasan Notifikasi WhatsApp** — MVP hanya mencakup Reminder Pembayaran via provider pihak ketiga; Phase 2 dapat memperluas ke tipe lain (pengingat kelas/quiz/ujian) dan/atau migrasi ke WhatsApp Cloud API resmi Meta jika volume & kebutuhan SLA meningkat.
- **Kuis Lanjutan** — tipe soal esai/isian singkat dengan penilaian manual guru, bank soal.
- **Manajemen Jadwal Berulang** — pola pertemuan rutin otomatis (recurring schedule generator) untuk Tahsin/Live Class, mengurangi input manual berulang.
- **Rating & Review Kelas** — murid memberi ulasan pasca kelas selesai, guna kredibilitas kelas.
- **Approval Workflow Bertingkat** — verifikasi pembayaran dengan lebih dari satu admin/level otorisasi untuk lembaga besar.
- **Progress Tahfidz Visual** — visualisasi peta 30 juz per murid.
- **Sertifikat Multi-Template Dinamis** — editor visual template sertifikat oleh admin (drag-and-drop elemen).

---

## 33. Phase 3 Roadmap

- **Multi-Tenant** — satu instance platform melayani banyak lembaga dengan branding & data terisolasi (arsitektur `organization_id` di seluruh tabel).
- **Mobile App Native** — aplikasi iOS/Android dengan push notification native, mode offline untuk materi PDF/ringkasan.
- **Internal Video Hosting** — migrasi dari YouTube embed ke hosting video terkelola (mis. Mux/Cloudflare Stream) untuk konten premium tertutup.
- **Gamifikasi** — poin, badge, leaderboard untuk mendorong konsistensi belajar (khususnya Tahsin/Tahfidz).
- **AI Tutor / AI Assistant** — bantuan tanya-jawab materi berbasis AI, rekomendasi kelas personalisasi.
- **Marketplace Multi-Guru** — guru independen dapat mendaftar dan menjual kelas sendiri dengan skema bagi hasil, memerlukan model pembayaran & payout baru.
- **Analitik Lanjutan** — dashboard prediktif (risiko murid drop-out, rekomendasi intervensi guru) berbasis data progress historis.
- **Integrasi Live Class API Native** — otomasi penuh Zoom/Google Meet (auto-generate link, auto-sync presensi via API, bukan input manual).

---

*Dokumen ini merupakan acuan utama untuk desain database, UI/UX, dan pengembangan aplikasi Sakeenah Academy menggunakan Next.js dan Supabase. Perubahan signifikan pada scope MVP harus dikonsultasikan ulang dengan tim produk sebelum implementasi.*
