import { createClient } from "@/lib/supabase/server";
import { createTahfidzTarget, recordTahfidzSetoran } from "@/lib/actions/tahfidz";

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

export default async function GuruTahfidzPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("teacher_id", user!.id)
    .eq("program_type", "tahfidz")
    .order("created_at", { ascending: false });

  if (!courses || courses.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-900">Tahfidz</h1>
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Anda belum memiliki kelas Tahfidz.</p>
        </div>
      </div>
    );
  }

  const courseIds = courses.map((c) => c.id);

  const [{ data: enrollments }, { data: targets }, { data: setoran }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("course_id, student_id, student:profiles!enrollments_student_id_fkey(id, full_name)")
      .in("course_id", courseIds)
      .eq("status", "active"),
    supabase
      .from("tahfidz_targets")
      .select("id, course_id, surah, ayat_start, ayat_end, target_date, status, student:profiles!tahfidz_targets_student_id_fkey(full_name)")
      .in("course_id", courseIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("tahfidz_setoran")
      .select("id, course_id, surah, ayat_start, ayat_end, setoran_date, status, score, student:profiles!tahfidz_setoran_student_id_fkey(full_name)")
      .in("course_id", courseIds)
      .order("setoran_date", { ascending: false })
      .limit(30),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tahfidz</h1>
      <p className="mt-1 text-sm text-parchment-500">Tetapkan target hafalan dan catat setoran murid binaan Anda.</p>

      <div className="mt-6 space-y-8">
        {courses.map((course) => {
          const students = (enrollments ?? []).filter((e) => e.course_id === course.id);
          const courseTargets = (targets ?? []).filter((t) => t.course_id === course.id);
          const courseSetoran = (setoran ?? []).filter((s) => s.course_id === course.id);

          return (
            <div key={course.id}>
              <h2 className="font-display text-lg font-semibold text-brand-900">{course.title}</h2>

              {students.length > 0 ? (
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-parchment-700">Beri Target Hafalan</h3>
                    <form action={createTahfidzTarget.bind(null, course.id)} className="mt-3 space-y-3">
                      <select name="student_id" required className="field-input">
                        {students.map((s) => (
                          <option key={s.student_id} value={s.student_id}>
                            {(s.student as unknown as { full_name: string } | null)?.full_name}
                          </option>
                        ))}
                      </select>
                      <input name="surah" required placeholder="Surah" className="field-input" />
                      <div className="grid grid-cols-2 gap-3">
                        <input name="ayat_start" type="number" min={1} required placeholder="Ayat mulai" className="field-input" />
                        <input name="ayat_end" type="number" min={1} required placeholder="Ayat selesai" className="field-input" />
                      </div>
                      <input name="target_date" type="date" className="field-input" />
                      <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Simpan Target</button>
                    </form>
                  </div>

                  <div className="card-surface p-6">
                    <h3 className="text-sm font-semibold text-parchment-700">Catat Setoran</h3>
                    <form action={recordTahfidzSetoran.bind(null, course.id)} className="mt-3 space-y-3">
                      <select name="student_id" required className="field-input">
                        {students.map((s) => (
                          <option key={s.student_id} value={s.student_id}>
                            {(s.student as unknown as { full_name: string } | null)?.full_name}
                          </option>
                        ))}
                      </select>
                      <input name="surah" required placeholder="Surah" className="field-input" />
                      <div className="grid grid-cols-2 gap-3">
                        <input name="ayat_start" type="number" min={1} required placeholder="Ayat mulai" className="field-input" />
                        <input name="ayat_end" type="number" min={1} required placeholder="Ayat selesai" className="field-input" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select name="status" className="field-input">
                          <option value="lancar">Lancar</option>
                          <option value="perlu_perbaikan">Perlu Perbaikan</option>
                          <option value="mengulang">Mengulang</option>
                        </select>
                        <input name="score" type="number" min={0} max={100} placeholder="Nilai" className="field-input" />
                      </div>
                      <textarea name="notes" rows={2} placeholder="Catatan" className="field-input" />
                      <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Simpan Setoran</button>
                    </form>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-parchment-500">Belum ada murid aktif di kelas ini.</p>
              )}

              {courseTargets.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-parchment-400">Target Aktif</h3>
                  {courseTargets.map((t) => (
                    <div key={t.id} className="card-surface flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-brand-900">
                          {(t.student as unknown as { full_name: string } | null)?.full_name}
                        </p>
                        <p className="mt-0.5 text-xs text-parchment-500">
                          {t.surah} {t.ayat_start}-{t.ayat_end}
                          {t.target_date && ` · target ${new Date(t.target_date).toLocaleDateString("id-ID")}`}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TARGET_STATUS_STYLE[t.status]}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {courseSetoran.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-parchment-400">Riwayat Setoran</h3>
                  {courseSetoran.map((s) => (
                    <div key={s.id} className="card-surface flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-brand-900">
                          {(s.student as unknown as { full_name: string } | null)?.full_name}
                        </p>
                        <p className="mt-0.5 text-xs text-parchment-500">
                          {s.surah} {s.ayat_start}-{s.ayat_end} &middot; {new Date(s.setoran_date).toLocaleDateString("id-ID")}
                          {s.score !== null && ` · Nilai ${s.score}`}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${SETORAN_STATUS_STYLE[s.status]}`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
