import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTahsinSchedule } from "@/lib/actions/tahsin";

const STATUS_STYLE: Record<string, string> = {
  terjadwal: "bg-brand-50 text-brand-700",
  berlangsung: "bg-gold-100 text-gold-700",
  selesai: "bg-parchment-200 text-parchment-600",
  dibatalkan: "bg-red-50 text-red-700",
};

export default async function GuruTahsinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("teacher_id", user!.id)
    .eq("program_type", "tahsin")
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const { data: schedules } =
    courseIds.length > 0
      ? await supabase
          .from("tahsin_schedules")
          .select("id, session_date, start_time, end_time, location_or_link, status, course:courses(title)")
          .in("course_id", courseIds)
          .order("session_date", { ascending: false })
      : { data: [] };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tahsin</h1>
      <p className="mt-1 text-sm text-parchment-500">Kelola jadwal, presensi, dan penilaian Tahsin.</p>

      {courses && courses.length > 0 ? (
        <div className="card-surface mt-6 p-6">
          <h2 className="font-display font-semibold text-brand-900">Buat Jadwal Baru</h2>
          <form action={createTahsinSchedule} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="course_id" className="field-label">Kelas Tahsin</label>
              <select id="course_id" name="course_id" required className="field-input">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="session_date" className="field-label">Tanggal</label>
              <input id="session_date" name="session_date" type="date" required className="field-input" />
            </div>
            <div>
              <label htmlFor="start_time" className="field-label">Jam Mulai</label>
              <input id="start_time" name="start_time" type="time" required className="field-input" />
            </div>
            <div>
              <label htmlFor="end_time" className="field-label">Jam Selesai</label>
              <input id="end_time" name="end_time" type="time" required className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="location_or_link" className="field-label">Lokasi / Link</label>
              <input id="location_or_link" name="location_or_link" className="field-input" placeholder="Masjid Al-Ikhlas atau link Zoom" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Jadwal</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Anda belum memiliki kelas Tahsin.</p>
        </div>
      )}

      {schedules && schedules.length > 0 && (
        <div className="mt-6 space-y-3">
          {schedules.map((s) => (
            <Link
              key={s.id}
              href={`/guru/tahsin/${s.id}`}
              className="card-surface flex items-center justify-between p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
            >
              <div>
                <p className="font-display font-semibold text-brand-900">
                  {(s.course as unknown as { title: string } | null)?.title}
                </p>
                <p className="mt-1 text-xs text-parchment-500">
                  {new Date(s.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  {" "}&middot; {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                  {s.location_or_link && <> &middot; {s.location_or_link}</>}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[s.status]}`}>
                {s.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
