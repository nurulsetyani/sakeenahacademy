import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { ADMIN_SIDEBAR_ITEMS, ADMIN_BOTTOM_ITEMS } from "@/lib/nav-config";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-parchment-50">
      <Sidebar items={ADMIN_SIDEBAR_ITEMS} roleLabel="Area Admin" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar fullName={profile.full_name} />
        <main className="flex-1 px-5 pb-24 pt-6 sm:px-8 lg:pb-8">{children}</main>
      </div>
      <BottomNav items={ADMIN_BOTTOM_ITEMS} />
    </div>
  );
}
