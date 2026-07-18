import { createClient } from "@/lib/supabase/server";

const TARGET_STATUS_STYLE: Record<string, string> = {
  belum_mulai: "bg-parchment-200 text-parchment-600",
  proses: "bg-gold-100 text-gold-700",
  selesai: "bg-success-50 text-success-700",
};

const SETORAN_STATUS_STYLE: Record<string, string> = {
  lancar: "bg-success-50 text-success-700",
  perlu_perbaikan: "bg-gold-100 text-gold-700",
  mengulang: "bg-red-50 text-red-700",
};

export default async function MuridTahfidzPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: targets }, { data: setoran }] = await Promise.all([
    supabase
      .from("tahfidz_targets")
      .select("id, surah, ayat_start, ayat_end, target_date, status, course:courses(title)")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tahfidz_setoran")
      .select("id, surah, ayat_start, ayat_end, setoran_date, status, score, notes, course:courses(title)")
      .eq("student_id", user!.id)
      .order("setoran_date", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tahfidz</h1>
      <p className="mt-1 text-sm text-parchment-500">Target hafalan aktif dan riwayat setoran Anda.</p>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-parchment-400">Target Aktif</h2>
      {targets && targets.length > 0 ? (
        <div className="mt-3 space-y-3">
          {targets.map((t) => (
            <div key={t.id} className="card-surface flex items-center justify-between p-5">
              <div>
                <p className="font-display font-semibold text-brand-900">{t.surah} {t.ayat_start}-{t.ayat_end}</p>
                <p className="mt-1 text-xs text-parchment-500">
                  {(t.course as unknown as { title: string } | null)?.title}
                  {t.target_date && ` · target ${new Date(t.target_date).toLocaleDateString("id-ID")}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TARGET_STATUS_STYLE[t.status]}`}>
                {t.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-3 p-10 text-center">
          <p className="text-sm text-parchment-600">Belum ada target hafalan.</p>
        </div>
      )}

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-parchment-400">Riwayat Setoran</h2>
      {setoran && setoran.length > 0 ? (
        <div className="mt-3 space-y-3">
          {setoran.map((s) => (
            <div key={s.id} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-brand-900">{s.surah} {s.ayat_start}-{s.ayat_end}</p>
                  <p className="mt-1 text-xs text-parchment-500">
                    {(s.course as unknown as { title: string } | null)?.title}
                    {" "}&middot; {new Date(s.setoran_date).toLocaleDateString("id-ID")}
                    {s.score !== null && ` · Nilai ${s.score}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${SETORAN_STATUS_STYLE[s.status]}`}>
                  {s.status.replace("_", " ")}
                </span>
              </div>
              {s.notes && <p className="mt-2 text-xs text-parchment-500">{s.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-3 p-10 text-center">
          <p className="text-sm text-parchment-600">Belum ada riwayat setoran.</p>
        </div>
      )}
    </div>
  );
}
