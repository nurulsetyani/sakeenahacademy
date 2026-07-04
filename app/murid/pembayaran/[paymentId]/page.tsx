import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPaymentProof, registerPaidCourse } from "@/lib/actions/payments";

const STATUS_LABEL: Record<string, string> = {
  pending: "Belum Dibayar",
  menunggu_verifikasi: "Menunggu Verifikasi",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default async function PembayaranDetailPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, course_id, attempt_number, amount, channel_id, proof_image_url, status, rejection_reason, course:courses(title, slug)")
    .eq("id", paymentId)
    .eq("student_id", user!.id)
    .single();

  if (!payment) notFound();

  const course = payment.course as unknown as { title: string; slug: string } | null;

  const { data: channels } = await supabase
    .from("payment_channels")
    .select("id, type, bank_name, account_number, account_holder, qris_image_url")
    .eq("is_active", true);

  const proofUrl = payment.proof_image_url
    ? (await supabase.storage.from("payment-proofs").createSignedUrl(payment.proof_image_url, 3600)).data?.signedUrl
    : null;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">{course?.title}</h1>
      <p className="mt-1 text-sm text-parchment-500">
        Percobaan ke-{payment.attempt_number} &middot; Rp{Number(payment.amount).toLocaleString("id-ID")}
      </p>

      <span className="mt-3 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">
        {STATUS_LABEL[payment.status]}
      </span>

      {payment.status === "rejected" && (
        <div className="card-surface mt-6 p-6">
          {payment.rejection_reason && (
            <p className="text-sm text-red-600">Alasan penolakan: {payment.rejection_reason}</p>
          )}
          <form action={registerPaidCourse.bind(null, payment.course_id, course?.slug ?? "")} className="mt-4">
            <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">Ajukan Ulang Pembayaran</button>
          </form>
        </div>
      )}

      {payment.status === "approved" && (
        <div className="card-surface mt-6 p-6 text-center">
          <p className="text-sm text-parchment-600">Pembayaran disetujui, akses kelas Anda sudah aktif.</p>
        </div>
      )}

      {(payment.status === "pending" || payment.status === "menunggu_verifikasi") && (
        <div className="card-surface mt-6 space-y-4 p-6">
          {channels && channels.length > 0 ? (
            <div>
              <p className="field-label">Metode Pembayaran</p>
              <div className="mt-2 space-y-2">
                {channels.map((c) => (
                  <div key={c.id} className="rounded-xl border border-parchment-200 p-3 text-sm">
                    {c.type === "transfer_bank" ? (
                      <p>
                        <span className="font-semibold text-brand-900">{c.bank_name}</span> &middot; {c.account_number} a.n. {c.account_holder}
                      </p>
                    ) : (
                      <p className="font-semibold text-brand-900">QRIS</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-parchment-500">Belum ada metode pembayaran aktif. Hubungi Admin.</p>
          )}

          {proofUrl && (
            <div>
              <p className="field-label">Bukti Transfer Saat Ini</p>
              <a href={proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-brand-700 underline hover:text-brand-600">
                Lihat bukti yang sudah diunggah
              </a>
            </div>
          )}

          <form action={uploadPaymentProof.bind(null, paymentId)} className="space-y-4">
            {channels && channels.length > 0 && (
              <div>
                <label htmlFor="channel_id" className="field-label">Pilih Channel</label>
                <select id="channel_id" name="channel_id" required className="field-input">
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.type === "transfer_bank" ? `${c.bank_name} — ${c.account_number}` : "QRIS"}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="proof" className="field-label">Unggah Bukti Transfer</label>
              <input id="proof" name="proof" type="file" accept="image/*" required className="field-input" />
            </div>
            <button type="submit" className="btn-primary w-full !py-2.5 text-sm">
              {payment.status === "menunggu_verifikasi" ? "Perbarui Bukti Transfer" : "Kirim Bukti Transfer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
