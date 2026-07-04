import { markNotificationRead } from "@/lib/actions/notifications";
import type { Tables } from "@/types/database.types";

export function NotificationList({ notifications }: { notifications: Tables<"notifications">[] }) {
  if (notifications.length === 0) {
    return (
      <div className="card-surface mt-6 p-14 text-center">
        <p className="text-sm text-parchment-600">Belum ada notifikasi.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2">
      {notifications.map((n) => (
        <form key={n.id} action={markNotificationRead.bind(null, n.id)}>
          <button
            type="submit"
            disabled={n.is_read}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
              n.is_read
                ? "border-parchment-200 bg-white"
                : "border-brand-200 bg-brand-50 hover:bg-brand-100"
            }`}
          >
            {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
            <span>
              <span className="block text-sm font-semibold text-brand-900">{n.title}</span>
              {n.body && <span className="mt-0.5 block text-sm text-parchment-600">{n.body}</span>}
              <span className="mt-1 block text-xs text-parchment-400">
                {new Date(n.sent_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                {n.channel === "whatsapp" && " · juga dikirim via WhatsApp"}
              </span>
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
