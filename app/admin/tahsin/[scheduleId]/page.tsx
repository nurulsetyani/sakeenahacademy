import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveTahsinAttendance } from "@/lib/actions/tahsin";

const ATTENDANCE_OPTIONS: { value: string; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak_hadir", label: "Tidak Hadir" },
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
];

export default async function AdminTahsinScheduleDetailPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = await params;
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("tahsin_schedules")
    .select("id, course_id, session_date, start_time, end_time, location_or_link, course:courses(title)")
    .eq("id", scheduleId)
    .single();

  if (!schedule) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, student:profiles!enrollments_student_id_fkey(id, full_name)")
    .eq("course_id", schedule.course_id)
    .eq("status", "active");

  const { data: attendance } = await supabase
    .from("tahsin_attendance")
    .select("student_id, status")
    .eq("schedule_id", scheduleId);

  const attendanceByStudent = new Map((attendance ?? []).map((a) => [a.student_id, a.status]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">
        {(schedule.course as unknown as { title: string } | null)?.title}
      </h1>
      <p className="mt-1 text-sm text-parchment-500">
        {new Date(schedule.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        {" "}&middot; {schedule.start_time.slice(0, 5)}–{schedule.end_time.slice(0, 5)}
      </p>

      {enrollments && enrollments.length > 0 ? (
        <div className="mt-6 space-y-3">
          {enrollments.map((e) => {
            const student = e.student as unknown as { id: string; full_name: string } | null;
            const currentAttendance = attendanceByStudent.get(e.student_id) ?? "tidak_hadir";

            return (
              <form
                key={e.student_id}
                action={saveTahsinAttendance.bind(null, scheduleId, e.student_id)}
                className="card-surface flex items-center justify-between gap-4 p-4"
              >
                <p className="text-sm font-semibold text-brand-900">{student?.full_name}</p>
                <div className="flex items-center gap-2">
                  <select name="attendance_status" defaultValue={currentAttendance} className="field-input !py-2 text-sm">
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
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada murid aktif di kelas ini.</p>
        </div>
      )}
    </div>
  );
}
