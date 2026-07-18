import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateQuizSettings, toggleQuizStatus, addQuizQuestion, deleteQuizQuestion } from "@/lib/actions/quizzes";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, quiz_type, passing_grade, time_limit_minutes, max_attempts, status")
    .eq("id", quizId)
    .eq("course_id", courseId)
    .single();

  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, question_text, points, options:quiz_options(id, option_text, is_correct, order_index)")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{quiz.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${quiz.status === "published" ? "bg-success-50 text-success-700" : "bg-parchment-200 text-parchment-600"}`}>
          {quiz.status}
        </span>
      </div>
      <p className="mt-1 text-xs capitalize text-parchment-500">{quiz.quiz_type.replace("_", " ")}</p>

      <form action={updateQuizSettings.bind(null, quizId, courseId)} className="card-surface mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="field-label">Judul</label>
          <input id="title" name="title" required defaultValue={quiz.title} className="field-input" />
        </div>
        <div>
          <label htmlFor="passing_grade" className="field-label">Nilai Kelulusan</label>
          <input id="passing_grade" name="passing_grade" type="number" min={0} max={100} defaultValue={quiz.passing_grade} className="field-input" />
        </div>
        <div>
          <label htmlFor="max_attempts" className="field-label">Maks. Percobaan</label>
          <input id="max_attempts" name="max_attempts" type="number" min={1} defaultValue={quiz.max_attempts} className="field-input" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="time_limit_minutes" className="field-label">Batas Waktu (menit, kosongkan jika tanpa batas)</label>
          <input id="time_limit_minutes" name="time_limit_minutes" type="number" min={1} defaultValue={quiz.time_limit_minutes ?? ""} className="field-input" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Pengaturan</button>
        </div>
      </form>

      <form action={toggleQuizStatus.bind(null, quizId, courseId, quiz.status)} className="mt-4">
        <button type="submit" className="btn-secondary">
          {quiz.status === "published" ? "Jadikan Draft" : "Publish Quiz"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-brand-900">Soal</h2>

        {questions && questions.length > 0 ? (
          <div className="mt-3 space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-brand-900">{q.question_text}</p>
                  <form action={deleteQuizQuestion.bind(null, q.id, quizId, courseId)}>
                    <button type="submit" className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700">Hapus</button>
                  </form>
                </div>
                <ul className="mt-3 space-y-1">
                  {(
                    (q.options ?? []) as unknown as {
                      id: string;
                      option_text: string;
                      is_correct: boolean;
                      order_index: number;
                    }[]
                  )
                    .slice()
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((opt) => (
                      <li
                        key={opt.id}
                        className={`text-sm ${opt.is_correct ? "font-semibold text-brand-700" : "text-parchment-600"}`}
                      >
                        {opt.is_correct ? "✓ " : "· "}
                        {opt.option_text}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-parchment-500">Belum ada soal.</p>
        )}

        <form action={addQuizQuestion.bind(null, quizId, courseId)} className="card-surface mt-4 space-y-3 p-6">
          <h3 className="text-sm font-semibold text-parchment-700">Tambah Soal</h3>
          <textarea name="question_text" required rows={2} placeholder="Pertanyaan" className="field-input" />
          <input name="points" type="number" min={1} defaultValue={1} placeholder="Poin" className="field-input" />
          <p className="text-xs text-parchment-500">Isi minimal 2 opsi, pilih jawaban benar.</p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="radio" name="correct_option" value={i} required={i === 0} className="h-4 w-4 accent-brand-600" />
              <input name={`option_${i}`} placeholder={`Opsi ${String.fromCharCode(65 + i)}`} className="field-input flex-1" />
            </div>
          ))}
          <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Tambah Soal</button>
        </form>
      </div>
    </div>
  );
}
