import { createClient } from "@/lib/supabase/server";
import { approvePayment, rejectPayment } from "@/lib/actions/admin";

export default async function AdminPembayaranPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, enrollment_id, student_id, amount, attempt_number, proof_image_url, submitted_at, status, student:profiles!payments_student_id_fkey(full_name), course:courses(title)"
    )
    .eq("status", "menunggu_verifikasi")
    .order("submitted_at", { ascending: true });

  const proofUrls = new Map(
    await Promise.all(
      (payments ?? [])
        .filter((p) => p.proof_image_url)
        .map(async (p) => {
          const { data } = await supabase.storage
            .from("payment-proofs")
            .createSignedUrl(p.proof_image_url!, 3600);
          return [p.id, data?.signedUrl ?? null] as const;
        })
    )
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Verifikasi Pembayaran</h1>
      <p className="mt-1 text-sm text-parchment-500">Diurutkan dari yang menunggu paling lama.</p>

      {payments && payments.length > 0 ? (
        <div className="mt-6 space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="card-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold text-brand-900">
                    {(p.student as unknown as { full_name: string } | null)?.full_name}
                  </p>
                  <p className="mt-1 text-sm text-parchment-600">
                    {(p.course as unknown as { title: string } | null)?.title} &middot; Percobaan ke-{p.attempt_number}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-800">
                    Rp{Number(p.amount).toLocaleString("id-ID")}
                  </p>
                  {proofUrls.get(p.id) && (
                    <a
                      href={proofUrls.get(p.id)!}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-brand-700 underline hover:text-brand-600"
                    >
                      Lihat Bukti Transfer
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <form action={approvePayment.bind(null, p.id, p.enrollment_id, p.student_id)}>
                    <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Setujui</button>
                  </form>
                </div>
              </div>

              <form action={rejectPayment.bind(null, p.id, p.student_id)} className="mt-4 flex flex-wrap items-center gap-2 border-t border-parchment-200 pt-4">
                <input
                  name="reason"
                  placeholder="Alasan penolakan..."
                  required
                  className="field-input flex-1"
                />
                <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                  Tolak
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Tidak ada pembayaran yang menunggu verifikasi.</p>
        </div>
      )}
    </div>
  );
}
