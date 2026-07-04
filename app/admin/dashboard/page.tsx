import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: studentCount }, { count: activeCourseCount }, { count: pendingPaymentCount }, { count: pendingTeacherCount }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "murid"),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "menunggu_verifikasi"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "guru")
        .eq("account_status", "pending"),
    ]);

  const stats = [
    { label: "Total Murid", value: studentCount ?? 0, href: "/admin/pengguna", urgent: false },
    { label: "Kelas Aktif", value: activeCourseCount ?? 0, href: "/admin/kelas", urgent: false },
    { label: "Menunggu Verifikasi Pembayaran", value: pendingPaymentCount ?? 0, href: "/admin/pembayaran", urgent: (pendingPaymentCount ?? 0) > 0 },
    { label: "Guru Menunggu Persetujuan", value: pendingTeacherCount ?? 0, href: "/admin/pengguna", urgent: (pendingTeacherCount ?? 0) > 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card-surface block p-6 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised ${
              s.urgent ? "border-gold-300 bg-gold-50" : ""
            }`}
          >
            <p className="text-sm font-medium text-parchment-500">{s.label}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${s.urgent ? "text-gold-700" : "text-brand-900"}`}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="card-surface p-6">
        <h2 className="font-display text-lg font-semibold text-brand-900">Tindakan Cepat</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/pembayaran" className="btn-secondary">Verifikasi Pembayaran</Link>
          <Link href="/admin/pengguna" className="btn-secondary">Kelola Pengguna</Link>
          <Link href="/admin/kelas" className="btn-secondary">Kelola Kelas</Link>
        </div>
      </div>
    </div>
  );
}
