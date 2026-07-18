import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCourse } from "@/lib/actions/courses";
import { toggleCourseStatus } from "@/lib/actions/course-status";

const CONTENT_STATUS_STYLE: Record<string, string> = {
  published: "bg-success-50 text-success-700",
  draft: "bg-parchment-200 text-parchment-600",
};

export default async function AdminEditKelasPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, status, access_type, price, program_type, category_id, teacher_id")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const [{ data: categories }, { data: teachers }, { data: lessons }] = await Promise.all([
    supabase.from("course_categories").select("id, name").order("name"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "guru")
      .eq("account_status", "active")
      .order("full_name"),
    supabase
      .from("lessons")
      .select("id, title, status, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true }),
  ]);

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{course.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${course.status === "published" ? "bg-success-50 text-success-700" : "bg-parchment-200 text-parchment-600"}`}>
          {course.status}
        </span>
      </div>

      <form action={updateCourse.bind(null, courseId)} className="card-surface mt-6 space-y-4 p-6">
        <div>
          <label htmlFor="title" className="field-label">Judul Kelas</label>
          <input id="title" name="title" required defaultValue={course.title} className="field-input" />
        </div>
        <div>
          <label htmlFor="teacher_id" className="field-label">Guru Penanggung Jawab</label>
          <select id="teacher_id" name="teacher_id" required defaultValue={course.teacher_id} className="field-input">
            {teachers?.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="field-label">Deskripsi</label>
          <textarea id="description" name="description" rows={3} defaultValue={course.description ?? ""} className="field-input" />
        </div>
        <div>
          <label htmlFor="category_id" className="field-label">Kategori</label>
          <select id="category_id" name="category_id" required defaultValue={course.category_id ?? ""} className="field-input">
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="program_type" className="field-label">Tipe Program</label>
          <select id="program_type" name="program_type" defaultValue={course.program_type} className="field-input">
            <option value="reguler">Reguler (materi &amp; quiz)</option>
            <option value="tahsin">Tahsin (jadwal, presensi, penilaian)</option>
            <option value="tahfidz">Tahfidz (target &amp; setoran)</option>
          </select>
        </div>
        <div>
          <label htmlFor="access_type" className="field-label">Tipe Akses</label>
          <select id="access_type" name="access_type" defaultValue={course.access_type} className="field-input">
            <option value="gratis">Gratis</option>
            <option value="berbayar">Berbayar</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="field-label">Harga (Rp, jika berbayar)</label>
          <input id="price" name="price" type="number" min={0} step={1000} defaultValue={course.price} className="field-input" />
        </div>
        <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Perubahan</button>
      </form>

      <form action={toggleCourseStatus.bind(null, course.id, course.status)} className="mt-4">
        <button type="submit" className="btn-secondary">
          {course.status === "published" ? "Jadikan Draft" : "Publish Kelas"}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-brand-900">Materi</h2>
          <Link href={`/admin/kelas/${courseId}/materi/baru`} className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            + Tambah Materi
          </Link>
        </div>

        {lessons && lessons.length > 0 ? (
          <div className="mt-3 space-y-2">
            {lessons.map((l) => (
              <Link
                key={l.id}
                href={`/admin/kelas/${courseId}/materi/${l.id}`}
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
    </div>
  );
}
