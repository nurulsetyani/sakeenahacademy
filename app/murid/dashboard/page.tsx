import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MuridDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, progress_percentage, course:courses(id, title, cover_image_url)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const { count: certificateCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user!.id);

  const activeCount = enrollments?.filter((e) => e.status === "active").length ?? 0;

  const stats = [
    { label: "Kelas Aktif", value: activeCount },
    { label: "Sertifikat", value: certificateCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-6">
            <p className="text-sm font-medium text-parchment-500">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-brand-900">Kelas Saya</h2>
          <Link href="/murid/kelas-saya" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            Lihat semua
          </Link>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => (
              <div key={e.id} className="card-surface p-5">
                <p className="font-display text-base font-semibold text-brand-900">
                  {(e.course as unknown as { title: string } | null)?.title ?? "Kelas"}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-parchment-200">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${e.progress_percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-parchment-500">{e.progress_percentage}% selesai</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-4 p-10 text-center">
            <p className="text-sm text-parchment-600">Anda belum mengikuti kelas apa pun.</p>
            <Link href="/kelas" className="btn-primary mt-4 inline-flex">
              Telusuri Katalog Kelas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
