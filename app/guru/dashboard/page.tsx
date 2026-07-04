import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GuruDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const publishedCount = courses?.filter((c) => c.status === "published").length ?? 0;
  const draftCount = courses?.filter((c) => c.status === "draft").length ?? 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-6">
          <p className="text-sm font-medium text-parchment-500">Kelas Published</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{publishedCount}</p>
        </div>
        <div className="card-surface p-6">
          <p className="text-sm font-medium text-parchment-500">Draft</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{draftCount}</p>
        </div>
        <Link href="/guru/kelas/baru" className="card-surface flex flex-col justify-center p-6 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised">
          <p className="font-display text-base font-semibold text-brand-800">+ Buat Kelas Baru</p>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-brand-900">Kelas Saya</h2>
          <Link href="/guru/kelas" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            Lihat semua
          </Link>
        </div>

        {courses && courses.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/guru/kelas/${c.id}/edit`}
                className="card-surface block p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <p className="font-display text-base font-semibold text-brand-900">{c.title}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    c.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"
                  }`}
                >
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-4 p-10 text-center">
            <p className="text-sm text-parchment-600">Anda belum memiliki kelas.</p>
            <Link href="/guru/kelas/baru" className="btn-primary mt-4 inline-flex">
              Buat Kelas Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
