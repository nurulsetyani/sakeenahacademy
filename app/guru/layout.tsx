import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { GURU_SIDEBAR_ITEMS, GURU_BOTTOM_ITEMS } from "@/lib/nav-config";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "guru") redirect("/dashboard");

  if (profile.account_status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment-50 px-6 text-center">
        <div className="card-surface max-w-sm p-8">
          <h1 className="font-display text-xl font-semibold text-brand-900">Menunggu Persetujuan</h1>
          <p className="mt-3 text-sm leading-[1.7] text-parchment-600">
            Akun guru Anda sedang ditinjau oleh Admin. Anda akan menerima notifikasi setelah disetujui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-parchment-50">
      <Sidebar items={GURU_SIDEBAR_ITEMS} roleLabel="Area Guru" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar fullName={profile.full_name} />
        <main className="flex-1 px-5 pb-24 pt-6 sm:px-8 lg:pb-8">{children}</main>
      </div>
      <BottomNav items={GURU_BOTTOM_ITEMS} />
    </div>
  );
}
