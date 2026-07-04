import { signOut } from "@/lib/actions/auth";

export function Topbar({ fullName }: { fullName: string }) {
  const initial = fullName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-parchment-200 bg-parchment-50/90 px-5 backdrop-blur-md sm:h-20 sm:px-8">
      <p className="font-display text-lg font-semibold text-brand-900">
        Assalamu&rsquo;alaikum, <span className="text-gold-700">{fullName.split(" ")[0]}</span>
      </p>

      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-parchment-50">
          {initial}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-parchment-300 px-4 py-1.5 text-xs font-semibold text-parchment-600 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
