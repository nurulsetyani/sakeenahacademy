import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "Belum Dibayar",
  menunggu_verifikasi: "Menunggu Verifikasi",
  approved: "Disetujui",
  rejected: "Ditolak",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-parchment-200 text-parchment-700",
  menunggu_verifikasi: "bg-gold-100 text-gold-700",
  approved: "bg-success-50 text-success-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function PembayaranPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, attempt_number, amount, status, submitted_at, rejection_reason, course:courses(title)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Pembayaran Saya</h1>

      {payments && payments.length > 0 ? (
        <div className="mt-6 space-y-3">
          {payments.map((p) => (
            <Link
              key={p.id}
              href={`/murid/pembayaran/${p.id}`}
              className="card-surface flex items-center justify-between p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
            >
              <div>
                <p className="font-display font-semibold text-brand-900">
                  {(p.course as unknown as { title: string } | null)?.title}
                </p>
                <p className="mt-1 text-xs text-parchment-500">
                  Percobaan ke-{p.attempt_number} &middot; Rp{Number(p.amount).toLocaleString("id-ID")}
                </p>
                {p.status === "rejected" && p.rejection_reason && (
                  <p className="mt-1 text-xs text-red-600">Alasan: {p.rejection_reason}</p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                {STATUS_LABEL[p.status]}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada riwayat pembayaran.</p>
        </div>
      )}
    </div>
  );
}
