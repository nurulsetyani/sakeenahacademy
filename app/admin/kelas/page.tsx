import { createClient } from "@/lib/supabase/server";

export default async function AdminKelasPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, access_type, program_type, teacher:profiles!courses_teacher_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Kelola Kelas</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-parchment-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-parchment-200 bg-parchment-50 text-xs uppercase tracking-wide text-parchment-500">
            <tr>
              <th className="px-5 py-3">Kelas</th>
              <th className="px-5 py-3">Guru</th>
              <th className="px-5 py-3">Program</th>
              <th className="px-5 py-3">Akses</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses?.map((c) => (
              <tr key={c.id} className="border-b border-parchment-100 last:border-0">
                <td className="px-5 py-3 font-medium text-parchment-800">{c.title}</td>
                <td className="px-5 py-3 text-parchment-600">
                  {(c.teacher as unknown as { full_name: string } | null)?.full_name}
                </td>
                <td className="px-5 py-3 capitalize text-parchment-600">{c.program_type}</td>
                <td className="px-5 py-3 capitalize text-parchment-600">{c.access_type}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${c.status === "published" ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
