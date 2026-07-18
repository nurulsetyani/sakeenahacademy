import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicTopbar } from "@/components/landing/public-topbar";

export default async function VerifikasiSertifikatResultPage({
  params,
}: {
  params: Promise<{ nomor: string }>;
}) {
  const { nomor } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("verify_certificate", { p_identifier: decodeURIComponent(nomor) });
  const result = data?.[0];

  return (
    <>
      <PublicTopbar />
      <main className="container-page flex min-h-[60vh] items-center justify-center py-14">
        <div className="card-surface w-full max-w-md p-8 text-center">
          {result ? (
            <>
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                  result.status === "aktif" ? "bg-success-50 text-success-700" : "bg-red-50 text-red-600"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  {result.status === "aktif" ? <path d="m5 12 4.5 4.5L19 7" /> : <path d="M6 6l12 12M18 6 6 18" />}
                </svg>
              </div>
              <h1 className="mt-4 font-display text-xl font-semibold text-brand-900">
                {result.status === "aktif" ? "Sertifikat Valid" : "Sertifikat Telah Dicabut"}
              </h1>
              <dl className="mt-6 space-y-3 text-left text-sm">
                <div className="flex justify-between border-b border-parchment-200 pb-2">
                  <dt className="text-parchment-500">Nomor</dt>
                  <dd className="font-medium text-parchment-800">{result.certificate_number}</dd>
                </div>
                <div className="flex justify-between border-b border-parchment-200 pb-2">
                  <dt className="text-parchment-500">Nama</dt>
                  <dd className="font-medium text-parchment-800">{result.student_name}</dd>
                </div>
                <div className="flex justify-between border-b border-parchment-200 pb-2">
                  <dt className="text-parchment-500">Kelas</dt>
                  <dd className="font-medium text-parchment-800">{result.course_title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-parchment-500">Tanggal Terbit</dt>
                  <dd className="font-medium text-parchment-800">
                    {new Date(result.issued_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold text-brand-900">Sertifikat Tidak Ditemukan</h1>
              <p className="mt-3 text-sm text-parchment-600">
                Periksa kembali nomor sertifikat yang Anda masukkan.
              </p>
            </>
          )}

          <Link href="/verifikasi-sertifikat" className="btn-secondary mt-8 inline-flex">
            Cek Sertifikat Lain
          </Link>
        </div>
      </main>
    </>
  );
}
