import { createClient } from "@/lib/supabase/server";
import { createCertificateTemplate, toggleCertificateTemplateActive } from "@/lib/actions/certificates";

export default async function CertificateTemplatePage() {
  const supabase = await createClient();

  const [{ data: templates }, { data: categories }] = await Promise.all([
    supabase
      .from("certificate_templates")
      .select("id, name, is_active, category:course_categories(name)")
      .order("created_at", { ascending: false }),
    supabase.from("course_categories").select("id, name").order("name", { ascending: true }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">Template Sertifikat</h1>

      {templates && templates.length > 0 && (
        <div className="mt-6 space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card-surface flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-brand-900">{t.name}</p>
                <p className="mt-1 text-xs text-parchment-500">
                  {(t.category as unknown as { name: string } | null)?.name ?? "Template Default (semua kategori)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.is_active ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
                  {t.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <form action={toggleCertificateTemplateActive.bind(null, t.id, t.is_active)}>
                  <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">
                    {t.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-surface mt-6 p-6">
        <h2 className="text-sm font-semibold text-parchment-700">Tambah Template</h2>
        <form action={createCertificateTemplate} className="mt-3 space-y-3">
          <input name="name" required placeholder="Nama Template" className="field-input" />
          <select name="category_id" className="field-input">
            <option value="">Template Default (semua kategori)</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Simpan Template</button>
        </form>
      </div>
    </div>
  );
}
