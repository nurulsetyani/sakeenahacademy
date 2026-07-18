import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startQuizAttempt, submitQuizAnswers } from "@/lib/actions/learning";

export default async function KerjakanQuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, passing_grade, max_attempts")
    .eq("id", quizId)
    .eq("course_id", courseId)
    .eq("status", "published")
    .single();

  if (!quiz) notFound();

  const redirectPath = `/murid/kelas-saya/${courseId}/quiz/${quizId}`;

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id, attempt_number, score, status")
    .eq("quiz_id", quizId)
    .eq("student_id", user!.id)
    .order("attempt_number", { ascending: false });

  const activeAttempt = attempts?.find((a) => a.status === "berjalan");
  const latestAttempt = attempts?.[0];

  if (!activeAttempt) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{quiz.title}</h1>
        <p className="mt-1 text-sm text-parchment-500">Nilai kelulusan: {quiz.passing_grade}</p>

        {latestAttempt && (
          <div className="card-surface mt-6 p-6 text-center">
            <p className="text-sm text-parchment-600">Percobaan ke-{latestAttempt.attempt_number}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{latestAttempt.score}</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                latestAttempt.status === "lulus" ? "bg-success-50 text-success-700" : "bg-red-50 text-red-700"
              }`}
            >
              {latestAttempt.status === "lulus" ? "Lulus" : "Tidak Lulus"}
            </span>
          </div>
        )}

        <form action={startQuizAttempt.bind(null, quizId, redirectPath)} className="mt-6">
          <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">
            {latestAttempt ? "Coba Lagi" : "Mulai Quiz"}
          </button>
        </form>
      </div>
    );
  }

  const { data: rows } = await supabase.rpc("get_quiz_for_attempt", { p_quiz_id: quizId });

  const questionsMap = new Map<string, { question_text: string; options: { option_id: string; option_text: string }[] }>();
  for (const row of rows ?? []) {
    if (!questionsMap.has(row.question_id)) {
      questionsMap.set(row.question_id, { question_text: row.question_text, options: [] });
    }
    if (row.option_id) {
      questionsMap.get(row.question_id)!.options.push({ option_id: row.option_id, option_text: row.option_text ?? "" });
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">{quiz.title}</h1>
      <p className="mt-1 text-sm text-parchment-500">Percobaan ke-{activeAttempt.attempt_number}</p>

      <form action={submitQuizAnswers.bind(null, activeAttempt.id, quizId, redirectPath)} className="mt-6 space-y-4">
        {Array.from(questionsMap.entries()).map(([questionId, q]) => (
          <div key={questionId} className="card-surface p-5">
            <p className="text-sm font-semibold text-brand-900">{q.question_text}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <label key={opt.option_id} className="flex items-center gap-3 text-sm text-parchment-700">
                  <input type="radio" name={questionId} value={opt.option_id} required className="h-4 w-4 accent-brand-600" />
                  {opt.option_text}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Kumpulkan Jawaban</button>
      </form>
    </div>
  );
}
