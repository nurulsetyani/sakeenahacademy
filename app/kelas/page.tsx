import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicTopbar } from "@/components/landing/public-topbar";

export default async function KatalogKelasPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, description, access_type, price, program_type, category:course_categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <>
      <PublicTopbar />
      <main className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900 sm:text-4xl">
          Katalog Kelas
        </h1>
        <p className="mt-3 max-w-lg text-parchment-600">
          Kelas gratis dan berbayar, Tahsin, Tahfidz — semua dalam satu tempat.
        </p>

        {courses && courses.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.id} href={`/kelas/${c.slug}`} className="card-surface block p-6 transition-transform duration-200 ease-spring hover:-translate-y-1 hover:shadow-raised">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  {(c.category as unknown as { name: string } | null)?.name ?? c.program_type}
                </span>
                <h2 className="mt-2 font-display text-lg font-semibold text-brand-900">{c.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-parchment-600">{c.description}</p>
                <p className="mt-4 text-sm font-semibold text-brand-800">
                  {c.access_type === "berbayar" ? `Rp${Number(c.price).toLocaleString("id-ID")}` : "Gratis"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-10 p-14 text-center">
            <p className="text-sm text-parchment-600">Belum ada kelas yang dipublikasikan.</p>
          </div>
        )}
      </main>
    </>
  );
}
