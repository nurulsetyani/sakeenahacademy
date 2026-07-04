import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/lib/actions/courses";

export default async function BuatKelasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("course_categories").select("id, name").order("name");

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">Buat Kelas Baru</h1>

      <form action={createCourse} className="card-surface mt-6 space-y-5 p-6">
        <div>
          <label htmlFor="title" className="field-label">Judul Kelas</label>
          <input id="title" name="title" required className="field-input" placeholder="mis. Bahasa Arab Dasar" />
        </div>

        <div>
          <label htmlFor="description" className="field-label">Deskripsi</label>
          <textarea id="description" name="description" rows={3} className="field-input" />
        </div>

        <div>
          <label htmlFor="category_id" className="field-label">Kategori</label>
          <select id="category_id" name="category_id" required className="field-input">
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="program_type" className="field-label">Tipe Program</label>
          <select id="program_type" name="program_type" className="field-input" defaultValue="reguler">
            <option value="reguler">Reguler (materi &amp; quiz)</option>
            <option value="tahsin">Tahsin (jadwal, presensi, penilaian)</option>
            <option value="tahfidz">Tahfidz (target &amp; setoran)</option>
          </select>
        </div>

        <div>
          <label htmlFor="access_type" className="field-label">Tipe Akses</label>
          <select id="access_type" name="access_type" className="field-input" defaultValue="gratis">
            <option value="gratis">Gratis</option>
            <option value="berbayar">Berbayar</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="field-label">Harga (Rp, jika berbayar)</label>
          <input id="price" name="price" type="number" min={0} step={1000} className="field-input" defaultValue={0} />
        </div>

        <button type="submit" className="btn-primary w-full">Simpan sebagai Draft</button>
      </form>
    </div>
  );
}
