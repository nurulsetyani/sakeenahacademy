import { createClient } from "@/lib/supabase/server";

export default async function AdminLaporanPage() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: activeStudentCount },
    { data: categories },
    { data: publishedCourses },
    { data: enrollments },
    { count: certificateCount },
    { count: pendingPaymentCount },
    { data: approvedPaymentsThisMonth },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "murid").eq("account_status", "active"),
    supabase.from("course_categories").select("id, name"),
    supabase.from("courses").select("category_id").eq("status", "published"),
    supabase.from("enrollments").select("status"),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "menunggu_verifikasi"),
    supabase.from("payments").select("amount").eq("status", "approved").gte("reviewed_at", startOfMonth.toISOString()),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const c of publishedCourses ?? []) {
    const key = c.category_id ?? "__none";
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }
  const categoryRows = [
    ...(categories ?? []).map((cat) => ({ name: cat.name, count: categoryCounts.get(cat.id) ?? 0 })),
    ...(categoryCounts.has("__none") ? [{ name: "Tanpa Kategori", count: categoryCounts.get("__none")! }] : []),
  ].filter((row) => row.count > 0);

  const completedCount = (enrollments ?? []).filter((e) => e.status === "completed").length;
  const activeEnrollmentCount = (enrollments ?? []).filter((e) => e.status === "active").length;
  const graduationPool = completedCount + activeEnrollmentCount;
  const graduationRate = graduationPool > 0 ? Math.round((completedCount / graduationPool) * 100) : 0;

  const monthlyRevenue = (approvedPaymentsThisMonth ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const stats = [
    { label: "Murid Aktif", value: activeStudentCount ?? 0 },
    { label: "Kelas Aktif", value: publishedCourses?.length ?? 0 },
    { label: "Pendapatan Bulan Ini", value: `Rp${monthlyRevenue.toLocaleString("id-ID")}` },
    { label: "Tingkat Kelulusan", value: `${graduationRate}%` },
    { label: "Sertifikat Terbit", value: certificateCount ?? 0 },
    { label: "Antrian Verifikasi", value: pendingPaymentCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Laporan</h1>
      <p className="mt-1 text-sm text-parchment-500">Ringkasan statistik lembaga.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-6">
            <p className="text-sm font-medium text-parchment-500">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">Kelas Aktif per Kategori</h2>
        {categoryRows.length > 0 ? (
          <div className="mt-3 space-y-2">
            {categoryRows.map((row) => (
              <div key={row.name} className="card-surface flex items-center justify-between p-4">
                <p className="text-sm font-semibold text-brand-900">{row.name}</p>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{row.count} kelas</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-parchment-500">Belum ada kelas yang dipublikasikan.</p>
        )}
      </div>
    </div>
  );
}
