import { createClient } from "@/lib/supabase/server";
import { selfCheckIn } from "@/lib/actions/live-class";

const STATUS_STYLE: Record<string, string> = {
  terjadwal: "bg-success-50 text-success-700",
  berlangsung: "bg-gold-100 text-gold-700",
  selesai: "bg-parchment-200 text-parchment-600",
  dibatalkan: "bg-red-50 text-red-700",
};

const ATTENDANCE_LABEL: Record<string, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  izin: "Izin",
  sakit: "Sakit",
};

export default async function JadwalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", user!.id)
    .eq("status", "active");

  const courseIds = (enrollments ?? []).map((e) => e.course_id);

  const { data: sessions } =
    courseIds.length > 0
      ? await supabase
          .from("live_sessions")
          .select("id, title, platform, meeting_link, scheduled_at, status, recording_url, course:courses(title)")
          .in("course_id", courseIds)
          .order("scheduled_at", { ascending: true })
      : { data: [] };

  const sessionIds = (sessions ?? []).map((s) => s.id);

  const { data: attendance } =
    sessionIds.length > 0
      ? await supabase
          .from("live_session_attendance")
          .select("session_id, status")
          .eq("student_id", user!.id)
          .in("session_id", sessionIds)
      : { data: [] };

  const attendanceBySession = new Map((attendance ?? []).map((a) => [a.session_id, a.status]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Jadwal</h1>
      <p className="mt-1 text-sm text-parchment-500">Jadwal kelas live Anda.</p>

      {sessions && sessions.length > 0 ? (
        <div className="mt-6 space-y-3">
          {sessions.map((s) => {
            const attendanceStatus = attendanceBySession.get(s.id);
            const canJoin = (s.status === "terjadwal" || s.status === "berlangsung") && s.meeting_link;
            const canCheckIn = s.status !== "selesai" && s.status !== "dibatalkan" && attendanceStatus !== "hadir";

            return (
              <div key={s.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-brand-900">{s.title}</p>
                    <p className="mt-1 text-xs capitalize text-parchment-500">
                      {(s.course as unknown as { title: string } | null)?.title}
                      {" "}&middot; {new Date(s.scheduled_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      {" "}&middot; {s.platform.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {canJoin && (
                    <a href={s.meeting_link!} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2 text-sm">
                      Gabung Kelas
                    </a>
                  )}
                  {s.status === "selesai" && s.recording_url && (
                    <a href={s.recording_url} target="_blank" rel="noreferrer" className="btn-secondary !px-4 !py-2 text-sm">
                      Tonton Rekaman
                    </a>
                  )}
                  {canCheckIn && (
                    <form action={selfCheckIn.bind(null, s.id)}>
                      <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">Saya Hadir</button>
                    </form>
                  )}
                  {attendanceStatus && (
                    <span className="text-xs font-semibold text-parchment-500">
                      Presensi: {ATTENDANCE_LABEL[attendanceStatus]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada jadwal kelas live.</p>
        </div>
      )}
    </div>
  );
}
