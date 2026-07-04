import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GuruKelasListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, access_type, program_type")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Kelola Kelas</h1>
        <Link href="/guru/kelas/baru" className="btn-primary !px-5 !py-2.5 text-sm">+ Kelas Baru</Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="mt-6 space-y-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/guru/kelas/${c.id}/edit`} className="card-surface flex items-center justify-between p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised">
              <div>
                <p className="font-display font-semibold text-brand-900">{c.title}</p>
                <p className="mt-1 text-xs capitalize text-parchment-500">
                  {c.program_type} &middot; {c.access_type}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${c.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
                {c.status}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Anda belum memiliki kelas.</p>
        </div>
      )}
    </div>
  );
}
