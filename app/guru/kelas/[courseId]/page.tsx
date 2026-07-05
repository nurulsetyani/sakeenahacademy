import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLessonQuiz, createExamQuiz } from "@/lib/actions/quizzes";

const CONTENT_STATUS_STYLE: Record<string, string> = {
  published: "bg-brand-50 text-brand-700",
  draft: "bg-parchment-200 text-parchment-600",
};

export default async function GuruKelasHubPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, status")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const [{ data: lessons }, { data: quizzes }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true }),
    supabase
      .from("quizzes")
      .select("id, title, status, quiz_type, lesson_id")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false }),
  ]);

  const quizByLesson = new Map(
    (quizzes ?? []).filter((q) => q.lesson_id).map((q) => [q.lesson_id as string, q])
  );
  const exams = (quizzes ?? []).filter((q) => q.quiz_type === "ujian_akhir");

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{course.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${course.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
          {course.status}
        </span>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">Quiz Materi</h2>

        {lessons && lessons.length > 0 ? (
          <div className="mt-3 space-y-2">
            {lessons.map((l) => {
              const quiz = quizByLesson.get(l.id);
              return quiz ? (
                <Link
                  key={l.id}
                  href={`/guru/kelas/${courseId}/quiz/${quiz.id}`}
                  className="card-surface flex items-center justify-between p-4 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
                >
                  <p className="text-sm font-semibold text-brand-900">{l.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${CONTENT_STATUS_STYLE[quiz.status]}`}>
                    {quiz.status}
                  </span>
                </Link>
              ) : (
                <div key={l.id} className="card-surface flex items-center justify-between p-4">
                  <p className="text-sm font-semibold text-brand-900">{l.title}</p>
                  <form action={createLessonQuiz.bind(null, courseId, l.id)}>
                    <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">+ Buat Quiz</button>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-parchment-500">Belum ada materi di kelas ini.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">Ujian Akhir</h2>

        {exams && exams.length > 0 && (
          <div className="mt-3 space-y-2">
            {exams.map((q) => (
              <Link
                key={q.id}
                href={`/guru/kelas/${courseId}/quiz/${q.id}`}
                className="card-surface flex items-center justify-between p-4 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <p className="text-sm font-semibold text-brand-900">{q.title}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${CONTENT_STATUS_STYLE[q.status]}`}>
                  {q.status}
                </span>
              </Link>
            ))}
          </div>
        )}

        <form action={createExamQuiz.bind(null, courseId)} className="card-surface mt-3 flex items-center gap-3 p-4">
          <input name="title" required placeholder="Judul ujian akhir" className="field-input flex-1" />
          <button type="submit" className="btn-secondary shrink-0 !py-2.5 text-sm">+ Buat Ujian</button>
        </form>
      </div>
    </div>
  );
}
