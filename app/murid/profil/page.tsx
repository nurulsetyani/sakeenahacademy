import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function MuridProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Profil</h1>
      {profile && <ProfileForm profile={profile} email={user!.email ?? ""} />}
    </div>
  );
}
