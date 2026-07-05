import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createLiveSession } from "@/lib/actions/live-class";

const STATUS_STYLE: Record<string, string> = {
  terjadwal: "bg-brand-50 text-brand-700",
  berlangsung: "bg-gold-100 text-gold-700",
  selesai: "bg-parchment-200 text-parchment-600",
  dibatalkan: "bg-red-50 text-red-700",
};

export default async function AdminLiveClassPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("created_at", { ascending: false });

  const { data: sessions } = await supabase
    .from("live_sessions")
    .select("id, title, platform, scheduled_at, duration_minutes, status, course:courses(title)")
    .order("scheduled_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Live Class</h1>
      <p className="mt-1 text-sm text-parchment-500">Jadwalkan kelas live dan kelola presensi murid.</p>

      {courses && courses.length > 0 ? (
        <div className="card-surface mt-6 p-6">
          <h2 className="font-display font-semibold text-brand-900">Jadwalkan Kelas Live</h2>
          <form action={createLiveSession} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="course_id" className="field-label">Kelas</label>
              <select id="course_id" name="course_id" required className="field-input">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="title" className="field-label">Judul Sesi</label>
              <input id="title" name="title" required className="field-input" placeholder="Contoh: Kajian Pekan ke-3" />
            </div>
            <div>
              <label htmlFor="platform" className="field-label">Platform</label>
              <select id="platform" name="platform" className="field-input">
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration_minutes" className="field-label">Durasi (menit)</label>
              <input id="duration_minutes" name="duration_minutes" type="number" min={1} defaultValue={60} className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="meeting_link" className="field-label">Link Meeting</label>
              <input id="meeting_link" name="meeting_link" type="url" className="field-input" placeholder="https://zoom.us/j/..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="scheduled_at" className="field-label">Waktu Mulai</label>
              <input id="scheduled_at" name="scheduled_at" type="datetime-local" required className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Jadwal</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada kelas.</p>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="mt-6 space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/admin/live-class/${s.id}`}
              className="card-surface flex items-center justify-between p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
            >
              <div>
                <p className="font-display font-semibold text-brand-900">{s.title}</p>
                <p className="mt-1 text-xs capitalize text-parchment-500">
                  {(s.course as unknown as { title: string } | null)?.title}
                  {" "}&middot; {new Date(s.scheduled_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  {" "}&middot; {s.platform.replace("_", " ")}
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
