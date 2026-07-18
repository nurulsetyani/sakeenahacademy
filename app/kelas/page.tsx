import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicTopbar } from "@/components/landing/public-topbar";
import { FadeInStagger, FadeInItem } from "@/components/landing/motion";

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
      <main className="min-h-screen bg-ink-50">
        <div className="container-page py-14">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-4xl">
            Katalog Kelas
          </h1>
          <p className="mt-3 max-w-lg text-ink-500">
            Kelas gratis dan berbayar, Tahsin, Tahfidz — semua dalam satu tempat.
          </p>

          {courses && courses.length > 0 ? (
            <FadeInStagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <FadeInItem key={c.id}>
                  <Link
                    href={`/kelas/${c.slug}`}
                    className="group block h-full rounded-2xl border border-ink-900/8 bg-white p-6 shadow-ink-soft transition-transform duration-200 ease-spring hover:-translate-y-1 hover:shadow-ink-raised"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-ember-600">
                      {(c.category as unknown as { name: string } | null)?.name ?? c.program_type}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-semibold text-ink-950 group-hover:text-ember-600">{c.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-500">{c.description}</p>
                    <p className="mt-4 text-sm font-semibold text-ink-800">
                      {c.access_type === "berbayar" ? `Rp${Number(c.price).toLocaleString("id-ID")}` : "Gratis"}
                    </p>
                  </Link>
                </FadeInItem>
              ))}
            </FadeInStagger>
          ) : (
            <div className="mt-10 rounded-2xl border border-ink-900/8 bg-white p-14 text-center shadow-ink-soft">
              <p className="text-sm text-ink-500">Belum ada kelas yang dipublikasikan.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
