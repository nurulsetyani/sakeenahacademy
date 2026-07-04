import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateLiveSession, saveLiveAttendance } from "@/lib/actions/live-class";

const ATTENDANCE_OPTIONS: { value: string; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak_hadir", label: "Tidak Hadir" },
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
];

export default async function LiveSessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("live_sessions")
    .select("id, course_id, title, platform, meeting_link, scheduled_at, status, recording_url, course:courses(title)")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, student:profiles!enrollments_student_id_fkey(id, full_name)")
    .eq("course_id", session.course_id)
    .eq("status", "active");

  const { data: attendance } = await supabase
    .from("live_session_attendance")
    .select("student_id, status")
    .eq("session_id", sessionId);

  const attendanceByStudent = new Map((attendance ?? []).map((a) => [a.student_id, a.status]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">{session.title}</h1>
      <p className="mt-1 text-sm text-parchment-500">
        {(session.course as unknown as { title: string } | null)?.title}
        {" "}&middot; {new Date(session.scheduled_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <form action={updateLiveSession.bind(null, sessionId)} className="card-surface mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="field-label">Status Sesi</label>
          <select id="status" name="status" defaultValue={session.status} className="field-input">
            <option value="terjadwal">Terjadwal</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
        <div>
          <label htmlFor="recording_url" className="field-label">Link Rekaman</label>
          <input id="recording_url" name="recording_url" type="url" defaultValue={session.recording_url ?? ""} className="field-input" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan</button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">Presensi Murid</h2>

        {enrollments && enrollments.length > 0 ? (
          <div className="mt-3 space-y-3">
            {enrollments.map((e) => {
              const student = e.student as unknown as { id: string; full_name: string } | null;
              const currentStatus = attendanceByStudent.get(e.student_id) ?? "tidak_hadir";

              return (
                <form
                  key={e.student_id}
                  action={saveLiveAttendance.bind(null, sessionId, e.student_id)}
                  className="card-surface flex items-center justify-between gap-4 p-4"
                >
                  <p className="text-sm font-semibold text-brand-900">{student?.full_name}</p>
                  <div className="flex items-center gap-2">
                    <select name="attendance_status" defaultValue={currentStatus} className="field-input !py-2 text-sm">
                      {ATTENDANCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary shrink-0 !px-4 !py-2 text-sm">Simpan</button>
                  </div>
                </form>
              );
            })}
          </div>
        ) : (
          <div className="card-surface mt-3 p-10 text-center">
            <p className="text-sm text-parchment-600">Belum ada murid aktif di kelas ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
