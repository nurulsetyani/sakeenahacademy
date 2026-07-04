import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleCourseStatus } from "@/lib/actions/course-status";
import { createExamQuiz } from "@/lib/actions/quizzes";

const CONTENT_STATUS_STYLE: Record<string, string> = {
  published: "bg-brand-50 text-brand-700",
  draft: "bg-parchment-200 text-parchment-600",
};

export default async function EditKelasPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, status, access_type, price, program_type")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const [{ data: lessons }, { data: exams }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, status, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true }),
    supabase
      .from("quizzes")
      .select("id, title, status")
      .eq("course_id", courseId)
      .eq("quiz_type", "ujian_akhir")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{course.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${course.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
          {course.status}
        </span>
      </div>

      <div className="card-surface mt-6 space-y-3 p-6">
        <p className="text-sm text-parchment-600">{course.description || "Belum ada deskripsi."}</p>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-parchment-400">Tipe Program</dt>
            <dd className="capitalize text-parchment-800">{course.program_type}</dd>
          </div>
          <div>
            <dt className="text-parchment-400">Akses</dt>
            <dd className="capitalize text-parchment-800">
              {course.access_type === "berbayar" ? `Rp${Number(course.price).toLocaleString("id-ID")}` : "Gratis"}
            </dd>
          </div>
        </dl>

        <form action={toggleCourseStatus.bind(null, course.id, course.status)}>
          <button type="submit" className="btn-secondary mt-2">
            {course.status === "published" ? "Jadikan Draft" : "Publish Kelas"}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-brand-900">Materi</h2>
          <Link href={`/guru/kelas/${courseId}/materi/baru`} className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            + Tambah Materi
          </Link>
        </div>

        {lessons && lessons.length > 0 ? (
          <div className="mt-3 space-y-2">
            {lessons.map((l) => (
              <Link
                key={l.id}
                href={`/guru/kelas/${courseId}/materi/${l.id}`}
                className="card-surface flex items-center justify-between p-4 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <p className="text-sm font-semibold text-brand-900">{l.title}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${CONTENT_STATUS_STYLE[l.status]}`}>
                  {l.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-parchment-500">Belum ada materi.</p>
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
