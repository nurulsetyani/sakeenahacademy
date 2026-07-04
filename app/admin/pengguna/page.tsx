import { createClient } from "@/lib/supabase/server";
import { approveTeacher, rejectTeacher } from "@/lib/actions/admin";

export default async function AdminPenggunaPage() {
  const supabase = await createClient();

  const { data: pendingTeachers } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "guru")
    .eq("account_status", "pending")
    .order("created_at", { ascending: true });

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, full_name, role, account_status")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-900">Menunggu Persetujuan Guru</h1>

        {pendingTeachers && pendingTeachers.length > 0 ? (
          <div className="mt-4 space-y-3">
            {pendingTeachers.map((t) => (
              <div key={t.id} className="card-surface flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-semibold text-brand-900">{t.full_name}</p>
                  <p className="text-xs text-parchment-500">{t.phone}</p>
                </div>
                <div className="flex gap-2">
                  <form action={approveTeacher.bind(null, t.id)}>
                    <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Setujui</button>
                  </form>
                  <form action={rejectTeacher.bind(null, t.id)}>
                    <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Tolak</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-parchment-500">Tidak ada pengajuan guru yang menunggu.</p>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-brand-900">Seluruh Pengguna</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-parchment-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-parchment-200 bg-parchment-50 text-xs uppercase tracking-wide text-parchment-500">
              <tr>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {allUsers?.map((u) => (
                <tr key={u.id} className="border-b border-parchment-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-parchment-800">{u.full_name}</td>
                  <td className="px-5 py-3 capitalize text-parchment-600">{u.role}</td>
                  <td className="px-5 py-3 capitalize text-parchment-600">{u.account_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
