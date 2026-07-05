import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveTahsinAssessment } from "@/lib/actions/tahsin";

export default async function TahsinAssessmentPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = await params;
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("tahsin_schedules")
    .select("id, course_id, session_date, start_time, end_time, course:courses(title)")
    .eq("id", scheduleId)
    .single();

  if (!schedule) notFound();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, student:profiles!enrollments_student_id_fkey(id, full_name)")
    .eq("course_id", schedule.course_id)
    .eq("status", "active");

  const { data: assessments } = await supabase
    .from("tahsin_assessments")
    .select("student_id, makhraj_score, tajwid_score, kelancaran_score, overall_grade, notes")
    .eq("schedule_id", scheduleId);

  const assessmentByStudent = new Map((assessments ?? []).map((a) => [a.student_id, a]));

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
        <div className="mt-6 space-y-4">
          {enrollments.map((e) => {
            const student = e.student as unknown as { id: string; full_name: string } | null;
            const assessment = assessmentByStudent.get(e.student_id);

            return (
              <form
                key={e.student_id}
                action={saveTahsinAssessment.bind(null, scheduleId, e.student_id)}
                className="card-surface p-6"
              >
                <p className="font-display font-semibold text-brand-900">{student?.full_name}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Nilai Keseluruhan</label>
                    <input name="overall_grade" defaultValue={assessment?.overall_grade ?? ""} className="field-input" placeholder="A / B / C" />
                  </div>
                  <div>
                    <label className="field-label">Makhraj (0-100)</label>
                    <input name="makhraj_score" type="number" min={0} max={100} defaultValue={assessment?.makhraj_score ?? ""} className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Tajwid (0-100)</label>
                    <input name="tajwid_score" type="number" min={0} max={100} defaultValue={assessment?.tajwid_score ?? ""} className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Kelancaran (0-100)</label>
                    <input name="kelancaran_score" type="number" min={0} max={100} defaultValue={assessment?.kelancaran_score ?? ""} className="field-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Catatan</label>
                    <textarea name="notes" defaultValue={assessment?.notes ?? ""} rows={2} className="field-input" />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-4 !px-5 !py-2.5 text-sm">Simpan</button>
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
