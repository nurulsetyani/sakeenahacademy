import { createLesson } from "@/lib/actions/lessons";

export default async function AdminTambahMateriPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tambah Materi</h1>

      <form action={createLesson.bind(null, courseId)} className="card-surface mt-6 space-y-4 p-6">
        <div>
          <label htmlFor="title" className="field-label">Judul Materi</label>
          <input id="title" name="title" required className="field-input" placeholder="Contoh: Pengantar Tauhid" />
        </div>
        <div>
          <label htmlFor="youtube_url" className="field-label">Link Video YouTube</label>
          <input id="youtube_url" name="youtube_url" type="url" className="field-input" placeholder="https://youtube.com/watch?v=..." />
        </div>
        <div>
          <label htmlFor="pdf_url" className="field-label">Link PDF</label>
          <input id="pdf_url" name="pdf_url" type="url" className="field-input" placeholder="https://..." />
        </div>
        <div>
          <label htmlFor="estimated_duration_minutes" className="field-label">Estimasi Durasi (menit)</label>
          <input id="estimated_duration_minutes" name="estimated_duration_minutes" type="number" min={1} className="field-input" />
        </div>
        <div>
          <label htmlFor="summary_content" className="field-label">Ringkasan Materi</label>
          <textarea id="summary_content" name="summary_content" rows={5} className="field-input" placeholder="Ringkasan yang bisa dibaca murid..." />
        </div>
        <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Simpan Materi</button>
      </form>
    </div>
  );
}
