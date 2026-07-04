import { PublicTopbar } from "@/components/landing/public-topbar";
import { redirect } from "next/navigation";

async function handleVerify(formData: FormData) {
  "use server";
  const identifier = String(formData.get("identifier") ?? "").trim();
  if (identifier) redirect(`/verifikasi-sertifikat/${encodeURIComponent(identifier)}`);
}

export default function VerifikasiSertifikatPage() {
  return (
    <>
      <PublicTopbar />
      <main className="container-page flex min-h-[60vh] items-center justify-center py-14">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-900">
            Verifikasi Sertifikat
          </h1>
          <p className="mt-3 text-parchment-600">
            Masukkan nomor sertifikat untuk memastikan keasliannya.
          </p>

          <form action={handleVerify} className="mt-8 flex gap-2">
            <input
              name="identifier"
              required
              placeholder="SA/2026/07/000123"
              className="field-input flex-1"
            />
            <button type="submit" className="btn-primary shrink-0">Cek</button>
          </form>
        </div>
      </main>
    </>
  );
}
