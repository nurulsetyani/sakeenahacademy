import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: ReactNode };

function icon(d: string): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home: "M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9",
  book: "M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15.5a.5.5 0 0 1-.5.5H7a2 2 0 0 1-2-2v-13Zm0 13a2 2 0 0 1 2-2h11",
  calendar: "M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V8",
  clipboard: "M9 4.5h6a1 1 0 0 1 1 1V6h1.5A1.5 1.5 0 0 1 19 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H8v-.5a1 1 0 0 1 1-1Zm-.5 9.5 2 2 4-4.5",
  award: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3 1-1.5 6L12 19l4.5 3L15 16",
  wallet: "M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9Zm12 5h2.5v2H16a1 1 0 0 1 0-2Z",
  bell: "M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Zm4.5 9a1.8 1.8 0 0 0 3 0",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c1-4 4-6 7-6s6 2 7 6",
  check: "m5 12 4.5 4.5L19 7",
  star: "m12 4 2.3 4.9 5.2.7-3.8 3.7.9 5.3L12 16l-4.6 2.6.9-5.3-3.8-3.7 5.2-.7Z",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 20c.6-3.3 3-5.5 6.5-5.5s5.9 2.2 6.5 5.5M15 14.8c2.8.4 4.6 2.3 5.1 5.2",
  layers: "m4 8 8-4 8 4-8 4-8-4Zm0 4 8 4 8-4M4 16l8 4 8-4",
  tag: "M12.6 3.4 20 10.8a2 2 0 0 1 0 2.8l-6.4 6.4a2 2 0 0 1-2.8 0L3.4 12.6A2 2 0 0 1 3 11.2V5a2 2 0 0 1 2-2h6.2a2 2 0 0 1 1.4.4ZM8 8.5h.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 1-.15 1.5l2 1.6-2 3.4-2.3-.9a7.5 7.5 0 0 1-1.3.75L15 21h-6l-.35-2.65a7.5 7.5 0 0 1-1.3-.75l-2.3.9-2-3.4 2-1.6A7.4 7.4 0 0 1 5 12c0-.5.05-1 .15-1.5l-2-1.6 2-3.4 2.3.9c.4-.3.85-.55 1.3-.75L9 3h6l.35 2.65c.45.2.9.45 1.3.75l2.3-.9 2 3.4-2 1.6c.1.5.15 1 .15 1.5Z",
  video: "M15 10.5 20 7v10l-5-3.5ZM4 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

export const MURID_BOTTOM_ITEMS: NavItem[] = [
  { href: "/murid/dashboard", label: "Beranda", icon: icon(ICONS.home) },
  { href: "/murid/kelas-saya", label: "Kelas", icon: icon(ICONS.book) },
  { href: "/murid/jadwal", label: "Jadwal", icon: icon(ICONS.calendar) },
  { href: "/murid/notifikasi", label: "Notifikasi", icon: icon(ICONS.bell) },
  { href: "/murid/profil", label: "Profil", icon: icon(ICONS.user) },
];

export const MURID_SIDEBAR_ITEMS: NavItem[] = [
  { href: "/murid/dashboard", label: "Beranda", icon: icon(ICONS.home) },
  { href: "/murid/kelas-saya", label: "Kelas Saya", icon: icon(ICONS.book) },
  { href: "/murid/jadwal", label: "Jadwal", icon: icon(ICONS.calendar) },
  { href: "/murid/tahsin", label: "Tahsin", icon: icon(ICONS.check) },
  { href: "/murid/tahfidz", label: "Tahfidz", icon: icon(ICONS.target) },
  { href: "/murid/sertifikat", label: "Sertifikat", icon: icon(ICONS.award) },
  { href: "/murid/pembayaran", label: "Pembayaran", icon: icon(ICONS.wallet) },
  { href: "/murid/notifikasi", label: "Notifikasi", icon: icon(ICONS.bell) },
  { href: "/murid/profil", label: "Profil", icon: icon(ICONS.user) },
];

export const GURU_BOTTOM_ITEMS: NavItem[] = [
  { href: "/guru/dashboard", label: "Beranda", icon: icon(ICONS.home) },
  { href: "/guru/kelas", label: "Tugas", icon: icon(ICONS.book) },
  { href: "/guru/tahsin", label: "Tahsin", icon: icon(ICONS.check) },
  { href: "/guru/notifikasi", label: "Notifikasi", icon: icon(ICONS.bell) },
  { href: "/guru/profil", label: "Profil", icon: icon(ICONS.user) },
];

export const GURU_SIDEBAR_ITEMS: NavItem[] = [
  { href: "/guru/dashboard", label: "Beranda", icon: icon(ICONS.home) },
  { href: "/guru/kelas", label: "Tugas & Quiz", icon: icon(ICONS.book) },
  { href: "/guru/tahsin", label: "Nilai Tahsin", icon: icon(ICONS.star) },
  { href: "/guru/tahfidz", label: "Tahfidz", icon: icon(ICONS.target) },
  { href: "/guru/notifikasi", label: "Notifikasi", icon: icon(ICONS.bell) },
  { href: "/guru/profil", label: "Profil", icon: icon(ICONS.user) },
];

export const ADMIN_BOTTOM_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: icon(ICONS.chart) },
  { href: "/admin/pengguna", label: "Pengguna", icon: icon(ICONS.users) },
  { href: "/admin/kelas", label: "Kelas", icon: icon(ICONS.layers) },
  { href: "/admin/pembayaran", label: "Bayar", icon: icon(ICONS.wallet) },
  { href: "/admin/sertifikat", label: "Sertifikat", icon: icon(ICONS.award) },
];

export const ADMIN_SIDEBAR_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: icon(ICONS.chart) },
  { href: "/admin/pengguna", label: "Kelola Pengguna", icon: icon(ICONS.users) },
  { href: "/admin/kelas", label: "Kelola Kelas", icon: icon(ICONS.layers) },
  { href: "/admin/kategori", label: "Kelola Kategori", icon: icon(ICONS.tag) },
  { href: "/admin/live-class", label: "Live Class", icon: icon(ICONS.video) },
  { href: "/admin/tahsin", label: "Tahsin", icon: icon(ICONS.check) },
  { href: "/admin/pembayaran", label: "Kelola Pembayaran", icon: icon(ICONS.wallet) },
  { href: "/admin/sertifikat", label: "Kelola Sertifikat", icon: icon(ICONS.award) },
  { href: "/admin/laporan", label: "Laporan", icon: icon(ICONS.clipboard) },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: icon(ICONS.settings) },
];
