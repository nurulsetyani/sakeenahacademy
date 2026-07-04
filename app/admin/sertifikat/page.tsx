import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleCertificateStatus } from "@/lib/actions/certificates";

export default async function AdminSertifikatPage() {
  const supabase = await createClient();

  const { data: certificates } = await supabase
    .from("certificates")
    .select(
      "id, certificate_number, issued_at, status, student:profiles!certificates_student_id_fkey(full_name), course:courses(title)"
    )
    .order("issued_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Kelola Sertifikat</h1>
        <Link href="/admin/sertifikat/template" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
          Kelola Template
        </Link>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="mt-6 space-y-3">
          {certificates.map((c) => (
            <div key={c.id} className="card-surface flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display font-semibold text-brand-900">
                  {(c.student as unknown as { full_name: string } | null)?.full_name}
                </p>
                <p className="mt-1 text-xs text-parchment-500">
                  {(c.course as unknown as { title: string } | null)?.title}
                </p>
                <p className="mt-1 text-xs text-parchment-400">
                  {c.certificate_number} &middot; {new Date(c.issued_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${c.status === "aktif" ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"}`}>
                  {c.status}
                </span>
                <form action={toggleCertificateStatus.bind(null, c.id, c.status)}>
                  <button
                    type="submit"
                    className={
                      c.status === "aktif"
                        ? "rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        : "btn-secondary !px-4 !py-2 text-sm"
                    }
                  >
                    {c.status === "aktif" ? "Revoke" : "Aktifkan"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Belum ada sertifikat yang terbit.</p>
        </div>
      )}
    </div>
  );
}
