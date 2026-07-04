import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "@/components/dashboard/notification-list";

export default async function GuruNotifikasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("sent_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Notifikasi</h1>
      <NotificationList notifications={notifications ?? []} />
    </div>
  );
}
