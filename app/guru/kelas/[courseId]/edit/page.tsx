import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleCourseStatus } from "@/lib/actions/course-status";

export default async function EditKelasPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, status, access_type, price, program_type")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

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

      <p className="mt-4 text-xs text-parchment-400">
        Kelola materi, quiz, dan live class untuk kelas ini akan tersedia di iterasi berikutnya.
      </p>
    </div>
  );
}
