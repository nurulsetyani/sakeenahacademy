import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  createBankChannel,
  createQrisChannel,
  togglePaymentChannelActive,
  deletePaymentChannel,
} from "@/lib/actions/settings";

export default async function AdminPengaturanPage() {
  const supabase = await createClient();

  const { data: channels } = await supabase
    .from("payment_channels")
    .select("id, type, bank_name, account_number, account_holder, qris_image_url, is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-brand-900">Pengaturan Lembaga</h1>
      <p className="mt-1 text-sm text-parchment-500">Kelola rekening bank dan QRIS untuk instruksi pembayaran murid.</p>

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-brand-900">Channel Pembayaran</h2>

        {channels && channels.length > 0 ? (
          <div className="mt-3 space-y-3">
            {channels.map((c) => (
              <div key={c.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {c.type === "transfer_bank" ? (
                      <>
                        <p className="text-sm font-semibold text-brand-900">{c.bank_name}</p>
                        <p className="mt-1 text-xs text-parchment-500">{c.account_number} a.n. {c.account_holder}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-brand-900">QRIS</p>
                        {c.qris_image_url && (
                          <Image
                            src={c.qris_image_url}
                            alt="QRIS"
                            width={96}
                            height={96}
                            className="mt-2 rounded-lg border border-parchment-200"
                          />
                        )}
                      </>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${c.is_active ? "bg-brand-50 text-brand-700" : "bg-parchment-200 text-parchment-600"}`}>
                    {c.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <form action={togglePaymentChannelActive.bind(null, c.id, c.is_active)}>
                    <button type="submit" className="btn-secondary !px-4 !py-2 text-sm">
                      {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                  <form action={deletePaymentChannel.bind(null, c.id)}>
                    <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-parchment-500">Belum ada channel pembayaran.</p>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-parchment-700">Tambah Rekening Bank</h3>
          <form action={createBankChannel} className="mt-3 space-y-3">
            <input name="bank_name" required placeholder="Nama Bank" className="field-input" />
            <input name="account_number" required placeholder="Nomor Rekening" className="field-input" />
            <input name="account_holder" required placeholder="Atas Nama" className="field-input" />
            <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Simpan Rekening</button>
          </form>
        </div>

        <div className="card-surface p-6">
          <h3 className="text-sm font-semibold text-parchment-700">Tambah QRIS</h3>
          <form action={createQrisChannel} className="mt-3 space-y-3">
            <input name="qris_image" type="file" accept="image/*" required className="field-input" />
            <button type="submit" className="btn-primary w-full !py-2.5 text-sm">Simpan QRIS</button>
          </form>
        </div>
      </div>
    </div>
  );
}
