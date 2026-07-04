import { createClient } from "@/lib/supabase/server";

export default async function AdminKategoriPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("course_categories").select("*").order("name");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Kategori Kelas</h1>
      <p className="mt-1 text-sm text-parchment-500">
        7 kategori topik — independen dari Tahsin/Tahfidz yang dikelola sebagai tipe program (lihat docs/PRD.md §14).
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories?.map((cat) => (
          <div key={cat.id} className="card-surface p-5">
            <p className="font-display font-semibold text-brand-900">{cat.name}</p>
            {cat.description && <p className="mt-1 text-sm text-parchment-600">{cat.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
