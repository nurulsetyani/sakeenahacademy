import { createClient } from "@/lib/supabase/server";

export default async function SertifikatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, status, course:courses(title)")
    .eq("student_id", user!.id)
    .order("issued_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Sertifikat Saya</h1>

      {certificates && certificates.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <div key={c.id} className="card-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                {c.certificate_number}
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-brand-900">
                {(c.course as unknown as { title: string } | null)?.title}
              </p>
              <p className="mt-1 text-xs text-parchment-500">
                Terbit {new Date(c.issued_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">
            Belum ada sertifikat. Selesaikan sebuah kelas untuk mendapatkan sertifikat pertama Anda.
          </p>
        </div>
      )}
    </div>
  );
}
