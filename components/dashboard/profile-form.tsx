import { updateProfile } from "@/lib/actions/profile";
import type { Tables } from "@/types/database.types";

export function ProfileForm({ profile, email }: { profile: Tables<"profiles">; email: string }) {
  return (
    <form action={updateProfile} className="card-surface mt-6 max-w-lg space-y-5 p-6">
      <div>
        <label className="field-label">Email</label>
        <input value={email} disabled className="field-input opacity-60" />
      </div>

      <div>
        <label htmlFor="full_name" className="field-label">Nama Lengkap</label>
        <input id="full_name" name="full_name" defaultValue={profile.full_name} required className="field-input" />
      </div>

      <div>
        <label htmlFor="phone" className="field-label">Nomor HP (WhatsApp)</label>
        <input id="phone" name="phone" defaultValue={profile.phone} required className="field-input" />
      </div>

      <div>
        <label htmlFor="address" className="field-label">Alamat</label>
        <textarea id="address" name="address" defaultValue={profile.address ?? ""} rows={3} className="field-input" />
      </div>

      <button type="submit" className="btn-primary">Simpan Perubahan</button>
    </form>
  );
}
