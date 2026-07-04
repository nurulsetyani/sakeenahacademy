import { createClient } from "@/lib/supabase/server";

const ATTENDANCE_LABEL: Record<string, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  izin: "Izin",
  sakit: "Sakit",
};

const ATTENDANCE_STYLE: Record<string, string> = {
  hadir: "bg-brand-50 text-brand-700",
  tidak_hadir: "bg-red-50 text-red-700",
  izin: "bg-gold-100 text-gold-700",
  sakit: "bg-gold-100 text-gold-700",
};

export default async function MuridTahsinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, course:courses!inner(id, title, program_type)")
    .eq("student_id", user!.id)
    .eq("status", "active")
    .eq("course.program_type", "tahsin");

  const courseIds = (enrollments ?? []).map((e) => e.course_id);

  const { data: schedules } =
    courseIds.length > 0
      ? await supabase
          .from("tahsin_schedules")
          .select("id, session_date, start_time, end_time, location_or_link, course:courses(title)")
          .in("course_id", courseIds)
          .order("session_date", { ascending: false })
      : { data: [] };

  const scheduleIds = (schedules ?? []).map((s) => s.id);

  const { data: attendance } =
    scheduleIds.length > 0
      ? await supabase
          .from("tahsin_attendance")
          .select("schedule_id, status")
          .eq("student_id", user!.id)
          .in("schedule_id", scheduleIds)
      : { data: [] };

  const { data: assessments } =
    scheduleIds.length > 0
      ? await supabase
          .from("tahsin_assessments")
          .select("schedule_id, makhraj_score, tajwid_score, kelancaran_score, overall_grade")
          .eq("student_id", user!.id)
          .in("schedule_id", scheduleIds)
      : { data: [] };

  const attendanceBySchedule = new Map((attendance ?? []).map((a) => [a.schedule_id, a.status]));
  const assessmentBySchedule = new Map((assessments ?? []).map((a) => [a.schedule_id, a]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tahsin</h1>
      <p className="mt-1 text-sm text-parchment-500">Riwayat presensi dan penilaian Tahsin Anda.</p>

      {schedules && schedules.length > 0 ? (
        <div className="mt-6 space-y-3">
          {schedules.map((s) => {
            const status = attendanceBySchedule.get(s.id);
            const assessment = assessmentBySchedule.get(s.id);

            return (
              <div key={s.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-brand-900">
                      {(s.course as unknown as { title: string } | null)?.title}
                    </p>
                    <p className="mt-1 text-xs text-parchment-500">
                      {new Date(s.session_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      {" "}&middot; {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status ? ATTENDANCE_STYLE[status] : "bg-parchment-200 text-parchment-600"}`}>
                    {status ? ATTENDANCE_LABEL[status] : "Belum ada data"}
                  </span>
                </div>

                {assessment && (assessment.makhraj_score !== null || assessment.overall_grade) && (
                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-parchment-200 pt-4 text-center text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-parchment-400">Makhraj</dt>
                      <dd className="font-semibold text-brand-800">{assessment.makhraj_score ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-parchment-400">Tajwid</dt>
                      <dd className="font-semibold text-brand-800">{assessment.tajwid_score ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-parchment-400">Kelancaran</dt>
                      <dd className="font-semibold text-brand-800">{assessment.kelancaran_score ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-parchment-400">Nilai</dt>
                      <dd className="font-semibold text-brand-800">{assessment.overall_grade ?? "-"}</dd>
                    </div>
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada jadwal Tahsin.</p>
        </div>
      )}
    </div>
  );
}
