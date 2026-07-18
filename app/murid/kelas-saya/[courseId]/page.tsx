import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BelajarKelasPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status, progress_percentage, course:courses(title)")
    .eq("student_id", user!.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment || (enrollment.status !== "active" && enrollment.status !== "completed")) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, estimated_duration_minutes")
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("enrollment_id", enrollment.id);

  const progressByLesson = new Map((progress ?? []).map((p) => [p.lesson_id, p.status]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">
        {(enrollment.course as unknown as { title: string } | null)?.title}
      </h1>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-parchment-200">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${enrollment.progress_percentage}%` }} />
      </div>
      <p className="mt-2 text-xs text-parchment-500">{enrollment.progress_percentage}% selesai</p>

      {lessons && lessons.length > 0 ? (
        <div className="mt-6 space-y-2">
          {lessons.map((l) => {
            const done = progressByLesson.get(l.id) === "selesai";
            return (
              <Link
                key={l.id}
                href={`/murid/kelas-saya/${courseId}/materi/${l.id}`}
                className="card-surface flex items-center justify-between p-4 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-900">{l.title}</p>
                  {l.estimated_duration_minutes && (
                    <p className="mt-0.5 text-xs text-parchment-500">{l.estimated_duration_minutes} menit</p>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${done ? "bg-success-50 text-success-700" : "bg-parchment-200 text-parchment-600"}`}>
                  {done ? "Selesai" : "Belum Selesai"}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada materi untuk kelas ini.</p>
        </div>
      )}
    </div>
  );
}
