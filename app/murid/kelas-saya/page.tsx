import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  active: "Aktif",
  completed: "Selesai",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
};

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-gold-100 text-gold-700",
  active: "bg-brand-50 text-brand-700",
  completed: "bg-parchment-200 text-parchment-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-red-50 text-red-700",
};

export default async function KelasSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawEnrollments } = await supabase
    .from("enrollments")
    .select("id, status, progress_percentage, course:courses(id, title, slug, access_type, program_type)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });

  const enrollments = (rawEnrollments ?? []).filter((e) => e.course !== null);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Kelas Saya</h1>

      {enrollments.length > 0 ? (
        <div className="mt-6 space-y-3">
          {enrollments.map((e) => {
            const course = e.course as unknown as {
              id: string;
              title: string;
              slug: string;
              access_type: string;
              program_type: string;
            } | null;

            const href =
              e.status === "active" || e.status === "completed"
                ? `/murid/kelas-saya/${course?.id}`
                : `/kelas/${course?.slug}`;

            return (
              <Link
                key={e.id}
                href={href}
                className="card-surface block p-5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-raised"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-brand-900">{course?.title}</p>
                    <p className="mt-1 text-xs capitalize text-parchment-500">
                      {course?.program_type} &middot; {course?.access_type}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[e.status]}`}>
                    {STATUS_LABEL[e.status]}
                  </span>
                </div>

                {e.status === "active" && (
                  <>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-parchment-200">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${e.progress_percentage}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-parchment-500">{e.progress_percentage}% selesai</p>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card-surface mt-6 p-14 text-center">
          <p className="text-sm text-parchment-600">Anda belum mengikuti kelas apa pun.</p>
          <Link href="/kelas" className="btn-primary mt-4 inline-flex">Telusuri Katalog Kelas</Link>
        </div>
      )}
    </div>
  );
}
