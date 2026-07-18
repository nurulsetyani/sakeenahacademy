import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GuruDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status")
    .eq("teacher_id", user!.id)
    .order("created_at", { ascending: false });

  const courseIds = (courses ?? []).map((c) => c.id);

  const [{ count: quizCount }, { data: schedules }] =
    courseIds.length > 0
      ? await Promise.all([
          supabase.from("quizzes").select("id", { count: "exact", head: true }).in("course_id", courseIds),
          supabase.from("tahsin_schedules").select("id").in("course_id", courseIds),
        ])
      : [{ count: 0 }, { data: [] }];

  const scheduleIds = (schedules ?? []).map((s) => s.id);

  const { data: assessedRows } =
    scheduleIds.length > 0
      ? await supabase
          .from("tahsin_assessments")
          .select("schedule_id")
          .eq("teacher_id", user!.id)
          .in("schedule_id", scheduleIds)
      : { data: [] };

  const assessedSet = new Set((assessedRows ?? []).map((a) => a.schedule_id));
  const pendingAssessmentCount = scheduleIds.filter((id) => !assessedSet.has(id)).length;

  const stats = [
    { label: "Kelas Diampu", value: courses?.length ?? 0 },
    { label: "Quiz & Ujian Dibuat", value: quizCount ?? 0 },
    { label: "Sesi Tahsin Belum Dinilai", value: pendingAssessmentCount },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-6">
            <p className="text-sm font-medium text-parchment-500">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-brand-900">Kelas Saya</h2>
          <Link href="/guru/kelas" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            Lihat semua
          </Link>
        </div>

        {courses && courses.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/guru/kelas/${c.id}`}
                className="card-surface block p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <p className="font-display text-base font-semibold text-brand-900">{c.title}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    c.status === "published" ? "bg-success-50 text-success-700" : "bg-parchment-200 text-parchment-600"
                  }`}
                >
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-4 p-10 text-center">
            <p className="text-sm text-parchment-600">Anda belum ditugaskan ke kelas apa pun. Hubungi Admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
